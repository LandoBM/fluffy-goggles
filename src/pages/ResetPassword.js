import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase sets a recovery session when user arrives via reset link
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setMsg("Reset link is missing or expired. Please request a new one.");
      }
      setReady(true);
    };
    init();
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMsg("Password updated! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMsg(err?.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <div className="min-h-screen bg-gray-50 px-4 py-10">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-blue-900">Reset Password</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Enter a new password for your parent account.
        </p>

        <form onSubmit={updatePassword} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters.</p>
          </div>

          {msg ? (
            <div className="text-sm rounded-lg border p-3 bg-gray-50 text-gray-700">{msg}</div>
          ) : null}

          <button
            disabled={loading}
            className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
            }`}
            type="submit"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
