import { useState, useEffect, useRef, useCallback } from "react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Timing map (all in ms from 0) ───────────────────────────────────────────
// Total: 60 seconds exactly

const T = {
  // Scene 1 — Install (0–6s)
  S1_START:          0,
  S1_CMD:            400,
  S1_DONE:           5200,

  // Scene 2 — Write agent (6–16s)
  S2_START:          6200,
  S2_TYPING_START:   7000,
  S2_DONE:           15500,

  // Scene 3 — cognos deploy (16–38s)
  S3_START:          16000,
  S3_CMD:            16800,
  S3_LINES_START:    17800,
  S3_DONE:           35500,

  // Scene 4 — Dashboard (35.5–52s)
  S4_START:          36000,
  S4_STATUS:         37000,
  S4_ENDPOINT:       38800,
  S4_SEND:           40500,  // POST request fires
  S4_STEP_0:         41200,  // Request received
  S4_STEP_1:         41800,  // Memory loaded
  S4_STEP_2:         42600,  // Web search
  S4_STEP_3:         43500,  // GitHub
  S4_STEP_4:         44600,  // LLM
  S4_STEP_5:         45700,  // Memory saved
  S4_STEP_6:         46500,  // Completed
  S4_RESPONSE:       47000,
  S4_LOGS_FILL:      47200,
  S4_DONE:           52000,

  // Scene 5 — Outro (52–60s)
  S5_START:          52500,
  TOTAL:             60000,
};

// ─── Agent code (typed character by character in Scene 2) ────────────────────

const AGENT_CODE = `from cognos import Agent

agent = Agent(
    name="research-agent",
    model="gpt-4o",
    memory=True,
    tools=["web", "slack"],
    cron="0 9 * * *",
)

agent.deploy()`;

// ─── Deploy output lines ──────────────────────────────────────────────────────

const DEPLOY_LINES: Array<{ text: string; gap: number; kind: "blank"|"label"|"ok"|"success"|"url"|"status" }> = [
  { text: "",                                                                      gap: 0,   kind: "blank"   },
  { text: "  Deploying  research-agent",                                           gap: 260, kind: "label"   },
  { text: "",                                                                      gap: 80,  kind: "blank"   },
  { text: "  ✓  Packaging agent...",                                               gap: 480, kind: "ok"      },
  { text: "  ✓  Uploading to Cognos Cloud...",                                     gap: 620, kind: "ok"      },
  { text: "  ✓  Provisioning runtime...",                                          gap: 740, kind: "ok"      },
  { text: "  ✓  Allocating memory store...",                                       gap: 560, kind: "ok"      },
  { text: "  ✓  Registering tools: web, slack...",                                 gap: 480, kind: "ok"      },
  { text: "  ✓  Starting container...",                                            gap: 820, kind: "ok"      },
  { text: "  ✓  Health check passed...",                                           gap: 500, kind: "ok"      },
  { text: "",                                                                      gap: 200, kind: "blank"   },
  { text: "  ● Agent deployed successfully",                                       gap: 340, kind: "success" },
  { text: "",                                                                      gap: 160, kind: "blank"   },
  { text: "  Dashboard   https://www.cognoscloud.xyz/agents/research-agent",           gap: 240, kind: "url"     },
  { text: "  API         POST https://api.cognos.ai/v1/agents/research-agent/run", gap: 80,  kind: "url"     },
  { text: "  Status      Running",                                                 gap: 60,  kind: "status"  },
];

// ─── Syntax highlight (inline, no deps) ──────────────────────────────────────

function hlPy(code: string): string {
  return code
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\b(from|import|True|False|None)\b/g, '<span style="color:#c678dd">$1</span>')
    .replace(/\b(Agent)\b/g,                        '<span style="color:#61afef">$1</span>')
    .replace(/(#[^\n]*)/g,                          '<span style="color:#5c6370;font-style:italic">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')
    .replace(/\.deploy\b/g,                         '.<span style="color:#e5c07b">deploy</span>');
}

// ─── pip install output ───────────────────────────────────────────────────────

const PIP_LINES = [
  { text: "Collecting cognos...",                                       delay: 600  },
  { text: "  Downloading cognos-0.1.4-py3-none-any.whl (48 kB)",       delay: 900  },
  { text: "  ├── httpx-0.27.0",                                         delay: 300  },
  { text: "  ├── pydantic-2.7.0",                                       delay: 200  },
  { text: "  └── rich-13.7.0",                                          delay: 200  },
  { text: "Installing collected packages: cognos",                       delay: 700  },
  { text: "\x1bSUCCESS\x1bSuccessfully installed cognos-0.1.4",         delay: 500  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Scene 1 — pip install cognos
// ─────────────────────────────────────────────────────────────────────────────

function Scene1Install({ visible, elapsed }: { visible: boolean; elapsed: number }) {
  const localT = elapsed - T.S1_START;
  const cmdVisible = localT >= (T.S1_CMD - T.S1_START);

  // which pip lines to show
  let cum = T.S1_CMD - T.S1_START + 200;
  const pipVisible: number[] = [];
  PIP_LINES.forEach((l, i) => {
    cum += l.delay;
    if (localT >= cum) pipVisible.push(i);
  });

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-600", visible ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className="w-full max-w-xl">
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4 font-medium">Step 1 — Install</p>
        <div className="bg-[#0b0b0b] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#090909]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/><span className="w-3 h-3 rounded-full bg-[#ffbd2e]"/><span className="w-3 h-3 rounded-full bg-[#28c840]"/>
            <span className="ml-3 font-mono text-[11px] text-zinc-600">Terminal</span>
          </div>
          <div className="px-5 py-5 font-mono text-[13px] min-h-[180px]">
            {cmdVisible && (
              <div className="flex gap-2 mb-2 leading-6">
                <span className="text-emerald-400 select-none">❯</span>
                <span className="text-white font-medium">pip install cognos</span>
              </div>
            )}
            {PIP_LINES.map((l, i) => {
              if (!pipVisible.includes(i)) return null;
              if (l.text.startsWith("\x1bSUCCESS\x1b")) {
                return <div key={i} className="text-emerald-400 leading-6 animate-fadeIn">{l.text.replace("\x1bSUCCESS\x1b","")}</div>;
              }
              return <div key={i} className="text-zinc-500 leading-6 animate-fadeIn">{l.text}</div>;
            })}
            {cmdVisible && pipVisible.length < PIP_LINES.length && (
              <span className="inline-block w-[7px] h-[13px] bg-zinc-500 align-middle mt-1" style={{ animation:"blink 1s step-end infinite" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 2 — Write the agent
// ─────────────────────────────────────────────────────────────────────────────

function Scene2Code({ visible, elapsed }: { visible: boolean; elapsed: number }) {
  const localT = elapsed - T.S2_START;
  const typingStart = T.S2_TYPING_START - T.S2_START;
  const typingDuration = T.S2_DONE - T.S2_TYPING_START;
  const progress = Math.max(0, Math.min(1, (localT - typingStart) / typingDuration));
  const charsVisible = Math.floor(progress * AGENT_CODE.length);
  const visibleCode = AGENT_CODE.slice(0, charsVisible);
  const isTyping = localT >= typingStart && charsVisible < AGENT_CODE.length;

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-600", visible ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className="w-full max-w-xl">
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4 font-medium">Step 2 — Write your agent</p>
        <div className="bg-[#0b0b0b] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#090909]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/><span className="w-3 h-3 rounded-full bg-[#ffbd2e]"/><span className="w-3 h-3 rounded-full bg-[#28c840]"/>
            <div className="flex items-center gap-1.5 ml-3">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-400/70 flex-shrink-0"/>
              <span className="font-mono text-[11px] text-zinc-400">agent.py</span>
            </div>
          </div>
          <div className="flex px-5 py-5 gap-4 min-h-[220px]">
            {/* line numbers */}
            <div className="text-right text-zinc-700 font-mono text-[13px] leading-6 select-none flex-shrink-0" style={{ minWidth:"1.5rem" }}>
              {visibleCode.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            {/* code */}
            <pre className="flex-1 font-mono text-[13px] leading-6 overflow-hidden" style={{ margin:0 }}>
              <code dangerouslySetInnerHTML={{ __html: hlPy(visibleCode) }} />
              {isTyping && <span className="inline-block w-[7px] h-[14px] bg-zinc-300 align-middle ml-px" style={{ animation:"blink 1s step-end infinite" }} />}
            </pre>
          </div>
        </div>
        <p className="mt-3 text-zinc-600 text-[12px] font-mono text-center">
          That's all the code you write. Cognos handles the rest.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 3 — cognos deploy
// ─────────────────────────────────────────────────────────────────────────────

function Scene3Deploy({ visible, elapsed }: { visible: boolean; elapsed: number }) {
  const localT   = elapsed - T.S3_START;
  const cmdShown = localT >= (T.S3_CMD - T.S3_START);

  // which deploy lines to show
  let cum = T.S3_LINES_START - T.S3_START;
  let visibleCount = 0;
  for (const line of DEPLOY_LINES) {
    cum += line.gap;
    if (localT >= cum) visibleCount++;
    else break;
  }
  const visibleLines = DEPLOY_LINES.slice(0, visibleCount);
  const isDone = visibleCount >= DEPLOY_LINES.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleCount]);

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-600", visible ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className="w-full max-w-xl">
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4 font-medium">Step 3 — Deploy</p>
        <div className="bg-[#0b0b0b] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#090909]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/><span className="w-3 h-3 rounded-full bg-[#ffbd2e]"/><span className="w-3 h-3 rounded-full bg-[#28c840]"/>
            <span className="ml-3 font-mono text-[11px] text-zinc-600">~/research-agent</span>
          </div>
          <div ref={scrollRef} className="px-5 py-5 font-mono text-[13px] overflow-y-auto" style={{ maxHeight:300, minHeight:200 }}>
            {cmdShown && (
              <div className="flex gap-2 mb-1 leading-6">
                <span className="text-emerald-400 select-none">❯</span>
                <span className="text-white font-medium">cognos deploy</span>
              </div>
            )}
            {visibleLines.map((line, i) => {
              const k = line.kind;
              if (k === "blank")   return <div key={i} className="h-2"/>;
              if (k === "label")   return <div key={i} className="text-zinc-300 font-semibold leading-6">{line.text}</div>;
              if (k === "ok")      return <div key={i} className="text-zinc-300 leading-6 animate-fadeIn">{line.text}</div>;
              if (k === "success") return <div key={i} className="text-emerald-400 font-semibold leading-6 animate-fadeIn mt-1">{line.text}</div>;
              if (k === "status")  return <div key={i} className="text-emerald-400 leading-6 animate-fadeIn">{line.text}</div>;
              if (k === "url") {
                const parts = line.text.split(/(https?:\/\/\S+)/);
                return (
                  <div key={i} className="leading-6 animate-fadeIn">
                    {parts.map((p, j) => /^https?:\/\//.test(p)
                      ? <span key={j} className="text-sky-400">{p}</span>
                      : <span key={j} className="text-zinc-400">{p}</span>)}
                  </div>
                );
              }
              return null;
            })}
            {cmdShown && !isDone && (
              <span className="inline-block w-[7px] h-[13px] bg-zinc-500 align-middle mt-1" style={{ animation:"blink 1s step-end infinite" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 4 — Dashboard: live status → API request → timeline → logs
// ─────────────────────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { label:"Request received",  sub:"POST /run",              col:"text-zinc-300",    dot:"bg-zinc-500",    bar:"bg-zinc-500"    },
  { label:"Memory loaded",     sub:"14 items · 42ms",        col:"text-blue-300",    dot:"bg-blue-400",    bar:"bg-blue-500"    },
  { label:"Tool — Web Search", sub:"11 results · 380ms",     col:"text-violet-300",  dot:"bg-violet-400",  bar:"bg-violet-500"  },
  { label:"Tool — GitHub",     sub:"12 repos · 190ms",       col:"text-violet-300",  dot:"bg-violet-400",  bar:"bg-violet-500"  },
  { label:"LLM — gpt-4o",     sub:"1,240 tokens · 820ms",   col:"text-amber-300",   dot:"bg-amber-400",   bar:"bg-amber-500"   },
  { label:"Memory saved",      sub:"4 items written · 31ms", col:"text-blue-300",    dot:"bg-blue-400",    bar:"bg-blue-500"    },
  { label:"Completed",         sub:"1.84s · $0.0032",        col:"text-emerald-300", dot:"bg-emerald-400", bar:"bg-emerald-500" },
];

const LOGS_AFTER_RUN = [
  { t:"20:34:22", msg:"─────────── New run ───────────", c:"text-zinc-700" },
  { t:"20:34:22", msg:"Received POST /run",                c:"text-zinc-400" },
  { t:"20:34:22", msg:"Memory: loaded 14 items (42ms)",    c:"text-zinc-400" },
  { t:"20:34:23", msg:'→ web.search("AI news today")',      c:"text-violet-400" },
  { t:"20:34:23", msg:"← web: 11 results (380ms)",         c:"text-emerald-400" },
  { t:"20:34:24", msg:"→ github.search_repos()",           c:"text-violet-400" },
  { t:"20:34:24", msg:"← github: 12 repos (190ms)",        c:"text-emerald-400" },
  { t:"20:34:25", msg:"→ OpenAI gpt-4o (1,240 tokens)",    c:"text-violet-400" },
  { t:"20:34:25", msg:"← gpt-4o: response received",       c:"text-emerald-400" },
  { t:"20:34:26", msg:"Memory: wrote 4 items (31ms)",      c:"text-zinc-400" },
  { t:"20:34:26", msg:"Run complete · 1.84s · $0.0032",    c:"text-emerald-400" },
];

function Scene4Dashboard({ visible, elapsed }: { visible: boolean; elapsed: number }) {
  const showStatus   = elapsed >= T.S4_STATUS;
  const showEndpoint = elapsed >= T.S4_ENDPOINT;
  const showSend     = elapsed >= T.S4_SEND;

  // timeline steps
  const stepTimings = [T.S4_STEP_0, T.S4_STEP_1, T.S4_STEP_2, T.S4_STEP_3, T.S4_STEP_4, T.S4_STEP_5, T.S4_STEP_6];
  let activeStep = -1;
  for (let i = stepTimings.length - 1; i >= 0; i--) {
    if (elapsed >= stepTimings[i]) { activeStep = i; break; }
  }
  const doneSteps   = stepTimings.filter((t, i) => elapsed >= t && i < activeStep).map((_, i) => i);

  // logs  
  const logTimings = LOGS_AFTER_RUN.map((_, i) => T.S4_LOGS_FILL + i * 180);
  const visibleLogs = LOGS_AFTER_RUN.filter((_, i) => elapsed >= logTimings[i]);

  // response
  const showResponse = elapsed >= T.S4_RESPONSE;

  const logsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight; }, [visibleLogs.length]);

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-600", visible ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className="w-full max-w-[860px]">
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-3 font-medium text-center">Step 4 — Dashboard</p>

        {/* Browser chrome */}
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[#090909]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/><span className="w-3 h-3 rounded-full bg-[#ffbd2e]"/><span className="w-3 h-3 rounded-full bg-[#28c840]"/>
            <div className="flex-1 flex justify-center">
                <div className="bg-black/40 border border-white/[0.06] rounded px-4 py-0.5">
                <span className="font-mono text-[11px] text-zinc-500">https://www.cognoscloud.xyz/agents/research-agent</span>
              </div>
            </div>
          </div>

          {/* Dashboard body */}
          <div className="flex" style={{ minHeight:340 }}>
            {/* Sidebar */}
            <div className="w-[180px] flex-shrink-0 border-r border-white/[0.06] p-4 space-y-4 bg-[#090909]">
              {/* Status */}
              <div className={cn("rounded-xl border p-3.5 transition-all duration-500",
                showStatus ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-white/[0.06]")}>
                <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1.5">Status</p>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full transition-colors",
                    showStatus ? "bg-emerald-400" : "bg-zinc-700")}
                    style={showStatus ? { animation:"blink 1.4s ease-in-out infinite" } : {}} />
                  <span className={cn("font-bold text-[13px] transition-colors",
                    showStatus ? "text-emerald-400" : "text-zinc-600")}>
                    {showStatus ? "Running" : "—"}
                  </span>
                </div>
              </div>

              {/* Endpoint */}
              {showEndpoint && (
                <div className="animate-fadeIn">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1.5">Endpoint</p>
                  <p className="font-mono text-sky-400 text-[10px] break-all leading-[14px]">
                    POST api.cognos.ai<br/>/v1/agents/<br/>research-agent/run
                  </p>
                </div>
              )}

              {/* Requests counter */}
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-700 mb-1">Requests</p>
                <p className="font-mono font-bold text-xl text-white tabular-nums">
                  {showSend ? "1" : "0"}
                </p>
              </div>
            </div>

            {/* Main: API + Timeline + Logs */}
            <div className="flex-1 flex flex-col min-w-0 divide-y divide-white/[0.05]">

              {/* API row */}
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-white">API</span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-sky-400 text-[11px]">POST /run</span>
                  {showSend && <span className="text-[11px] text-emerald-400 font-bold ml-2 animate-fadeIn">200 OK</span>}
                </div>
                {showSend && (
                  <div className="animate-fadeIn flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">1.84s</span>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5">
                      <span className="text-[10px] text-emerald-400 font-mono">completed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Response preview */}
              {showResponse && (
                <div className="px-5 py-3 border-t border-white/[0.04] animate-fadeIn flex-shrink-0">
                  <p className="text-zinc-200 text-[12px] leading-5 line-clamp-2">
                    OpenAI o3-mini: 3× reasoning gains. Claude 3.5 Sonnet leads coding benchmarks. Gemini 2.0 Flash GA. Llama 3.3 70B matches GPT-4 at 10× lower cost.
                  </p>
                  <div className="flex gap-3 mt-2">
                    {[{l:"sources",v:"11",c:"text-white"},{l:"tokens",v:"1,240",c:"text-white"},{l:"latency",v:"1840ms",c:"text-violet-400"},{l:"cost",v:"$0.0032",c:"text-amber-400"}].map(s => (
                      <div key={s.l} className="bg-white/[0.03] border border-white/[0.05] rounded px-2.5 py-1.5">
                        <p className="text-[9px] text-zinc-700 mb-0.5">{s.l}</p>
                        <p className={cn("font-mono text-[11px] font-semibold", s.c)}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline + Logs side by side */}
              <div className="flex flex-1 min-h-0 divide-x divide-white/[0.05]">

                {/* Timeline */}
                <div className="flex-1 px-5 py-4 overflow-y-auto" style={{ minWidth:0 }}>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Execution</p>
                  {TIMELINE_STEPS.map((step, i) => {
                    const isDone   = doneSteps.includes(i) || (i < activeStep);
                    const isActive = i === activeStep;
                    const isWait   = !isDone && !isActive;
                    return (
                      <div key={i} className="flex gap-2.5">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300",
                            isWait   ? "border-white/[0.07] bg-zinc-900"             :
                            isActive ? "border-sky-400/40 bg-sky-500/10"             :
                                       `border-[${step.dot}]/30 bg-white/[0.06]`
                          )}>
                            {isWait   && <span className="w-1 h-1 rounded-full bg-zinc-700"/>}
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" style={{ animation:"blink 0.55s ease-in-out infinite" }}/>}
                            {isDone   && <span className={cn("w-1.5 h-1.5 rounded-full", step.dot)}/>}
                          </div>
                          {i < TIMELINE_STEPS.length-1 && (
                            <div className={cn("w-px flex-1 min-h-[14px] mt-0.5 mb-0.5 transition-colors duration-400", isDone ? "bg-white/[0.09]" : "bg-white/[0.04]")}/>
                          )}
                        </div>
                        <div className={cn("flex-1 min-w-0 pb-2.5", i===TIMELINE_STEPS.length-1&&"pb-0")}>
                          <p className={cn("text-[12px] font-semibold leading-4 mt-[2px] transition-colors duration-200",
                            isWait ? "text-zinc-700" : isActive ? "text-white" : step.col)}>
                            {step.label}
                            {isActive && <span className="ml-1.5 text-sky-400 font-normal text-[10px]">…</span>}
                          </p>
                          {(isDone || isActive) && (
                            <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{step.sub}</p>
                          )}
                          {isDone && (
                            <div className="mt-1 w-16 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", step.bar)} style={{ width:"80%", opacity:0.7 }}/>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live logs */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-2 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:"blink 1.4s ease-in-out infinite" }}/>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">Live Logs</span>
                  </div>
                  <div ref={logsRef} className="flex-1 overflow-y-auto bg-[#090909] px-3 py-2 font-mono text-[10px]" style={{ maxHeight:200 }}>
                    {/* static startup logs */}
                    {showStatus && [
                      { t:"20:34:20", msg:"Agent started successfully",              c:"text-zinc-600" },
                      { t:"20:34:20", msg:"Runtime ready · memory attached",          c:"text-zinc-600" },
                      { t:"20:34:21", msg:"Listening on POST /run",                   c:"text-zinc-600" },
                    ].map((l,i) => (
                      <div key={`s${i}`} className="flex gap-2 leading-[18px] border-b border-white/[0.025] py-[3px] animate-fadeIn">
                        <span className="text-zinc-800 tabular-nums w-[50px] flex-shrink-0">{l.t}</span>
                        <span className={l.c}>{l.msg}</span>
                      </div>
                    ))}
                    {/* run logs */}
                    {visibleLogs.map((l, i) => (
                      <div key={`r${i}`} className="flex gap-2 leading-[18px] border-b border-white/[0.025] py-[3px] animate-fadeIn">
                        <span className="text-zinc-800 tabular-nums w-[50px] flex-shrink-0">{l.t}</span>
                        <span className={l.c}>{l.msg}</span>
                      </div>
                    ))}
                    <div className="py-1">
                      <span className="inline-block w-[5px] h-[10px] bg-zinc-700 align-middle" style={{ animation:"blink 1s step-end infinite" }}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene 5 — Outro
// ─────────────────────────────────────────────────────────────────────────────

function Scene5Outro({ visible }: { visible: boolean }) {
  return (
    <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-800", visible ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <div className="text-center" style={{ animation: visible ? "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" : "none" }}>
        <CognosLogoLg />
      </div>
      <div style={{ animation: visible ? "fadeIn 0.7s ease-out 300ms both" : "none" }}>
        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-6 mb-3">Cognos Cloud</p>
        <p className="text-zinc-400 text-base sm:text-lg">The operating system for autonomous AI agents.</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:"blink 1.4s ease-in-out infinite" }}/>
          <span className="text-zinc-600 text-sm font-mono">www.cognoscloud.xyz</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter dots ─────────────────────────────────────────────────────────────

const CHAPTERS = [
  { at: T.S1_START, label:"Install"   },
  { at: T.S2_START, label:"Write"     },
  { at: T.S3_START, label:"Deploy"    },
  { at: T.S4_START, label:"Dashboard" },
  { at: T.S5_START, label:"Done"      },
];

function Chapters({ elapsed, onSeek }: { elapsed: number; onSeek: (t: number) => void }) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
      {CHAPTERS.map((ch) => {
        const active = elapsed >= ch.at;
        return (
          <button key={ch.label} title={ch.label} onClick={() => onSeek(ch.at)}
            className={cn("rounded-full transition-all duration-300 hover:scale-125",
              active ? "w-2.5 h-2.5 bg-white" : "w-2 h-2 bg-white/20 hover:bg-white/40")} />
        );
      })}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, done }: { pct: number; done: boolean }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06]">
      <div className={cn("h-full transition-all", done ? "bg-emerald-400" : "bg-white/40")}
        style={{ width:`${pct}%`, transitionDuration: done ? "300ms" : "150ms" }} />
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function CognosLogoLg() {
  return (
    <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="7" fill="white"/>
      <circle cx="16" cy="16" r="3.5" fill="black"/>
      <circle cx="16" cy="7"  r="2"   fill="black"/>
      <circle cx="16" cy="25" r="2"   fill="black"/>
      <circle cx="7"  cy="16" r="2"   fill="black"/>
      <circle cx="25" cy="16" r="2"   fill="black"/>
      <line x1="16" y1="9" x2="16" y2="12.5" stroke="black" strokeWidth="1.5"/>
      <line x1="16" y1="19.5" x2="16" y2="23" stroke="black" strokeWidth="1.5"/>
      <line x1="9" y1="16" x2="12.5" y2="16" stroke="black" strokeWidth="1.5"/>
      <line x1="19.5" y1="16" x2="23" y2="16" stroke="black" strokeWidth="1.5"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main VideoDemo export
// ─────────────────────────────────────────────────────────────────────────────

export function VideoDemo() {
  const [elapsed,  setElapsed]  = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [started,  setStarted]  = useState(false);
  const [ended,    setEnded]    = useState(false);

  const rafRef   = useRef<number>(0);
  const baseRef  = useRef(0);    // elapsed at last pause
  const startRef = useRef(0);   // wall-clock at last play

  const tick = useCallback(() => {
    const e = baseRef.current + (performance.now() - startRef.current);
    if (e >= T.TOTAL) {
      setElapsed(T.TOTAL);
      setPlaying(false);
      setEnded(true);
      return;
    }
    setElapsed(e);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const play = useCallback(() => {
    if (ended) { baseRef.current = 0; setElapsed(0); setEnded(false); }
    startRef.current = performance.now();
    setPlaying(true);
    setStarted(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [ended, tick]);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    baseRef.current = elapsed;
    setPlaying(false);
  }, [elapsed]);

  const seek = useCallback((ms: number) => {
    cancelAnimationFrame(rafRef.current);
    baseRef.current = ms;
    setElapsed(ms);
    setEnded(false);
    if (playing) { startRef.current = performance.now(); rafRef.current = requestAnimationFrame(tick); }
  }, [playing, tick]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const pct = (elapsed / T.TOTAL) * 100;

  // scene visibility (with 600ms overlap for crossfade)
  const show1 = elapsed >= T.S1_START && elapsed < T.S2_START + 600;
  const show2 = elapsed >= T.S2_START - 200 && elapsed < T.S3_START + 600;
  const show3 = elapsed >= T.S3_START - 200 && elapsed < T.S4_START + 600;
  const show4 = elapsed >= T.S4_START - 200 && elapsed < T.S5_START + 600;
  const show5 = elapsed >= T.S5_START - 200;

  // current chapter label for top indicator
  const chapterLabel = elapsed < T.S2_START ? "Install" :
                       elapsed < T.S3_START ? "Write agent" :
                       elapsed < T.S4_START ? "Deploy" :
                       elapsed < T.S5_START ? "Dashboard" : "";

  return (
    <div className="w-full">
      <div className="relative bg-[#080808] rounded-2xl overflow-hidden border border-white/[0.09] shadow-[0_0_120px_rgba(0,0,0,0.9)]"
        style={{ aspectRatio:"16/9", minHeight:320 }}>

        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:"linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize:"48px 48px",
            maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
            WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
          }} />

        {/* Scenes */}
        <Scene1Install  visible={show1} elapsed={elapsed} />
        <Scene2Code     visible={show2} elapsed={elapsed} />
        <Scene3Deploy   visible={show3} elapsed={elapsed} />
        <Scene4Dashboard visible={show4} elapsed={elapsed} />
        <Scene5Outro    visible={show5} />

        {/* Play overlay */}
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 z-30 backdrop-blur-[2px]">
            <button onClick={play}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.15)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="black"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <p className="mt-5 text-zinc-400 text-sm font-medium">Watch the 60-second demo</p>
            <p className="text-zinc-700 text-xs mt-1">Install → Write → Deploy → Dashboard</p>
          </div>
        )}

        {/* Ended overlay */}
        {ended && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <button onClick={play}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
              </svg>
              Watch again
            </button>
          </div>
        )}

        {/* Chapter label */}
        {started && !ended && chapterLabel && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">{chapterLabel}</span>
          </div>
        )}

        {/* Chapter dots */}
        {started && !ended && <Chapters elapsed={elapsed} onSeek={seek} />}

        {/* Hover controls row */}
        {started && (
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={playing ? pause : play}
              className="text-white/50 hover:text-white p-1.5 rounded hover:bg-white/10 transition-all">
              {playing
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>}
            </button>
            <span className="text-white/30 text-[10px] font-mono tabular-nums">
              {Math.floor(elapsed/1000)}s / 60s
            </span>
          </div>
        )}

        {/* Progress bar */}
        {started && <ProgressBar pct={pct} done={ended} />}
      </div>
    </div>
  );
}
