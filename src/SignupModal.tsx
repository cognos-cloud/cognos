import { useState, useEffect, useRef } from "react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Signup modal ─────────────────────────────────────────────────────────────

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

const SIGNUP_STORAGE_KEY = "cognos_access_requests";

interface StoredSignup {
  id: string;
  name: string;
  email: string;
  role: string;
  usecase: string;
  createdAt: string;
  status: "new";
}

function saveSignup(signup: StoredSignup) {
  const existing = JSON.parse(localStorage.getItem(SIGNUP_STORAGE_KEY) || "[]") as StoredSignup[];
  const withoutDuplicate = existing.filter((item) => item.email.toLowerCase() !== signup.email.toLowerCase());
  localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify([signup, ...withoutDuplicate]));
  window.dispatchEvent(new CustomEvent("cognos-signups-updated"));
}

export function SignupModal({ open, onClose }: SignupModalProps) {
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [role, setRole]         = useState("");
  const [usecase, setUsecase]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    saveSignup({
      id: crypto.randomUUID ? crypto.randomUUID() : `signup_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      usecase: usecase.trim(),
      createdAt: new Date().toISOString(),
      status: "new",
    });

    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const reset = () => {
    setEmail("");
    setName("");
    setRole("");
    setUsecase("");
    setSubmitted(false);
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-[#0e0e0e] border border-white/[0.1] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="px-8 py-8">
          {submitted ? (
            // ── Success state ────────────────────────────────────
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center mx-auto mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" className="text-emerald-400">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">You're on the list.</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-1">
                We'll email <span className="text-white font-medium">{email}</span> when your access is ready.
              </p>
              <p className="text-zinc-600 text-sm mb-8">
                We're onboarding developers one by one. You'll hear from us soon.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://x.com/CognosCloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-4 py-2 transition-all"
                >
                  <XIcon /> Follow on X
                </a>
                <a
                  href="https://github.com/cognos-cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-4 py-2 transition-all"
                >
                  <GHIcon /> Star on GitHub
                </a>
              </div>
              <button
                onClick={handleClose}
                className="mt-6 text-zinc-600 hover:text-zinc-400 text-[13px] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            // ── Form state ───────────────────────────────────────
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight mb-1">
                    Join the first 100 developers.
                  </h3>
                  <p className="text-zinc-500 text-[13px] leading-snug">
                    We're onboarding developers one at a time.<br />
                    No waitlist queue — we'll reach out directly.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-zinc-700 hover:text-zinc-400 transition-colors flex-shrink-0 ml-4 mt-0.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Spots indicator */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex gap-1 flex-shrink-0">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-sm",
                        i < 7 ? "bg-white/25" : "bg-white/[0.06]"
                      )}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-zinc-500">
                  <span className="text-white font-semibold">30 spots</span> remaining of 100
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">
                    Name
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="James Hoffman"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-[14px] placeholder:text-zinc-700 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">
                    Work email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="james@acme.com"
                    required
                    className={cn(
                      "w-full bg-white/[0.04] border rounded-lg px-4 py-2.5 text-white text-[14px] placeholder:text-zinc-700 focus:outline-none focus:bg-white/[0.06] transition-all",
                      error ? "border-red-500/50 focus:border-red-400/70" : "border-white/[0.08] focus:border-white/25"
                    )}
                  />
                  {error && (
                    <p className="mt-1.5 text-[12px] text-red-400">{error}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">
                    What do you build?
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-white/25 transition-all appearance-none"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="" className="bg-[#111] text-zinc-400">Select one…</option>
                    <option value="ai-apps" className="bg-[#111]">AI applications</option>
                    <option value="automation" className="bg-[#111]">Automation / workflows</option>
                    <option value="crypto" className="bg-[#111]">Crypto / on-chain agents</option>
                    <option value="research" className="bg-[#111]">Research tools</option>
                    <option value="infra" className="bg-[#111]">Developer infrastructure</option>
                    <option value="other" className="bg-[#111]">Something else</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">
                    What agent are you trying to deploy?
                  </label>
                  <textarea
                    value={usecase}
                    onChange={(e) => setUsecase(e.target.value)}
                    placeholder="e.g. Monitor GitHub PRs and post reviews to Slack…"
                    rows={2}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-[14px] placeholder:text-zinc-700 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold text-[15px] transition-all",
                    loading
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : "bg-white text-black hover:bg-zinc-100 hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <SpinnerIcon />
                      Submitting…
                    </span>
                  ) : (
                    "Request access →"
                  )}
                </button>

                <p className="text-center text-[11px] text-zinc-700">
                  No spam. No pitch decks. We'll email you directly.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Trigger button — used everywhere a CTA was ───────────────────────────────

export function SignupButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

// ─── Tiny icons ───────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GHIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      className="animate-spin">
      <circle cx="12" cy="12" r="10" className="opacity-25" />
      <path d="M12 2a10 10 0 0 1 10 10" className="opacity-75" />
    </svg>
  );
}
