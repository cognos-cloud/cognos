import { useState, useEffect, useRef, useCallback } from "react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LineType = "cmd" | "out" | "success" | "error" | "blank" | "url" | "dim";

interface TermLine {
  type: LineType;
  text: string;
  delay: number; // cumulative ms
}

// ─────────────────────────────────────────────────────────────────────────────
// Script: build the timeline with cumulative delays
// ─────────────────────────────────────────────────────────────────────────────

function buildScript(): TermLine[] {
  const raw: Array<Omit<TermLine, "delay"> & { gap: number }> = [
    // install
    { type: "cmd",     text: "pip install cognos",                                      gap: 0 },
    { type: "dim",     text: "Collecting cognos...",                                    gap: 550 },
    { type: "dim",     text: "  Downloading cognos-0.1.4-py3-none-any.whl (48 kB)",    gap: 280 },
    { type: "dim",     text: "  Downloading httpx-0.27.0 (76 kB)",                     gap: 180 },
    { type: "dim",     text: "Installing collected packages: cognos",                   gap: 350 },
    { type: "success", text: "Successfully installed cognos-0.1.4",                     gap: 280 },

    // blank
    { type: "blank", text: "", gap: 380 },

    // login
    { type: "cmd",     text: "cognos login",                                            gap: 0 },
    { type: "dim",     text: "Opening browser for authentication...",                   gap: 640 },
    { type: "dim",     text: "Waiting for confirmation...",                             gap: 1100 },
    { type: "success", text: "✓  Authenticated as james@acme.com",                     gap: 750 },
    { type: "success", text: "✓  Token saved to ~/.cognos/credentials",                gap: 160 },

    // blank
    { type: "blank", text: "", gap: 360 },

    // deploy
    { type: "cmd",     text: "cognos deploy",                                           gap: 0 },
    { type: "blank",   text: "",                                                        gap: 120 },
    { type: "out",     text: "  Deploying  research-agent",                             gap: 280 },
    { type: "blank",   text: "",                                                        gap: 80 },
    { type: "out",     text: "  ✓  Packaging agent...",                                 gap: 520 },
    { type: "out",     text: "  ✓  Uploading to Cognos Cloud...",                       gap: 680 },
    { type: "out",     text: "  ✓  Provisioning runtime...",                            gap: 820 },
    { type: "out",     text: "  ✓  Allocating memory store (vector)...",                gap: 560 },
    { type: "out",     text: "  ✓  Registering tools: perplexity, slack...",            gap: 480 },
    { type: "out",     text: "  ✓  Configuring schedule: 0 9 * * *...",                gap: 420 },
    { type: "out",     text: "  ✓  Starting container...",                              gap: 880 },
    { type: "out",     text: "  ✓  Health check passed...",                             gap: 540 },
    { type: "blank",   text: "",                                                        gap: 180 },
    { type: "success", text: "  ● Agent deployed successfully",                         gap: 380 },
    { type: "blank",   text: "",                                                        gap: 160 },
    { type: "url",     text: "  Dashboard    https://www.cognoscloud.xyz/agents/research-agent", gap: 220 },
    { type: "url",     text: "  API          POST https://api.cognoscloud.xyz/v1/agents/research-agent/run", gap: 80 },
    { type: "url",     text: "  Status       Running",                                  gap: 60 },
    { type: "url",     text: "  Memory       Attached (vector, 1.2 GB)",                gap: 60 },
    { type: "blank",   text: "",                                                        gap: 80 },
      { type: "url",     text: "  API          POST https://api.cognoscloud.xyz/v1/agents/research-agent/run", gap: 80 },
      { type: "url",     text: "  Status       Running",                                  gap: 60 },
      { type: "url",     text: "  Memory       Attached (vector, 1.2 GB)",                gap: 60 },
  ];

  let cum = 0;
  return raw.map((r) => {
    cum += r.gap;
    return { type: r.type, text: r.text, delay: cum };
  });
}

const SCRIPT = buildScript();
const TOTAL_DURATION = SCRIPT[SCRIPT.length - 1].delay + 200;

// index at which "deploy done" triggers (after "● Agent deployed")
const DONE_IDX = SCRIPT.findIndex((l) => l.text.includes("Agent deployed successfully"));

// ─────────────────────────────────────────────────────────────────────────────
// Agent source code to display in the editor pane
// ─────────────────────────────────────────────────────────────────────────────

const AGENT_CODE = `from cognos import Agent

agent = Agent(
    name="research-agent",
    model="gpt-4o",
    memory=True,
    tools=[
        "perplexity",
        "slack",
    ],
    cron="0 9 * * *",
)

agent.deploy()`;

// ─────────────────────────────────────────────────────────────────────────────
// Syntax highlight (no deps)
// ─────────────────────────────────────────────────────────────────────────────

function highlight(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\b(from|import|True|False|None)\b/g, '<span class="syn-kw">$1</span>')
    .replace(/\b(Agent)\b/g, '<span class="syn-cls">$1</span>')
    .replace(/(#[^\n]*)/g, '<span class="syn-cmt">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="syn-str">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="syn-num">$1</span>')
    .replace(/\.(deploy|name|model|memory|tools|cron)\b/g, '.<span class="syn-fn">$1</span>');
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal line renderer
// ─────────────────────────────────────────────────────────────────────────────

function TLine({ line }: { line: TermLine }) {
  if (line.type === "blank") return <div className="h-[10px]" />;

  if (line.type === "cmd") {
    return (
      <div className="flex items-center gap-2 font-mono text-[13px] leading-[22px]">
        <span className="text-emerald-400 select-none flex-shrink-0">❯</span>
        <span className="text-white font-medium">{line.text}</span>
      </div>
    );
  }
  if (line.type === "success") {
    return (
      <div className="font-mono text-[13px] leading-[22px] text-emerald-400">{line.text}</div>
    );
  }
  if (line.type === "error") {
    return (
      <div className="font-mono text-[13px] leading-[22px] text-red-400">{line.text}</div>
    );
  }
  if (line.type === "url") {
    // split on http URLs
    const parts = line.text.split(/(https?:\/\/\S+)/);
    return (
      <div className="font-mono text-[13px] leading-[22px]">
        {parts.map((p, i) =>
          /^https?:\/\//.test(p)
            ? <span key={i} className="text-sky-400">{p}</span>
            : /Running/.test(p)
            ? <span key={i} className="text-zinc-300">{p.replace("Running", '')}<span className="text-emerald-400">Running</span></span>
            : <span key={i} className="text-zinc-400">{p}</span>
        )}
      </div>
    );
  }
  if (line.type === "out") {
    const isCheck = line.text.includes("✓");
    return (
      <div className={cn("font-mono text-[13px] leading-[22px]", isCheck ? "text-zinc-300" : "text-zinc-400")}>
        {line.text}
      </div>
    );
  }
  // dim
  return (
    <div className="font-mono text-[13px] leading-[22px] text-zinc-600">{line.text}</div>
  );
}

function BlinkCursor() {
  return (
    <span className="inline-block w-[7px] h-[14px] bg-zinc-300 align-middle ml-0.5"
      style={{ animation: "blink 1s step-end infinite" }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live dashboard that animates in after deploy
// ─────────────────────────────────────────────────────────────────────────────

const LOG_LINES = [
  { t: "09:00:01", msg: "Starting scheduled run (cron)", color: "text-zinc-500" },
  { t: "09:00:01", msg: "Memory: loaded 14 items from context store", color: "text-zinc-500" },
  { t: "09:00:02", msg: "→ perplexity.search(\"AI safety papers 2025\")", color: "text-violet-400" },
  { t: "09:00:03", msg: "← perplexity: 12 results returned (371ms)", color: "text-sky-400" },
  { t: "09:00:04", msg: "→ slack.post(channel=\"#ai-research\", ...)", color: "text-violet-400" },
  { t: "09:00:04", msg: "← slack: message posted (id: C08XQ2F3A)", color: "text-sky-400" },
  { t: "09:00:05", msg: "Memory: wrote 4 new items to context store", color: "text-zinc-500" },
  { t: "09:00:05", msg: "Run complete · 4.2s · $0.03 · success", color: "text-emerald-400" },
];

function LiveDashboard({ visible }: { visible: boolean }) {
  const [logIdx, setLogIdx] = useState(0);
  const [executions, setExecutions] = useState(0);
  const [cost, setCost] = useState(0);
  const logsRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;

    let i = 0;
    const iv = setInterval(() => {
      if (i >= LOG_LINES.length) { clearInterval(iv); return; }
      setLogIdx(i + 1);
      setExecutions((e) => e + 1);
      setCost((c) => parseFloat((c + 0.004).toFixed(3)));
      i++;
    }, 340);
    return () => clearInterval(iv);
  }, [visible]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logIdx]);

  const bars = [28, 51, 39, 67, 62, 81, 78];

  return (
    <div
      className={cn(
        "flex flex-col bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-white/[0.06] transition-all duration-700 overflow-hidden",
        visible ? "lg:w-[46%] opacity-100" : "lg:w-0 opacity-0 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#090909] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
          <span className="text-zinc-300 text-[12px] font-mono font-medium">research-agent</span>
        </div>
        <span className="text-[10px] text-emerald-400 border border-emerald-400/25 bg-emerald-400/[0.07] rounded-full px-2 py-0.5 font-semibold">
          Running
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3 min-w-0">
        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Executions", value: executions.toString(), color: "text-white" },
            { label: "Failures",   value: "0",                   color: "text-emerald-400" },
            { label: "Cost",       value: `$${cost.toFixed(3)}`, color: "text-amber-400" },
            { label: "Memory",     value: "1.2 GB",              color: "text-sky-400" },
            { label: "Latency",    value: "450ms",               color: "text-violet-400" },
            { label: "Uptime",     value: "100%",                color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-2.5 py-2">
              <p className="text-[9px] text-zinc-600 mb-0.5 uppercase tracking-wider">{s.label}</p>
              <p className={cn("font-mono font-bold text-[12px] tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* API */}
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">
          <p className="text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">API Endpoint</p>
            <p className="text-sky-400 font-mono text-[10px] truncate">
            POST api.cognoscloud.xyz/v1/agents/research-agent/run
          </p>
        </div>

        {/* Sparkline */}
        <div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">Executions · 7d</p>
          <div className="flex items-end gap-[3px] h-8">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/[0.12] rounded-[2px] transition-all duration-700"
                style={{ height: visible ? `${h}%` : "0%" }}
              />
            ))}
          </div>
        </div>

        {/* Live logs */}
        <div className="bg-black/40 border border-white/[0.05] rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04]">
            <span className="w-1 h-1 rounded-full bg-emerald-400" style={{ animation: "blink 1.4s ease-in-out infinite" }} />
            <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Live logs</span>
          </div>
          <div ref={logsRef} className="p-2.5 h-[130px] overflow-y-auto space-y-0.5 scroll-dark">
            {LOG_LINES.slice(0, logIdx).map((l, i) => (
              <div key={i} className="font-mono text-[10px] leading-[18px] flex gap-2">
                <span className="text-zinc-700 flex-shrink-0">{l.t}</span>
                <span className={l.color}>{l.msg}</span>
              </div>
            ))}
            {visible && logIdx < LOG_LINES.length && (
              <span className="inline-block w-1 h-3 bg-white/30" style={{ animation: "blink 1s step-end infinite" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor pane — shows agent.py with typing effect
// ─────────────────────────────────────────────────────────────────────────────

function EditorPane() {
  const lines = AGENT_CODE.split("\n");
  return (
    <div className="flex flex-col bg-[#0d0d0d] border-b lg:border-b-0 lg:border-r border-white/[0.06]" style={{ minWidth: 0, flex: "0 0 38%" }}>
      {/* Tab */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-[#090909]">
        <div className="flex items-center gap-1.5 bg-[#141414] border border-white/[0.08] rounded-t-sm px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-orange-400/70" />
          <span className="text-[11px] text-zinc-300 font-mono">agent.py</span>
        </div>
      </div>
      {/* Code */}
      <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-[20px]">
        {/* Line numbers + code */}
        <div className="flex gap-3">
          <div className="select-none text-right text-zinc-700 flex-shrink-0" style={{ minWidth: "1.5rem" }}>
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 text-zinc-300 overflow-x-auto" style={{ margin: 0 }}>
            <code
              dangerouslySetInnerHTML={{ __html: highlight(AGENT_CODE) }}
              className="block"
            />
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────────────────────

function ProgressBar({ progress, done }: { progress: number; done: boolean }) {
  return (
    <div className="h-[2px] bg-white/[0.06] relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all",
          done ? "bg-emerald-400" : "bg-sky-400"
        )}
        style={{ width: `${progress}%`, transitionDuration: done ? "300ms" : "200ms" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DeployDemo export
// ─────────────────────────────────────────────────────────────────────────────

export function DeployDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const termRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  const stopAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  const runProgress = useCallback(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const runSequence = useCallback(() => {
    stopAll();
    setVisibleCount(0);
    setDone(false);
    setProgress(0);
    setPlaying(true);
    startTimeRef.current = Date.now();
    runProgress();

    SCRIPT.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleCount(i + 1);
        if (termRef.current) {
          termRef.current.scrollTop = termRef.current.scrollHeight;
        }
        if (i === SCRIPT.length - 1) {
          setDone(true);
          setPlaying(false);
          setProgress(100);
        }
      }, line.delay);
      timeoutsRef.current.push(t);
    });
  }, [stopAll, runProgress]);

  // Trigger when scrolled into view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          setTimeout(runSequence, 600);
        }
      },
      { threshold: 0.1 }
    );
    if (wrapperRef.current) obs.observe(wrapperRef.current);
    return () => { obs.disconnect(); stopAll(); };
  }, [runSequence, stopAll]);

  const replay = useCallback(() => {
    hasStarted.current = true;
    runSequence();
  }, [runSequence]);

  const dashboardVisible = visibleCount > DONE_IDX && DONE_IDX >= 0;
  const visibleLines = SCRIPT.slice(0, visibleCount);

  return (
    <div ref={wrapperRef} className="w-full">
      {/* Window */}
      <div className="rounded-2xl border border-white/[0.1] overflow-hidden bg-[#0b0b0b] shadow-[0_0_100px_rgba(0,0,0,0.9)] shadow-black">

        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0a0a0a] border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-black/50 border border-white/[0.06] rounded px-3 py-0.5">
              <span className="text-[11px] text-zinc-600 font-mono">~/projects/research-agent</span>
            </div>
          </div>
          <button
            onClick={replay}
            disabled={playing}
            className={cn(
              "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border transition-all",
              playing
                ? "text-zinc-700 border-white/[0.04] cursor-not-allowed"
                : "text-zinc-500 border-white/[0.08] hover:text-white hover:border-white/20"
            )}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
            </svg>
            {playing ? "Running…" : "Replay"}
          </button>
        </div>

        {/* Progress bar */}
        <ProgressBar progress={progress} done={done} />

        {/* Body */}
        <div className="flex flex-col lg:flex-row" style={{ minHeight: 520 }}>

          {/* Editor pane — left */}
          <EditorPane />

          {/* Terminal pane — middle/right */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Terminal tab */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-[#0a0a0a]">
              <div className="flex items-center gap-1.5 bg-[#131313] border border-white/[0.08] rounded-sm px-2.5 py-1">
                <span className="text-[9px] text-zinc-500 font-mono">zsh</span>
              </div>
            </div>

            {/* Terminal body + dashboard side by side */}
            <div className="flex flex-1 min-h-0">
              {/* Terminal scroll area */}
              <div
                ref={termRef}
                className="flex-1 p-4 overflow-y-auto bg-[#0b0b0b] scroll-dark"
                style={{ maxHeight: 480 }}
              >
                {visibleLines.map((line, i) => (
                  <TLine key={i} line={line} />
                ))}
                {playing && <BlinkCursor />}
              </div>

              {/* Dashboard slides in */}
              <LiveDashboard visible={dashboardVisible} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Three-step explainer
// ─────────────────────────────────────────────────────────────────────────────

export function ThreeSteps() {
  const steps = [
    {
      num: "01",
      cmd: "pip install cognos",
      title: "Install",
      body: "One package. CLI, SDK, and runtime client — everything included.",
      accent: "border-zinc-700/50 text-zinc-300",
    },
    {
      num: "02",
      cmd: "cognos login",
      title: "Authenticate",
      body: "Browser OAuth flow. Token stored locally. Done in under 10 seconds.",
      accent: "border-sky-500/30 text-sky-400",
    },
    {
      num: "03",
      cmd: "cognos deploy",
      title: "Ship",
      body: "Packages your agent, provisions cloud infra, and returns a live URL and dashboard.",
      accent: "border-emerald-500/30 text-emerald-400",
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-3 mt-10">
      {steps.map((s, i) => (
        <div key={s.num} className="relative">
          {i < steps.length - 1 && (
            <div
              className="hidden sm:block absolute top-7 left-[calc(100%-0px)] w-[calc(100%-24px)] h-px z-10"
              style={{ borderTop: "1px dashed rgba(255,255,255,0.07)", left: "100%" }}
            />
          )}
          <div className={cn("border rounded-xl p-5 bg-white/[0.02] h-full", s.accent.split(" ")[0])}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-zinc-700 font-mono tabular-nums">{s.num}</span>
            </div>
            <p className={cn("font-mono text-sm font-bold mb-2", s.accent.split(" ")[1])}>{s.cmd}</p>
            <p className="text-white font-semibold text-[14px] mb-1">{s.title}</p>
            <p className="text-zinc-500 text-sm leading-relaxed">{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// What every deployed agent gets
// ─────────────────────────────────────────────────────────────────────────────

export function WhatYouGet() {
  const items = [
    { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Runs 24/7", sub: "Auto-restart on crash" },
    { color: "text-sky-400",     bg: "bg-sky-400/10 border-sky-400/20",         label: "Persistent memory", sub: "Vector store, zero config" },
    { color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/20",   label: "Live API endpoint", sub: "POST /agents/{id}/run" },
    { color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",     label: "Cron scheduling", sub: "Any cron expression" },
    { color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/20",       label: "Full observability", sub: "Every decision traced" },
    { color: "text-zinc-300",    bg: "bg-zinc-400/10 border-zinc-400/20",       label: "Dashboard", sub: "Logs, costs, metrics" },
    { color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/20",   label: "Webhooks", sub: "Trigger on any event" },
    { color: "text-teal-400",    bg: "bg-teal-400/10 border-teal-400/20",       label: "Any LLM", sub: "OpenAI, Anthropic, local" },
  ];

  return (
    <div className="mt-12 rounded-2xl border border-white/[0.07] p-7 bg-white/[0.01]">
      <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-medium mb-6">
        Every deployed agent automatically gets
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "border rounded-xl p-4 transition-all hover:scale-[1.02]",
              item.bg
            )}
          >
            <p className={cn("font-semibold text-[13px] mb-0.5", item.color)}>{item.label}</p>
            <p className="text-zinc-500 text-[11px]">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
