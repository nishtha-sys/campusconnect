import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getAdminStats } from '../api';

function StatCard({ emoji, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
        {accent && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: accent.bg, color: accent.color }}>
            {accent.label}
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      <p className="text-white/40 text-xs font-mono">{label}</p>
      {sub && <p className="text-white/25 text-xs">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="font-display font-semibold text-white text-lg">{title}</h3>
      {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
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

export default function Admin({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const idToken = await getAuth().currentUser.getIdToken();
        const data = await getAdminStats(idToken);
        if (data.error) throw new Error(data.error);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(184,255,71,0.4)', borderTopColor: 'transparent' }} />
      <p className="text-white/30 text-xs font-mono">Loading stats...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-2">
      <p className="text-red-400 text-sm">Failed to load stats</p>
      <p className="text-white/30 text-xs font-mono">{error}</p>
    </div>
  );

  const { notes, lostFound } = stats;
  const subjectEntries = Object.entries(notes.subjectBreakdown).sort((a, b) => b[1] - a[1]);
  const maxSubjectCount = subjectEntries[0]?.[1] || 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-10 stagger-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(184,255,71,0.1)', color: '#b8ff47', border: '1px solid rgba(184,255,71,0.2)' }}>
            ⚡ Admin
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white tracking-tight">Dashboard</h2>
        <p className="text-white/40 text-sm mt-1">
          Last updated {new Date(stats.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Notes Stats */}
      <div className="mb-10 stagger-1">
        <SectionHeader title="📘 Notes" subtitle="Shared study notes across campus" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <StatCard emoji="📄" label="Total Notes" value={notes.totalNotes} />
          <StatCard emoji="👁" label="Total Views" value={notes.totalViews} />
          <StatCard emoji="👤" label="Unique Uploaders" value={notes.uniqueUploaders}
            sub="distinct students" />
        </div>

        {/* Subject breakdown */}
        {subjectEntries.length > 0 && (
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs font-mono mb-4">Notes by subject</p>
            <div className="flex flex-col gap-3">
              {subjectEntries.map(([subject, count]) => (
                <SubjectBar key={subject} subject={subject} count={count} max={maxSubjectCount} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lost & Found Stats */}
      <div className="mb-10 stagger-1">
        <SectionHeader title="🔍 Lost & Found" subtitle="Item reports and resolution rate" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <StatCard emoji="📦" label="Total Items" value={lostFound.totalItems} />
          <StatCard emoji="🔴" label="Lost Reports" value={lostFound.lostCount} />
          <StatCard emoji="🟢" label="Found Reports" value={lostFound.foundCount} />
          <StatCard emoji="✅" label="Resolved" value={lostFound.resolvedCount}
            accent={{ bg: 'rgba(184,255,71,0.1)', color: '#b8ff47', label: 'closed' }} />
          <StatCard emoji="🕐" label="Still Open" value={lostFound.openCount}
            accent={{ bg: 'rgba(255,165,0,0.1)', color: '#ffa500', label: 'open' }} />
          <StatCard emoji="🎯" label="Match Rate" value={`${lostFound.matchRate}%`}
            sub={`${lostFound.uniqueReporters} unique reporters`}
            accent={lostFound.matchRate >= 50
              ? { bg: 'rgba(184,255,71,0.1)', color: '#b8ff47', label: 'good' }
              : { bg: 'rgba(255,100,100,0.1)', color: '#ff6464', label: 'low' }} />
        </div>
      </div>

      {/* Footer note */}
      <p className="text-white/15 text-xs font-mono text-center pb-4">
        stats are computed live from firestore · visible to admin only
      </p>
    </div>
  );
}