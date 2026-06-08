import { useState, useEffect, useRef } from 'react';
import { uploadNote, searchNotes, getAllNotes, countDownload } from '../api';

function SkeletonCard() {
  return (
    <div className="card">
      <div className="shimmer h-3 w-16 rounded-full mb-3" />
      <div className="shimmer h-5 w-3/4 rounded mb-2" />
      <div className="shimmer h-3 w-1/3 rounded mb-4" />
      <div className="shimmer h-16 w-full rounded-lg mb-3" />
      <div className="flex gap-2">
        <div className="shimmer h-5 w-14 rounded-full" />
        <div className="shimmer h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

function NoteModal({ note, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-2xl p-6 max-h-[85vh] flex flex-col"
        style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white text-xl">{note.title}</h3>
            <p className="text-blue-400 text-xs mt-1 font-mono">📘 {note.subject}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}>✕</button>
        </div>

        {/* AI Summary */}
        {note.summary && (
          <div className="rounded-xl p-4 mb-4"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-xs font-mono mb-2" style={{ color: '#60a5fa' }}>✦ AI Summary</p>
            <p className="text-white/80 text-sm leading-relaxed">{note.summary}</p>
          </div>
        )}

        {/* Full notes */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-white/30 text-xs font-mono mb-2">FULL NOTES</p>
          <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-body">{note.raw_text}</pre>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-white/30 text-xs">By {note.uploader_name} · {note.downloads} views</p>
          <button onClick={onClose} className="btn-ghost text-xs px-4 py-2">Close</button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onView }) {
  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
          📘 {note.subject}
        </span>
        <span className="text-white/20 text-xs font-mono">{note.downloads} views</span>
      </div>

      <h3 className="font-display font-semibold text-white mb-3 leading-snug">{note.title}</h3>

      {/* AI Summary */}
      {note.summary && (
        <div className="rounded-xl p-3 mb-3"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs font-mono mb-1" style={{ color: '#b8ff47' }}>✦ AI</p>
          <p className="text-white/55 text-xs leading-relaxed line-clamp-3">{note.summary}</p>
        </div>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="tag-pill">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-white/30 text-xs">{note.uploader_name}</p>
        <button onClick={() => onView(note)}
          className="text-xs font-display font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,255,71,0.1)'; e.currentTarget.style.color = '#b8ff47'; e.currentTarget.style.borderColor = 'rgba(184,255,71,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          View Notes →
        </button>
      </div>
    </div>
  );
}

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeNote, setActiveNote] = useState(null);
  const [form, setForm] = useState({ title: '', subject: '', raw_text: '', uploader_name: user.displayName });
  const searchRef = useRef(null);

  const fetchNotes = async (q = query) => {
    setFetching(true);
    try {
      const data = q ? await searchNotes(q) : await getAllNotes();
      setNotes(data.notes ?? []);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchNotes(''); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes(query);
  };

  const handleUpload = async () => {
    if (!form.title.trim() || !form.subject.trim() || !form.raw_text.trim()) return;
    setLoading(true);
    try {
      await uploadNote(form);
      setShowForm(false);
      setForm({ title: '', subject: '', raw_text: '', uploader_name: user.displayName });
      fetchNotes('');
      setQuery('');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (note) => {
    await countDownload(note.id);
    setActiveNote(note);
  };

  return (
    <div>
      {activeNote && <NoteModal note={activeNote} onClose={() => setActiveNote(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 stagger-1">
        <div>
          <h2 className="font-display text-3xl font-bold text-white tracking-tight">Notes Sharing</h2>
          <p className="text-white/40 text-sm mt-1">AI-summarized study notes from your peers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-volt">
          {showForm ? '✕ Cancel' : '+ Upload Notes'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-8 stagger-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-display font-semibold text-white mb-1">Share Your Notes</h3>
          <p className="text-white/30 text-xs mb-5">AI will auto-generate a summary and tags</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Title (e.g. Thermodynamics Ch. 3)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
            />
            <input
              placeholder="Subject (e.g. Physics)"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input-field"
            />
          </div>
          <textarea
            placeholder="Paste your notes here… AI will read them and generate a summary + tags"
            value={form.raw_text}
            onChange={(e) => setForm({ ...form, raw_text: e.target.value })}
            rows={6}
            className="textarea-field mb-3"
          />
          <button onClick={handleUpload}
            disabled={loading || !form.title.trim() || !form.subject.trim() || !form.raw_text.trim()}
            className="btn-volt w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                AI is summarizing…
              </span>
            ) : 'Upload Notes'}
          </button>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 stagger-2">
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by subject, topic, or keyword…"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-volt px-5">Search</button>
        {query && (
          <button type="button" onClick={() => { setQuery(''); fetchNotes(''); }} className="btn-ghost px-4">
            Clear
          </button>
        )}
      </form>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-3">
        {fetching ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : notes.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-30">📚</span>
            <p className="text-white/30 text-sm">
              {query ? `No notes matching "${query}"` : 'No notes yet. Be the first to share!'}
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard key={note.id} note={note} onView={handleView} />
          ))
        )}
      </div>
    </div>
  );
}
