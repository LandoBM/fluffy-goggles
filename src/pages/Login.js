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

        const user = data?.user;

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;

        if (profile?.role === "admin") {
          navigate("/admin");
          return;
        }

        const { data: memberRow, error: memberErr } = await supabase
          .from("family_members")
          .select("family_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (memberErr) throw memberErr;

        if (!memberRow?.family_id) {
          setCreatedParentName(
            user.user_metadata?.parent_name || user.email || "Parent"
          );
          setMode("signup");
          setSignupStep("welcome");
          setMsg("");
          return;
        }

        navigate("/portal");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            parent_name: parentName,
          },
        },
      });

      if (error) throw error;

      if (data?.session) {
        setCreatedParentName(parentName);
        setSignupStep("welcome");
        setMsg("");
        return;
      }

      setMode("login");
      setPassword("");
      setMsg(
        "Account created! Please check your email and confirm your account. After confirming, return here and log in."
      );
    } catch (err) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const saveStudents = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const user = userData?.user;
      if (!user) {
        setMsg("Please log in again to finish setting up your portal.");
        setMode("login");
        resetSetupFlow();
        setLoading(false);
        return;
      }

      const studentRows = students
        .filter((student) => student.firstName && student.lastName)
        .map((student) => ({
          first_name: student.firstName,
          last_name: student.lastName,
          grade: student.grade || null,
        }));

      if (studentRows.length === 0) {
        setMsg("Please add at least one student.");
        setLoading(false);
        return;
      }

      const parentDisplayName =
        createdParentName || user.user_metadata?.parent_name || user.email;

      const { data: familyRow, error: famErr } = await supabase
        .from("families")
        .insert({
          name: `${parentDisplayName} Family`,
          parent_name: parentDisplayName,
          status: "pending",
        })
        .select()
        .single();

      if (famErr) throw famErr;

      const { error: memberErr } = await supabase
        .from("family_members")
        .insert({
          user_id: user.id,
          family_id: familyRow.id,
        });

      if (memberErr) throw memberErr;

      const studentsToInsert = studentRows.map((student) => ({
        ...student,
        family_id: familyRow.id,
      }));

      const { error: studentErr } = await supabase
        .from("students")
        .insert(studentsToInsert);

      if (studentErr) throw studentErr;

      navigate("/portal");
    } catch (err) {
      setMsg(err?.message || "Could not finish setting up your portal.");
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
            onClick={() => {
              setMsg("");
              setSignupStep("students");
            }}
            className="mt-8 w-full rounded-lg px-4 py-3 font-semibold text-white bg-blue-900 hover:bg-blue-800 transition"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (mode === "signup" && signupStep === "students") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <img
              src={Leo}
              alt="Leo the Lion"
              className="h-24 w-auto mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-blue-900">
              Add Your Student
            </h1>
            <p className="text-gray-600 mt-1">
              Add one or more children to your parent account.
            </p>
          </div>

          <form onSubmit={saveStudents} className="space-y-4">
            {students.map((student, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  type="text"
                  name={`student-first-name-${index}`}
                  autoComplete="given-name"
                  placeholder="First name"
                  value={student.firstName}
                  onChange={(e) =>
                    updateStudent(index, "firstName", e.target.value)
                  }
                  required
                />

                <input
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  type="text"
                  name={`student-last-name-${index}`}
                  autoComplete="family-name"
                  placeholder="Last name"
                  value={student.lastName}
                  onChange={(e) =>
                    updateStudent(index, "lastName", e.target.value)
                  }
                  required
                />

                <input
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  type="text"
                  name={`student-grade-${index}`}
                  autoComplete="off"
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

            {msg ? (
              <div className="text-sm rounded-lg border p-3 bg-gray-50 text-gray-700">
                {msg}
              </div>
            ) : null}

            <button
              disabled={loading}
              className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
              type="submit"
            >
              {loading ? "Saving..." : "Finish and Go to Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
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

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" ? (
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
            ) : null}

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
                ? "Please wait..."
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>

            {mode === "login" ? (
              <button
                type="button"
                onClick={forgotPassword}
                className="text-sm font-medium text-blue-900 hover:underline"
              >
                Forgot password?
              </button>
            ) : null}

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to the school's policies and terms.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
