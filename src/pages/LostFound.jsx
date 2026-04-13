import { useState, useEffect } from 'react';
import { reportItem, getItems, resolveItem } from '../api';

const CATEGORIES = ['All', 'Electronics', 'Books & Notes', 'Clothing', 'ID & Cards', 'Keys', 'Bags', 'Other'];

const TYPE_CONFIG = {
  lost: { label: 'Lost', emoji: '📍', accent: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)' },
  found: { label: 'Found', emoji: '✦', accent: '#b8ff47', bg: 'rgba(184,255,71,0.08)', border: 'rgba(184,255,71,0.2)' },
};

function SkeletonCard() {
  return (
    <div className="card">
      <div className="shimmer h-4 w-20 rounded-full mb-4" />
      <div className="shimmer h-4 w-full rounded mb-2" />
      <div className="shimmer h-4 w-3/4 rounded mb-4" />
      <div className="shimmer h-3 w-1/2 rounded" />
    </div>
  );
}

function ItemCard({ item, user, onResolve }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.lost;
  const isOwn = item.contact === user.email;

  return (
    <div className="card group" style={item.status === 'resolved' ? { opacity: 0.45 } : {}}>
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}>
          {cfg.emoji} {cfg.label.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          {item.status === 'resolved' && (
            <span className="text-xs font-mono text-white/30">resolved</span>
          )}
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white text-sm leading-relaxed mb-3">{item.description}</p>

      {/* Meta */}
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-white/40 text-xs flex items-center gap-1.5">
          <span style={{ color: cfg.accent }}>◎</span> {item.location}
        </p>
        <p className="text-white/40 text-xs flex items-center gap-1.5">
          <span>→</span> {item.contact}
        </p>
      </div>

      {/* Resolve button */}
      {item.status === 'open' && isOwn && (
        <button onClick={() => onResolve(item.id)}
          className="text-xs font-display font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{ background: 'rgba(184,255,71,0.1)', color: '#b8ff47', border: '1px solid rgba(184,255,71,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,255,71,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,255,71,0.1)'}>
          Mark as Resolved ✓
        </button>
      )}

      {/* Timestamp */}
      <p className="text-white/20 text-xs font-mono mt-3">
        {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  );
}

export default function LostFound({ user }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({ type: '', category: 'All' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiMatches, setAiMatches] = useState([]);
  const [form, setForm] = useState({ type: 'lost', description: '', location: '', contact: user.email });

  const fetchItems = async () => {
    setFetching(true);
    try {
      const data = await getItems(filter.type, filter.category);
      setItems(data.items ?? []);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchItems(); }, [filter]);

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.location.trim()) return;
    setLoading(true);
    try {
      const result = await reportItem(form);
      setAiMatches(result.ai_matches ?? []);
      setShowForm(false);
      setForm({ type: 'lost', description: '', location: '', contact: user.email });
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    await resolveItem(id);
    fetchItems();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 stagger-1">
        <div>
          <h2 className="font-display text-3xl font-bold text-white tracking-tight">Lost &amp; Found</h2>
          <p className="text-white/40 text-sm mt-1">AI-powered item matching across campus</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setAiMatches([]); }} className="btn-volt">
          {showForm ? '✕ Cancel' : '+ Report Item'}
        </button>
      </div>

      {/* AI Match Alert */}
      {aiMatches.length > 0 && (
        <div className="rounded-2xl p-5 mb-6 stagger-1"
          style={{ background: 'rgba(184,255,71,0.06)', border: '1px solid rgba(184,255,71,0.2)' }}>
          <p className="font-display font-semibold text-sm mb-3" style={{ color: '#b8ff47' }}>
            ✦ AI found {aiMatches.length} possible match{aiMatches.length > 1 ? 'es' : ''}
          </p>
          {aiMatches.map((m, i) => (
            <div key={i} className="flex flex-col gap-0.5 text-sm text-white/70 mb-2">
              <span className="text-white">{m.description}</span>
              <span className="text-white/40 text-xs">Found at {m.location} · Contact: {m.contact}</span>
            </div>
          ))}
        </div>
      )}

      {/* Report Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-8 stagger-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-display font-semibold text-white mb-5">Report an Item</h3>

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            {['lost', 'found'].map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                className="py-2.5 rounded-lg text-sm font-display font-medium transition-all duration-200"
                style={form.type === t
                  ? { background: t === 'lost' ? '#ff6b6b' : '#b8ff47', color: '#09090f' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {t === 'lost' ? '📍 I Lost Something' : '✦ I Found Something'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <textarea
              placeholder="Describe the item in detail… (AI will auto-categorize)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="textarea-field"
            />
            <input
              placeholder="Location (e.g. Library Block B, Canteen)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
            />
            <input
              placeholder="Contact (email or phone)"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="input-field"
            />
            <button onClick={handleSubmit} disabled={loading || !form.description.trim() || !form.location.trim()}
              className="btn-volt w-full py-3 mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  AI is processing…
                </span>
              ) : 'Submit Report'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6 stagger-2">
        {['', 'lost', 'found'].map((t) => (
          <button key={t}
            onClick={() => setFilter({ ...filter, type: t })}
            className="px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-200"
            style={filter.type === t
              ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
            {t === '' ? 'All' : t === 'lost' ? '📍 Lost' : '✦ Found'}
          </button>
        ))}
        <span className="text-white/10 self-center mx-1">|</span>
        {CATEGORIES.map((c) => (
          <button key={c}
            onClick={() => setFilter({ ...filter, category: c })}
            className="px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-200"
            style={filter.category === c
              ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-3">
        {fetching ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-30">🔍</span>
            <p className="text-white/30 text-sm">No items reported yet. Be the first!</p>
          </div>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} user={user} onResolve={handleResolve} />
          ))
        )}
      </div>
    </div>
  );
}
