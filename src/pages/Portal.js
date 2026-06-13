import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Portal() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [entries, setEntries] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [paying, setPaying] = useState(false);

  const balanceCents = useMemo(() => {
    return (entries || []).reduce((acc, row) => {
      const increases = row.entry_type === "charge" || row.entry_type === "adjustment";
      return acc + (increases ? row.amount_cents : -row.amount_cents);
    }, 0);
  }, [entries]);

  const loadPortal = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const user = userData?.user;
      if (!user) {
        setErrorMsg("You are not logged in. Please go to /login.");
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      // Get this user's family_id
      const { data: memberRow, error: memberErr } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberErr) throw memberErr;

      const fid = memberRow?.family_id || null;
      if (!fid) {
        setFamilyId(null);
        setFamilyName("");
        setEntries([]);
        setErrorMsg(
          "Your account is not linked to a family yet. Ask an admin to connect your login to your family account."
        );
        setLoading(false);
        return;
      }

      setFamilyId(fid);

      // Family name
      const { data: famRow, error: famErr } = await supabase
        .from("families")
        .select("name")
        .eq("id", fid)
        .maybeSingle();

      if (famErr) throw famErr;
      setFamilyName(famRow?.name || "");

      // Ledger
      const { data: ledgerRows, error: ledgerErr } = await supabase
        .from("ledger_entries")
        .select("id, entry_type, amount_cents, description, entry_date")
        .eq("family_id", fid)
        .order("entry_date", { ascending: false });

      if (ledgerErr) throw ledgerErr;
      setEntries(ledgerRows || []);

      setLoading(false);
    } catch (err) {
      console.error("Portal load error:", err);
      setErrorMsg(err?.message || "Something went wrong loading the portal.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const payNow = async () => {
    try {
      if (!familyId) return alert("No family account found for this login.");
      if (balanceCents <= 0) return alert("Your balance is already $0.00.");

      setPaying(true);

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;

      const token = sessionData?.session?.access_token;
      if (!token) {
        alert("Your login session is missing. Log out and log back in, then try again.");
        setPaying(false);
        return;
      }

      // Use invoke but explicitly attach Authorization (most reliable)
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { familyId, amountCents: balanceCents },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
        console.error(error);
        alert(error.message || "Could not start checkout.");
        setPaying(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert("No checkout URL returned.");
      setPaying(false);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Something went wrong starting checkout.");
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 px-4 py-10">Loading portal…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Parent Portal</h1>
            <p className="text-gray-600 mt-1">Logged in as {email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 transition"
          >
            Log out
          </button>
        </div>

        {errorMsg ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <p className="text-red-700 font-medium">{errorMsg}</p>
            <p className="text-gray-600 mt-2 text-sm">
              If you're testing: confirm your user has a row in <b>family_members</b>, and your ledger
              rows use the same <b>family_id</b>.
            </p>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {familyName ? `${familyName}` : "Family Account"}
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-4xl font-bold text-blue-900 mt-1">{money(balanceCents)}</p>
                </div>

                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={payNow}
                    disabled={balanceCents <= 0 || paying}
                    className={`rounded-lg px-6 py-3 text-white font-medium transition ${
                      balanceCents <= 0 || paying
                        ? "bg-green-600/50 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {paying ? "Redirecting…" : "Pay Now"}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                This balance reflects all charges and payments for your family account.
              </p>
            </div>

            {/* Ledger */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Ledger</h3>

              {entries.length === 0 ? (
                <p className="text-gray-500">No charges or payments have been posted yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-gray-600">Date</th>
                        <th className="text-left py-3 px-2 text-gray-600">Description</th>
                        <th className="text-left py-3 px-2 text-gray-600">Type</th>
                        <th className="text-right py-3 px-2 text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => (
                        <tr key={e.id} className="border-b last:border-b-0">
                          <td className="py-3 px-2 text-gray-700">{e.entry_date}</td>
                          <td className="py-3 px-2 text-gray-700">{e.description}</td>
                          <td className="py-3 px-2 capitalize text-gray-600">{e.entry_type}</td>
                          <td className="py-3 px-2 text-right font-medium text-gray-800">
                            {money(e.amount_cents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

