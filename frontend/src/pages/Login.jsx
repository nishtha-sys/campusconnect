import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

export default function Login({ onLogin }) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl w-full max-w-sm">
        <div className="text-5xl">🎓</div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-1">CampusConnect</h1>
          <p className="text-slate-400 text-sm">Smart campus utilities, powered by AI</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3 px-6 rounded-xl hover:bg-slate-100 transition"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
          Sign in with Google
        </button>

        <p className="text-xs text-slate-600 text-center">
          Use your college Google account to sign in
        </p>
      </div>
    </div>
  );
}
