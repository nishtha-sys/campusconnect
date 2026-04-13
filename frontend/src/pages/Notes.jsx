import { useState, useEffect } from "react";
import { uploadNote, searchNotes, getAllNotes, countDownload } from "../api";

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", raw_text: "", uploader_name: user.displayName });

  const fetchNotes = async () => {
    const data = query ? await searchNotes(query) : await getAllNotes();
    setNotes(data.notes || []);
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleUpload = async () => {
    if (!form.title || !form.subject || !form.raw_text) return alert("Fill all fields including note text");
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    await uploadNote(fd);
    setLoading(false);
    setShowForm(false);
    setForm({ ...form, title: "", subject: "", raw_text: "" });
    fetchNotes();
  };

  const handleDownload = async (note) => {
    await countDownload(note.id);
    if (note.file_url) window.open(note.file_url, "_blank");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Notes Sharing</h2>
          <p className="text-slate-400 text-sm mt-1">AI-summarized study notes from your peers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl transition"
        >
          + Upload Notes
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">Upload Your Notes</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Title (e.g., Thermodynamics Ch.3)" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            <input placeholder="Subject (e.g., Physics)" value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <textarea placeholder="Paste your notes here (AI will summarize them)..." value={form.raw_text}
            onChange={e => setForm({ ...form, raw_text: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm mb-3 h-28 resize-none focus:outline-none focus:border-blue-500" />
          <button onClick={handleUpload} disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {loading ? "🤖 AI is summarizing..." : "Upload Notes"}
          </button>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by subject, topic, or keyword..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button type="submit"
          className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-xl text-sm font-medium transition">
          Search
        </button>
        <button type="button" onClick={() => { setQuery(""); getAllNotes().then(d => setNotes(d.notes || [])); }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-3 rounded-xl text-sm transition">
          Clear
        </button>
      </form>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 py-12">No notes yet. Be the first to share!</div>
        )}
        {notes.map(note => (
          <div key={note.id} className="bg-slate-900 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/50 transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{note.title}</h3>
                <p className="text-blue-400 text-xs mt-1">📘 {note.subject}</p>
              </div>
              <span className="text-xs text-slate-500">{note.downloads} ↓</span>
            </div>

            {/* AI Summary */}
            {note.summary && (
              <div className="bg-slate-800 rounded-lg p-3 mb-3">
                <p className="text-xs text-slate-400 font-medium mb-1">🤖 AI Summary</p>
                <p className="text-slate-300 text-xs leading-relaxed">{note.summary}</p>
              </div>
            )}

            {/* Tags */}
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {note.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">By {note.uploader_name}</p>
              <button onClick={() => { countDownload(note.id); alert(note.raw_text); }}
                className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition">
                👁 View Notes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
