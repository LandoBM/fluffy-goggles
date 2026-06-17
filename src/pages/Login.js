import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import Leo from "../assets/images/mascot.png";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [signupStep, setSignupStep] = useState("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [createdParentName, setCreatedParentName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

  const resetSetupFlow = () => {
    setSignupStep("form");
    setCreatedParentName("");
    setStudents([{ firstName: "", lastName: "", grade: "" }]);
  };

  // ── Login ─────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        navigate("/admin");
        return;
      }

      const { data: memberRow } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!memberRow?.family_id) {
        setCreatedParentName(
          user.user_metadata?.parent_name || user.email || "Parent",
        );
        setMode("signup");
        setSignupStep("welcome");
        setMsg("");
        return;
      }

      navigate("/portal");
    } catch (err) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Signup — calls Edge Function ──────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const studentRows = students.filter((s) => s.firstName && s.lastName);
      if (studentRows.length === 0) {
        setMsg("Please add at least one student.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://exiczidjjvmgwntomeip.supabase.co/functions/v1/signup-family",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email,
            password,
            familyName: familyName || `${parentName} Family`,
            parentName,
            phone: phone || null,
            students: studentRows,
          }),
        },
      );

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Auto login after account created
      const { data: loginData, error: loginErr } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginErr) {
        setMsg("Account created! Please log in.");
        setMode("login");
        setPassword("");
        return;
      }

      setCreatedParentName(parentName);
      setSignupStep("welcome");
      setMsg("");
    } catch (err) {
      setMsg(err?.message || "Could not create account. Try again.");
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
      setMsg("Password reset email sent. Check your inbox and spam.");
    } catch (err) {
      setMsg(err?.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  // ── Welcome screen ────────────────────────────────────────────
  if (mode === "signup" && signupStep === "welcome") {
    return (
      <div className="relative min-h-screen bg-blue-50 px-4 py-10 overflow-hidden flex items-center justify-center">
        {Array.from({ length: 36 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-3 w-3 rounded-sm animate-bounce"
            style={{
              left: `${(index * 17) % 100}%`,
              top: `${(index * 23) % 70}%`,
              backgroundColor: ["#1d4ed8", "#facc15", "#16a34a", "#dc2626"][
                index % 4
              ],
              animationDelay: `${index * 0.08}s`,
            }}
          />
        ))}
        <div className="relative max-w-xl w-full bg-white rounded-2xl border border-blue-100 shadow-lg p-8 text-center">
          <img
            src={Leo}
            alt="Leo the Lion"
            className="h-36 w-auto mx-auto mb-5 leo-bounce"
          />
          <h1 className="text-3xl font-bold text-blue-900">
            Hello {createdParentName}!
          </h1>
          <p className="text-gray-700 text-lg mt-3">
            Welcome to Summer Crest Learning Academy Parent Portal.
          </p>
          <button
            type="button"
            onClick={() => navigate("/portal")}
            className="mt-8 w-full rounded-lg px-4 py-3 font-semibold text-white bg-blue-900 hover:bg-blue-800 transition"
          >
            Go to Portal
          </button>
        </div>
      </div>
    );
  }

  // ── Main login / signup form ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Leo */}
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
              "We're glad you're here. Let's get you logged in."
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "login" ? "Parent Login" : "Create Parent Account"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setMsg("");
                resetSetupFlow();
                setMode(mode === "login" ? "signup" : "login");
              }}
              className="text-sm font-medium text-blue-900 hover:underline"
            >
              {mode === "login" ? "Create account" : "Have an account?"}
            </button>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : handleSignup}
            className="space-y-4"
          >
            {/* Signup-only fields */}
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent / Guardian Name
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Jamie Williams"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                  />
                </div>
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
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                type="password"
                name={mode === "login" ? "password" : "new-password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters.
              </p>
            </div>

            {/* Students — signup only */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student(s)
                </label>
                {students.map((student, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"
                  >
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                      type="text"
                      placeholder="First name"
                      value={student.firstName}
                      onChange={(e) =>
                        updateStudent(index, "firstName", e.target.value)
                      }
                      required
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                      type="text"
                      placeholder="Last name"
                      value={student.lastName}
                      onChange={(e) =>
                        updateStudent(index, "lastName", e.target.value)
                      }
                      required
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
                      type="text"
                      placeholder="Grade"
                      value={student.grade}
                      onChange={(e) =>
                        updateStudent(index, "grade", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStudentField}
                  className="text-sm font-medium text-blue-900 hover:underline"
                >
                  + Add another child
                </button>
              </div>
            )}

            {msg && (
              <div className="text-sm rounded-lg border p-3 bg-gray-50 text-gray-700">
                {msg}
              </div>
            )}

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
                ? "Please wait..."
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={forgotPassword}
                className="text-sm font-medium text-blue-900 hover:underline"
              >
                Forgot password?
              </button>
            )}

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to the school's policies and terms.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
