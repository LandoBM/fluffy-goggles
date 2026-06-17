import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

const EVENT_TYPE_LABELS = {
  event: "Event",
  important: "Important",
  noschool: "No School",
};

const EVENT_TYPE_COLORS = {
  event: "bg-blue-100 text-blue-800 border-blue-300",
  important: "bg-yellow-100 text-yellow-800 border-yellow-300",
  noschool: "bg-red-100 text-red-700 border-red-300",
};

export default function AdminPortal() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [entries, setEntries] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ first_name: "", last_name: "", grade: "" });
  const [addingStudent, setAddingStudent] = useState(false);

  const [entryType, setEntryType] = useState("charge");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [removingAccount, setRemovingAccount] = useState(false);

  // ── Tabs ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("families");

  // ── Announcements ─────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "", body: "", posted_at: new Date().toISOString().split("T")[0], kicker: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  // ── Calendar ──────────────────────────────────────────────────
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "", date: new Date().toISOString().split("T")[0],
    type: "event", description: "",
  });
  const [eventSaving, setEventSaving] = useState(false);
  const [eventMsg, setEventMsg] = useState("");
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [calendarFilter, setCalendarFilter] = useState("upcoming"); // "upcoming" | "all"

  const selectedFamilyData = families.find((f) => f.id === selectedFamily) || null;

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData?.user;
      if (!user) { setErrorMsg("You are not logged in."); setLoading(false); return; }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profileErr) throw profileErr;
      if (profile?.role !== "admin") {
        setErrorMsg("You do not have permission to view this page.");
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await Promise.all([loadFamilies(), loadAnnouncements(), loadCalendarEvents()]);
      setLoading(false);
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // ── Families ──────────────────────────────────────────────────
  const loadFamilies = async () => {
    const { data: familyRows, error: familyError } = await supabase
      .from("families").select("id, name, parent_name, phone, address, status")
      .order("name", { ascending: true });
    if (familyError) throw familyError;

    const familyIds = (familyRows || []).map((f) => f.id);
    let studentsByFamily = {};
    if (familyIds.length > 0) {
      const { data: studentRows, error: studentError } = await supabase
        .from("students").select("id, family_id, first_name, last_name, grade")
        .in("family_id", familyIds).order("last_name", { ascending: true });
      if (studentError) throw studentError;
      studentsByFamily = (studentRows || []).reduce((acc, s) => {
        if (!acc[s.family_id]) acc[s.family_id] = [];
        acc[s.family_id].push(s);
        return acc;
      }, {});
    }

    const visible = (familyRows || [])
      .map((f) => ({ ...f, students: studentsByFamily[f.id] || [] }))
      .filter((f) => f.status !== "removed" && (f.parent_name || f.name || f.students.length > 0));
    setFamilies(visible);
  };

  const loadLedger = async (familyId) => {
    setSelectedFamily(familyId);
    setErrorMsg("");
    setShowAddStudent(false);
    const { data, error } = await supabase
      .from("ledger_entries").select("id, entry_type, amount_cents, description, entry_date")
      .eq("family_id", familyId).order("entry_date", { ascending: false });
    if (error) { setErrorMsg(error.message); return; }
    setEntries(data || []);
  };

  const balanceFor = (rows) =>
    (rows || []).reduce((acc, row) => {
      const up = row.entry_type === "charge" || row.entry_type === "adjustment";
      return acc + (up ? row.amount_cents : -row.amount_cents);
    }, 0);

  const addStudent = async (e) => {
    e.preventDefault();
    if (!selectedFamily || !newStudent.first_name || !newStudent.last_name) {
      alert("Enter the child's first and last name."); return;
    }
    setAddingStudent(true);
    const { error } = await supabase.from("students").insert({
      family_id: selectedFamily, first_name: newStudent.first_name,
      last_name: newStudent.last_name, grade: newStudent.grade || null,
    });
    setAddingStudent(false);
    if (error) { setErrorMsg(error.message || "Could not add child."); return; }
    setNewStudent({ first_name: "", last_name: "", grade: "" });
    setShowAddStudent(false);
    await loadFamilies();
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!selectedFamily || !amount || isNaN(Number(amount))) {
      alert("Enter a valid dollar amount."); return;
    }
    setSaving(true);
    const { error } = await supabase.from("ledger_entries").insert({
      family_id: selectedFamily, entry_type: entryType,
      amount_cents: Math.round(Number(amount) * 100),
      description: description || null, entry_date: entryDate,
    });
    setSaving(false);
    if (error) { alert(error.message || "Could not add entry."); return; }
    setAmount(""); setDescription("");
    await loadLedger(selectedFamily);
  };

  const removeParentAccount = async () => {
    if (!selectedFamily) return;
    if (!window.confirm("Remove this parent account? Children and ledger records will stay saved.")) return;
    setRemovingAccount(true);
    await supabase.from("family_members").delete().eq("family_id", selectedFamily);
    const { error } = await supabase.from("families")
      .update({ parent_name: null, name: null, phone: null, address: null, status: "removed" })
      .eq("id", selectedFamily);
    setRemovingAccount(false);
    if (error) { setErrorMsg(error.message || "Could not remove parent account."); return; }
    setSelectedFamily(null); setEntries([]); setShowAddStudent(false);
    await loadFamilies();
  };

  // ── Announcements ─────────────────────────────────────────────
  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    const { data, error } = await supabase
      .from("announcements").select("id, title, body, kicker, image_url, posted_at")
      .order("posted_at", { ascending: false });
    if (!error) setAnnouncements(data || []);
    setAnnouncementsLoading(false);
  };

  const openNewAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: "", body: "", posted_at: new Date().toISOString().split("T")[0], kicker: "" });
    setImageFile(null); setImagePreview(""); setAnnouncementMsg("");
    setShowAnnouncementForm(true);
  };

  const openEditAnnouncement = (a) => {
    setEditingAnnouncement(a.id);
    setAnnouncementForm({
      title: a.title || "", body: a.body || "",
      posted_at: a.posted_at || new Date().toISOString().split("T")[0], kicker: a.kicker || "",
    });
    setImageFile(null); setImagePreview(a.image_url || ""); setAnnouncementMsg("");
    setShowAnnouncementForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const ext = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("announcement-images").upload(fileName, imageFile, { upsert: true });
    if (error) throw new Error("Image upload failed: " + error.message);
    const { data: urlData } = supabase.storage.from("announcement-images").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const saveAnnouncement = async () => {
    if (!announcementForm.title.trim()) { setAnnouncementMsg("Title is required."); return; }
    if (!announcementForm.body.trim()) { setAnnouncementMsg("Body / caption is required."); return; }
    if (!announcementForm.posted_at) { setAnnouncementMsg("Date is required."); return; }
    if (!editingAnnouncement && !imageFile) { setAnnouncementMsg("An image is required for new announcements."); return; }

    setAnnouncementSaving(true); setAnnouncementMsg("");
    try {
      let imageUrl = imagePreview;
      if (imageFile) imageUrl = await uploadImage();

      const payload = {
        title: announcementForm.title.trim(), body: announcementForm.body.trim(),
        kicker: announcementForm.kicker.trim() || null,
        posted_at: announcementForm.posted_at, image_url: imageUrl || null,
      };

      if (editingAnnouncement) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", editingAnnouncement);
        if (error) throw error;
        setAnnouncementMsg("Announcement updated!");
      } else {
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
        setAnnouncementMsg("Announcement posted!");
      }

      await loadAnnouncements();
      setShowAnnouncementForm(false); setEditingAnnouncement(null);
    } catch (err) {
      setAnnouncementMsg(err?.message || "Failed to save announcement.");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
    setDeletingId(id);
    await supabase.from("announcements").delete().eq("id", id);
    setDeletingId(null);
    await loadAnnouncements();
  };

  // ── Calendar ──────────────────────────────────────────────────
  const loadCalendarEvents = async () => {
    setCalendarLoading(true);
    const { data, error } = await supabase
      .from("calendar_events").select("id, title, date, type, description")
      .order("date", { ascending: true });
    if (!error) setCalendarEvents(data || []);
    setCalendarLoading(false);
  };

  const openNewEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: "", date: new Date().toISOString().split("T")[0], type: "event", description: "" });
    setEventMsg("");
    setShowEventForm(true);
  };

  const openEditEvent = (ev) => {
    setEditingEvent(ev.id);
    setEventForm({ title: ev.title || "", date: ev.date || "", type: ev.type || "event", description: ev.description || "" });
    setEventMsg("");
    setShowEventForm(true);
  };

  const saveEvent = async () => {
    if (!eventForm.title.trim()) { setEventMsg("Title is required."); return; }
    if (!eventForm.date) { setEventMsg("Date is required."); return; }

    setEventSaving(true); setEventMsg("");
    try {
      const payload = {
        title: eventForm.title.trim(), date: eventForm.date,
        type: eventForm.type, description: eventForm.description.trim() || null,
      };

      if (editingEvent) {
        const { error } = await supabase.from("calendar_events").update(payload).eq("id", editingEvent);
        if (error) throw error;
        setEventMsg("Event updated!");
      } else {
        const { error } = await supabase.from("calendar_events").insert(payload);
        if (error) throw error;
        setEventMsg("Event added!");
      }

      await loadCalendarEvents();
      setShowEventForm(false); setEditingEvent(null);
    } catch (err) {
      setEventMsg(err?.message || "Failed to save event.");
    } finally {
      setEventSaving(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    setDeletingEventId(id);
    await supabase.from("calendar_events").delete().eq("id", id);
    setDeletingEventId(null);
    await loadCalendarEvents();
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredEvents = calendarFilter === "upcoming"
    ? calendarEvents.filter((e) => e.date >= today)
    : calendarEvents;

  // ── UI ────────────────────────────────────────────────────────
  if (loading) return <div className="min-h-screen bg-gray-50 px-4 py-10">Loading admin portal...</div>;

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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Principal Admin Portal</h1>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
            className="inline-flex items-center justify-center rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 transition"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {["families", "announcements", "calendar"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition capitalize ${
                activeTab === tab ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab === "families" ? "Parent Accounts" : tab === "announcements" ? "Announcements" : "Calendar"}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{errorMsg}</div>
        )}

        {/* ── FAMILIES TAB ── */}
        {activeTab === "families" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:col-span-1">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Parent Accounts</h2>
              {families.length === 0 ? (
                <p className="text-gray-500 text-sm">No parent accounts found.</p>
              ) : (
                <ul className="space-y-2 max-h-[650px] overflow-y-auto">
                  {families.map((family) => (
                    <li key={family.id}>
                      <button
                        onClick={() => loadLedger(family.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition ${
                          selectedFamily === family.id ? "bg-blue-900 text-white" : "hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        <p className="font-semibold">{family.parent_name || family.name || "Parent Account"}</p>
                        {family.name && family.parent_name && <p className="text-xs opacity-80">{family.name}</p>}
                        {family.students?.length > 0 ? (
                          <ul className="mt-2 text-xs opacity-90 space-y-1">
                            {family.students.map((s) => (
                              <li key={s.id}>{s.first_name} {s.last_name}{s.grade ? ` - Grade ${s.grade}` : ""}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs opacity-70">No children listed</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="md:col-span-2 space-y-6">
              {!selectedFamily ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-500">
                  Select a parent account from the list to view children, balance, and ledger details.
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-4xl font-bold text-blue-900 mt-1">{money(balanceFor(entries))}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Parent & Children</h2>
                    <p className="text-sm text-gray-500">Parent</p>
                    <p className="text-xl font-bold text-blue-900">
                      {selectedFamilyData?.parent_name || selectedFamilyData?.name || "Parent Account"}
                    </p>
                    {selectedFamilyData?.phone && <p className="text-sm text-gray-600 mt-2">Phone: {selectedFamilyData.phone}</p>}
                    {selectedFamilyData?.address && <p className="text-sm text-gray-600">Address: {selectedFamilyData.address}</p>}

                    <div className="mt-5">
                      <p className="text-sm text-gray-500 mb-2">Children</p>
                      {selectedFamilyData?.students?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedFamilyData.students.map((s) => (
                            <li key={s.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                              <span className="font-medium text-gray-800">{s.first_name} {s.last_name}</span>
                              {s.grade && <span className="text-gray-500"> - Grade {s.grade}</span>}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-gray-500">No children listed.</p>}
                    </div>

                    <div className="mt-5">
                      {!showAddStudent ? (
                        <button type="button" onClick={() => setShowAddStudent(true)}
                          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition">
                          Add Child
                        </button>
                      ) : (
                        <form onSubmit={addStudent}
                          className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input type="text" value={newStudent.first_name}
                            onChange={(e) => setNewStudent((p) => ({ ...p, first_name: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2" placeholder="First name" required />
                          <input type="text" value={newStudent.last_name}
                            onChange={(e) => setNewStudent((p) => ({ ...p, last_name: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Last name" required />
                          <input type="text" value={newStudent.grade}
                            onChange={(e) => setNewStudent((p) => ({ ...p, grade: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Grade" />
                          <div className="sm:col-span-3 flex gap-3">
                            <button type="submit" disabled={addingStudent}
                              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${addingStudent ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800"}`}>
                              {addingStudent ? "Adding..." : "Save Child"}
                            </button>
                            <button type="button" onClick={() => { setShowAddStudent(false); setNewStudent({ first_name: "", last_name: "", grade: "" }); }}
                              className="rounded-lg px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-white transition">
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <button type="button" onClick={removeParentAccount} disabled={removingAccount}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${removingAccount ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>
                        {removingAccount ? "Removing..." : "Remove Parent Account"}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Removes the parent from the list while keeping children and ledger records saved.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Charge / Payment / Adjustment</h3>
                    <form onSubmit={addEntry} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Type</label>
                        <select value={entryType} onChange={(e) => setEntryType(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option value="charge">Charge (increases balance)</option>
                          <option value="payment">Payment (decreases balance)</option>
                          <option value="adjustment">Adjustment (increases balance)</option>
                          <option value="credit">Credit (decreases balance)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Amount ($)</label>
                        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Description</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. March tuition" />
                      </div>
                      <div className="sm:col-span-2">
                        <button type="submit" disabled={saving}
                          className={`rounded-lg px-6 py-2.5 text-white font-medium transition ${saving ? "bg-blue-900/50 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800"}`}>
                          {saving ? "Saving..." : "Add Entry"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Ledger History</h3>
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
                            {entries.map((entry) => (
                              <tr key={entry.id} className="border-b last:border-b-0">
                                <td className="py-3 px-2 text-gray-700">{entry.entry_date}</td>
                                <td className="py-3 px-2 text-gray-700">{entry.description}</td>
                                <td className="py-3 px-2 capitalize text-gray-600">{entry.entry_type}</td>
                                <td className="py-3 px-2 text-right font-medium text-gray-800">{money(entry.amount_cents)}</td>
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
        )}

        {/* ── ANNOUNCEMENTS TAB ── */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-900">Manage Announcements</h2>
              {!showAnnouncementForm && (
                <button onClick={openNewAnnouncement}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition">
                  + New Announcement
                </button>
              )}
            </div>

            {showAnnouncementForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-5">
                  {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. Summer Registration Now Open" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kicker <span className="text-gray-400 text-xs">(optional — shown above headline in gold)</span>
                    </label>
                    <input type="text" value={announcementForm.kicker}
                      onChange={(e) => setAnnouncementForm((p) => ({ ...p, kicker: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. IMPORTANT UPDATE" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body / Caption <span className="text-red-500">*</span></label>
                    <textarea rows={4} value={announcementForm.body}
                      onChange={(e) => setAnnouncementForm((p) => ({ ...p, body: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                      placeholder="Write the announcement body here..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Date <span className="text-red-500">*</span></label>
                    <input type="date" value={announcementForm.posted_at}
                      onChange={(e) => setAnnouncementForm((p) => ({ ...p, posted_at: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image {!editingAnnouncement && <span className="text-red-500">*</span>}
                      {editingAnnouncement && <span className="text-gray-400 text-xs"> (leave blank to keep existing)</span>}
                    </label>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded-lg mb-2" />
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Click to upload an image</p>
                          <p className="text-gray-300 text-xs mt-1">JPG, PNG, GIF, WEBP</p>
                        </div>
                      )}
                      {imagePreview && <p className="text-xs text-blue-900 underline mt-2">Click to change image</p>}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                  {announcementMsg && (
                    <p className={`text-sm rounded-lg border px-3 py-2 ${
                      announcementMsg.includes("required") || announcementMsg.includes("Failed")
                        ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
                    }`}>{announcementMsg}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveAnnouncement} disabled={announcementSaving}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${announcementSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800"}`}>
                      {announcementSaving ? "Saving…" : editingAnnouncement ? "Update Announcement" : "Post Announcement"}
                    </button>
                    <button onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null); setAnnouncementMsg(""); }}
                      className="rounded-lg px-5 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {announcementsLoading ? (
              <p className="text-gray-500 text-sm">Loading announcements...</p>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-500">No announcements posted yet.</div>
            ) : (
              <div className="space-y-4">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex gap-5 items-start">
                    {a.image_url && (
                      <img src={a.image_url} alt={a.title} className="w-24 h-24 object-cover rounded-lg border border-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {a.kicker && <p className="text-xs uppercase tracking-widest text-yellow-600 font-bold mb-1">{a.kicker}</p>}
                      <h3 className="font-semibold text-gray-800 text-base truncate">{a.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 mb-2">{a.posted_at}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{a.body}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => openEditAnnouncement(a)}
                        className="text-sm border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Edit</button>
                      <button onClick={() => deleteAnnouncement(a.id)} disabled={deletingId === a.id}
                        className="text-sm border border-red-200 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition">
                        {deletingId === a.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-900">Manage Calendar Events</h2>
              {!showEventForm && (
                <button onClick={openNewEvent}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition">
                  + Add Event
                </button>
              )}
            </div>

            {/* Event form */}
            {showEventForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-5">
                  {editingEvent ? "Edit Event" : "New Calendar Event"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={eventForm.title}
                      onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. Field Trip: Zoo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                    <input type="date" value={eventForm.date}
                      onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                    <select value={eventForm.type}
                      onChange={(e) => setEventForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
                      <option value="event">Event (blue)</option>
                      <option value="important">Important (yellow)</option>
                      <option value="noschool">No School (red)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input type="text" value={eventForm.description}
                      onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g. Meet at front entrance by 8am" />
                  </div>
                </div>

                {eventMsg && (
                  <p className={`mt-4 text-sm rounded-lg border px-3 py-2 ${
                    eventMsg.includes("required") || eventMsg.includes("Failed")
                      ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
                  }`}>{eventMsg}</p>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={saveEvent} disabled={eventSaving}
                    className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${eventSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-800"}`}>
                    {eventSaving ? "Saving…" : editingEvent ? "Update Event" : "Add Event"}
                  </button>
                  <button onClick={() => { setShowEventForm(false); setEditingEvent(null); setEventMsg(""); }}
                    className="rounded-lg px-5 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Filter toggle */}
            <div className="flex gap-2">
              {["upcoming", "all"].map((f) => (
                <button key={f} onClick={() => setCalendarFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                    calendarFilter === f ? "bg-blue-900 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {f === "upcoming" ? "Upcoming" : "All Events"}
                </button>
              ))}
            </div>

            {/* Events list */}
            {calendarLoading ? (
              <p className="text-gray-500 text-sm">Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-500">
                {calendarFilter === "upcoming" ? "No upcoming events." : "No events yet."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.event}`}>
                      {EVENT_TYPE_LABELS[ev.type] || ev.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.date}{ev.description ? ` — ${ev.description}` : ""}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openEditEvent(ev)}
                        className="text-sm border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Edit</button>
                      <button onClick={() => deleteEvent(ev.id)} disabled={deletingEventId === ev.id}
                        className="text-sm border border-red-200 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition">
                        {deletingEventId === ev.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}