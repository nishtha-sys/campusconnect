import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getAdminStats, getAllNotes, deleteNote } from '../api';

// ── Shared components ─────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
        {accent && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: accent.bg, color: accent.color }}>{accent.label}</span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      <p className="text-white/40 text-xs font-mono">{label}</p>
      {sub && <p className="text-white/25 text-xs">{sub}</p>}
    </div>
  );
}

function SubjectBar({ subject, count, max }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <p className="text-white/50 text-xs font-mono w-28 truncate">{subject}</p>
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: '#b8ff47' }} />
      </div>
      <p className="text-white/30 text-xs font-mono w-6 text-right">{count}</p>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(184,255,71,0.3)', borderTopColor: '#b8ff47' }} />
      <p className="text-white/30 text-xs font-mono">{label || 'Loading...'}</p>
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getAuth().currentUser.getIdToken();
        const data = await getAdminStats(idToken);
        if (data.error) throw new Error(data.error);
        setStats(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Spinner label="Loading stats..." />;
  if (error) return <p className="text-red-400 text-sm py-20 text-center">{error}</p>;

  const { notes, lostFound } = stats;
  const subjectEntries = Object.entries(notes.subjectBreakdown).sort((a, b) => b[1] - a[1]);
  const maxSubjectCount = subjectEntries[0]?.[1] || 1;

  return (
    <div>
      <p className="text-white/25 text-xs font-mono mb-8">
        Last updated {new Date(stats.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Notes Stats */}
      <div className="mb-10">
        <p className="text-white/50 text-xs font-mono uppercase tracking-widest mb-4">📘 Notes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <StatCard emoji="📄" label="Total Notes" value={notes.totalNotes} />
          <StatCard emoji="👁" label="Total Views" value={notes.totalViews} />
          <StatCard emoji="👤" label="Unique Uploaders" value={notes.uniqueUploaders} sub="distinct students" />
        </div>
        {subjectEntries.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs font-mono mb-4">Notes by subject</p>
            <div className="flex flex-col gap-3">
              {subjectEntries.map(([s, c]) => <SubjectBar key={s} subject={s} count={c} max={maxSubjectCount} />)}
            </div>
          </div>
        )}
      </div>

      {/* Lost & Found Stats */}
      <div className="mb-10">
        <p className="text-white/50 text-xs font-mono uppercase tracking-widest mb-4">🔍 Lost & Found</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard emoji="📦" label="Total Items" value={lostFound.totalItems} />
          <StatCard emoji="🔴" label="Lost" value={lostFound.lostCount} />
          <StatCard emoji="🟢" label="Found" value={lostFound.foundCount} />
          <StatCard emoji="✅" label="Resolved" value={lostFound.resolvedCount}
            accent={{ bg: 'rgba(184,255,71,0.1)', color: '#b8ff47', label: 'closed' }} />
          <StatCard emoji="🕐" label="Open" value={lostFound.openCount}
            accent={{ bg: 'rgba(255,165,0,0.1)', color: '#ffa500', label: 'open' }} />
          <StatCard emoji="🎯" label="Match Rate" value={`${lostFound.matchRate}%`}
            sub={`${lostFound.uniqueReporters} reporters`}
            accent={lostFound.matchRate >= 50
              ? { bg: 'rgba(184,255,71,0.1)', color: '#b8ff47', label: 'good' }
              : { bg: 'rgba(255,100,100,0.1)', color: '#ff6464', label: 'low' }} />
        </div>
      </div>

      <p className="text-white/15 text-xs font-mono text-center pb-4">
        stats computed live from firestore · admin only
      </p>
    </div>
  );
}

// ── Manage Notes Tab ──────────────────────────────────────────────────────────

function ManageNotesTab() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await getAllNotes();
      setNotes(data.notes || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete note "${title}"?`)) return;
    setDeletingId(id);
    try {
      const idToken = await getAuth().currentUser.getIdToken();
      await deleteNote(id, idToken);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally { setDeletingId(null); }
  };

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase()) ||
    n.uploader_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner label="Fetching notes..." />;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, subject, uploader..."
          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <span className="text-white/30 text-xs font-mono shrink-0">{filtered.length} notes</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/20 text-sm">No notes found</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header row */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 text-white/25 text-xs font-mono uppercase tracking-wider"
            style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="col-span-4">Title</span>
            <span className="col-span-2">Subject</span>
            <span className="col-span-2">Uploader</span>
            <span className="col-span-1 text-center">Views</span>
            <span className="col-span-2 text-center">Date</span>
            <span className="col-span-1"></span>
          </div>

          {/* Rows */}
          {filtered.map((note, i) => (
            <div key={note.id}
              className="grid grid-cols-12 gap-3 px-4 py-3 items-center transition-colors"
              style={{
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: deletingId === note.id ? 'rgba(255,60,60,0.05)' : 'transparent',
              }}>
              {/* Title */}
              <div className="col-span-4">
                <p className="text-white text-sm font-medium truncate">{note.title}</p>
                {note.tags?.length > 0 && (
                  <p className="text-white/25 text-xs truncate mt-0.5">
                    {note.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="col-span-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full truncate block"
                  style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {note.subject}
                </span>
              </div>

              {/* Uploader */}
              <p className="col-span-2 text-white/40 text-xs truncate">{note.uploader_name}</p>

              {/* Views */}
              <p className="col-span-1 text-white/30 text-xs font-mono text-center">{note.downloads || 0}</p>

              {/* Date */}
              <p className="col-span-2 text-white/25 text-xs font-mono text-center">
                {note.created_at ? new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
              </p>

              {/* Delete */}
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => handleDelete(note.id, note.title)}
                  disabled={deletingId === note.id}
                  className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(255,60,60,0.08)', color: 'rgba(255,100,100,0.6)', border: '1px solid rgba(255,60,60,0.15)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.18)'; e.currentTarget.style.color = '#ff6464'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.08)'; e.currentTarget.style.color = 'rgba(255,100,100,0.6)'; }}>
                  {deletingId === note.id ? '...' : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'stats', label: '📊 Stats' },
  { id: 'notes', label: '📘 Notes' },
];

export default function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div>
      {/* Header */}
      <div className="mb-8 stagger-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(184,255,71,0.1)', color: '#b8ff47', border: '1px solid rgba(184,255,71,0.2)' }}>
            ⚡ Admin
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white tracking-tight">Dashboard</h2>
        <p className="text-white/40 text-sm mt-1">Logged in as {user.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-8 w-fit"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200"
            style={activeTab === tab.id
              ? { background: 'rgba(184,255,71,0.15)', color: '#b8ff47' }
              : { color: 'rgba(255,255,255,0.35)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'stats' && <StatsTab />}
      {activeTab === 'notes' && <ManageNotesTab />}
    </div>
  );
}