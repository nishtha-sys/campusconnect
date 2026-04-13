import { useState, useEffect } from "react";
import { reportItem, getItems, resolveItem } from "../api";

const CATEGORIES = ["All", "Electronics", "Books & Notes", "Clothing", "ID & Cards", "Keys", "Bags", "Other"];

export default function LostFound({ user }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({ type: "", category: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [form, setForm] = useState({ type: "lost", description: "", location: "", contact: user.email });

  const fetchItems = async () => {
    const data = await getItems(filter.type, filter.category === "All" ? "" : filter.category);
    setItems(data.items || []);
  };

  useEffect(() => { fetchItems(); }, [filter]);

  const handleSubmit = async () => {
    if (!form.description || !form.location) return alert("Fill all fields");
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const result = await reportItem(fd);
    setLoading(false);
    setShowForm(false);
    setAiMatches(result.ai_matches || []);
    fetchItems();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Lost & Found</h2>
          <p className="text-slate-400 text-sm mt-1">AI-powered item matching on campus</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl transition"
        >
          + Report Item
        </button>
      </div>

      {/* AI Match Alert */}
      {aiMatches.length > 0 && (
        <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <p className="text-emerald-400 font-semibold mb-2">🤖 AI found {aiMatches.length} possible match(es)!</p>
          {aiMatches.map((m, i) => (
            <div key={i} className="text-sm text-slate-300">📍 {m.description} — Found at {m.location} — Contact: {m.contact}</div>
          ))}
        </div>
      )}

      {/* Report Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">Report an Item</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button onClick={() => setForm({ ...form, type: "lost" })}
              className={`py-2 rounded-lg text-sm font-medium transition ${form.type === "lost" ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400"}`}>
              😢 I Lost Something
            </button>
            <button onClick={() => setForm({ ...form, type: "found" })}
              className={`py-2 rounded-lg text-sm font-medium transition ${form.type === "found" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}>
              🙌 I Found Something
            </button>
          </div>
          <textarea placeholder="Describe the item in detail..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm mb-3 h-24 resize-none focus:outline-none focus:border-emerald-500" />
          <input placeholder="Location (e.g., Library Block B)" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm mb-3 focus:outline-none focus:border-emerald-500" />
          <input placeholder="Contact (email or phone)" value={form.contact}
            onChange={e => setForm({ ...form, contact: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm mb-3 focus:outline-none focus:border-emerald-500" />

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
            {loading ? "🤖 AI is processing..." : "Submit Report"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["", "lost", "found"].map(t => (
          <button key={t} onClick={() => setFilter({ ...filter, type: t })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter.type === t ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {t === "" ? "All" : t === "lost" ? "😢 Lost" : "🙌 Found"}
          </button>
        ))}
        <span className="text-slate-700">|</span>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter({ ...filter, category: c })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter.category === c ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 py-12">No items found. Be the first to report!</div>
        )}
        {items.map(item => (
          <div key={item.id} className={`bg-slate-900 border rounded-xl p-5 ${item.status === "resolved" ? "border-slate-700 opacity-50" : item.type === "lost" ? "border-red-500/30" : "border-emerald-500/30"}`}>
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {item.type === "lost" ? "😢 LOST" : "🙌 FOUND"}
              </span>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{item.category}</span>
            </div>
            <p className="text-white text-sm mb-2">{item.description}</p>
            <p className="text-slate-400 text-xs">📍 {item.location}</p>
            <p className="text-slate-400 text-xs">📞 {item.contact}</p>
            {item.status === "open" && item.contact === user.email && (
              <button onClick={() => { resolveItem(item.id); fetchItems(); }}
                className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg transition">
                ✅ Mark Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
