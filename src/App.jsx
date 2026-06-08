import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import LostFound from './pages/LostFound';
import Notes from './pages/Notes';
import Login from './pages/Login';

export default function App() {
  const [page, setPage] = useState('lost-found');
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen" style={{ background: '#09090f' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(9,9,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: '#b8ff47' }}>🎓</div>
          <span className="font-display font-bold text-white tracking-tight hidden sm:block">CampusConnect</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <button onClick={() => setPage('lost-found')}
            className="px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200"
            style={page === 'lost-found'
              ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
              : { color: 'rgba(255,255,255,0.4)' }}>
            <span className="sm:hidden">🔍</span>
            <span className="hidden sm:inline">🔍 Lost &amp; Found</span>
          </button>
          <button onClick={() => setPage('notes')}
            className="px-4 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200"
            style={page === 'notes'
              ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
              : { color: 'rgba(255,255,255,0.4)' }}>
            <span className="sm:hidden">📚</span>
            <span className="hidden sm:inline">📚 Notes</span>
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full"
              style={{ border: '2px solid rgba(255,255,255,0.1)' }} />
          )}
          <span className="text-white/50 text-sm hidden md:block">{user.displayName?.split(' ')[0]}</span>
          <button onClick={handleLogout}
            className="text-xs font-body transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {page === 'lost-found' && <LostFound user={user} />}
        {page === 'notes' && <Notes user={user} />}
      </main>

      {/* Footer */}
      <footer className="border-t text-center py-6 mt-12"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p className="text-white/20 text-xs font-mono tracking-widest uppercase">
          CampusConnect · Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
}
