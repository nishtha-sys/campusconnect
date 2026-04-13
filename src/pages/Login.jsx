import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1a0a 0%, #09090f 60%, #0d0d1f 100%)' }}>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(184,255,71,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(184,255,71,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

        {/* Large decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #b8ff47 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: '#b8ff47' }}>🎓</div>
          <span className="font-display font-bold text-white text-xl tracking-tight">CampusConnect</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <p className="font-display text-6xl font-bold leading-none tracking-tight mb-6"
            style={{ color: '#b8ff47' }}>
            Your campus,<br />smarter.
          </p>
          <p className="text-white/40 text-lg font-light max-w-sm leading-relaxed">
            AI-powered lost & found matching, collaborative notes sharing, and more — all in one place.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {['🔍 Smart lost item matching', '📚 AI-summarized notes', '🤝 Built for your community'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#b8ff47' }} />
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom label */}
        <div className="relative z-10">
          <p className="text-white/20 text-xs font-mono tracking-widest uppercase">
            Powered by Gemini AI × Firebase
          </p>
        </div>
      </div>

      {/* Right panel — auth */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16"
        style={{ background: '#09090f' }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: '#b8ff47' }}>🎓</div>
          <span className="font-display font-bold text-white text-xl tracking-tight">CampusConnect</span>
        </div>

        <div className="w-full max-w-sm stagger-1">
          <h2 className="font-display text-4xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-white/40 text-sm mb-10">Sign in with your college Google account to continue.</p>

          <button onClick={handleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-body font-medium text-sm transition-all duration-200 mb-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <p className="text-center text-xs mt-3" style={{ color: '#ff6b6b' }}>{error}</p>
          )}

          <p className="text-center text-white/20 text-xs mt-8 leading-relaxed">
            By signing in you agree to use this platform<br />responsibly within your campus community.
          </p>
        </div>
      </div>
    </div>
  );
}
