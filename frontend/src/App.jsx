import { useState } from "react";
import LostFound from "./pages/LostFound";
import Notes from "./pages/Notes";
import Login from "./pages/Login";

export default function App() {
  const [page, setPage] = useState("lost-found");
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-xl font-bold tracking-tight text-white">CampusConnect</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPage("lost-found")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === "lost-found" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            🔍 Lost & Found
          </button>
          <button onClick={() => setPage("notes")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${page === "notes" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            📚 Notes
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-slate-700" />
          <span className="text-sm text-slate-300">{user.displayName}</span>
          <button onClick={() => setUser(null)} className="text-xs text-slate-500 hover:text-red-400 transition">Logout</button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {page === "lost-found" && <LostFound user={user} />}
        {page === "notes" && <Notes user={user} />}
      </main>
    </div>
  );
}