import { useEffect, useMemo, useState } from "react";

const PASSWORD = "4Everdolphin<3";
const STORAGE_KEY = "cognos_access_requests";
const SESSION_KEY = "cognos_admin_unlocked";

interface Signup {
  id: string;
  name: string;
  email: string;
  role: string;
  usecase: string;
  createdAt: string;
  status: "new";
}

function loadSignups(): Signup[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Signup[];
  } catch {
    return [];
  }
}

function saveSignups(items: Signup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cognos-signups-updated"));
}

function toCsv(items: Signup[]) {
  const esc = (v: string) => `"${String(v || "").replace(/"/g, '""')}"`;
  return [
    ["created_at", "email", "name", "role", "usecase"].join(","),
    ...items.map((s) => [s.createdAt, s.email, s.name, s.role, s.usecase].map(esc).join(",")),
  ].join("\n");
}

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(SESSION_KEY) === "true");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [signups, setSignups] = useState<Signup[]>(() => loadSignups());

  useEffect(() => {
    const sync = () => setSignups(loadSignups());
    window.addEventListener("storage", sync);
    window.addEventListener("cognos-signups-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cognos-signups-updated", sync);
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: signups.length,
      today: signups.filter((s) => new Date(s.createdAt).toDateString() === today).length,
      roles: new Set(signups.map((s) => s.role).filter(Boolean)).size,
    };
  }, [signups]);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem(SESSION_KEY, "true");
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Incorrect password.");
  };

  const lock = () => {
    localStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setPassword("");
  };

  const copyEmails = async () => {
    await navigator.clipboard.writeText(signups.map((s) => s.email).join("\n"));
    setCopied("emails");
    setTimeout(() => setCopied(""), 1600);
  };

  const exportCsv = async () => {
    await navigator.clipboard.writeText(toCsv(signups));
    setCopied("csv");
    setTimeout(() => setCopied(""), 1600);
  };

  const deleteSignup = (id: string) => {
    const next = signups.filter((s) => s.id !== id);
    setSignups(next);
    saveSignups(next);
  };

  const clearAll = () => {
    if (!confirm("Delete all saved access requests from this browser?")) return;
    setSignups([]);
    saveSignups([]);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
          <button onClick={onBack} className="text-zinc-600 hover:text-white text-sm mb-8 transition-colors">
            ← Back
          </button>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Admin</h1>
          <p className="text-zinc-500 text-sm mb-6">Enter the password to view saved access requests.</p>
          <form onSubmit={unlock} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Password"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/25"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-zinc-100 transition-colors">
              Unlock
            </button>
          </form>
          <p className="text-zinc-700 text-xs mt-6 leading-relaxed">
            Note: this admin view uses browser localStorage. Requests are stored only on this device/browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="h-[58px] border-b border-white/[0.06] flex items-center justify-between px-5 sticky top-0 bg-[#080808]/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-600 hover:text-white transition-colors">←</button>
          <div>
            <p className="text-white font-semibold leading-tight">Cognos Cloud Admin</p>
            <p className="text-zinc-700 text-xs">Access requests stored in localStorage</p>
          </div>
        </div>
        <button onClick={lock} className="text-zinc-600 hover:text-white text-sm transition-colors">Lock</button>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <Stat label="Total requests" value={stats.total.toString()} />
          <Stat label="Today" value={stats.today.toString()} />
          <Stat label="Roles" value={stats.roles.toString()} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={copyEmails} className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors">
            {copied === "emails" ? "Copied emails" : "Copy emails"}
          </button>
          <button onClick={exportCsv} className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors">
            {copied === "csv" ? "Copied CSV" : "Copy CSV"}
          </button>
          <button onClick={clearAll} className="rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:border-red-400/40 transition-colors">Clear all</button>
        </div>

        {signups.length === 0 ? (
          <div className="border border-white/[0.07] rounded-2xl p-10 text-center bg-white/[0.02]">
            <p className="text-white font-semibold mb-1">No requests yet.</p>
            <p className="text-zinc-600 text-sm">Submit the access form once and it will show up here.</p>
          </div>
        ) : (
          <div className="border border-white/[0.07] rounded-2xl overflow-hidden bg-[#0b0b0b]">
            <div className="grid grid-cols-[160px_1fr_140px_1.5fr_60px] gap-4 px-4 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-zinc-700 hidden md:grid">
              <span>Date</span><span>Email</span><span>Role</span><span>Use case</span><span></span>
            </div>
            {signups.map((s) => (
              <div key={s.id} className="grid md:grid-cols-[160px_1fr_140px_1.5fr_60px] gap-3 md:gap-4 px-4 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div>
                  <p className="md:hidden text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Date</p>
                  <p className="text-zinc-500 text-sm font-mono">{new Date(s.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="md:hidden text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Email</p>
                  <p className="text-white text-sm font-medium break-all">{s.email}</p>
                  {s.name && <p className="text-zinc-600 text-xs mt-0.5">{s.name}</p>}
                </div>
                <div>
                  <p className="md:hidden text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Role</p>
                  <p className="text-zinc-400 text-sm">{s.role || "—"}</p>
                </div>
                <div>
                  <p className="md:hidden text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Use case</p>
                  <p className="text-zinc-400 text-sm leading-6">{s.usecase || "—"}</p>
                </div>
                <button onClick={() => deleteSignup(s.id)} className="text-zinc-700 hover:text-red-400 text-sm transition-colors text-left md:text-right">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/[0.07] bg-white/[0.02] rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2">{label}</p>
      <p className="text-3xl font-bold font-mono text-white">{value}</p>
    </div>
  );
}