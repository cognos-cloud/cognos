import { useState, useEffect } from "react";
import React from "react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Syntax highlight ─────────────────────────────────────────────────────────

function highlight(code: string, lang: "python" | "bash" | "text" = "text"): string {
  const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (lang === "bash") {
    return esc
      .replace(/(#[^\n]*)/g, '<span class="syn-cmt">$1</span>')
      .replace(/\b(cognos|pip)\b/g, '<span class="syn-cls">$1</span>')
      .replace(/\b(install|login|deploy|dev|logs|monitor|rollback|init)\b/g, '<span class="syn-fn">$1</span>');
  }
  if (lang === "python") {
    return esc
      .replace(/(#[^\n]*)/g, '<span class="syn-cmt">$1</span>')
      .replace(/\b(from|import|True|False|None|str|bool|list|int|float|def|return|if|else|for|in|async|await)\b/g, '<span class="syn-kw">$1</span>')
      .replace(/\b(Agent|tool)\b/g, '<span class="syn-cls">$1</span>')
      .replace(/\.(deploy|start|stop|restart|logs|delete|run)\b/g, '.<span class="syn-fn">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="syn-str">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-num">$1</span>');
  }
  return esc
    .replace(/(✓[^\n]*)/g, '<span class="syn-ok">$1</span>')
    .replace(/(https?:\/\/\S+)/g, '<span class="syn-url">$1</span>');
}

// ─── Code block ───────────────────────────────────────────────────────────────

function Code({ code, lang = "text" }: { code: string; lang?: "python" | "bash" | "text" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const label = lang === "python" ? "Python" : lang === "bash" ? "Bash" : "Output";
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <span className={cn("w-1.5 h-1.5 rounded-full",
            lang === "python" ? "bg-blue-400" : lang === "bash" ? "bg-emerald-400" : "bg-zinc-600"
          )} />
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">{label}</span>
        </div>
        <button onClick={copy} className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1">
          {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
        </button>
      </div>
      <pre className="px-5 py-4 text-[13px] font-mono leading-6 overflow-x-auto">
        <code dangerouslySetInnerHTML={{ __html: highlight(code.trim(), lang) }} />
      </pre>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ variant }: { variant: "live" | "coming-soon" | "planned" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
      variant === "live"        && "text-emerald-400 border-emerald-400/25 bg-emerald-400/[0.07]",
      variant === "coming-soon" && "text-sky-400 border-sky-400/25 bg-sky-400/[0.07]",
      variant === "planned"     && "text-zinc-500 border-zinc-700 bg-white/[0.02]",
    )}>
      {variant === "live" && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
      {variant === "live" ? "Live" : variant === "coming-soon" ? "Coming Soon" : "Planned"}
    </span>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { feature: "Build agents",           cognos: true,  frameworks: true  },
  { feature: "Deploy to production",   cognos: true,  frameworks: null  },
  { feature: "Runtime management",     cognos: true,  frameworks: false },
  { feature: "Persistent memory",      cognos: true,  frameworks: null  },
  { feature: "Observability",          cognos: true,  frameworks: null  },
  { feature: "Scheduling",             cognos: true,  frameworks: null  },
  { feature: "One-command deployment", cognos: true,  frameworks: false },
];

function ComparisonTable() {
  return (
    <div className="my-6 rounded-xl border border-white/[0.07] overflow-hidden">
      <div className="grid grid-cols-3 bg-[#0a0a0a] border-b border-white/[0.07] px-5 py-2.5 text-[11px] uppercase tracking-widest text-zinc-600">
        <span>Capability</span>
        <span className="text-white text-center">Cognos Cloud</span>
        <span className="text-center">AI Frameworks</span>
      </div>
      {COMPARISON_ROWS.map((row, i) => (
        <div key={row.feature} className={cn("grid grid-cols-3 px-5 py-3 border-b border-white/[0.04] last:border-0", i % 2 === 0 ? "bg-[#0c0c0c]" : "bg-[#0d0d0d]")}>
          <span className="text-zinc-300 text-[13px]">{row.feature}</span>
          <span className="text-center">{row.cognos ? <Tick /> : <Cross />}</span>
          <span className="text-center">{row.frameworks === true ? <Tick /> : row.frameworks === false ? <Cross /> : <Partial />}</span>
        </div>
      ))}
      <div className="px-5 py-2.5 bg-[#0a0a0a] border-t border-white/[0.04] flex items-center gap-4 text-[10px] text-zinc-700">
        <span><span className="text-emerald-400">✓</span> Full support</span>
        <span><span className="text-amber-400">⚠</span> Partial / manual</span>
        <span><span className="text-red-400">✗</span> Not included</span>
      </div>
    </div>
  );
}

function Tick()    { return <span className="text-emerald-400 font-bold">✓</span>; }
function Cross()   { return <span className="text-red-400 font-bold">✗</span>; }
function Partial() { return <span className="text-amber-400 font-bold">⚠</span>; }

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({ label, available }: { label: string; available: true | "coming-soon" }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 border-b border-white/[0.04] last:border-0">
      <span className={cn("text-sm flex-shrink-0 w-4", available === true ? "text-emerald-400" : "text-sky-400")}>
        {available === true ? "✓" : "◎"}
      </span>
      <span className="text-zinc-400 text-[13px] flex-1">{label}</span>
      {available === "coming-soon" && (
        <span className="text-[10px] text-sky-500/70 border border-sky-500/20 rounded px-1.5 py-0.5 flex-shrink-0">Soon</span>
      )}
    </div>
  );
}

// ─── Flow diagram ─────────────────────────────────────────────────────────────

function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="my-4 pl-1">
      {steps.map((step, i) => (
        <div key={step}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
            <span className="text-[13px] text-zinc-300 font-medium">{step}</span>
          </div>
          {i < steps.length - 1 && <div className="ml-[3px] w-px h-5 bg-white/[0.07]" />}
        </div>
      ))}
    </div>
  );
}

// ─── Typography ───────────────────────────────────────────────────────────────

function Section({ id, title, badge, children }: {
  id: string; title: string; badge?: "live" | "coming-soon" | "planned"; children: React.ReactNode;
}) {
  return (
    <section id={id} className="pt-12 pb-4 border-b border-white/[0.05] last:border-0 scroll-mt-[72px]">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {badge && <StatusBadge variant={badge} />}
      </div>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-[15px] font-semibold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 text-[14px] leading-7 mb-3">{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 my-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[14px] text-zinc-400">
          <span className="text-zinc-600 mt-1 flex-shrink-0">•</span>{item}
        </li>
      ))}
    </ul>
  );
}

function InlineCode({ children }: { children: string }) {
  return <code className="text-zinc-300 bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-[12px] font-mono">{children}</code>;
}

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV = [
  {
    group: "Overview",
    items: [
      { id: "why-cognos",      label: "Why Cognos Cloud" },
      { id: "getting-started", label: "Getting Started",  badge: "live" as const },
    ],
  },
  {
    group: "Examples",
    items: [
      { id: "example-research", label: "Research Agent",  badge: "live" as const },
      { id: "example-github",   label: "GitHub Agent",    badge: "live" as const },
      { id: "example-crypto",   label: "Crypto Agent",    badge: "live" as const },
    ],
  },
  {
    group: "Core",
    items: [
      { id: "runtime",   label: "Runtime",   badge: "live" as const },
      { id: "memory",    label: "Memory",    badge: "coming-soon" as const },
      { id: "observe",   label: "Observe",   badge: "coming-soon" as const },
      { id: "workflow",  label: "Workflow",  badge: "coming-soon" as const },
      { id: "policy",    label: "Policy",    badge: "coming-soon" as const },
      { id: "tools",     label: "Tools",     badge: "live" as const },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "sdk",       label: "SDK" },
      { id: "cli",       label: "CLI" },
      { id: "dashboard", label: "Dashboard" },
      { id: "api-ref",   label: "API Reference" },
    ],
  },
  {
    group: "More",
    items: [
      { id: "roadmap", label: "Roadmap" },
      { id: "faq",     label: "FAQ" },
    ],
  },
];

const ALL_IDS = NAV.flatMap((g) => g.items.map((i) => i.id));

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

function SidebarNav({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <nav className="space-y-5">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="text-[10px] uppercase tracking-widest text-zinc-700 font-semibold px-2 mb-1.5">
            {group.group}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors text-left",
                  activeId === item.id
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <span>{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0",
                    item.badge === "live"        && "text-emerald-400 border-emerald-400/25 bg-emerald-400/[0.07]",
                    item.badge === "coming-soon" && "text-sky-400 border-sky-400/20 bg-sky-400/[0.05]",
                  )}>
                    {item.badge === "live" ? "Live" : "Soon"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ─── Tools data ───────────────────────────────────────────────────────────────

const TOOLS_LIVE    = ["GitHub", "Slack", "Discord", "PostgreSQL", "Notion", "Gmail", "Stripe", "Solana", "Ethereum"];
const TOOLS_SOON    = ["Linear", "Jira", "HubSpot", "Salesforce", "Twilio"];

// ─── Main Docs component ──────────────────────────────────────────────────────

export default function Docs({ onBack }: { onBack: () => void }) {
  const [activeId, setActiveId]       = useState("why-cognos");
  const [mobileOpen, setMobileOpen]   = useState(false);

  // ── Active section via scroll spy on window ──────────────────────
  useEffect(() => {
    const handleScroll = () => {
      let current = ALL_IDS[0];
      for (const id of ALL_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 90) current = id;
      }
      setActiveId(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* ── Sticky top bar ────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <CognosLogoSm />
          <span className="text-white text-[13px] font-semibold">Cognos Cloud</span>
          <span className="text-zinc-700 text-[13px]">/</span>
          <span className="text-zinc-500 text-[13px]">Docs</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <a href="https://github.com/cognos-cloud" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors">
            <GHIcon /><span className="text-[12px]">GitHub</span>
          </a>
          <a href="https://x.com/CognosCloud" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition-colors">
            <XIcon /><span className="text-[12px]">X</span>
          </a>
          <button onClick={() => scrollTo("getting-started")} className="text-[12px] text-zinc-500 hover:text-white transition-colors">
            Quick start
          </button>
        </div>

        <button className="sm:hidden text-zinc-500 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </header>

      {/* ── Mobile nav overlay ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-[56px] bg-[#080808]/98 sm:hidden overflow-y-auto">
          <div className="p-5">
            <SidebarNav activeId={activeId} onSelect={scrollTo} />
          </div>
        </div>
      )}

      {/* ── Desktop fixed sidebar ─────────────────────────────────── */}
      <aside className="hidden sm:block fixed left-0 top-[56px] bottom-0 w-[220px] border-r border-white/[0.06] bg-[#080808] overflow-y-auto py-6 px-3 z-30">
        <SidebarNav activeId={activeId} onSelect={scrollTo} />
      </aside>

      {/* ── Main content. Desktop gets left padding equal to sidebar width. */}
      <main className="pt-[56px] sm:pl-[220px] min-w-0">
        <div className="max-w-2xl mx-auto px-6 py-10 pb-40">

            {/* Why Cognos Cloud */}
            <Section id="why-cognos" title="Why Cognos Cloud">
              <P>Cognos Cloud is the operating system for autonomous AI agents. Instead of managing infrastructure, Cognos Cloud gives every agent a production-ready runtime with built-in memory, scheduling, observability, and security — from a single command.</P>
              <P>Most AI frameworks help you <strong className="text-zinc-200">build</strong> agents. Cognos Cloud helps you <strong className="text-zinc-200">operate</strong> them reliably in production.</P>
              <Sub title="Cognos Cloud vs. AI Frameworks">
                <ComparisonTable />
                <P>LangGraph, CrewAI, AutoGen, and the OpenAI Agents SDK are excellent tools for building agent logic. Cognos Cloud is the production layer those agents run on.</P>
              </Sub>
            </Section>

            {/* Getting Started */}
            <Section id="getting-started" title="Getting Started" badge="live">
              <P>Four commands. A fully managed AI agent running in production.</P>

              <Sub title="1 — Install">
                <Code lang="bash" code={`pip install cognos`} />
                <P>Installs the SDK, CLI, and runtime client. Requires Python 3.10+.</P>
              </Sub>

              <Sub title="2 — Authenticate">
                <Code lang="bash" code={`cognos login`} />
                <P>Opens a browser for OAuth. Token saved to <InlineCode>~/.cognos/credentials</InlineCode>. Or set <InlineCode>COGNOS_API_KEY</InlineCode> directly.</P>
              </Sub>

              <Sub title="3 — Write your agent">
                <Code lang="python" code={`from cognos import Agent

agent = Agent(
    name="research-agent",
    model="gpt-4o",
    memory=True,
    tools=["web", "slack"],
    cron="0 9 * * *",
)

agent.deploy()`} />
                <P>That's the entire agent definition. No infra config. No YAML. No Dockerfile.</P>
              </Sub>

              <Sub title="4 — Deploy">
                <Code lang="bash" code={`cognos deploy`} />
                <Code lang="text" code={`✓ Packaging agent...
✓ Uploading to Cognos Cloud...
✓ Provisioning runtime...
✓ Allocating memory store...
✓ Registering tools: web, slack...
✓ Starting container...
✓ Health check passed...

● Agent deployed successfully

Dashboard   https://www.cognoscloud.xyz/agents/research-agent
API         POST https://api.cognos.ai/v1/agents/research-agent/run
Status      Running`} />
              </Sub>

              <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-5 py-4">
                <p className="text-emerald-300 font-semibold text-[14px] mb-1">Every deployed agent automatically gets:</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3">
                  {[
                    "Live dashboard",
                    "REST API endpoint",
                    "Persistent memory",
                    "Auto-restart on failure",
                    "Cron scheduling",
                    "Streaming logs",
                    "Webhook triggers",
                    "Execution traces",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-[13px] text-emerald-300/80">
                      <span className="text-emerald-500 flex-shrink-0">✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── EXAMPLE AGENTS ──────────────────────────────────── */}

            {/* Research Agent */}
            <Section id="example-research" title="Research Agent" badge="live">
              <P>Searches the web on a schedule, summarises the results, and posts them to Slack. Clone this to get a daily AI briefing in minutes.</P>

              <div className="my-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Model",    value: "gpt-4o" },
                  { label: "Schedule", value: "Daily 9am" },
                  { label: "Tools",    value: "web · slack" },
                ].map((s) => (
                  <div key={s.label} className="border border-white/[0.07] bg-white/[0.02] rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-zinc-300 text-[12px] font-mono font-medium">{s.value}</p>
                  </div>
                ))}
              </div>

              <Code lang="python" code={`from cognos import Agent

agent = Agent(
    name="research-agent",
    model="gpt-4o",
    memory=True,
    tools=["web", "slack"],
    cron="0 9 * * *",       # runs every morning at 9am
    instructions="""
    You are a research assistant.
    Every morning:
    1. Search for the top AI and tech news from the last 24 hours
    2. Summarise the 5 most important stories in plain language
    3. Post the summary to the #research Slack channel
    Keep it concise. Include source links.
    """
)

agent.deploy()`} />

              <Sub title="What it does">
                <UL items={[
                  "Triggers automatically via cron — no server needed",
                  "Searches the web for fresh content using the web tool",
                  "Remembers past summaries to avoid repetition (memory=True)",
                  "Posts formatted digest directly to Slack",
                  "Logs every run — latency, cost, tool calls — in dashboard",
                ]} />
              </Sub>

              <Sub title="Deploy it">
                <Code lang="bash" code={`cognos deploy
# Dashboard: https://www.cognoscloud.xyz/agents/research-agent`} />
              </Sub>

              <Sub title="Execution trace">
                <div className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4 font-mono text-[12px] leading-6 space-y-1">
                  {[
                    { t: "0ms",    c: "text-zinc-500",   m: "Cron triggered (0 9 * * *)" },
                    { t: "12ms",   c: "text-zinc-500",   m: "Memory: loaded 8 prior summaries" },
                    { t: "240ms",  c: "text-violet-400", m: "→ web.search(\"top AI news last 24h\")" },
                    { t: "910ms",  c: "text-sky-400",    m: "← web: 14 results (670ms)" },
                    { t: "1.2s",   c: "text-violet-400", m: "→ web.search(\"tech funding news today\")" },
                    { t: "1.8s",   c: "text-sky-400",    m: "← web: 9 results (580ms)" },
                    { t: "3.1s",   c: "text-violet-400", m: "→ slack.post(channel=\"#research\")" },
                    { t: "3.4s",   c: "text-sky-400",    m: "← slack: message sent (id: C09AB1)" },
                    { t: "3.5s",   c: "text-emerald-400",m: "● Complete · 3.5s · $0.04" },
                  ].map((row) => (
                    <div key={row.t} className="flex items-start gap-3">
                      <span className="text-zinc-700 w-[44px] flex-shrink-0 tabular-nums">{row.t}</span>
                      <span className={row.c}>{row.m}</span>
                    </div>
                  ))}
                </div>
              </Sub>
            </Section>

            {/* GitHub Agent */}
            <Section id="example-github" title="GitHub Agent" badge="live">
              <P>Monitors your repositories for new pull requests and open issues. Reviews code, leaves structured comments, and posts a daily digest to Slack.</P>

              <div className="my-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Model",    value: "gpt-4o" },
                  { label: "Trigger",  value: "Webhook + cron" },
                  { label: "Tools",    value: "github · slack" },
                ].map((s) => (
                  <div key={s.label} className="border border-white/[0.07] bg-white/[0.02] rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-zinc-300 text-[12px] font-mono font-medium">{s.value}</p>
                  </div>
                ))}
              </div>

              <Code lang="python" code={`from cognos import Agent

agent = Agent(
    name="github-agent",
    model="gpt-4o",
    memory=True,
    tools=["github", "slack"],
    endpoint="/webhook/github",  # triggered by GitHub webhooks
    cron="0 17 * * 1-5",         # daily digest at 5pm on weekdays
    instructions="""
    You are a senior code reviewer and project manager.

    When triggered by a PR webhook:
    - Read the diff and changed files
    - Leave a structured review comment covering:
      * Summary of what the PR does
      * Potential bugs or edge cases
      * Suggestions for improvement
      * Approval or request-for-changes verdict

    When triggered by cron:
    - List all open PRs and issues created today
    - Post a concise digest to #engineering in Slack
    - Flag any PRs that have been open > 3 days without review

    Be direct and helpful. No filler.
    """
)

agent.deploy()`} />

              <Sub title="What it does">
                <UL items={[
                  "Listens for GitHub webhook events — fires instantly on new PR",
                  "Reads the full diff and file context via GitHub tool",
                  "Posts a structured review comment directly on the PR",
                  "Flags stale PRs and unreviewed issues in daily digest",
                  "Remembers repo context across reviews (memory=True)",
                ]} />
              </Sub>

              <Sub title="Configure the webhook">
                <P>After deploy, your agent gets a live URL. Add it to GitHub:</P>
                <Code lang="bash" code={`# Settings → Webhooks → Add webhook
Payload URL:  https://api.cognos.ai/v1/agents/github-agent/webhook/github
Content type: application/json
Events:       Pull requests, Issues`} />
              </Sub>

              <Sub title="Execution trace">
                <div className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4 font-mono text-[12px] leading-6 space-y-1">
                  {[
                    { t: "0ms",   c: "text-zinc-500",   m: "Webhook: pull_request.opened (#142)" },
                    { t: "18ms",  c: "text-violet-400", m: "→ github.get_pull_request(pr=142)" },
                    { t: "190ms", c: "text-sky-400",    m: "← github: diff returned (1,240 lines)" },
                    { t: "220ms", c: "text-violet-400", m: "→ github.get_file_contents(paths=[...])" },
                    { t: "380ms", c: "text-sky-400",    m: "← github: 4 files returned" },
                    { t: "2.1s",  c: "text-violet-400", m: "→ github.create_review(verdict=\"approve\")" },
                    { t: "2.4s",  c: "text-sky-400",    m: "← github: review posted" },
                    { t: "2.4s",  c: "text-emerald-400",m: "● Complete · 2.4s · $0.06" },
                  ].map((row) => (
                    <div key={row.t} className="flex items-start gap-3">
                      <span className="text-zinc-700 w-[44px] flex-shrink-0 tabular-nums">{row.t}</span>
                      <span className={row.c}>{row.m}</span>
                    </div>
                  ))}
                </div>
              </Sub>
            </Section>

            {/* Crypto Agent */}
            <Section id="example-crypto" title="Crypto Agent" badge="live">
              <P>Monitors wallets and on-chain transactions across Solana and Ethereum. Sends alerts on large movements, checks balances on a schedule, and simulates transactions before they execute.</P>

              <div className="my-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Model",    value: "gpt-4o" },
                  { label: "Schedule", value: "Every 5 min" },
                  { label: "Tools",    value: "solana · ethereum · slack" },
                ].map((s) => (
                  <div key={s.label} className="border border-white/[0.07] bg-white/[0.02] rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-zinc-300 text-[12px] font-mono font-medium">{s.value}</p>
                  </div>
                ))}
              </div>

              <Code lang="python" code={`from cognos import Agent

WATCHED_WALLETS = [
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",  # Solana
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",    # Ethereum (vitalik.eth)
]

agent = Agent(
    name="crypto-agent",
    model="gpt-4o",
    memory=True,
    tools=["solana", "ethereum", "slack"],
    cron="*/5 * * * *",   # runs every 5 minutes
    instructions=f"""
    You are an on-chain monitoring agent.

    Watched wallets: {WATCHED_WALLETS}

    Every run:
    1. Check SOL and ETH balances for all watched wallets
    2. Fetch the last 10 transactions for each wallet
    3. Flag any transaction > $10,000 USD equivalent
    4. For flagged transactions, simulate what they do before alerting
    5. Post alerts to #crypto-alerts in Slack with:
       - Wallet address (truncated)
       - Transaction type and amount
       - Counterparty address
       - USD value at time of transaction
       - Link to block explorer

    Alert format:
    🚨 Large movement detected
    Wallet: 7xKX...sU
    Amount: 50,000 SOL ($8.2M)
    To: 9yZ3...Qm
    Explorer: https://solscan.io/tx/...

    Simulate all transactions before alerting.
    Never execute transactions — monitoring only.
    """
)

agent.deploy()`} />

              <Sub title="What it does">
                <UL items={[
                  "Polls wallets every 5 minutes — catches movements fast",
                  "Checks balances on Solana and Ethereum in the same run",
                  "Simulates flagged transactions to understand intent before alerting",
                  "Sends structured Slack alerts with explorer links",
                  "Remembers previous balances to detect changes (memory=True)",
                  "Fully read-only — never executes transactions",
                ]} />
              </Sub>

              <Sub title="Add more wallets at runtime">
                <Code lang="bash" code={`# Trigger the agent with a new wallet to monitor
curl -X POST https://api.cognos.ai/v1/agents/crypto-agent/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"input": "Add wallet 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B to monitoring"}'`} />
              </Sub>

              <Sub title="Execution trace">
                <div className="rounded-xl border border-white/[0.07] bg-[#0d0d0d] p-4 font-mono text-[12px] leading-6 space-y-1">
                  {[
                    { t: "0ms",   c: "text-zinc-500",   m: "Cron triggered (*/5 * * * *)" },
                    { t: "8ms",   c: "text-zinc-500",   m: "Memory: loaded prior balances" },
                    { t: "90ms",  c: "text-violet-400", m: "→ solana.get_balance(wallet=7xKX...)" },
                    { t: "210ms", c: "text-sky-400",    m: "← solana: 12,400 SOL ($2.04M)" },
                    { t: "220ms", c: "text-violet-400", m: "→ solana.get_transactions(wallet=7xKX..., limit=10)" },
                    { t: "390ms", c: "text-sky-400",    m: "← solana: 10 txs — 1 flagged (50,000 SOL)" },
                    { t: "400ms", c: "text-violet-400", m: "→ solana.simulate_transaction(tx=sig...)" },
                    { t: "560ms", c: "text-sky-400",    m: "← solana: simulation ok — token swap" },
                    { t: "580ms", c: "text-violet-400", m: "→ slack.post(channel=\"#crypto-alerts\", ...)" },
                    { t: "720ms", c: "text-sky-400",    m: "← slack: alert sent" },
                    { t: "730ms", c: "text-emerald-400",m: "● Complete · 730ms · $0.02" },
                  ].map((row) => (
                    <div key={row.t} className="flex items-start gap-3">
                      <span className="text-zinc-700 w-[44px] flex-shrink-0 tabular-nums">{row.t}</span>
                      <span className={row.c}>{row.m}</span>
                    </div>
                  ))}
                </div>
              </Sub>
            </Section>

            {/* Runtime */}
            <Section id="runtime" title="Runtime" badge="live">
              <P>The Cognos Cloud Runtime keeps your agent running continuously in a managed container. It handles process lifecycle, restart policy, scheduling, and API exposure — so you don't have to.</P>
              <Sub title="What's included">
                <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d]">
                  <FeatureRow label="Continuous execution (runs forever)"  available={true} />
                  <FeatureRow label="Auto-restart on failure"              available={true} />
                  <FeatureRow label="Live REST API endpoint"               available={true} />
                  <FeatureRow label="Cron / scheduled execution"           available={true} />
                  <FeatureRow label="Webhook triggers"                     available={true} />
                  <FeatureRow label="Background job queue"                 available={true} />
                  <FeatureRow label="Horizontal auto-scaling"              available="coming-soon" />
                </div>
              </Sub>
              <Sub title="Example">
                <Code lang="python" code={`agent = Agent(
    name="daily-report",
    model="gpt-4o",
    cron="0 9 * * *",   # every day at 9am
    memory=True,
    tools=["slack"]
)
agent.deploy()`} />
              </Sub>
            </Section>

            {/* Memory */}
            <Section id="memory" title="Memory" badge="coming-soon">
              <P>Cognos Cloud Memory gives agents persistent intelligence across sessions. Set <InlineCode>memory=True</InlineCode> and your agent automatically reads and writes to a managed vector store — no configuration required.</P>
              <div className="my-4 rounded-lg border border-sky-400/20 bg-sky-400/[0.04] px-4 py-3 flex items-start gap-3">
                <span className="text-sky-400 text-sm flex-shrink-0 mt-0.5">◎</span>
                <p className="text-sky-300/80 text-[13px] leading-6">
                  <strong className="text-sky-300">Coming Soon.</strong> Memory is under active development. Basic conversation history is available now; vector search and per-user namespaces are next.
                </p>
              </div>
              <Sub title="What's included">
                <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d]">
                  <FeatureRow label="Conversation history"              available={true} />
                  <FeatureRow label="Long-term context store"           available={true} />
                  <FeatureRow label="Automatic read/write on each run"  available={true} />
                  <FeatureRow label="Vector similarity search"          available="coming-soon" />
                  <FeatureRow label="Per-user memory namespaces"        available="coming-soon" />
                  <FeatureRow label="Knowledge base ingestion"          available="coming-soon" />
                </div>
              </Sub>
            </Section>

            {/* Observe */}
            <Section id="observe" title="Observe" badge="coming-soon">
              <P>Every agent execution is recorded as a structured trace — every model call, tool use, latency, token count, and cost. View them live in the dashboard.</P>
              <div className="my-4 rounded-lg border border-sky-400/20 bg-sky-400/[0.04] px-4 py-3 flex items-start gap-3">
                <span className="text-sky-400 text-sm flex-shrink-0 mt-0.5">◎</span>
                <p className="text-sky-300/80 text-[13px] leading-6">
                  <strong className="text-sky-300">Coming Soon.</strong> Live logs and basic metrics are live now. Full trace explorer and cost analytics are coming.
                </p>
              </div>
              <Sub title="What's included">
                <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d]">
                  <FeatureRow label="Live execution logs"            available={true} />
                  <FeatureRow label="CPU and latency metrics"        available={true} />
                  <FeatureRow label="Per-run cost tracking"          available={true} />
                  <FeatureRow label="Full tool call traces"          available="coming-soon" />
                  <FeatureRow label="Execution timeline"             available="coming-soon" />
                  <FeatureRow label="Alerting on failure / latency"  available="coming-soon" />
                </div>
              </Sub>
            </Section>

            {/* Workflow */}
            <Section id="workflow" title="Workflow" badge="coming-soon">
              <P>Workflows let you connect multiple agents into pipelines. One agent's output becomes another's input — with durable execution, retries, and human-in-the-loop steps.</P>
              <div className="my-4 rounded-lg border border-sky-400/20 bg-sky-400/[0.04] px-4 py-3 flex items-start gap-3">
                <span className="text-sky-400 text-sm flex-shrink-0 mt-0.5">◎</span>
                <p className="text-sky-300/80 text-[13px] leading-6">
                  <strong className="text-sky-300">Coming Soon.</strong> In active development.
                </p>
              </div>
              <Sub title="Example pipeline">
                <Flow steps={["Research Agent", "Planning Agent", "Coding Agent", "Review Agent", "Deploy Agent"]} />
              </Sub>
            </Section>

            {/* Policy */}
            <Section id="policy" title="Policy" badge="coming-soon">
              <P>Policy is the governance layer for agents. Define what an agent is allowed to do — spending limits, tool permissions, human approval gates, and RBAC.</P>
              <div className="my-4 rounded-lg border border-sky-400/20 bg-sky-400/[0.04] px-4 py-3 flex items-start gap-3">
                <span className="text-sky-400 text-sm flex-shrink-0 mt-0.5">◎</span>
                <p className="text-sky-300/80 text-[13px] leading-6">
                  <strong className="text-sky-300">Coming Soon.</strong> Basic spending limits are live. RBAC and approval workflows are in development.
                </p>
              </div>
              <Sub title="Approval flow">
                <Flow steps={["Agent wants to send $500 payment", "Policy: spending limit check", "Human approval required", "Approved → execution continues"]} />
              </Sub>
            </Section>

            {/* Tools */}
            <Section id="tools" title="Tools" badge="live">
              <P>Tools connect agents to external services. Pass tool names to the <InlineCode>tools</InlineCode> parameter and Cognos Cloud handles auth, rate limiting, and errors automatically.</P>
              <Sub title="Available now">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 my-3">
                  {TOOLS_LIVE.map((t) => (
                    <div key={t} className="border border-white/[0.07] bg-white/[0.02] rounded-lg px-3 py-2 text-center text-[12px] text-zinc-300 font-medium">{t}</div>
                  ))}
                </div>
              </Sub>
              <Sub title="Coming soon">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 my-3">
                  {TOOLS_SOON.map((t) => (
                    <div key={t} className="border border-sky-400/15 bg-sky-400/[0.03] rounded-lg px-3 py-2 text-center text-[12px] text-sky-500/70 font-medium">{t}</div>
                  ))}
                </div>
              </Sub>
              <Sub title="Custom tools">
                <Code lang="python" code={`from cognos import tool

@tool(name="my-api", description="Fetches data from internal API")
def my_api_tool(query: str) -> str:
    # your implementation
    return response`} />
              </Sub>
            </Section>

            {/* SDK */}
            <Section id="sdk" title="SDK Reference" badge="live">
              <P>The Python SDK is the primary interface for defining and deploying agents.</P>
              <Sub title="Agent constructor">
                <Code lang="python" code={`from cognos import Agent

agent = Agent(
    name: str,              # unique agent identifier
    model: str,             # LLM model string
    memory: bool,           # enable persistent memory
    tools: list[str],       # tool names or custom tool functions
    cron: str | None,       # cron expression for scheduling
    endpoint: str | None,   # custom webhook path
    instructions: str,      # system prompt / persona
)`} />
              </Sub>
              <Sub title="Methods">
                <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d]">
                  {[
                    { m: "agent.deploy()",   d: "Package and deploy agent to Cognos Cloud" },
                    { m: "agent.start()",    d: "Start a stopped agent" },
                    { m: "agent.stop()",     d: "Stop a running agent gracefully" },
                    { m: "agent.restart()",  d: "Restart the agent runtime" },
                    { m: "agent.logs()",     d: "Stream live logs to stdout" },
                    { m: "agent.delete()",   d: "Remove agent and all resources" },
                  ].map((row) => (
                    <div key={row.m} className="flex items-start gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0">
                      <code className="text-sky-400 text-[12px] font-mono flex-shrink-0 w-36">{row.m}</code>
                      <span className="text-zinc-500 text-[13px]">{row.d}</span>
                    </div>
                  ))}
                </div>
              </Sub>
              <Sub title="Supported models">
                <UL items={[
                  "OpenAI — gpt-4o, gpt-4o-mini, o1, o3-mini",
                  "Anthropic — claude-3-5-sonnet, claude-3-haiku",
                  "Google — gemini-2.0-flash, gemini-1.5-pro",
                  "Local — ollama://llama3, ollama://mistral",
                ]} />
              </Sub>
            </Section>

            {/* CLI */}
            <Section id="cli" title="CLI Reference" badge="live">
              <P>The Cognos Cloud CLI manages the full agent lifecycle from your terminal.</P>
              <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d] my-4">
                {[
                  { cmd: "cognos init",           desc: "Scaffold a new agent project" },
                  { cmd: "cognos login",           desc: "Authenticate via browser OAuth" },
                  { cmd: "cognos dev",             desc: "Run agent locally with hot reload" },
                  { cmd: "cognos deploy",          desc: "Build, upload, and start agent in cloud" },
                  { cmd: "cognos logs",            desc: "Stream live logs from running agent" },
                  { cmd: "cognos logs --tail 50",  desc: "Show last 50 log lines" },
                  { cmd: "cognos monitor",         desc: "Open agent dashboard in browser" },
                  { cmd: "cognos restart",         desc: "Restart the agent runtime" },
                  { cmd: "cognos rollback",        desc: "Roll back to previous deployment" },
                  { cmd: "cognos delete",          desc: "Delete agent and all resources" },
                ].map((row) => (
                  <div key={row.cmd} className="flex items-start gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <code className="text-emerald-400 text-[12px] font-mono flex-shrink-0 w-48">{row.cmd}</code>
                    <span className="text-zinc-500 text-[13px]">{row.desc}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Dashboard */}
            <Section id="dashboard" title="Dashboard" badge="live">
              <P>Every deployed agent gets a live dashboard at <InlineCode>{"www.cognoscloud.xyz/agents/{name}"}</InlineCode>. No setup required.</P>
              <Sub title="What's included">
                <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-[#0d0d0d]">
                  <FeatureRow label="Live execution logs (streaming)"  available={true} />
                  <FeatureRow label="CPU + latency sparklines"         available={true} />
                  <FeatureRow label="Request count and failure rate"   available={true} />
                  <FeatureRow label="Cost per day"                     available={true} />
                  <FeatureRow label="Memory usage"                     available={true} />
                  <FeatureRow label="Full tool execution traces"       available="coming-soon" />
                  <FeatureRow label="Environment variable editor"      available="coming-soon" />
                </div>
              </Sub>
            </Section>

            {/* API Reference */}
            <Section id="api-ref" title="API Reference" badge="live">
              <P>Every agent exposes a REST API endpoint automatically on deploy.</P>
              <Sub title="Run an agent">
                <Code lang="bash" code={`curl -X POST https://api.cognos.ai/v1/agents/research-agent/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Research the latest AI safety papers"}'`} />
              </Sub>
              <Sub title="Response">
                <Code lang="text" code={`{
  "run_id": "run_01HXZK4R2P...",
  "status": "completed",
  "output": "...",
  "latency_ms": 824,
  "cost_usd": 0.03,
  "memory_writes": 4
}`} />
              </Sub>
              <Sub title="Base URL">
                <P><InlineCode>https://api.cognos.ai/v1</InlineCode></P>
                <P>All requests require <InlineCode>Authorization: Bearer YOUR_API_KEY</InlineCode>. Generate keys from the dashboard.</P>
              </Sub>
            </Section>

            {/* Roadmap */}
            <Section id="roadmap" title="Roadmap">
              <P>Built in public. Available Today means the feature genuinely works. Future features are never marked as live.</P>
              <div className="space-y-5 my-4">
                {[
                  {
                    title: "Available Today (v0.1)",
                    status: "live" as const,
                    summary: "Runtime: deploy agents, invoke them via API, and monitor execution.",
                    items: [
                      "Agent deployment from the CLI",
                      "Runtime management: start, stop, restart",
                      "Live logs streamed in real time",
                      "Execution timeline",
                      "REST API endpoint",
                      "Persistent memory across runs",
                    ],
                  },
                  {
                    title: "In Progress (v0.2)",
                    status: "coming-soon" as const,
                    summary: "Scheduling & Tools: cron jobs, secrets, custom tools, and deployment history.",
                    items: [
                      "Scheduled agents (cron jobs)",
                      "Tool SDK for custom integrations",
                      "Environment variables and secrets",
                      "Deployment history and rollback",
                      "Usage metrics",
                    ],
                  },
                  {
                    title: "Planned (v0.3+)",
                    status: "planned" as const,
                    summary: "Multi-agent workflows and Cognos Cloud: shared memory, teams, marketplace, and enterprise deployment.",
                    items: [
                      "Multi-agent workflows",
                      "Shared memory between agents",
                      "Team workspaces",
                      "RBAC and permissions",
                      "Hosted cloud platform",
                      "Marketplace for tools and agent templates",
                      "Enterprise self-hosting",
                    ],
                  },
                ].map((group) => (
                  <div key={group.title} className="border border-white/[0.06] rounded-xl bg-[#0d0d0d] p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge variant={group.status} />
                      <p className="text-white font-semibold text-[15px]">{group.title}</p>
                    </div>
                    <p className="text-zinc-500 text-[13px] leading-6 mb-4">{group.summary}</p>
                    <UL items={group.items} />
                  </div>
                ))}
              </div>
            </Section>

            {/* FAQ */}
            <Section id="faq" title="FAQ">
              {[
                { q: "Does Cognos Cloud host my agent?",      a: "Yes. Every deployed agent runs inside Cognos Cloud on managed infrastructure. No servers to provision." },
                { q: "Which LLMs are supported?",             a: "OpenAI (gpt-4o, o1, o3-mini), Anthropic (claude-3-5-sonnet, claude-3-haiku), Google (gemini-2.0-flash), and local models via Ollama." },
                { q: "Can I bring my own tools?",             a: "Yes. Register any Python function or HTTP endpoint as a custom tool using the @tool decorator." },
                { q: "What does 'Coming Soon' mean?",         a: "Coming Soon features are in active development. Basic versions may be available now, but the full API surface isn't stable yet." },
                { q: "Can I self-host Cognos Cloud?",         a: "Self-hosted enterprise deployment is planned. Today, Cognos Cloud is a fully managed service." },
                { q: "How is pricing calculated?",            a: "Based on agent runtime hours, memory storage, and execution count. LLM costs are passed through at cost." },
              ].map(({ q, a }) => (
                <div key={q} className="py-5 border-b border-white/[0.05] last:border-0">
                  <p className="text-white font-semibold text-[14px] mb-2">{q}</p>
                  <p className="text-zinc-400 text-[14px] leading-7">{a}</p>
                </div>
              ))}
            </Section>

        </div>
      </main>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GHIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function CognosLogoSm() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="white" />
      <circle cx="16" cy="16" r="3.5" fill="black" />
      <circle cx="16" cy="7" r="2" fill="black" />
      <circle cx="16" cy="25" r="2" fill="black" />
      <circle cx="7" cy="16" r="2" fill="black" />
      <circle cx="25" cy="16" r="2" fill="black" />
      <line x1="16" y1="9"    x2="16" y2="12.5" stroke="black" strokeWidth="1.5" />
      <line x1="16" y1="19.5" x2="16" y2="23"   stroke="black" strokeWidth="1.5" />
      <line x1="9"  y1="16"   x2="12.5" y2="16"  stroke="black" strokeWidth="1.5" />
      <line x1="19.5" y1="16" x2="23"   y2="16"  stroke="black" strokeWidth="1.5" />
    </svg>
  );
}
