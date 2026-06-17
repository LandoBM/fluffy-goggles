import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import jsPDF from "jspdf";

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Portal() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [entries, setEntries] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [paying, setPaying] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "" });
  const [saveMsg, setSaveMsg] = useState("");

  // Add new student
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ first_name: "", last_name: "", grade: "" });
  const [addingStudent, setAddingStudent] = useState(false);

  // Account settings
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    parent_name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Ledger date filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Student handlers ──────────────────────────────────────────
  const startEdit = (student) => {
    setEditingId(student.id);
    setEditForm({ first_name: student.first_name, last_name: student.last_name });
    setSaveMsg("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ first_name: "", last_name: "" });
  };

  const addStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name) {
      setSaveMsg("Please enter both first and last name.");
      return;
    }
    setAddingStudent(true);
    setSaveMsg("");
    const { data, error } = await supabase
      .from("students")
      .insert({
        family_id: familyId,
        first_name: newStudent.first_name,
        last_name: newStudent.last_name,
        grade: newStudent.grade || null,
      })
      .select()
      .single();

    if (error) {
      setSaveMsg("Failed to add student. Try again.");
    } else {
      setStudents((prev) => [...prev, data]);
      setNewStudent({ first_name: "", last_name: "", grade: "" });
      setShowAddStudent(false);
      setSaveMsg("Student added successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
    setAddingStudent(false);
  };

  const saveEdit = async (studentId) => {
    const { error } = await supabase
      .from("students")
      .update({ first_name: editForm.first_name, last_name: editForm.last_name })
      .eq("id", studentId);

    if (error) {
      setSaveMsg("Failed to save. Try again.");
    } else {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, first_name: editForm.first_name, last_name: editForm.last_name }
            : s
        )
      );
      setEditingId(null);
      setSaveMsg("Changes saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  // ── Balance ───────────────────────────────────────────────────
  const balanceCents = useMemo(() => {
    return (entries || []).reduce((acc, row) => {
      const increases = row.entry_type === "charge" || row.entry_type === "adjustment";
      return acc + (increases ? row.amount_cents : -row.amount_cents);
    }, 0);
  }, [entries]);

  // ── Filtered ledger ───────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (dateFrom && e.entry_date < dateFrom) return false;
      if (dateTo && e.entry_date > dateTo) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo]);

  // ── Load portal ───────────────────────────────────────────────
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

      const { data: memberRow, error: memberErr } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberErr) throw memberErr;

      const fid = memberRow?.family_id || null;
      if (!fid) {
        setFamilyId(null);
        setErrorMsg(
          "Your account is not linked to a family yet. Ask an admin to connect your login to your family account."
        );
        setLoading(false);
        return;
      }

      setFamilyId(fid);

      const { data: famRow, error: famErr } = await supabase
        .from("families")
        .select("name, parent_name, phone, address")
        .eq("id", fid)
        .maybeSingle();

      if (famErr) throw famErr;
      setFamilyName(famRow?.name || "");
      setParentName(famRow?.parent_name || "");
      setSettingsForm({
        parent_name: famRow?.parent_name || "",
        phone: famRow?.phone || "",
        address: famRow?.address || "",
        email: user.email || "",
      });

      const { data: ledgerRows, error: ledgerErr } = await supabase
        .from("ledger_entries")
        .select("id, entry_type, amount_cents, description, entry_date")
        .eq("family_id", fid)
        .order("entry_date", { ascending: false });

      if (ledgerErr) throw ledgerErr;
      setEntries(ledgerRows || []);

      const { data: studentData } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade")
        .eq("family_id", fid);

      setStudents(studentData || []);
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

  // ── Account settings save ─────────────────────────────────────
  const saveSettings = async () => {
    setSettingsLoading(true);
    setSettingsMsg("");
    try {
      // Update family row (name, phone, address)
      const { error: famErr } = await supabase
        .from("families")
        .update({
          parent_name: settingsForm.parent_name,
          phone: settingsForm.phone,
          address: settingsForm.address,
        })
        .eq("id", familyId);

      if (famErr) throw famErr;

      // Update email in auth if changed
      if (settingsForm.email && settingsForm.email !== email) {
        const { error: emailErr } = await supabase.auth.updateUser({
          email: settingsForm.email,
        });
        if (emailErr) throw emailErr;
        setSettingsMsg(
          "Profile updated! A confirmation link was sent to your new email — click it to complete the email change."
        );
      } else {
        setSettingsMsg("Profile updated successfully.");
      }

      setParentName(settingsForm.parent_name);
      setEmail(settingsForm.email || email);
      setTimeout(() => setSettingsMsg(""), 5000);
    } catch (err) {
      setSettingsMsg(err?.message || "Failed to update. Try again.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // ── PDF export ────────────────────────────────────────────────
  const exportPDF = async () => {
    

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // ── Letterhead ──
    // Top bar
    doc.setFillColor(30, 58, 138); // blue-900
    doc.rect(0, 0, pageW, 28, "F");

    // School name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Summer Crest Learning Academy", pageW / 2, 13, { align: "center" });

    // Tagline
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("Nurturing Minds. Building Futures.", pageW / 2, 21, { align: "center" });

    // Gold rule
    doc.setDrawColor(202, 138, 4); // yellow-600
    doc.setLineWidth(1.2);
    doc.line(14, 29, pageW - 14, 29);

    y = 40;

    // ── Statement title ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 138);
    doc.text("Account Statement", 14, y);

    // Date generated
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - 14, y, { align: "right" });

    y += 10;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    // ── Family info ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Account Holder", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${parentName || "—"}`, 14, y); y += 6;
    doc.text(`Family: ${familyName || "—"}`, 14, y); y += 6;
    doc.text(`Email: ${email || "—"}`, 14, y); y += 6;

    // Date range if filtered
    if (dateFrom || dateTo) {
      const range = `Period: ${dateFrom || "Beginning"} → ${dateTo || "Today"}`;
      doc.text(range, 14, y); y += 6;
    }

    y += 4;

    // ── Children ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text("Enrolled Students", 14, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    if (students.length === 0) {
      doc.text("No students on record.", 14, y); y += 6;
    } else {
      students.forEach((s) => {
        doc.text(`• ${s.first_name} ${s.last_name}  |  Grade: ${s.grade || "N/A"}`, 18, y);
        y += 6;
      });
    }

    y += 6;

    // ── Ledger table ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text("Ledger", 14, y);
    y += 6;

    // Table header
    doc.setFillColor(30, 58, 138);
    doc.rect(14, y, pageW - 28, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("Date", 16, y + 5.5);
    doc.text("Description", 46, y + 5.5);
    doc.text("Type", 130, y + 5.5);
    doc.text("Amount", pageW - 16, y + 5.5, { align: "right" });
    y += 10;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let rowShade = false;
    filteredEntries.forEach((e) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (rowShade) {
        doc.setFillColor(245, 247, 255);
        doc.rect(14, y - 4, pageW - 28, 8, "F");
      }
      doc.setTextColor(30, 30, 30);
      doc.text(e.entry_date || "—", 16, y);
      const desc = e.description?.length > 45
        ? e.description.substring(0, 45) + "…"
        : (e.description || "—");
      doc.text(desc, 46, y);
      doc.text(e.entry_type || "—", 130, y);
      doc.text(money(e.amount_cents), pageW - 16, y, { align: "right" });
      y += 8;
      rowShade = !rowShade;
    });

    if (filteredEntries.length === 0) {
      doc.setTextColor(120, 120, 120);
      doc.text("No entries for selected date range.", 16, y);
      y += 8;
    }

    // ── Balance row ──
    y += 4;
    doc.setDrawColor(202, 138, 4);
    doc.setLineWidth(0.8);
    doc.line(14, y, pageW - 14, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("Current Balance:", 14, y);
    doc.text(money(balanceCents), pageW - 14, y, { align: "right" });
    y += 12;

    // ── Footer ──
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "This statement is for informational purposes. Please contact the school office for questions.",
      pageW / 2,
      285,
      { align: "center" }
    );

    doc.save(`SummerCrest_Statement_${familyName.replace(/\s+/g, "_")}.pdf`);
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // ── Pay Now ───────────────────────────────────────────────────
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

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { familyId, amountCents: balanceCents },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
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

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Parent Portal</h1>
            <p className="text-gray-600 mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-blue-900">
                {parentName || email}
              </span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={() => { setShowSettings(!showSettings); setSettingsMsg(""); }}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {showSettings ? "Close Settings" : "Account Settings"}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 transition"
            >
              Log out
            </button>
          </div>
        </div>

        {errorMsg ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <p className="text-red-700 font-medium">{errorMsg}</p>
            <p className="text-gray-600 mt-2 text-sm">
              If you're testing: confirm your user has a row in <b>family_members</b>.
            </p>
          </div>
        ) : (
          <>
            {/* ── Account Settings ── */}
            {showSettings && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Account Settings</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent / Guardian Name</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={settingsForm.parent_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, parent_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      type="tel"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Home Address</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="your@email.com"
                      type="email"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Changing your email will send a confirmation link to the new address.
                    </p>
                  </div>
                </div>

                {settingsMsg && (
                  <p className={`mt-4 text-sm rounded-lg border px-3 py-2 ${
                    settingsMsg.includes("Failed")
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-green-50 border-green-200 text-green-700"
                  }`}>
                    {settingsMsg}
                  </p>
                )}

                <button
                  onClick={saveSettings}
                  disabled={settingsLoading}
                  className={`mt-4 rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${
                    settingsLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
                  }`}
                >
                  {settingsLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* ── Balance Card ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {familyName || "Family Account"}
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

            {/* ── Registered Children ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Registered Children</h3>
                <button
                  onClick={() => { setShowAddStudent(!showAddStudent); setSaveMsg(""); }}
                  className="text-sm font-medium text-blue-900 border border-blue-900 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
                >
                  {showAddStudent ? "Cancel" : "+ Add Child"}
                </button>
              </div>

              {saveMsg && (
                <p className={`text-sm rounded-lg border px-3 py-2 mb-4 ${
                  saveMsg.includes("Failed") || saveMsg.includes("Please")
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700"
                }`}>
                  {saveMsg}
                </p>
              )}

              {/* Add student form */}
              {showAddStudent && (
                <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-blue-900 mb-3">New Student</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="First name"
                      value={newStudent.first_name}
                      onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Last name"
                      value={newStudent.last_name}
                      onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Grade (optional)"
                      value={newStudent.grade}
                      onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Grade can only be set or changed by the school office.
                  </p>
                  <button
                    onClick={addStudent}
                    disabled={addingStudent}
                    className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                      addingStudent ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
                    }`}
                  >
                    {addingStudent ? "Adding…" : "Add Student"}
                  </button>
                </div>
              )}

              {/* Existing students */}
              {students.length === 0 ? (
                <p className="text-gray-500 text-sm">No students found for this account.</p>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      {editingId === student.id ? (
                        <div className="flex gap-2 flex-1 flex-wrap">
                          <input
                            className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                            placeholder="First name"
                          />
                          <input
                            className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                            placeholder="Last name"
                          />
                          <span className="text-sm text-gray-400 flex items-center px-2">
                            Grade: {student.grade || "N/A"} (admin only)
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-gray-500">Grade: {student.grade || "N/A"}</p>
                        </div>
                      )}
                      <div className="flex gap-2 shrink-0">
                        {editingId === student.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(student.id)}
                              className="text-sm bg-blue-900 text-white px-3 py-1 rounded-lg hover:bg-blue-950"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-sm border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(student)}
                            className="text-sm border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50"
                          >
                            Edit Name
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Ledger ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-lg font-semibold text-gray-700">Account Ledger</h3>
                <button
                  onClick={exportPDF}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 transition"
                >
                  ⬇ Export PDF
                </button>
              </div>

              {/* Date filter */}
              <div className="flex flex-wrap gap-3 mb-5 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline self-end pb-1"
                  >
                    Clear filter
                  </button>
                )}
                {(dateFrom || dateTo) && (
                  <span className="text-xs text-gray-400 self-end pb-1.5">
                    Showing {filteredEntries.length} of {entries.length} entries
                  </span>
                )}
              </div>

              {filteredEntries.length === 0 ? (
                <p className="text-gray-500">
                  {entries.length === 0
                    ? "No charges or payments have been posted yet."
                    : "No entries found for the selected date range."}
                </p>
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
                      {filteredEntries.map((e) => (
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

