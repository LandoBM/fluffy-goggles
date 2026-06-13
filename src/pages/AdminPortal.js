import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminPortal() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [entries, setEntries] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // New entry form state
  const [entryType, setEntryType] = useState("charge");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      setLoading(true);

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const user = userData?.user;
      if (!user) {
        setErrorMsg("You are not logged in. Please go to /login.");
        setLoading(false);
        return;
      }

      // Check role
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) throw profileErr;

      if (profile?.role !== "admin") {
        setErrorMsg("You do not have permission to view this page.");
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadFamilies();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const loadFamilies = async () => {
    const { data, error } = await supabase
      .from("families")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    setFamilies(data || []);
  };

  const loadLedger = async (familyId) => {
    setSelectedFamily(familyId);

    const { data, error } = await supabase
      .from("ledger_entries")
      .select("id, entry_type, amount_cents, description, entry_date")
      .eq("family_id", familyId)
      .order("entry_date", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      return;
    }

    setEntries(data || []);
  };

  const balanceFor = (rows) => {
    return (rows || []).reduce((acc, row) => {
      const increases =
        row.entry_type === "charge" || row.entry_type === "adjustment";
      return acc + (increases ? row.amount_cents : -row.amount_cents);
    }, 0);
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!selectedFamily) return;
    if (!amount || isNaN(Number(amount))) {
      alert("Enter a valid dollar amount.");
      return;
    }

    setSaving(true);

    const amountCents = Math.round(Number(amount) * 100);

    const { error } = await supabase.from("ledger_entries").insert({
      family_id: selectedFamily,
      entry_type: entryType,
      amount_cents: amountCents,
      description: description || null,
      entry_date: entryDate,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message || "Could not add entry.");
      return;
    }

    setAmount("");
    setDescription("");
    await loadLedger(selectedFamily);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 px-4 py-10">Loading admin portal…</div>;
  }

  if (errorMsg && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <p className="text-red-700 font-medium">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            Principal Admin Portal
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="inline-flex items-center justify-center rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 transition"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FAMILY LIST */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Families
            </h2>
            {families.length === 0 ? (
              <p className="text-gray-500 text-sm">No families found.</p>
            ) : (
              <ul className="space-y-1 max-h-[600px] overflow-y-auto">
                {families.map((f) => (
                  <li key={f.id}>
                    <button
                      onClick={() => loadLedger(f.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedFamily === f.id
                          ? "bg-blue-900 text-white"
                          : "hover:bg-blue-50 text-gray-700"
                      }`}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SELECTED FAMILY DETAIL */}
          <div className="md:col-span-2 space-y-6">
            {!selectedFamily ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-500">
                Select a family from the list to view their balance and add
                charges or payments.
              </div>
            ) : (
              <>
                {/* Balance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-4xl font-bold text-blue-900 mt-1">
                    {money(balanceFor(entries))}
                  </p>
                </div>

                {/* Add Entry Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Add Charge / Payment / Adjustment
                  </h3>
                  <form
                    onSubmit={addEntry}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Type
                      </label>
                      <select
                        value={entryType}
                        onChange={(e) => setEntryType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="charge">Charge (increases balance)</option>
                        <option value="payment">Payment (decreases balance)</option>
                        <option value="adjustment">Adjustment (increases balance)</option>
                        <option value="credit">Credit (decreases balance)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="e.g. March tuition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`rounded-lg px-6 py-2.5 text-white font-medium transition ${
                          saving
                            ? "bg-blue-900/50 cursor-not-allowed"
                            : "bg-blue-900 hover:bg-blue-800"
                        }`}
                      >
                        {saving ? "Saving…" : "Add Entry"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Ledger */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Ledger History
                  </h3>

                  {entries.length === 0 ? (
                    <p className="text-gray-500">No entries yet.</p>
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
      </div>
    </div>
  );
}