import { useState, useEffect, useRef, useCallback } from "react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type AgentStatus = "deploying" | "running" | "stopped" | "restarting";
type RunState    = "idle" | "running" | "done";
type StepState   = "waiting" | "active" | "done";
type StepKind    = "request" | "memory-read" | "tool" | "llm" | "memory-write" | "complete";
type LogKind     = "info" | "tool" | "success" | "warn" | "system";

interface Log { id: number; ts: string; msg: string; kind: LogKind; }

interface Step {
  id:         string;
  kind:       StepKind;
  label:      string;
  sublabel:   string;      // e.g. "14 items · 42ms"
  state:      StepState;
  durationMs: number | null;
}

// ─── Timing helpers ────────────────────────────────────────────────────────────

const nowTs = () =>
  new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });

const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

let _uid = 0;
const uid = () => ++_uid;

// ─── Execution script ──────────────────────────────────────────────────────────
// All timings are realistic but compressed for a demo.
// Each spec says when a step goes "active" and when it goes "done",
// both measured in ms from run start.

interface Spec {
  activeAt: number;   // ms from run start → step turns active
  doneAt:   number;   // ms from run start → step turns done, log fires
  step:     Omit<Step, "state" | "durationMs">;
  logMsg:   string;
  logKind:  LogKind;
}

function makeScript(prompt: string): Spec[] {
  const q       = prompt.slice(0, 42);
  const tokens  = Math.floor(prompt.length * 4.2 + 800 + Math.random() * 160);
  const results = Math.floor(8 + Math.random() * 7);
  const webMs   = Math.floor(300 + Math.random() * 200);
  const ghMs    = Math.floor(160 + Math.random() * 100);
  const llmMs   = Math.floor(700 + Math.random() * 300);
  const mrMs    = Math.floor(40  + Math.random() * 25);
  const mwMs    = Math.floor(30  + Math.random() * 20);
  const total   = Math.round(mrMs + webMs + ghMs + llmMs + mwMs + 280);

  // Build cumulative cursor
  let t = 0;
  function seg(gap: number, dur: number): [number, number] {
    t += gap; const a = t; t += dur; return [a, t];
  }

  const [ra, rd] = seg(0,   30);
  const [ma, md] = seg(60,  mrMs);
  const [wa, wd] = seg(50,  webMs);
  const [ga, gd] = seg(40,  ghMs);
  const [la, ld] = seg(40,  llmMs);
  const [sa, sd] = seg(40,  mwMs);
  const [da, dd] = seg(30,  40);

  return [
    {
      activeAt: ra, doneAt: rd,
      logMsg:  `Received POST /run`,
      logKind: "info",
      step: { id:"request",   kind:"request",      label:"Request received",
              sublabel: `"${q.slice(0,38)}${prompt.length>38?"…":""}"` },
    },
    {
      activeAt: ma, doneAt: md,
      logMsg:  `Memory: loaded 14 items from context store (${mrMs}ms)`,
      logKind: "info",
      step: { id:"mem-r",    kind:"memory-read",  label:"Memory loaded",
              sublabel: `14 items · ${mrMs}ms` },
    },
    {
      activeAt: wa, doneAt: wd,
      logMsg:  `→ web.search("${q.slice(0,36)}")`,
      logKind: "tool",
      step: { id:"web",      kind:"tool",         label:"Tool — Web Search",
              sublabel: `${results} results · ${webMs}ms` },
    },
    {
      activeAt: ga, doneAt: gd,
      logMsg:  `← web: ${results} results returned · → github.search_repos`,
      logKind: "success",
      step: { id:"gh",       kind:"tool",         label:"Tool — GitHub",
              sublabel: `12 repos · ${ghMs}ms` },
    },
    {
      activeAt: la, doneAt: ld,
      logMsg:  `→ OpenAI gpt-4o (${tokens} tokens)`,
      logKind: "tool",
      step: { id:"llm",      kind:"llm",          label:"LLM — gpt-4o",
              sublabel: `${tokens} tokens · ${llmMs}ms` },
    },
    {
      activeAt: sa, doneAt: sd,
      logMsg:  `← gpt-4o: response generated · Memory: writing 4 items`,
      logKind: "success",
      step: { id:"mem-w",    kind:"memory-write", label:"Memory saved",
              sublabel: `4 items written · ${mwMs}ms` },
    },
    {
      activeAt: da, doneAt: dd,
      logMsg:  `Run complete · ${(total/1000).toFixed(2)}s · ${tokens} tokens · $${(tokens*0.000003).toFixed(4)}`,
      logKind: "success",
      step: { id:"done",     kind:"complete",     label:"Completed",
              sublabel: `${(total/1000).toFixed(2)}s · $${(tokens*0.000003).toFixed(4)}` },
    },
  ];
}

function makeResponse(prompt: string, specs: Spec[]) {
  const llmSpec  = specs.find(s => s.step.kind === "llm")!;
  const webSpec  = specs.find(s => s.step.id  === "web")!;
  const last     = specs[specs.length - 1];
  const tokens   = parseInt(llmSpec.step.sublabel.match(/(\d+) tokens/)?.[1]  ?? "1000");
  const sources  = parseInt(webSpec.step.sublabel.match(/(\d+) results/)?.[1] ?? "10");
  const lower    = prompt.toLowerCase();

  const summary =
    lower.includes("github")
      ? "microsoft/phi-4 trending at 14k ★ this week. llama.cpp ships Metal backend. huggingface/transformers hits v4.47 with MoE support."
      : lower.includes("crypto") || lower.includes("solana") || lower.includes("eth")
      ? "Solana TVL up 12% to $8.2B. ETH gas fees at 6-month lows. Base chain: 4.2M tx/day — new record. Uniswap V4 hooks accelerating."
      : "OpenAI o3-mini: 3× reasoning improvement. Claude 3.5 Sonnet leads coding benchmarks. Gemini 2.0 Flash GA with 1M context window. Llama 3.3 70B matches GPT-4 at 10× lower cost.";

  return {
    run_id:     `run_${Date.now().toString(36)}`,
    status:     "completed",
    summary,
    sources,
    tokens,
    latency_ms: last.doneAt,
    cost_usd:   parseFloat((tokens * 0.000003).toFixed(4)),
  };
}

// ─── Deploy terminal ───────────────────────────────────────────────────────────

const DEPLOY_SCRIPT = [
  { text: "",                                                                       gap: 0,   k: "blank"   },
  { text: "  Deploying  research-agent",                                            gap: 180, k: "label"   },
  { text: "",                                                                       gap: 60,  k: "blank"   },
  { text: "  ✓  Packaging agent...",                                                gap: 380, k: "ok"      },
  { text: "  ✓  Uploading to Cognos Cloud...",                                      gap: 600, k: "ok"      },
  { text: "  ✓  Provisioning runtime...",                                           gap: 760, k: "ok"      },
  { text: "  ✓  Allocating memory store...",                                        gap: 540, k: "ok"      },
  { text: "  ✓  Registering tools: web, slack, github...",                          gap: 460, k: "ok"      },
  { text: "  ✓  Starting container...",                                             gap: 840, k: "ok"      },
  { text: "  ✓  Health check passed...",                                            gap: 500, k: "ok"      },
  { text: "",                                                                       gap: 180, k: "blank"   },
  { text: "  ● Agent deployed successfully",                                        gap: 340, k: "success" },
  { text: "",                                                                       gap: 140, k: "blank"   },
  { text: "  Dashboard  https://www.cognoscloud.xyz/agents/research-agent",             gap: 220, k: "url"     },
  { text: "  API        POST https://api.cognos.ai/v1/agents/research-agent/run",   gap: 70,  k: "url"     },
  { text: "  Status     Running",                                                   gap: 55,  k: "running" },
  { text: "",                                                                       gap: 70,  k: "blank"   },
] as const;

function DeployScene({ onDone }: { onDone: () => void }) {
  const [n,    setN]    = useState(0);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cum = 0;
    DEPLOY_SCRIPT.forEach((line, i) => {
      cum += line.gap;
      setTimeout(() => {
        setN(i + 1);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        if (i === DEPLOY_SCRIPT.length - 1) setTimeout(() => setDone(true), 700);
      }, cum);
    });
  }, []);

  return (
    <div className="h-screen bg-[#080808] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center gap-2.5 mb-4">
          <CognosLogo />
          <span className="text-white font-semibold text-sm">Cognos Cloud</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-500 text-sm">deploying research-agent</span>
        </div>

        {/* Terminal window */}
        <div className="rounded-xl border border-white/[0.09] overflow-hidden bg-[#0b0b0b] shadow-[0_0_80px_rgba(0,0,0,0.7)]">
          {/* chrome bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#090909]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-[11px] text-zinc-600">~/projects/research-agent</span>
          </div>

          <div ref={scrollRef} className="px-5 py-5 font-mono overflow-y-auto"
            style={{ minHeight: 260, maxHeight: 400 }}>
            {/* the command */}
            <div className="flex gap-2 text-[13px] mb-1 leading-6">
              <span className="text-emerald-400 select-none">❯</span>
              <span className="text-white font-medium">cognos deploy</span>
            </div>

            {DEPLOY_SCRIPT.slice(0, n).map((line, i) => {
              if (line.k === "blank")   return <div key={i} className="h-2" />;
              if (line.k === "label")   return <div key={i} className="text-[13px] text-zinc-300 font-semibold leading-6">{line.text}</div>;
              if (line.k === "ok")      return <div key={i} className="text-[13px] text-zinc-300 leading-6 animate-fadeIn">{line.text}</div>;
              if (line.k === "success") return <div key={i} className="text-[13px] text-emerald-400 font-semibold leading-6 animate-fadeIn mt-1">{line.text}</div>;
              if (line.k === "running") return <div key={i} className="text-[13px] text-emerald-400 leading-6 animate-fadeIn">{line.text}</div>;
              if (line.k === "url") {
                const parts = line.text.split(/(https?:\/\/\S+)/);
                return (
                  <div key={i} className="text-[13px] leading-6 animate-fadeIn">
                    {parts.map((p, j) =>
                      /^https?:\/\//.test(p)
                        ? <span key={j} className="text-sky-400">{p}</span>
                        : <span key={j} className="text-zinc-500">{p}</span>
                    )}
                  </div>
                );
              }
              return null;
            })}

            {/* blinking cursor while running */}
            {!done && n > 0 && (
              <span className="inline-block w-[7px] h-[13px] bg-zinc-500 align-middle mt-1"
                style={{ animation:"blink 1s step-end infinite" }} />
            )}
          </div>
        </div>

        {/* CTA fades in after completion */}
        {done && (
          <div className="mt-6 flex justify-center animate-fadeIn">
            <button onClick={onDone}
              className="bg-white text-black font-bold px-9 py-3 rounded-xl text-[15px] hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg flex items-center gap-2">
              Open Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step node in timeline ─────────────────────────────────────────────────────

const STEP_COLORS: Record<StepKind, { ring: string; dot: string; label: string; bar: string }> = {
  "request":       { ring:"border-zinc-700 bg-zinc-900",                dot:"bg-zinc-400",    label:"text-zinc-300",    bar:"bg-zinc-500" },
  "memory-read":   { ring:"border-blue-400/30 bg-blue-500/10",           dot:"bg-blue-400",    label:"text-blue-300",    bar:"bg-blue-500" },
  "tool":          { ring:"border-violet-400/30 bg-violet-500/10",       dot:"bg-violet-400",  label:"text-violet-300",  bar:"bg-violet-500" },
  "llm":           { ring:"border-amber-400/30 bg-amber-500/10",         dot:"bg-amber-400",   label:"text-amber-300",   bar:"bg-amber-500" },
  "memory-write":  { ring:"border-blue-400/30 bg-blue-500/10",           dot:"bg-blue-400",    label:"text-blue-300",    bar:"bg-blue-500" },
  "complete":      { ring:"border-emerald-400/30 bg-emerald-500/10",     dot:"bg-emerald-400", label:"text-emerald-300", bar:"bg-emerald-500" },
};

const STEP_ICONS: Record<StepKind, React.ReactNode> = {
  "request":      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "memory-read":  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  "tool":         <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  "llm":          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  "memory-write": <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  "complete":     <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function StepNode({ step, isLast }: { step: Step; isLast: boolean }) {
  const c = STEP_COLORS[step.kind];
  const isDone   = step.state === "done";
  const isActive = step.state === "active";
  const isWaiting = step.state === "waiting";
  const pct = isDone && step.durationMs ? Math.min((step.durationMs / 600) * 100, 100) : 0;

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Node circle */}
        <div className={cn(
          "w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300",
          isWaiting ? "border-white/[0.07] bg-zinc-900" :
          isActive  ? "border-sky-400/40 bg-sky-500/10" :
          cn(c.ring)
        )}>
          {isWaiting && <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
          {isActive  && <span className="w-2 h-2 rounded-full bg-sky-400" style={{ animation:"blink 0.55s ease-in-out infinite" }} />}
          {isDone    && <span className={c.dot.replace("bg-", "text-")}>{STEP_ICONS[step.kind]}</span>}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div className={cn(
            "w-px flex-1 min-h-[20px] mt-1 mb-0 transition-colors duration-500",
            isDone ? "bg-white/[0.10]" : "bg-white/[0.04]"
          )} />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0 pb-4", isLast && "pb-0")}>
        {/* Label row */}
        <div className="flex items-baseline justify-between gap-2 mt-[3px]">
          <span className={cn(
            "text-[13px] font-semibold leading-5 transition-colors duration-200",
            isWaiting ? "text-zinc-700" :
            isActive  ? "text-white" :
            c.label
          )}>
            {step.label}
            {isActive && (
              <span className="ml-2 text-sky-400 font-normal text-[11px] tracking-wide">running…</span>
            )}
          </span>
          {isDone && step.durationMs !== null && (
            <span className="text-[10px] text-zinc-600 font-mono tabular-nums flex-shrink-0">
              {step.durationMs}ms
            </span>
          )}
        </div>

        {/* Sublabel */}
        {(isDone || isActive) && (
          <p className={cn(
            "text-[11px] font-mono leading-[16px] mt-0.5 truncate",
            isActive ? "text-zinc-600" : "text-zinc-500"
          )}>
            {step.sublabel}
          </p>
        )}

        {/* Duration bar */}
        {isDone && step.durationMs !== null && (
          <div className="mt-2 w-24 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", c.bar)}
              style={{ width:`${pct}%`, opacity:0.8 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Log row ───────────────────────────────────────────────────────────────────

const LOG_COLOR: Record<LogKind, string> = {
  info:    "text-zinc-400",
  tool:    "text-violet-400",
  success: "text-emerald-400",
  warn:    "text-amber-400",
  system:  "text-zinc-600",
};
const LOG_DOT: Record<LogKind, string> = {
  info:"bg-zinc-600", tool:"bg-violet-500", success:"bg-emerald-500", warn:"bg-amber-500", system:"bg-zinc-800",
};

function LogRow({ log, fresh }: { log: Log; fresh: boolean }) {
  return (
    <div className={cn(
      "flex items-start gap-2.5 px-4 py-[5px] border-b border-white/[0.025] last:border-0 transition-colors duration-200",
      fresh && "bg-white/[0.04]"
    )}>
      <span className="text-[10px] text-zinc-700 font-mono tabular-nums w-[54px] flex-shrink-0 pt-[2px] select-none">
        {log.ts}
      </span>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[4px]", LOG_DOT[log.kind])} />
      <span className={cn("font-mono text-[12px] leading-5", LOG_COLOR[log.kind])}>
        {log.msg}
      </span>
    </div>
  );
}

// ─── Response panel ────────────────────────────────────────────────────────────

function RespPanel({ data }: { data: Record<string, unknown> }) {
  const [raw, setRaw] = useState(false);

  if (raw) return (
    <div className="p-4">
      <button onClick={() => setRaw(false)}
        className="text-[10px] text-zinc-600 hover:text-zinc-400 mb-2.5 block transition-colors">
        ← structured
      </button>
      <pre className="font-mono text-[12px] text-emerald-400 leading-[18px] whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  return (
    <div className="p-4 space-y-3">
      {typeof data.summary === "string" && (
        <p className="text-zinc-200 text-[13px] leading-6">{data.summary}</p>
      )}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { l:"sources",  v:String(data.sources),    c:"text-white" },
          { l:"tokens",   v:String(data.tokens),      c:"text-white" },
          { l:"latency",  v:`${data.latency_ms}ms`,   c:"text-violet-400" },
          { l:"cost",     v:`$${data.cost_usd}`,      c:"text-amber-400" },
          { l:"status",   v:String(data.status),      c:"text-emerald-400" },
          { l:"run_id",   v:String(data.run_id).slice(0,10)+"…", c:"text-zinc-600" },
        ].map(item => (
          <div key={item.l} className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-2.5 py-2">
            <p className="text-[9px] text-zinc-700 uppercase tracking-wider mb-0.5">{item.l}</p>
            <p className={cn("font-mono text-[11px] font-semibold tabular-nums", item.c)}>{item.v}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setRaw(true)}
        className="text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">
        raw JSON →
      </button>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({ onBack }: { onBack: () => void }) {
  // scene
  const [scene,   setScene]   = useState<"deploy" | "live">("deploy");

  // agent lifecycle
  const [status,  setStatus]  = useState<AgentStatus>("deploying");
  const [uptime,  setUptime]  = useState(0);
  const [reqs,    setReqs]    = useState(0);
  const [copied,  setCopied]  = useState(false);

  // run
  const [runState,  setRunState]  = useState<RunState>("idle");
  const [steps,     setSteps]     = useState<Step[]>([]);
  const [elapsed,   setElapsed]   = useState(0);
  const [response,  setResponse]  = useState<Record<string,unknown> | null>(null);
  const [body,      setBody]      = useState(`{\n  "input": "Summarize today's AI news"\n}`);
  const [mobileTab, setMobileTab] = useState<"api"|"timeline"|"logs">("api");

  // logs
  const [logs,    setLogs]    = useState<Log[]>([]);
  const [freshId, setFreshId] = useState<number | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const abortRef   = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const uptimeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = status === "running";

  // ── uptime clock ────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "running") {
      uptimeRef.current = setInterval(() => setUptime(u => u + 1), 1000);
    } else {
      if (uptimeRef.current) clearInterval(uptimeRef.current);
      if (status === "stopped") setUptime(0);
    }
    return () => { if (uptimeRef.current) clearInterval(uptimeRef.current); };
  }, [status]);

  // ── auto-scroll logs ────────────────────────────────────────────────
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ── append log ──────────────────────────────────────────────────────
  const addLog = useCallback((msg: string, kind: LogKind) => {
    const id = uid();
    setLogs(prev => [...prev.slice(-399), { id, ts: nowTs(), msg, kind }]);
    setFreshId(id);
    setTimeout(() => setFreshId(f => f === id ? null : f), 550);
  }, []);

  // ── deploy done → live dashboard ────────────────────────────────────
  const onDeployDone = useCallback(() => {
    setScene("live");
    setStatus("running");
    setReqs(0);
    setUptime(0);
    setTimeout(() => addLog("Agent started successfully", "system"),  80);
    setTimeout(() => addLog("Runtime ready · memory store attached", "info"), 340);
    setTimeout(() => addLog("Registered tools: web, slack, github",  "info"), 600);
    setTimeout(() => addLog("Listening on POST /v1/agents/research-agent/run", "info"), 860);
  }, [addLog]);

  // ── controls ────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    if (status !== "running") return;
    setStatus("stopped");
    addLog("Agent stopped by user", "system");
  }, [status, addLog]);

  const handleStart = useCallback(() => {
    if (status !== "stopped") return;
    setStatus("running");
    addLog("Agent started", "system");
    addLog("Runtime ready", "info");
  }, [status, addLog]);

  const handleRestart = useCallback(() => {
    if (status !== "running") return;
    setStatus("restarting");
    setUptime(0);
    addLog("Restarting agent…", "system");
    setTimeout(() => {
      setStatus("running");
      addLog("Agent restarted · runtime ready", "success");
    }, 1800);
  }, [status, addLog]);

  // ── API send ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!isRunning || runState === "running") return;

    // parse prompt
    let prompt = "Research query";
    try {
      const p = JSON.parse(body) as { input?: string; query?: string };
      prompt = p.input ?? p.query ?? prompt;
    } catch {
      prompt = body.slice(0, 80);
    }

    const script = makeScript(prompt);
    const resp   = makeResponse(prompt, script);

    abortRef.current = false;
    setRunState("running");
    setResponse(null);
    setElapsed(0);

    // Initialise all steps as waiting
    setSteps(script.map(s => ({ ...s.step, state: "waiting", durationMs: null })));
    addLog("────────────────────────────", "system");

    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 60);

    for (let i = 0; i < script.length; i++) {
      const spec = script[i];

      // wait until activeAt
      const waitA = spec.activeAt - (Date.now() - start);
      if (waitA > 0) await pause(waitA);
      if (abortRef.current) break;

      const stepStart = Date.now() - start;
      setSteps(prev => prev.map((s, j) => j === i ? { ...s, state: "active" } : s));

      // wait until doneAt
      const waitD = spec.doneAt - (Date.now() - start);
      if (waitD > 0) await pause(waitD);
      if (abortRef.current) break;

      const dur = Date.now() - start - stepStart;
      setSteps(prev => prev.map((s, j) => j === i ? { ...s, state: "done", durationMs: dur } : s));
      addLog(spec.logMsg, spec.logKind);
    }

    if (timerRef.current) clearInterval(timerRef.current);

    if (!abortRef.current) {
      setRunState("done");
      setResponse(resp);
      setReqs(r => r + 1);
    }
  }, [isRunning, runState, body, addLog]);

  // cleanup on unmount
  useEffect(() => () => {
    abortRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── format uptime ────────────────────────────────────────────────────
  const fmtUp = (s: number) => {
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m ${s%60}s`;
    return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
  };

  // ── status palette ───────────────────────────────────────────────────
  const SC = {
    deploying:  { label:"Deploying",  dot:"bg-amber-400",   blink:true,  text:"text-amber-400",   badge:"text-amber-400 border-amber-400/20 bg-amber-400/[0.06]",    ring:"border-amber-500/20 bg-amber-500/[0.04]"  },
    running:    { label:"Running",    dot:"bg-emerald-400", blink:true,  text:"text-emerald-400", badge:"text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.06]",ring:"border-emerald-500/20 bg-emerald-500/[0.04]"},
    stopped:    { label:"Stopped",    dot:"bg-zinc-600",    blink:false, text:"text-zinc-500",    badge:"text-zinc-500 border-zinc-700 bg-white/[0.02]",               ring:"border-white/[0.07] bg-white/[0.01]"      },
    restarting: { label:"Restarting", dot:"bg-amber-400",   blink:true,  text:"text-amber-400",   badge:"text-amber-400 border-amber-400/20 bg-amber-400/[0.06]",    ring:"border-amber-500/20 bg-amber-500/[0.04]"  },
  }[status];

  // ── deploy scene ─────────────────────────────────────────────────────
  if (scene === "deploy") return <DeployScene onDone={onDeployDone} />;

  // ── live dashboard ───────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#080808] text-white flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="h-[52px] flex items-center justify-between px-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="text-zinc-600 hover:text-white transition-colors flex-shrink-0 p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <CognosLogo />
          <span className="text-white font-semibold text-[13px]">Cognos Cloud</span>
          <span className="text-white/10 hidden sm:inline mx-1">/</span>
          <span className="text-zinc-500 text-[13px] hidden sm:inline">research-agent</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={cn("flex items-center gap-1.5 text-[12px] border rounded-full px-2.5 py-1 font-medium", SC.badge)}>
            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", SC.dot)}
              style={SC.blink ? { animation:"blink 1.4s ease-in-out infinite" } : {}} />
            <span className="hidden sm:inline">{SC.label}</span>
          </div>
          {status === "stopped" ? (
            <button onClick={handleStart}
              className="text-[12px] font-medium text-emerald-400 border border-emerald-400/25 hover:bg-emerald-400/10 rounded-lg px-2.5 py-1.5 transition-all">
              Start
            </button>
          ) : (
            <button onClick={handleStop} disabled={status !== "running"}
              className="text-[12px] font-medium text-zinc-400 hover:text-red-400 border border-white/[0.08] hover:border-red-400/30 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
              Stop
            </button>
          )}
          <button onClick={handleRestart} disabled={status !== "running"}
            className="text-[12px] font-medium text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-20 disabled:cursor-not-allowed hidden sm:block">
            Restart
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex w-[188px] flex-shrink-0 border-r border-white/[0.06] flex-col overflow-y-auto">
          <div className="flex-1 px-4 py-5 space-y-5">

            {/* Status card */}
            <div className={cn("rounded-xl border p-4 transition-all duration-500", SC.ring)}>
              <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-2">Status</p>
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", SC.dot)}
                  style={SC.blink ? { animation:"blink 1.4s ease-in-out infinite" } : {}} />
                <span className={cn("font-bold text-[14px]", SC.text)}>{SC.label}</span>
              </div>
              {status === "running" && (
                <p className="text-[11px] text-zinc-700 mt-1.5 font-mono tabular-nums">{fmtUp(uptime)}</p>
              )}
            </div>

            {/* Requests */}
            <div className="rounded-xl border border-white/[0.06] px-4 py-3">
              <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Requests</p>
              <p className="font-mono font-bold text-[22px] text-white tabular-nums leading-none">{reqs.toLocaleString()}</p>
              {runState === "running" && (
                <p className="text-[11px] text-sky-400 mt-1 font-mono leading-none"
                  style={{ animation:"blink 0.9s ease-in-out infinite" }}>● in flight</p>
              )}
            </div>

            {/* Config */}
            <div className="space-y-2.5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-700">Agent</p>
              <Kv k="Name"     v="research-agent" mono />
              <Kv k="Model"    v="gpt-4o" />
              <Kv k="Tools"    v="web, slack, github" />
              <Kv k="Schedule" v="0 9 * * *" mono />
              <Kv k="Memory"   v="Enabled" hl="text-blue-400" />
            </div>

            {/* Endpoint */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-2">Endpoint</p>
              <div className="rounded-lg bg-black/50 border border-white/[0.06] p-3 space-y-2">
                <p className="text-sky-400 font-mono text-[10px] break-all leading-[15px]">
                  POST api.cognos.ai<br/>/v1/agents/<br/>research-agent/run
                </p>
                <button onClick={() => {
                  navigator.clipboard.writeText("https://api.cognos.ai/v1/agents/research-agent/run");
                  setCopied(true); setTimeout(() => setCopied(false), 1500);
                }} className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors">
                  {copied
                    ? <><ChkSvg /> Copied</>
                    : <><CpySvg /> Copy URL</>}
                </button>
              </div>
            </div>

          </div>

          {/* Redeploy at bottom */}
          <div className="px-4 py-3 border-t border-white/[0.05]">
            <button
              onClick={() => {
                abortRef.current = true;
                setScene("deploy"); setStatus("deploying");
                setLogs([]); setSteps([]); setRunState("idle"); setResponse(null); setReqs(0); setUptime(0);
                setTimeout(() => { abortRef.current = false; }, 100);
              }}
              className="flex items-center gap-1.5 text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors w-full">
              <ReplaySvg />
              Run deploy again
            </button>
          </div>
        </aside>

        {/* Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Mobile: status strip */}
          <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-[#090909] flex-shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] text-zinc-700 uppercase tracking-wider">Requests</p>
                <p className="font-mono font-bold text-[15px] text-white tabular-nums leading-none">{reqs}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-700 uppercase tracking-wider">Uptime</p>
                <p className="font-mono text-[13px] text-zinc-400 leading-none">{status === "running" ? fmtUp(uptime) : "—"}</p>
              </div>
            </div>
            <button onClick={() => {
              abortRef.current = true;
              setScene("deploy"); setStatus("deploying");
              setLogs([]); setSteps([]); setRunState("idle"); setResponse(null); setReqs(0); setUptime(0);
              setTimeout(() => { abortRef.current = false; }, 100);
            }} className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">
              <ReplaySvg /><span>Redeploy</span>
            </button>
          </div>

          {/* Mobile: tab bar */}
          <div className="lg:hidden flex border-b border-white/[0.06] flex-shrink-0">
            {(["api","timeline","logs"] as const).map(tab => (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className={cn(
                  "flex-1 py-2.5 text-[12px] font-medium transition-colors relative",
                  mobileTab === tab ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                )}>
                {tab === "api" ? "API" : tab === "timeline" ? "Timeline" : "Logs"}
                {mobileTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t" />
                )}
                {tab === "logs" && runState === "running" && (
                  <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle"
                    style={{ animation:"blink 1s ease-in-out infinite" }} />
                )}
              </button>
            ))}
          </div>

          {/* Columns */}
          <div className="flex-1 flex overflow-hidden">

          {/* ── Col 1: API ── */}
          <div className={cn(
            "flex flex-col overflow-hidden",
            "lg:border-r lg:border-white/[0.06] lg:flex lg:w-[36%]",
            mobileTab === "api" ? "flex w-full" : "hidden lg:flex"
          )}>

            {/* col header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-white">API</span>
                <span className="text-zinc-700">·</span>
                <span className="font-mono text-sky-400 text-[11px]">POST /run</span>
              </div>
              <div className="flex items-center gap-2.5">
                {runState === "running" && (
                  <span className="font-mono text-[11px] text-sky-400 tabular-nums">{(elapsed/1000).toFixed(1)}s</span>
                )}
                {runState === "done" && response && (
                  <span className="text-[11px] text-emerald-400 font-bold font-mono">200 OK</span>
                )}
                <button onClick={handleSend}
                  disabled={!isRunning || runState === "running"}
                  className={cn(
                    "font-bold text-[12px] px-4 py-1.5 rounded-lg transition-all",
                    !isRunning || runState === "running"
                      ? "text-zinc-600 bg-white/[0.04] cursor-not-allowed"
                      : "text-black bg-white hover:bg-zinc-100 active:scale-95 shadow-sm"
                  )}>
                  {runState === "running" ? "Running…" : "Send →"}
                </button>
              </div>
            </div>

            {/* agent-stopped notice */}
            {!isRunning && (
              <div className="px-5 py-2 bg-amber-500/[0.04] border-b border-amber-500/[0.07] flex-shrink-0">
                <p className="text-[12px] text-amber-500/70">
                  Agent {status} —{" "}
                  {status === "stopped" ? "click Start above" : "please wait…"}
                </p>
              </div>
            )}

            {/* request body */}
            <div className="flex flex-col flex-shrink-0">
              <div className="px-5 py-2 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-zinc-700">Request body</span>
                <button onClick={() => setBody(`{\n  "input": "Summarize today's AI news"\n}`)}
                  className="text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">reset</button>
              </div>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                disabled={runState === "running"} spellCheck={false} rows={5}
                className="px-5 py-3 bg-transparent font-mono text-[13px] text-zinc-300 leading-6 resize-none focus:outline-none disabled:opacity-40 w-full" />
            </div>

            {/* response label */}
            <div className="px-5 py-2 border-t border-b border-white/[0.04] flex-shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-zinc-700">Response</span>
            </div>

            {/* response body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {runState === "idle" && (
                <p className="px-5 py-4 text-zinc-700 font-mono text-[12px]">
                  # Press Send → to invoke the agent
                </p>
              )}
              {runState === "running" && (
                <div className="px-5 py-4 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 mt-[3px]"
                    style={{ animation:"blink 0.7s ease-in-out infinite" }} />
                  <div>
                    <p className="text-sky-400 font-mono text-[13px]">Executing…</p>
                    <p className="text-zinc-600 font-mono text-[11px] mt-0.5">Watch timeline →</p>
                  </div>
                </div>
              )}
              {runState === "done" && response && <RespPanel data={response} />}
            </div>
          </div>

          {/* ── Col 2: Timeline — desktop + mobile tab ── */}
          <div className={cn(
            "flex flex-col overflow-hidden",
            "lg:border-r lg:border-white/[0.06] lg:w-[30%]",
            mobileTab === "timeline" ? "flex flex-1" : "hidden lg:flex"
          )}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                {runState === "idle"    && <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
                {runState === "running" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" style={{ animation:"blink 0.6s ease-in-out infinite" }} />}
                {runState === "done"    && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                <span className="text-[12px] font-semibold text-white">Execution</span>
                {runState === "running" && (
                  <span className="text-[11px] text-zinc-600 font-mono">{steps.filter(s => s.state === "done").length}/{steps.length}</span>
                )}
              </div>
              {runState === "running" && <span className="font-mono text-[12px] text-sky-400 tabular-nums">{(elapsed/1000).toFixed(1)}s</span>}
              {runState === "done" && response && <span className="font-mono text-[12px] text-emerald-400 tabular-nums">{response.latency_ms as number}ms</span>}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {steps.length === 0 ? (
                <div>
                  {["Request received","Memory loaded","Tool — Web Search","Tool — GitHub","LLM — gpt-4o","Memory saved","Completed"].map((label, i, arr) => (
                    <div key={label} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-7 h-7 rounded-full border border-white/[0.06] bg-zinc-900 flex items-center justify-center opacity-25">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        </div>
                        {i < arr.length-1 && <div className="w-px flex-1 min-h-[20px] mt-1 bg-white/[0.03] opacity-25" />}
                      </div>
                      <div className={cn("flex-1 pb-4", i === arr.length-1 && "pb-0")}>
                        <p className="text-[13px] text-zinc-700 font-semibold mt-[3px] opacity-40">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : steps.map((step, i) => (
                <StepNode key={step.id} step={step} isLast={i === steps.length-1} />
              ))}
            </div>
          </div>

          {/* ── Col 3: Logs — desktop + mobile tab ── */}
          <div className={cn(
            "flex flex-col overflow-hidden",
            "lg:flex lg:flex-1 lg:min-w-0",
            mobileTab === "logs" ? "flex flex-1" : "hidden lg:flex"
          )}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ animation:"blink 1.4s ease-in-out infinite" }} />}
                <span className="text-[12px] font-semibold text-white">Live Logs</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-700 font-mono">{logs.length} lines</span>
                <button onClick={() => setLogs([])} className="text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">clear</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#090909]">
              {logs.length === 0 && <p className="px-4 py-3 text-zinc-700 font-mono text-[12px]">Waiting for activity…</p>}
              {logs.map(l => <LogRow key={l.id} log={l} fresh={l.id === freshId} />)}
              <div ref={logsEndRef} />
              <div className="px-4 py-2 flex items-center gap-2.5">
                <span className="text-[10px] text-zinc-800 font-mono tabular-nums w-[54px] select-none">{nowTs()}</span>
                <span className={cn("inline-block w-[6px] h-[11px] bg-zinc-700", !isRunning && "opacity-0")}
                  style={isRunning ? { animation:"blink 1s step-end infinite" } : {}} />
              </div>
            </div>
          </div>

          </div>{/* end columns flex */}
        </div>{/* end workspace */}
      </div>{/* end body */}
    </div>
  );
}

// ─── Tiny components ────────────────────────────────────────────────────────────

function Kv({ k, v, mono, hl }: { k:string; v:string; mono?:boolean; hl?:string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-0.5">{k}</p>
      <p className={cn("text-[12px] leading-snug text-zinc-400", mono && "font-mono text-zinc-300", hl)}>{v}</p>
    </div>
  );
}

function CognosLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="white"/>
      <circle cx="16" cy="16" r="3.5" fill="black"/>
      <circle cx="16" cy="7"  r="2"   fill="black"/>
      <circle cx="16" cy="25" r="2"   fill="black"/>
      <circle cx="7"  cy="16" r="2"   fill="black"/>
      <circle cx="25" cy="16" r="2"   fill="black"/>
      <line x1="16" y1="9"    x2="16" y2="12.5" stroke="black" strokeWidth="1.5"/>
      <line x1="16" y1="19.5" x2="16" y2="23"   stroke="black" strokeWidth="1.5"/>
      <line x1="9"  y1="16"   x2="12.5" y2="16" stroke="black" strokeWidth="1.5"/>
      <line x1="19.5" y1="16" x2="23"   y2="16" stroke="black" strokeWidth="1.5"/>
    </svg>
  );
}

function CpySvg() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
}
function ChkSvg() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ReplaySvg() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>;
}
