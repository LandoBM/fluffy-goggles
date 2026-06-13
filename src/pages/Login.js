import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Leo from "../assets/images/mascot.png";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [familyName, setFamilyName] = useState("");
  const [students, setStudents] = useState([
    { firstName: "", lastName: "", grade: "" },
  ]);

  const addStudentField = () => {
    setStudents([...students, { firstName: "", lastName: "", grade: "" }]);
  };

  const updateStudent = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check role and redirect accordingly
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/portal");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const userId = data?.user?.id;
        if (!userId) {
          setMsg("Account created! Check your email to confirm, then log in.");
          setMode("login");
          setLoading(false);
          return;
        }

        // Create the family record (pending review)
        const { data: familyRow, error: famErr } = await supabase
          .from("families")
          .insert({ name: familyName, status: "pending" })
          .select()
          .single();

        if (famErr) throw famErr;

        // Link this user to the new family
        await supabase.from("family_members").insert({
          user_id: userId,
          family_id: familyRow.id,
        });

        // Add each student
        const studentRows = students
          .filter((s) => s.firstName && s.lastName)
          .map((s) => ({
            family_id: familyRow.id,
            first_name: s.firstName,
            last_name: s.lastName,
            grade: s.grade || null,
          }));

        if (studentRows.length > 0) {
          await supabase.from("students").insert(studentRows);
        }

        // If email confirmation is OFF, signUp returns a session immediately
        if (data?.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .maybeSingle();

          navigate(profile?.role === "admin" ? "/admin" : "/portal");
          return;
        }

        setMsg(
          "Account created! Check your email to confirm your account, then log in.",
        );
        setMode("login");
      }
    } catch (err) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    setMsg("");
    if (!email) {
      setMsg("Enter your email above, then click Forgot password.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      setMsg("Password reset email sent. Check your inbox (and spam).");
    } catch (err) {
      setMsg(err?.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Leo + welcome */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-4">
            <img
              src={Leo}
              alt="Leo the Lion"
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                Welcome Parents!
              </h1>
              <p className="text-gray-600 mt-1">
                Log in to view your balance, ledger, and tuition updates.
              </p>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="font-medium text-blue-900">Leo says:</p>
            <p className="mt-1">
              “We’re glad you’re here. Let’s get you logged in.”
            </p>
          </div>
        </div>

        {/* Right: Auth form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "login" ? "Parent Login" : "Create Parent Account"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setMsg("");
                setMode(mode === "login" ? "signup" : "login");
              }}
              className="text-sm font-medium text-blue-900 hover:underline"
            >
              {mode === "login" ? "Create account" : "Have an account?"}
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="leo@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters (recommended: 8+).
              </p>
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Family Name
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. The Williams Family"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student(s)
                  </label>
                  {students.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                      <input
                        className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                        placeholder="First name"
                        value={s.firstName}
                        onChange={(e) => updateStudent(idx, "firstName", e.target.value)}
                        required
                      />
                      <input
                        className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                        placeholder="Last name"
                        value={s.lastName}
                        onChange={(e) => updateStudent(idx, "lastName", e.target.value)}
                        required
                      />
                      <input
                        className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                        placeholder="Grade"
                        value={s.grade}
                        onChange={(e) => updateStudent(idx, "grade", e.target.value)}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStudentField}
                    className="text-sm text-blue-900 underline"
                  >
                    + Add another child
                  </button>
                </div>
              </>
            )}

            {msg ? (
              <div className="text-sm rounded-lg border p-3 bg-gray-50 text-gray-700">
                {msg}
              </div>
            ) : null}

            <button
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-950"
              }`}
              type="submit"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>
            <button
              type="button"
              onClick={forgotPassword}
              className="text-sm font-medium text-blue-900 hover:underline"
            >
              Forgot password?
            </button>

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to the school’s policies and terms.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}