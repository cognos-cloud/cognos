import { useState, useEffect, useRef } from "react";
import { DeployDemo, ThreeSteps, WhatYouGet } from "./DeployDemo";
import { VideoDemo } from "./VideoDemo";
import { SignupModal } from "./SignupModal";
import Dashboard from "./Dashboard";
import Docs from "./Docs";
import AdminDashboard from "./AdminDashboard";


function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Logo ──────────────────────────────────────────────────────────────────

function CognosLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="white" />
      <circle cx="16" cy="16" r="3.5" fill="black" />
      <circle cx="16" cy="7" r="2" fill="black" />
      <circle cx="16" cy="25" r="2" fill="black" />
      <circle cx="7" cy="16" r="2" fill="black" />
      <circle cx="25" cy="16" r="2" fill="black" />
      <line x1="16" y1="9" x2="16" y2="12.5" stroke="black" strokeWidth="1.5" />
      <line x1="16" y1="19.5" x2="16" y2="23" stroke="black" strokeWidth="1.5" />
      <line x1="9" y1="16" x2="12.5" y2="16" stroke="black" strokeWidth="1.5" />
      <line x1="19.5" y1="16" x2="23" y2="16" stroke="black" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────

function Nav({ onDashboard, onDocs, onSignup }: { onDashboard: () => void; onDocs: () => void; onSignup: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Deploy", href: "#deploy" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Roadmap", href: "#roadmap" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <CognosLogo size={26} />
          <span className="text-white font-semibold tracking-tight">Cognos Cloud</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] text-zinc-500 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onDocs}
            className="text-[13px] text-zinc-500 hover:text-white transition-colors"
          >
            Docs
          </button>
          <button
            onClick={onDashboard}
            className="text-[13px] text-zinc-500 hover:text-white transition-colors"
          >
            Dashboard
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="https://github.com/cognos-cloud" target="_blank" rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white transition-colors p-1.5">
            <GitHubIcon />
          </a>
          <a href="https://x.com/CognosCloud" target="_blank" rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white transition-colors p-1.5">
            <XIcon />
          </a>
          <button
            onClick={onDocs}
            className="text-[13px] text-zinc-400 hover:text-white px-3 py-1.5 transition-colors"
          >
            Docs
          </button>
          <button
            onClick={onSignup}
            className="text-[13px] bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Request access
          </button>
        </div>

        <button
          className="md:hidden text-zinc-400"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen
              ? <path d="M18 6L6 18M6 6l12 12" />
              : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#080808]/98 border-b border-white/5 px-6 py-5 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-zinc-400 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-4 pt-1">
            <a href="https://github.com/cognos-cloud" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
              <GitHubIcon /> GitHub
            </a>
            <a href="https://x.com/CognosCloud" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
              <XIcon /> X
            </a>
          </div>
          <button
            onClick={onSignup}
            className="bg-white text-black font-semibold text-sm px-4 py-2.5 rounded-lg w-full"
          >
            Request access
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────

function GridBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
        }}
      />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

function HeroTerminal() {
  const lines = [
    { type: "cmd",     text: "pip install cognos" },
    { type: "out",     text: "Successfully installed cognos-0.1.4" },
    { type: "blank",   text: "" },
    { type: "cmd",     text: "cognos deploy research-agent" },
    { type: "blank",   text: "" },
    { type: "ok",      text: "✓  Uploading..." },
    { type: "ok",      text: "✓  Provisioning runtime..." },
    { type: "ok",      text: "✓  Starting container..." },
    { type: "success", text: "✓  Agent deployed." },
    { type: "blank",   text: "" },
    { type: "label",   text: "Dashboard:" },
    { type: "url",     text: "https://www.cognoscloud.xyz/agents/research-agent" },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0b0b0b] shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        {/* chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#090909]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-zinc-600 font-mono">~/research-agent</span>
        </div>
        {/* body */}
        <div className="px-5 py-4 font-mono text-[13px] leading-[22px]">
          {lines.map((line, i) => {
            if (line.type === "blank")   return <div key={i} className="h-1.5" />;
            if (line.type === "cmd")     return (
              <div key={i} className="flex gap-2">
                <span className="text-emerald-400 select-none flex-shrink-0">❯</span>
                <span className="text-white font-medium">{line.text}</span>
              </div>
            );
            if (line.type === "out")     return <div key={i} className="text-zinc-600 pl-4">{line.text}</div>;
            if (line.type === "ok")      return <div key={i} className="text-zinc-300 pl-2">{line.text}</div>;
            if (line.type === "success") return <div key={i} className="text-emerald-400 font-medium pl-2">{line.text}</div>;
            if (line.type === "label")   return <div key={i} className="text-zinc-500 pl-2">{line.text}</div>;
            if (line.type === "url")     return <div key={i} className="text-sky-400 pl-2">{line.text}</div>;
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

function Hero({ onDashboard, onDocs, onSignup }: { onDashboard: () => void; onDocs: () => void; onSignup: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
      <GridBg />
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Now in private beta
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
          <span className="text-zinc-400">Cognos Cloud.</span><br />
          Deploy AI agents in minutes.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-4">
          Stop wiring infrastructure. Cognos Cloud gives every agent{" "}
          <span className="text-zinc-200">memory, observability, retries, scheduling, and a live API</span>
          {" "}the moment you deploy.
        </p>

        <p className="text-sm text-zinc-600 mb-10">
          You write the agent logic. We keep it running.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <button
            onClick={onSignup}
            className="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3.5 rounded-xl text-[15px] hover:bg-zinc-100 transition-all hover:scale-[1.02]"
          >
            Request access →
          </button>
          <button
            onClick={onDashboard}
            className="w-full sm:w-auto border border-white/15 text-zinc-300 px-8 py-3.5 rounded-xl text-[15px] hover:bg-white/5 hover:border-white/25 transition-all"
          >
            Live dashboard →
          </button>
          <button
            onClick={onDocs}
            className="w-full sm:w-auto text-zinc-500 hover:text-zinc-300 text-[15px] transition-colors"
          >
            Read the docs →
          </button>
        </div>

        <HeroTerminal />

        {/* What's live right now */}
        <div className="mt-12 border border-white/[0.07] rounded-2xl px-6 py-5 bg-white/[0.02] max-w-lg w-full">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium mb-4">
            What's live right now
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {[
              { label: "Working deployment runtime",   live: true  },
              { label: "Live execution dashboard",     live: true  },
              { label: "Memory engine",                live: true  },
              { label: "REST API",                     live: true  },
              { label: "CLI",                          live: true  },
              { label: "Open-source SDK",              live: false },
            ].map(({ label, live }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={cn(
                  "text-[13px] flex-shrink-0 font-semibold",
                  live ? "text-emerald-400" : "text-zinc-600"
                )}>
                  {live ? "✓" : "○"}
                </span>
                <span className={cn(
                  "text-[13px]",
                  live ? "text-zinc-300" : "text-zinc-600"
                )}>
                  {label}
                  {!live && (
                    <span className="ml-2 text-[10px] text-zinc-700 border border-zinc-800 rounded px-1.5 py-0.5 font-mono align-middle">
                      coming soon
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pain → Solution ──────────────────────────────────────────────────────

const pains = [
  {
    pain: "My agent crashes every few hours.",
    solution: "Cognos Cloud restarts it automatically. Zero downtime.",
    icon: "⚡",
  },
  {
    pain: "I spent three weeks wiring memory.",
    solution: "One flag: memory=True. Persistent across every session.",
    icon: "🧠",
  },
  {
    pain: "I have no idea what my agent is doing.",
    solution: "Every decision, tool call, and cost — live in your dashboard.",
    icon: "👁",
  },
  {
    pain: "Production deployment is a nightmare.",
    solution: "cognos deploy. Done. Live API endpoint included.",
    icon: "🚀",
  },
  {
    pain: "Scheduling agents is complex infra work.",
    solution: "cron='0 9 * * *' and it runs every morning. That's it.",
    icon: "🕐",
  },
  {
    pain: "Security and permissions are an afterthought.",
    solution: "Spending limits, human-approval gates, and RBAC built in.",
    icon: "🔒",
  },
];

function PainSolution() {
  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            Why Cognos Cloud
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Developers don't wake up thinking<br />"I need a runtime."
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            They wake up thinking "my agent crashed again" or "why did it cost $40?" Cognos Cloud solves the actual problems.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {pains.map((item) => (
            <div
              key={item.pain}
              className="bg-[#080808] p-8 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="text-2xl mb-5">{item.icon}</div>
              <p className="text-zinc-500 text-sm mb-3 line-through decoration-zinc-700">
                "{item.pain}"
              </p>
              <p className="text-zinc-100 text-[15px] font-medium leading-snug">
                {item.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── The One Product ──────────────────────────────────────────────────────

function OneProduct() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
          The product
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">
          One command. A fully managed agent.
        </h2>
        <p className="text-zinc-500 mb-16 max-w-xl mx-auto text-base">
          Every deployed agent automatically gets everything it needs to run reliably in production.
        </p>

        <div className="flex flex-col items-center gap-0">
          {[
            { label: "cognos deploy", sub: "Push your agent", icon: "▲", accent: "text-white" },
            { label: "Running forever", sub: "Auto-restart on failure", icon: "●", accent: "text-emerald-400" },
            { label: "Memory included", sub: "Persistent across sessions", icon: "◈", accent: "text-blue-400" },
            { label: "Live API endpoint", sub: "POST /agents/{id}/run", icon: "◎", accent: "text-violet-400" },
            { label: "Cron scheduling", sub: "Set it. Forget it.", icon: "◷", accent: "text-amber-400" },
            { label: "Full observability", sub: "Every decision, cost, and trace", icon: "◉", accent: "text-rose-400" },
            { label: "Dashboard", sub: "See everything in one place", icon: "▣", accent: "text-zinc-300" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex flex-col items-center">
              <div className="flex items-center gap-5 bg-white/[0.03] border border-white/[0.08] rounded-xl px-8 py-4 w-full max-w-md hover:bg-white/[0.05] hover:border-white/15 transition-all group">
                <span className={cn("text-lg w-6 text-center flex-shrink-0", step.accent)}>{step.icon}</span>
                <div className="text-left">
                  <p className="text-white font-semibold text-[15px]">{step.label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{step.sub}</p>
                </div>
                <div className="ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-5 bg-white/10" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-12 text-zinc-600 text-sm">
          That alone is a company. That's what we're building first.
        </p>
      </div>
    </section>
  );
}

// ─── Dashboard Mock ───────────────────────────────────────────────────────

function StatusDot({ status }: { status: "running" | "idle" | "failed" }) {
  return (
    <span className={cn(
      "inline-flex w-2 h-2 rounded-full",
      status === "running" && "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse",
      status === "idle" && "bg-zinc-500",
      status === "failed" && "bg-red-400"
    )} />
  );
}

const mockAgents = [
  {
    name: "research-agent",
    status: "running" as const,
    model: "gpt-4o",
    memory: "1.2 GB",
    executions: 482,
    failures: 0,
    latency: "450ms",
    cost: "$0.14/day",
    uptime: "99.9%",
  },
  {
    name: "content-agent",
    status: "running" as const,
    model: "claude-3.5",
    memory: "640 MB",
    executions: 1204,
    failures: 2,
    latency: "310ms",
    cost: "$0.22/day",
    uptime: "99.8%",
  },
  {
    name: "support-agent",
    status: "idle" as const,
    model: "gpt-4o-mini",
    memory: "128 MB",
    executions: 88,
    failures: 0,
    latency: "180ms",
    cost: "$0.03/day",
    uptime: "100%",
  },
];

function DashboardMock({ onDashboard }: { onDashboard: () => void }) {
  const [selected, setSelected] = useState(0);
  const agent = mockAgents[selected];

  return (
    <section id="dashboard" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            Dashboard
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            See exactly what your agent is doing.
          </h2>
          <p className="text-zinc-500 text-base max-w-xl">
            Real-time visibility into every agent you've deployed. Execution history, costs, latency, and memory — all in one place.
          </p>
        </div>

        {/* Dashboard UI mock */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0c0c0c] shadow-2xl shadow-black/60">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a]">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <div className="flex-1 flex justify-center">
              <div className="bg-white/5 border border-white/[0.06] rounded-md px-4 py-1 text-[11px] text-zinc-500 font-mono">
                app.cognos.dev/dashboard
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="hidden sm:flex flex-col w-48 border-r border-white/[0.06] bg-[#090909] p-3 gap-1">
              {[
                { icon: "⬡", label: "Agents", active: true },
                { icon: "◈", label: "Memory", active: false },
                { icon: "◷", label: "Schedules", active: false },
                { icon: "◉", label: "Observe", active: false },
                { icon: "◎", label: "API Keys", active: false },
                { icon: "⚙", label: "Settings", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors",
                    item.active
                      ? "bg-white/10 text-white"
                      : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 min-w-0">
              {/* Agent list */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Your agents</h3>
                  <button
                    onClick={onDashboard}
                    className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    Open live dashboard →
                  </button>
                </div>
                <div className="space-y-2">
                  {mockAgents.map((a, i) => (
                    <div
                      key={a.name}
                      onClick={() => setSelected(i)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                        selected === i
                          ? "border-white/20 bg-white/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                      )}
                    >
                      <StatusDot status={a.status} />
                      <span className="text-[13px] text-white font-mono font-medium flex-1 truncate">
                        {a.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 hidden sm:inline">{a.model}</span>
                      <span className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full border",
                        a.status === "running"
                          ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
                          : "text-zinc-500 border-zinc-700 bg-white/[0.02]"
                      )}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent detail */}
              <div className="border border-white/[0.06] rounded-xl bg-[#0a0a0a] p-5">
                <div className="flex items-center gap-3 mb-5">
                  <StatusDot status={agent.status} />
                  <span className="text-white font-mono font-semibold">{agent.name}</span>
                  <span className="text-zinc-600 text-xs">{agent.model}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Memory", value: agent.memory, color: "text-blue-400" },
                    { label: "Executions", value: agent.executions.toLocaleString(), color: "text-white" },
                    { label: "Failures", value: agent.failures.toString(), color: agent.failures === 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Avg. latency", value: agent.latency, color: "text-violet-400" },
                    { label: "Cost", value: agent.cost, color: "text-amber-400" },
                    { label: "Uptime", value: agent.uptime, color: "text-emerald-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                      <p className="text-[11px] text-zinc-600 mb-1">{stat.label}</p>
                      <p className={cn("font-mono font-semibold text-sm", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Mini sparkline-ish bars */}
                <div>
                  <p className="text-[11px] text-zinc-600 mb-2">Executions · last 7 days</p>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 65, 52, 80, 72, 90, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/10 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d} className="text-[10px] text-zinc-700">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Execution Trace ──────────────────────────────────────────────────────

function ExecutionTrace() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      label: "Prompt received",
      detail: '"Research latest AI safety papers and summarize for Slack"',
      time: "0ms",
      type: "input",
      color: "text-zinc-300",
      dot: "bg-zinc-400",
    },
    {
      label: "GPT-4o",
      detail: "Planned 3 tool calls: search → read → format",
      time: "240ms",
      type: "model",
      color: "text-blue-400",
      dot: "bg-blue-400",
    },
    {
      label: "Perplexity API",
      detail: "Fetched 12 relevant papers from arXiv",
      time: "380ms",
      type: "tool",
      color: "text-violet-400",
      dot: "bg-violet-400",
    },
    {
      label: "Memory read",
      detail: "Retrieved previous context: 14 stored items",
      time: "412ms",
      type: "memory",
      color: "text-amber-400",
      dot: "bg-amber-400",
    },
    {
      label: "GPT-4o",
      detail: "Synthesized research into structured summary",
      time: "698ms",
      type: "model",
      color: "text-blue-400",
      dot: "bg-blue-400",
    },
    {
      label: "Slack API",
      detail: "Posted to #ai-research with 3 highlights",
      time: "790ms",
      type: "tool",
      color: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    {
      label: "Memory write",
      detail: "Stored 4 new items for future context",
      time: "810ms",
      type: "memory",
      color: "text-amber-400",
      dot: "bg-amber-400",
    },
    {
      label: "Completed",
      detail: "Success · 824ms total · $0.03",
      time: "824ms",
      type: "output",
      color: "text-emerald-400",
      dot: "bg-emerald-400",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            Observability
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Every decision is visible.
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            Click any execution and see a full trace: every model call, tool use, memory read, latency, and cost. Not a log file — a story.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Trace */}
          <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-500 font-mono">execution #482 · research-agent</span>
            </div>
            <div className="p-5">
              {steps.map((step, i) => (
                <div key={i}>
                  <button
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    className={cn(
                      "w-full flex items-start gap-4 text-left py-3 px-3 rounded-lg transition-all group",
                      activeStep === i ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex flex-col items-center gap-0 pt-1 flex-shrink-0">
                      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", step.dot)} />
                      {i < steps.length - 1 && (
                        <div className="w-px h-8 bg-white/[0.08] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("font-medium text-sm", step.color)}>{step.label}</span>
                        <span className="text-[11px] text-zinc-600 font-mono flex-shrink-0">{step.time}</span>
                      </div>
                      {activeStep === i && (
                        <p className="text-[12px] text-zinc-400 mt-1.5 leading-relaxed font-mono">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <div className="mx-5 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center gap-6">
              <div>
                <p className="text-[10px] text-zinc-600 mb-0.5">Total time</p>
                <p className="text-emerald-400 font-mono font-semibold text-sm">824ms</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 mb-0.5">Cost</p>
                <p className="text-amber-400 font-mono font-semibold text-sm">$0.03</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 mb-0.5">Tool calls</p>
                <p className="text-violet-400 font-mono font-semibold text-sm">3</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 mb-0.5">Status</p>
                <p className="text-emerald-400 font-mono font-semibold text-sm">success</p>
              </div>
            </div>
          </div>

          {/* Why this matters */}
          <div className="space-y-6">
            <p className="text-zinc-400 text-base leading-relaxed">
              Most agent frameworks give you stdout. We give you a structured execution trace for every run — click into any step to debug exactly what happened.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "Instant cost attribution",
                  body: "Know exactly what each agent costs per run, per day, per user. No surprises at the end of the month.",
                  icon: "💰",
                },
                {
                  title: "Debug without logs",
                  body: "Click any execution, see every decision. No grep. No CloudWatch. No digging.",
                  icon: "🔍",
                },
                {
                  title: "Catch failures before users do",
                  body: "Alerts on latency spikes, error rates, and memory anomalies — before they become incidents.",
                  icon: "🛡",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 border border-white/[0.06] rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SDK ──────────────────────────────────────────────────────────────────

function highlight(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(
      /\b(from|import|True|False|None|def|class|return|if|else|for|in|with|as|and|or|not)\b/g,
      '<span style="color:#c678dd">$1</span>'
    )
    .replace(
      /\b(Agent)\b/g,
      '<span style="color:#61afef">$1</span>'
    )
    .replace(
      /(#[^\n]*)/g,
      '<span style="color:#5c6370;font-style:italic">$1</span>'
    )
    .replace(
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
      '<span style="color:#98c379">$1</span>'
    )
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>');
}

const agentCode = `from cognos import Agent

agent = Agent(
    name="research-agent",
    model="gpt-4o",          # Any LLM
    memory=True,             # Persistent memory
    tools=["perplexity", "slack"],
    cron="0 9 * * *",        # Runs every morning
)

# One line. Live API + dashboard + logs.
agent.deploy()`;

const outputLines = [
  { text: "✓ Validating agent...", color: "text-zinc-500" },
  { text: "✓ Provisioning runtime...", color: "text-zinc-500" },
  { text: "✓ Attaching memory store...", color: "text-zinc-500" },
  { text: "✓ Registering tools: perplexity, slack", color: "text-zinc-500" },
  { text: "✓ Scheduling cron: 0 9 * * *", color: "text-zinc-500" },
  { text: "", color: "" },
  { text: "● Agent deployed successfully", color: "text-emerald-400" },
  { text: "", color: "" },
  { text: "  API endpoint   POST https://api.cognos.dev/agents/research-agent/run", color: "text-zinc-300" },
  { text: "  Dashboard      https://app.cognos.dev/agents/research-agent", color: "text-zinc-300" },
  { text: "  Status         Running", color: "text-emerald-400" },
];

function TypingOutput() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= outputLines.length) return;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), visibleLines < 6 ? 400 : 200);
    return () => clearTimeout(t);
  }, [visibleLines]);

  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setVisibleLines(1);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-zinc-950 border border-white/[0.08] rounded-xl p-5 font-mono text-sm min-h-[240px]">
      {outputLines.slice(0, visibleLines).map((line, i) => (
        <div key={i} className={cn("leading-7", line.color || "text-transparent")}>
          {line.text || "\u00A0"}
        </div>
      ))}
      {visibleLines > 0 && visibleLines < outputLines.length && (
        <span className="inline-block w-2 h-4 bg-white/60 animate-pulse align-middle" />
      )}
    </div>
  );
}

function SDKSection({ onDocs }: { onDocs: () => void }) {
  const [tab, setTab] = useState<"sdk" | "cli">("sdk");

  const cliCommands = [
    { cmd: "cognos init", desc: "Scaffold a new agent project" },
    { cmd: "cognos dev", desc: "Run locally with hot reload" },
    { cmd: "cognos deploy", desc: "Deploy to cloud in seconds" },
    { cmd: "cognos logs --follow", desc: "Stream live execution logs" },
    { cmd: "cognos monitor", desc: "Open dashboard in browser" },
    { cmd: "cognos rollback", desc: "Roll back to last good version" },
  ];

  return (
    <section id="sdk" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            SDK + CLI
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            The simplest agent API ever written.
          </h2>
          <p className="text-zinc-500 text-base max-w-xl">
            No infra config. No YAML. No Docker files. Just describe your agent — we handle everything else.
          </p>
          <button
            onClick={onDocs}
            className="mt-4 text-[13px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            Full API reference in docs →
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: code */}
          <div>
            <div className="flex gap-2 mb-4">
              {(["sdk", "cli"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                    tab === t
                      ? "bg-white text-black"
                      : "text-zinc-500 border border-white/10 hover:border-white/20 hover:text-white"
                  )}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {tab === "sdk" ? (
              <div className="bg-zinc-950 border border-white/[0.08] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[11px] text-zinc-600 font-mono">agent.py</span>
                  <span className="text-[11px] text-zinc-600">python</span>
                </div>
                <pre className="p-5 text-[13px] leading-relaxed font-mono overflow-x-auto">
                  <code dangerouslySetInnerHTML={{ __html: highlight(agentCode) }} />
                </pre>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-white/[0.08] rounded-xl overflow-hidden">
                <div className="flex items-center px-4 py-2.5 border-b border-white/[0.06] gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-[11px] text-zinc-600 font-mono">Terminal</span>
                </div>
                <div className="p-5">
                  {cliCommands.map((c) => (
                    <div key={c.cmd} className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className="text-emerald-400 font-mono text-sm flex-shrink-0">$</span>
                      <div>
                        <span className="text-zinc-200 font-mono text-sm">{c.cmd}</span>
                        <span className="text-zinc-600 text-xs ml-3">— {c.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: animated output */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-600 mb-4">
              What happens when you run cognos deploy
            </p>
            <TypingOutput />

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Any LLM provider", detail: "OpenAI, Anthropic, Gemini, local" },
                { label: "Any tool", detail: "Plugin SDK or custom endpoints" },
                { label: "Python-first", detail: "TypeScript SDK coming soon" },
                { label: "Git-native", detail: "Deploys from your repo" },
              ].map((item) => (
                <div key={item.label} className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
                  <p className="text-white text-sm font-medium mb-0.5">{item.label}</p>
                  <p className="text-zinc-600 text-xs">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Comparison ───────────────────────────────────────────────────────────

function Comparison() {
  const rows = [
    { task: "Memory across sessions", without: "Build & maintain your own vector DB", with: "memory=True" },
    { task: "Keep agent running", without: "Write retry logic, process managers", with: "Auto-restart included" },
    { task: "Schedule agent to run daily", without: "Set up cron + server + monitoring", with: 'cron="0 9 * * *"' },
    { task: "Expose agent as API", without: "Build REST layer, auth, rate limits", with: "Live endpoint on deploy" },
    { task: "Debug a failed execution", without: "Grep logs, pray", with: "Click → full trace" },
    { task: "Monitor costs", without: "Parse token counts manually", with: "Cost per run, per day" },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            The alternative
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Three weeks of infra work. Or one command.
          </h2>
        </div>

        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="grid grid-cols-3 bg-[#0a0a0a] border-b border-white/[0.08] text-xs uppercase tracking-wider">
            <div className="px-5 py-3 text-zinc-600">Task</div>
            <div className="px-5 py-3 text-red-400 border-x border-white/[0.06]">Without Cognos Cloud</div>
            <div className="px-5 py-3 text-emerald-400">With Cognos Cloud</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors",
                i % 2 === 0 ? "bg-[#0b0b0b]" : "bg-[#0c0c0c]"
              )}
            >
              <div className="px-5 py-4 text-zinc-300 text-sm">{row.task}</div>
              <div className="px-5 py-4 text-zinc-500 text-sm border-x border-white/[0.04]">{row.without}</div>
              <div className="px-5 py-4 text-emerald-300 text-sm font-mono font-medium">{row.with}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Positioning ─────────────────────────────────────────────────────────

function Positioning() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            Our bet
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            The cloud platform for AI agents.
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {[
            {
              name: "Vercel",
              claim: "git push → deployed",
              category: "Web apps",
            },
            {
              name: "Railway",
              claim: "Backend in seconds",
              category: "Servers",
            },
            {
              name: "Modal",
              claim: "GPU functions instantly",
              category: "Compute",
            },
          ].map((co) => (
            <div key={co.name} className="border border-white/[0.06] rounded-xl p-5 bg-white/[0.02]">
              <p className="text-zinc-600 text-xs mb-2">{co.category}</p>
              <p className="text-white font-semibold mb-1">{co.name}</p>
              <p className="text-zinc-500 text-sm font-mono">{co.claim}</p>
            </div>
          ))}
        </div>

        <div className="border-l-2 border-white/20 pl-8">
          <div className="border border-white/[0.06] rounded-xl p-5 bg-white/[0.02] inline-block mb-4 w-full sm:w-auto">
            <p className="text-zinc-600 text-xs mb-2">AI Agents</p>
            <p className="text-white font-bold text-xl mb-1">Cognos Cloud</p>
            <p className="text-emerald-300 font-mono text-sm">cognos deploy → running forever</p>
          </div>
          <p className="text-zinc-500 text-base max-w-xl leading-relaxed">
            Developers already have LangGraph, CrewAI, AutoGen, and the OpenAI Agents SDK to{" "}
            <em className="text-zinc-400 not-italic font-medium">build</em> agents. They don't have a way to{" "}
            <em className="text-zinc-300 not-italic font-semibold">operate</em> them reliably in production. That's what we're building.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Roadmap ─────────────────────────────────────────────────────────────

function Roadmap() {
  const columns = [
    {
      eyebrow: "Available Today",
      version: "v0.1 — Runtime",
      title: "Deploy agents, invoke them via API, and monitor execution.",
      status: "available",
      items: [
        "Agent deployment from the CLI",
        "Runtime management: start, stop, restart",
        "Live execution logs",
        "Execution timeline",
        "Dashboard: https://www.cognoscloud.xyz/agents/research-agent",
      ],
    },
    {
      eyebrow: "In Progress",
      version: "v0.2 — Scheduling & Tools",
      title: "Cron jobs, secrets, custom tools, and deployment history.",
      status: "progress",
      items: [
        "Scheduled agents (cron jobs)",
        "Tool SDK for custom integrations",
        "Environment variables and secrets",
        "Deployment history and rollback",
        "Usage metrics",
      ],
    },
    {
      eyebrow: "Planned",
      version: "v0.3+ — Multi-Agent Workflows / v1.0 — Cognos Cloud",
      title: "Shared memory, orchestration, teams, marketplace, and enterprise deployment.",
      status: "planned",
      items: [
        "Multi-agent workflows",
        "Shared memory between agents",
        "Team workspaces",
        "RBAC and permissions",
        "Hosted cloud platform",
        "Marketplace for tools and templates",
        "Enterprise self-hosting",
      ],
    },
  ];

  return (
    <section id="roadmap" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
            Roadmap
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Built in public.
          </h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            From one-command deploy to a full agent platform. Cognos starts with a production runtime for autonomous AI agents. Everything else builds on that foundation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {columns.map((phase) => (
            <div
              key={phase.eyebrow}
              className={cn(
                "border rounded-2xl p-6 transition-all bg-white/[0.01]",
                phase.status === "available" && "border-emerald-400/20 bg-emerald-400/[0.03]",
                phase.status === "progress" && "border-sky-400/20 bg-sky-400/[0.025]",
                phase.status === "planned" && "border-white/[0.06]"
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
                    phase.status === "available"
                      ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/[0.08]"
                      : phase.status === "progress"
                      ? "text-sky-400 border-sky-400/30 bg-sky-400/[0.06]"
                      : "text-zinc-500 border-zinc-700 bg-white/[0.02]"
                  )}
                >
                  {phase.eyebrow}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{phase.version}</h3>
              <p className="text-zinc-500 text-sm leading-6 mb-5">{phase.title}</p>
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5",
                        phase.status === "available" ? "bg-emerald-400" : phase.status === "progress" ? "bg-sky-400" : "bg-zinc-700"
                      )}
                    />
                    <span className="text-zinc-400 text-sm leading-5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-zinc-700 text-sm">
          Never marked as shipped unless it actually works.
        </p>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────

function CTA({ onDashboard, onDocs, onSignup }: { onDashboard: () => void; onDocs: () => void; onSignup: () => void }) {
  return (
    <section className="py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="relative rounded-3xl border border-white/10 p-12 sm:p-16 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 60%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <CognosLogo size={44} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
              Deploy autonomous AI agents<br />
              <span className="text-zinc-400">on Cognos Cloud.</span>
            </h2>
            <p className="text-zinc-400 mb-10 text-lg max-w-lg mx-auto">
              Join the first 100 developers testing the private beta. We onboard one at a time — no queue, no automation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onSignup}
                className="w-full sm:w-auto bg-white text-black font-bold px-10 py-4 rounded-xl text-[15px] hover:bg-zinc-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Request access →
              </button>
              <button
                onClick={onDashboard}
                className="w-full sm:w-auto border border-white/15 text-zinc-300 px-10 py-4 rounded-xl text-[15px] hover:bg-white/5 hover:border-white/25 transition-all"
              >
                See live dashboard →
              </button>
              <button
                onClick={onDocs}
                className="w-full sm:w-auto text-zinc-500 hover:text-zinc-300 px-6 py-4 text-[15px] transition-colors"
              >
                Read the docs →
              </button>
            </div>

            <div className="font-mono text-xs text-zinc-600">
              30 spots remaining · No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social icons ─────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────

function Footer({ onDocs, onSignup, onAdmin }: { onDocs: () => void; onSignup: () => void; onAdmin: () => void }) {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 sm:gap-5">
        <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0">
          <CognosLogo size={20} />
          <span className="text-zinc-500 text-sm font-medium">Cognos Cloud</span>
          <span className="hidden md:inline text-zinc-800 text-sm">— The OS for autonomous AI agents</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:items-center sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
            <a href="https://github.com/cognos-cloud" target="_blank" rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-300 transition-colors flex items-center justify-center sm:justify-start gap-1.5 py-1">
              <GitHubIcon />
              <span className="text-sm">GitHub</span>
            </a>
            <a href="https://orynth.dev/projects/cognos-cloud" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center py-1">
              <img src="https://orynth.dev/api/badge/cognos-cloud?theme=dark&style=default" alt="Featured on Orynth" width="160" height="50" />
            </a>
          </div>
          <a href="https://x.com/CognosCloud" target="_blank" rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-300 transition-colors flex items-center justify-center sm:justify-start gap-1.5 py-1">
            <XIcon />
            <span className="text-sm">X</span>
          </a>
          <button
            onClick={onSignup}
            className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors py-1"
          >
            Request access
          </button>
          <button
            onClick={onDocs}
            className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors py-1"
          >
            Docs
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("cognos-open-legal", { detail: "privacy" }))}
            className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors py-1"
          >
            Privacy
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("cognos-open-legal", { detail: "terms" }))}
            className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors py-1"
          >
            Terms
          </button>
          <button
            onClick={onAdmin}
            className="text-zinc-800 hover:text-zinc-500 text-sm transition-colors py-1 col-span-2 sm:col-span-1"
          >
            Admin
          </button>
        </div>

        <p className="text-zinc-800 text-xs text-center sm:text-right">© 2026 Cognos Cloud</p>
      </div>
    </footer>
  );
}

// ─── Legal Pages ───────────────────────────────────────────────────────────

function LegalPage({ type, onBack }: { type: "privacy" | "terms"; onBack: () => void }) {
  const isPrivacy = type === "privacy";

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="h-[56px] border-b border-white/[0.06] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-600 hover:text-white transition-colors">←</button>
          <CognosLogo size={22} />
          <span className="font-semibold">Cognos Cloud</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {isPrivacy ? "Privacy Policy" : "Terms of Service"}
        </h1>
        <p className="text-zinc-600 text-sm mb-10">Last updated: 2026</p>

        {isPrivacy ? (
          <div className="space-y-8 text-zinc-400 text-sm leading-7">
            <section>
              <h2 className="text-white font-semibold mb-2">What we collect</h2>
              <p>When you request access, we collect your name, email, role, use case, and submission timestamp. In the current prototype, access requests are stored locally in your browser unless connected to a backend.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">How we use it</h2>
              <p>We use access request information to contact developers, understand use cases, and prioritize onboarding. We do not sell personal information.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">Product data</h2>
              <p>Demo dashboard actions, API tester inputs, and execution logs shown on this website are simulated in the browser for demonstration purposes.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">Contact</h2>
              <p>Questions? Contact us on X at <a className="text-sky-400 hover:text-sky-300" href="https://x.com/CognosCloud" target="_blank" rel="noopener noreferrer">@CognosCloud</a>.</p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-zinc-400 text-sm leading-7">
            <section>
              <h2 className="text-white font-semibold mb-2">Use of the service</h2>
              <p>Cognos Cloud is currently an early product experience. You may use the website, demos, and examples to evaluate the product and request access.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">No production guarantee yet</h2>
              <p>Unless you have a separate agreement with us, the current beta is provided as-is with no uptime or availability guarantees.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">Acceptable use</h2>
              <p>Do not use Cognos Cloud for unlawful activity, spam, credential theft, unauthorized access, or harmful automated behavior.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">Changes</h2>
              <p>We may update these terms as the product evolves. Continued use means you accept the updated terms.</p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Deploy Section ───────────────────────────────────────────────────────

function DeploySection() {
  const [useMobileDemo, setUseMobileDemo] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const check = () => setUseMobileDemo(mq.matches);
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  return (
    <section id="deploy" className="py-24 px-4 sm:px-6 border-t border-white/[0.06] overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full min-w-0">

        {/* 60-second demo — the hero of this section */}
        <div className="mb-20">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
              60-second demo
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Install. Write. Deploy.<br />
              <span className="text-zinc-400">Watch it run.</span>
            </h2>
            <p className="text-zinc-500 text-base max-w-md mx-auto">
              pip install → write the agent → cognos deploy → dashboard opens →
              POST request → execution timeline → live logs.
            </p>
          </div>
          {/* Full video player is desktop/tablet only. On phones the embedded
              16:9 dashboard scene becomes too dense, so we show a mobile-safe
              storyboard instead. */}
          {!useMobileDemo && (
            <div className="desktop-video-demo hidden md:block w-full min-w-0 overflow-hidden">
              <VideoDemo />
            </div>
          )}

          {useMobileDemo && (
          <div className="mobile-demo-card rounded-2xl border border-white/[0.08] bg-[#0b0b0b] overflow-hidden w-full max-w-full">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white text-sm font-semibold">60-second flow</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                ["01", "Install", "pip install cognos"],
                ["02", "Create agent", "from cognos import Agent"],
                ["03", "Deploy", "cognos deploy research-agent"],
                ["04", "Dashboard", "Running · Endpoint · Logs"],
                ["05", "Invoke API", "POST /run → Timeline → Response"],
              ].map(([n, title, text], i, arr) => (
                <div key={n} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                      {n}
                    </div>
                    {i < arr.length - 1 && <div className="w-px h-6 bg-white/[0.07] my-1" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-zinc-500 text-xs font-mono mt-0.5 break-all">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* chapter legend */}
          <div className="hidden md:flex mt-6 items-center justify-center gap-6 flex-wrap">
            {[
              { n:"01", label:"Install",   t:"0s"  },
              { n:"02", label:"Write",     t:"6s"  },
              { n:"03", label:"Deploy",    t:"16s" },
              { n:"04", label:"Dashboard", t:"36s" },
              { n:"05", label:"Done",      t:"52s" },
            ].map((c, i, arr) => (
              <div key={c.n} className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-700 font-mono">{c.t}</span>
                <span className="text-[12px] text-zinc-400 font-medium">{c.label}</span>
                {i < arr.length - 1 && <span className="text-zinc-800 ml-2">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive deploy terminal */}
        <div className="mb-16 hidden md:block">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3">
              Interactive
            </p>
            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
              Try it yourself.
            </h3>
            <p className="text-zinc-500 text-sm">
              Click replay at any time. Dashboard opens the moment deploy completes.
            </p>
          </div>
          <DeployDemo />
        </div>

        <ThreeSteps />
        <WhatYouGet />
      </div>
    </section>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]         = useState<"landing" | "dashboard" | "docs" | "admin" | "privacy" | "terms">(
    () => window.location.hash === "#admin" ? "admin" : "landing"
  );
  const [signupOpen, setSignup] = useState(false);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#admin") setView("admin");
    };
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const openLegal = (event: Event) => {
      const page = (event as CustomEvent<"privacy" | "terms">).detail;
      if (page === "privacy" || page === "terms") setView(page);
    };
    window.addEventListener("cognos-open-legal", openLegal);
    return () => window.removeEventListener("cognos-open-legal", openLegal);
  }, []);

  if (view === "dashboard") return <Dashboard onBack={() => setView("landing")} />;
  if (view === "docs")      return <Docs onBack={() => setView("landing")} />;
  if (view === "admin")     return <AdminDashboard onBack={() => setView("landing")} />;
  if (view === "privacy")   return <LegalPage type="privacy" onBack={() => setView("landing")} />;
  if (view === "terms")     return <LegalPage type="terms" onBack={() => setView("landing")} />;

  return (
    <div className="bg-[#080808] min-h-screen text-white overflow-x-hidden">
      <SignupModal open={signupOpen} onClose={() => setSignup(false)} />
      <Nav
        onDashboard={() => setView("dashboard")}
        onDocs={() => setView("docs")}
        onSignup={() => setSignup(true)}
      />
      <Hero onDashboard={() => setView("dashboard")} onDocs={() => setView("docs")} onSignup={() => setSignup(true)} />
      <DeploySection />
      <PainSolution />
      <OneProduct />
      <DashboardMock onDashboard={() => setView("dashboard")} />
      <ExecutionTrace />
      <SDKSection onDocs={() => setView("docs")} />
      <Comparison />
      <Positioning />
      <Roadmap />
      <CTA onDashboard={() => setView("dashboard")} onDocs={() => setView("docs")} onSignup={() => setSignup(true)} />
      <Footer onDocs={() => setView("docs")} onSignup={() => setSignup(true)} onAdmin={() => setView("admin")} />
    </div>
  );
}
