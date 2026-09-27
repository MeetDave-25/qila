import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  Route,
  ListChecks,
  BookOpenText,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Terminal,
  ChevronDown,
  FileSearch,
  Code2,
  ScanLine,
  Presentation,
  Eye,
  Download,
  Cpu,
  Gauge,
  WifiOff,
  Timer,
  AlertTriangle,
  Circle,
  RotateCcw,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Ban,
  X,
} from 'lucide-react'
import { DOCS, MODELS, ROLE_META, SCENARIOS, type Scenario, type Deliverable } from '../data/mock'
import { Badge, Card, cn, Dot, FileIcon, Progress } from '../components/ui'
import { PreviewModal } from '../components/PreviewModal'
import { useExport, useSession } from '../lib/session'

/* ------------------------------------------------------------------ */

type Run = { stage: number; plan: number; tools: number; verify: number; chars: number; started: number; ended?: number }
type Msg = { id: number; role: 'user'; text: string; attachment?: string } | { id: number; role: 'agent'; sc: Scenario; run: Run; modelId: string; manual: boolean }

const STAGES = [
  { label: 'Route', icon: Route },
  { label: 'Plan', icon: ListChecks },
  { label: 'Retrieve', icon: BookOpenText },
  { label: 'Act', icon: Wrench },
  { label: 'Verify', icon: ShieldCheck },
  { label: 'Deliver', icon: Sparkles },
]

const SCENARIO_ICONS: Record<string, typeof Code2> = { pid: ScanLine, report: FileSearch, code: Code2, slides: Presentation, guard: ShieldAlert }

function pickScenario(text: string): Scenario {
  const t = text.toLowerCase()
  if (/vendor|quot|supplier|apex|price/.test(t)) return SCENARIOS[4]
  if (/p&id|pid|drawing|valve|scan|image|diagram|instrument/.test(t)) return SCENARIOS[0]
  if (/code|script|python|calculat|efficien|csv|program/.test(t)) return SCENARIOS[2]
  if (/slide|ppt|presentation|deck|briefing|toolbox/.test(t)) return SCENARIOS[3]
  return SCENARIOS[1]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------------------------ */

function RichText({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n')
  const fmt = (s: string, k: number) =>
    s.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d\])/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={`${k}-${i}`} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      if (part.startsWith('`') && part.endsWith('`')) return <code key={`${k}-${i}`} className="rounded bg-white/[0.06] px-1 font-mono text-[12px] text-cyan-200">{part.slice(1, -1)}</code>
      if (/^\[\d\]$/.test(part))
        return (
          <sup key={`${k}-${i}`} className="mx-0.5 inline-grid h-4 min-w-4 cursor-help place-items-center rounded bg-indigo-500/20 px-1 text-[10px] font-semibold text-indigo-200 ring-1 ring-indigo-400/30">
            {part.slice(1, -1)}
          </sup>
        )
      return part
    })
  return (
    <div className={cn('space-y-1.5 text-[14px] leading-relaxed text-slate-300', streaming && 'caret')}>
      {lines.map((l, i) =>
        l.startsWith('• ') ? (
          <div key={i} className="flex gap-2 pl-1">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
            <span>{fmt(l.slice(2), i)}</span>
          </div>
        ) : l === '' ? (
          <div key={i} className="h-1" />
        ) : (
          <p key={i}>{fmt(l, i)}</p>
        ),
      )}
    </div>
  )
}

function Step({
  icon,
  title,
  state,
  meta,
  children,
  defaultOpen = true,
}: {
  icon: ReactNode
  title: string
  state: 'pending' | 'active' | 'done'
  meta?: ReactNode
  children?: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (state === 'pending') return null
  return (
    <div className="fade-up relative pl-9">
      <div
        className={cn(
          'absolute left-0 top-0.5 grid h-6 w-6 place-items-center rounded-full ring-1',
          state === 'done' ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' : 'bg-indigo-500/20 text-indigo-200 ring-indigo-400/40',
        )}
      >
        {state === 'active' ? <Loader2 size={13} className="animate-spin" /> : icon}
      </div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left">
        <span className={cn('text-[13px] font-medium', state === 'active' ? 'text-white' : 'text-slate-300')}>{title}</span>
        {meta}
        {children && <ChevronDown size={14} className={cn('ml-auto text-slate-500 transition', open && 'rotate-180')} />}
      </button>
      {open && children && <div className="mt-2">{children}</div>}
    </div>
  )
}

function HumanReview({ sc }: { sc: Scenario }) {
  const { user, toast } = useSession()
  const [state, setState] = useState<'pending' | 'approved' | 'changes'>('pending')
  const [vote, setVote] = useState<0 | 1 | -1>(0)
  if (state === 'approved')
    return (
      <div className="fade-up flex items-center gap-3 rounded-xl bg-emerald-500/[0.07] px-4 py-3 text-sm ring-1 ring-emerald-500/20">
        <UserCheck size={17} className="text-emerald-300" />
        <span className="text-emerald-100">
          Approved by <b>{user.name}</b> and published to the team library. The approval is signed in the audit trail.
        </span>
      </div>
    )
  if (state === 'changes')
    return (
      <div className="fade-up flex items-center gap-3 rounded-xl bg-amber-500/[0.07] px-4 py-3 text-sm ring-1 ring-amber-500/20">
        <ShieldAlert size={17} className="text-amber-300" />
        <span className="text-amber-100">Sent back for revision. The agent will re-run with your feedback, and the output stays in draft.</span>
      </div>
    )
  return (
    <div className="fade-up flex flex-wrap items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.07]">
      <div className="flex items-center gap-2 text-[13px] text-slate-300">
        <UserCheck size={16} className="text-indigo-300" />
        <span>
          <b className="text-white">Human review</b> required before publishing
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={() => setVote(vote === 1 ? 0 : 1)} className={cn('grid h-8 w-8 place-items-center rounded-lg transition', vote === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:bg-white/[0.06] hover:text-white')}>
          <ThumbsUp size={15} />
        </button>
        <button onClick={() => setVote(vote === -1 ? 0 : -1)} className={cn('grid h-8 w-8 place-items-center rounded-lg transition', vote === -1 ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500 hover:bg-white/[0.06] hover:text-white')}>
          <ThumbsDown size={15} />
        </button>
        <button
          onClick={() => {
            setState('changes')
            toast('Revision requested', 'info', `${sc.title} returned to agent`)
          }}
          className="rounded-lg px-3 py-1.5 text-xs text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.05]"
        >
          Request changes
        </button>
        <button
          onClick={() => {
            setState('approved')
            toast('Output approved & published', 'ok', 'Signed approval written to audit trail')
          }}
          className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
        >
          Approve
        </button>
      </div>
    </div>
  )
}

function AgentMessage({ sc, run, modelId, manual, onPreview }: { sc: Scenario; run: Run; modelId: string; manual: boolean; onPreview: (d: Deliverable) => void }) {
  const model = MODELS.find((m) => m.id === modelId)!
  const exportFile = useExport()
  const st = (i: number): 'pending' | 'active' | 'done' => (run.stage < i ? 'pending' : run.stage === i ? 'active' : 'done')
  const done = run.stage >= 6

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/50 sm:grid">
        <Sparkles size={17} />
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-white">Workbench Agent</span>
          <Badge tone={ROLE_META[model.role].tone}>
            <Cpu size={11} /> {model.name}
          </Badge>
          {done && (
            <span className="text-xs text-slate-500">
              completed in {(((run.ended ?? Date.now()) - run.started) / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        {/* Trace */}
        <Card className="space-y-4 !rounded-xl p-4 !bg-ink-850/60">
          <Step
            icon={<Route size={12} />}
            title="Model router"
            state={st(0)}
            meta={st(0) === 'done' && (manual ? <Badge tone="amber">manual override</Badge> : <Badge tone="emerald">{Math.round(sc.confidence * 100)}% confidence</Badge>)}
          >
            {st(0) === 'active' ? (
              <div className="shimmer h-10 rounded-lg bg-white/[0.03]" />
            ) : (
              <div className="rounded-lg bg-white/[0.02] p-3 text-xs ring-1 ring-white/[0.05]">
                <div className="flex flex-wrap items-center gap-2 text-slate-400">
                  Task classified as <Badge tone="cyan">{sc.task}</Badge> → {manual ? 'user selected' : 'routed to'} <span className="font-medium text-white">{model.name}</span>
                  <span className="text-slate-600">·</span> {model.quant} · {model.runtime}
                </div>
                <div className="mt-1.5 text-slate-500">
                  {manual ? `Router recommendation was ${MODELS.find((m) => m.id === sc.modelId)!.name}. The user's choice was respected.` : sc.routeReason}
                </div>
              </div>
            )}
          </Step>

          <Step icon={<ListChecks size={12} />} title="Plan" state={st(1)} meta={<span className="text-xs text-slate-500">{sc.plan.length} steps</span>}>
            <ol className="space-y-1.5">
              {sc.plan.map((p, i) => (
                <li key={p} className={cn('flex items-start gap-2 text-[13px] transition', i < run.plan ? 'text-slate-300' : 'text-slate-600')}>
                  {i < run.plan ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" /> : <Circle size={14} className="mt-0.5 shrink-0" />}
                  {p}
                </li>
              ))}
            </ol>
          </Step>

          <Step icon={<BookOpenText size={12} />} title="Retrieved from local knowledge base" state={st(2)} meta={<span className="text-xs text-slate-500">Qdrant · hybrid search</span>}>
            {st(2) === 'active' ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="shimmer h-16 rounded-lg bg-white/[0.03]" />
                ))}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {sc.sources.map((s, i) => (
                  <div key={s.doc} className="rounded-lg bg-white/[0.02] p-2.5 ring-1 ring-white/[0.05] transition hover:ring-indigo-400/30">
                    <div className="flex items-center gap-2">
                      <span className="grid h-4 min-w-4 place-items-center rounded bg-indigo-500/20 px-1 text-[10px] font-semibold text-indigo-200">{i + 1}</span>
                      <span className="truncate text-xs font-medium text-slate-200">{s.doc}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-emerald-300">{s.score.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">{s.loc}</div>
                    <div className="mt-1 line-clamp-2 text-[11.5px] italic text-slate-400">“{s.snippet}”</div>
                  </div>
                ))}
              </div>
            )}
          </Step>

          <Step icon={<Wrench size={12} />} title="Tool execution" state={st(3)} meta={<span className="text-xs text-slate-500">{Math.min(run.tools, sc.tools.length)}/{sc.tools.length} calls · sandboxed</span>}>
            <div className="space-y-2">
              {sc.tools.slice(0, run.stage === 3 ? run.tools + 1 : sc.tools.length).map((t, i) => {
                const running = run.stage === 3 && i === run.tools
                const failed = t.output[0]?.includes('Error')
                const blocked = t.output.some((o) => o.startsWith('BLOCKED'))
                const warned = t.output.some((o) => o.startsWith('⚠'))
                return (
                  <div key={i} className={cn('fade-up overflow-hidden rounded-lg bg-ink-950/80 ring-1', !running && blocked ? 'ring-rose-500/40' : !running && warned ? 'ring-amber-500/30' : 'ring-white/[0.06]')}>
                    <div className="flex items-center gap-2 border-b border-white/[0.05] px-3 py-1.5">
                      <Terminal size={12} className="text-slate-500" />
                      <span className="font-mono text-[11px] text-cyan-300">{t.tool}</span>
                      <span className="hidden truncate text-[11px] text-slate-500 sm:inline">— {t.label}</span>
                      <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px]">
                        {running ? (
                          <span className="flex items-center gap-1 text-indigo-300">
                            <Loader2 size={11} className="animate-spin" /> running
                          </span>
                        ) : failed ? (
                          <span className="flex items-center gap-1 text-amber-300">
                            <AlertTriangle size={11} /> error → retry
                          </span>
                        ) : blocked ? (
                          <span className="flex items-center gap-1 font-semibold text-rose-400">
                            <Ban size={11} /> blocked
                          </span>
                        ) : warned ? (
                          <span className="flex items-center gap-1 text-amber-300">
                            <ShieldAlert size={11} /> threat quarantined
                          </span>
                        ) : (
                          <span className="text-emerald-400">✓ {t.ms} ms</span>
                        )}
                      </span>
                    </div>
                    <div className="px-3 py-2 font-mono text-[11.5px] leading-relaxed">
                      <div className="text-slate-500">
                        <span className="text-slate-600">$</span> {t.input}
                      </div>
                      {t.code && (
                        <pre className="mt-1.5 overflow-x-auto rounded bg-white/[0.02] p-2 text-[11px] text-slate-300">{t.code}</pre>
                      )}
                      {!running &&
                        t.output.map((o) => (
                          <div key={o} className={o.startsWith('BLOCKED') ? 'font-semibold text-rose-400' : o.includes('Error') || o.startsWith('⚠') || o.startsWith('"') ? 'text-amber-300' : 'text-slate-300'}>
                            <span className="text-slate-600">›</span> {o}
                          </div>
                        ))}
                      {running && <div className="shimmer mt-1 h-3 w-2/3 rounded bg-white/[0.03]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </Step>

          <Step icon={<ShieldCheck size={12} />} title="Verification layer" state={st(4)} meta={st(4) === 'done' && <Badge tone="emerald">passed</Badge>}>
            <ul className="space-y-1.5">
              {sc.verify.map((v, i) => (
                <li key={v} className={cn('flex items-start gap-2 text-[13px]', i < run.verify ? 'text-slate-300' : 'text-slate-600')}>
                  {i < run.verify ? (
                    v.includes('flag') ? <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" /> : <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle size={14} className="mt-0.5 shrink-0" />
                  )}
                  {v}
                </li>
              ))}
            </ul>
          </Step>
        </Card>

        {/* Answer */}
        {run.stage >= 5 && <RichText text={sc.answer.slice(0, run.chars)} streaming={run.stage === 5} />}

        {/* Deliverables */}
        {done && (
          <div className="fade-up grid gap-2 sm:grid-cols-2">
            {sc.deliverables.map((d) => (
              <div key={d.name} className="group flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07] transition hover:bg-white/[0.05] hover:ring-indigo-400/30">
                <FileIcon kind={d.kind} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-100">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.size} · saved to /deliverables</div>
                </div>
                <button onClick={() => onPreview(d)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.08] hover:text-white" title="Preview">
                  <Eye size={16} />
                </button>
                <button onClick={() => exportFile(d)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.08] hover:text-white" title="Download">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        {done && <HumanReview sc={sc} />}
        {done && (
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <WifiOff size={12} className="text-emerald-400" /> 0 external network calls during this run
            </span>
            <span>·</span>
            <span>{sc.sources.length} sources cited</span>
            <span>·</span>
            <span>audit id #{(sc.id.length * 7919 + 40213).toString(16)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Telemetry({ active }: { active: { sc: Scenario; run: Run; modelId: string } | null }) {
  const [tps, setTps] = useState<number[]>(Array(28).fill(0))
  const running = !!active && active.run.stage < 6
  const model = active ? MODELS.find((m) => m.id === active.modelId)! : null

  useEffect(() => {
    const t = setInterval(() => {
      setTps((a) => [...a.slice(1), running && model ? model.tps * (0.75 + Math.random() * 0.4) : 0])
    }, 400)
    return () => clearInterval(t)
  }, [running, model])

  const max = Math.max(...tps, 1)
  const cur = Math.round(tps[tps.length - 1])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Agent pipeline</div>
        <div className="mt-3 space-y-2.5">
          {STAGES.map((s, i) => {
            const stage = active?.run.stage ?? -1
            const state = stage > i || stage >= 6 ? 'done' : stage === i ? 'active' : 'idle'
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-lg ring-1 transition',
                    state === 'done' && 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
                    state === 'active' && 'bg-indigo-500/25 text-indigo-200 ring-indigo-400/50 shadow-[0_0_16px] shadow-indigo-500/40',
                    state === 'idle' && 'bg-white/[0.03] text-slate-600 ring-white/[0.06]',
                  )}
                >
                  {state === 'active' ? <Loader2 size={13} className="animate-spin" /> : <s.icon size={13} />}
                </div>
                <span className={cn('text-[13px]', state === 'idle' ? 'text-slate-600' : 'text-slate-200')}>{s.label}</span>
                {state === 'done' && <CheckCircle2 size={13} className="ml-auto text-emerald-400" />}
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Inference</div>
          {running ? <Badge tone="indigo"><Dot tone="cyan" pulse /> live</Badge> : <Badge>idle</Badge>}
        </div>
        <div className="mt-3 text-sm font-medium text-white">{model?.name ?? 'Awaiting task'}</div>
        <div className="text-xs text-slate-500">{model ? `${model.quant} · ${model.runtime} · ctx ${model.ctx}` : 'Router will auto-select'}</div>
        <div className="mt-3 flex h-14 items-end gap-[3px]">
          {tps.map((v, i) => (
            <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600/60 to-cyan-400/80 transition-all duration-300" style={{ height: `${Math.max(3, (v / max) * 100)}%`, opacity: v ? 1 : 0.15 }} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-1 text-slate-500"><Gauge size={12} /> tokens/s</div>
            <div className="mt-0.5 font-mono text-lg text-white">{cur}</div>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-1 text-slate-500"><Timer size={12} /> TTFT</div>
            <div className="mt-0.5 font-mono text-lg text-white">{model ? '182ms' : '—'}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-slate-500">
            <span>Context window</span>
            <span className="font-mono">{active ? `${(5.2 + (active.run.stage ?? 0) * 1.9).toFixed(1)}K / ${model?.ctx}` : '—'}</span>
          </div>
          <Progress value={active ? 16 + active.run.stage * 7 : 0} tone="cyan" />
        </div>
      </Card>

      <Card className="border-emerald-500/20 p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
          <WifiOff size={13} /> Egress monitor
        </div>
        <div className="mt-2 font-mono text-3xl font-semibold text-white">0 B</div>
        <div className="text-xs text-slate-500">outbound to internet this session</div>
        <div className="mt-3 space-y-1 font-mono text-[10.5px] text-slate-500">
          <div><span className="text-emerald-400">ALLOW</span> 10.0.4.12 → vllm:8000</div>
          <div><span className="text-emerald-400">ALLOW</span> 10.0.4.12 → qdrant:6333</div>
          <div><span className="text-rose-400">DENY&nbsp;</span> * → 0.0.0.0/0</div>
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function Workbench() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<Deliverable | null>(null)
  const [modelSel, setModelSel] = useState('auto')
  const [attached, setAttached] = useState<string | null>(null)
  const [picker, setPicker] = useState(false)
  const alive = useRef(true)
  const scroller = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const patch = (id: number, p: Partial<Run>) =>
    setMsgs((m) => m.map((x) => (x.id === id && x.role === 'agent' ? { ...x, run: { ...x.run, ...p } } : x)))

  async function start(text: string, sc: Scenario, attachment?: string) {
    if (busy) return
    setBusy(true)
    const uid = nextId.current++
    const aid = nextId.current++
    const manual = modelSel !== 'auto'
    setMsgs((m) => [
      ...m,
      { id: uid, role: 'user', text, attachment: attachment ?? sc.attachment },
      { id: aid, role: 'agent', sc, modelId: manual ? modelSel : sc.modelId, manual, run: { stage: 0, plan: 0, tools: 0, verify: 0, chars: 0, started: Date.now() } },
    ])
    setInput('')
    setAttached(null)
    const ok = () => alive.current

    await sleep(1100)
    if (!ok()) return
    patch(aid, { stage: 1 })
    for (let i = 1; i <= sc.plan.length; i++) {
      await sleep(380)
      if (!ok()) return
      patch(aid, { plan: i })
    }
    await sleep(250)
    patch(aid, { stage: 2 })
    await sleep(1100)
    if (!ok()) return
    patch(aid, { stage: 3, tools: 0 })
    for (let i = 0; i < sc.tools.length; i++) {
      await sleep(Math.min(1500, 500 + sc.tools[i].ms / 3))
      if (!ok()) return
      patch(aid, { tools: i + 1 })
    }
    await sleep(300)
    patch(aid, { stage: 4 })
    for (let i = 1; i <= sc.verify.length; i++) {
      await sleep(420)
      if (!ok()) return
      patch(aid, { verify: i })
    }
    await sleep(300)
    patch(aid, { stage: 5 })
    for (let c = 0; c <= sc.answer.length; c += 5) {
      await sleep(14)
      if (!ok()) return
      patch(aid, { chars: c })
    }
    patch(aid, { chars: sc.answer.length, stage: 6, ended: Date.now() })
    setBusy(false)
  }

  const submit = () => {
    const t = input.trim()
    if (!t) return
    start(t, pickScenario(`${t} ${attached ?? ''}`), attached ?? undefined)
  }

  const lastAgent = [...msgs].reverse().find((m) => m.role === 'agent') as Extract<Msg, { role: 'agent' }> | undefined

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
            {msgs.length === 0 ? (
              <div className="fade-up pt-2 sm:pt-12">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-900/60">
                  <Sparkles size={26} className="text-white" />
                </div>
                <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                  What should the <span className="text-gradient">agent</span> do today?
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-400">
                  Ask about drawings, reports, SOPs or data. The router picks the right open-weight model, the agent plans, uses local tools, verifies and delivers real files — all on-premise.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {MODELS.filter((m) => m.status === 'loaded').map((m) => (
                    <Badge key={m.id} tone={ROLE_META[m.role].tone}>
                      <Dot tone="emerald" /> {m.name}
                    </Badge>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2">
                  {SCENARIOS.map((s) => {
                    const I = SCENARIO_ICONS[s.id]
                    const m = MODELS.find((x) => x.id === s.modelId)!
                    return (
                      <button
                        key={s.id}
                        onClick={() => start(s.prompt, s)}
                        className={cn(
                          'group glass flex flex-col gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:bg-ink-850',
                          s.id === 'guard' ? 'border-rose-500/20 hover:border-rose-400/40 sm:col-span-2' : 'hover:border-indigo-400/30',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn('grid h-8 w-8 place-items-center rounded-lg ring-1 ring-white/10 group-hover:text-white', s.id === 'guard' ? 'bg-rose-500/10 text-rose-300' : 'bg-white/[0.05] text-indigo-300')}>
                            <I size={16} />
                          </div>
                          <span className="text-sm font-medium text-white">{s.title}</span>
                          {s.id === 'guard' && <Badge tone="rose" className="ml-auto">Security demo</Badge>}
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{s.prompt}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Route size={11} /> {m.name}
                          <span className="ml-auto flex gap-1">
                            {s.deliverables.map((d) => (
                              <span key={d.name} className="rounded bg-white/[0.05] px-1.5 py-px font-mono text-[10px] uppercase text-slate-300">
                                .{d.kind}
                              </span>
                            ))}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {msgs.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} className="fade-up flex justify-end">
                      <div className="max-w-[85%] space-y-2">
                        {m.attachment && (
                          <div className="ml-auto flex w-fit items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300 ring-1 ring-white/[0.08]">
                            <FileIcon kind={m.attachment.endsWith('.csv') ? 'csv' : 'pdf'} size="sm" />
                            {m.attachment}
                          </div>
                        )}
                        <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 px-4 py-2.5 text-[14px] text-white shadow-lg shadow-indigo-950/50">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="fade-up">
                      <AgentMessage sc={m.sc} run={m.run} modelId={m.modelId} manual={m.manual} onPreview={setPreview} />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="safe-bottom shrink-0 px-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="glass relative !rounded-2xl p-2 focus-within:border-indigo-400/40">
              {picker && (
                <div className="glass fade-up absolute bottom-full left-0 z-20 mb-2 w-80 max-w-full !bg-ink-850/95 p-2">
                  <div className="flex items-center justify-between px-2 pb-2 pt-1">
                    <span className="text-xs font-semibold text-slate-300">Attach from knowledge base</span>
                    <button onClick={() => setPicker(false)} className="text-slate-500 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-64 space-y-0.5 overflow-y-auto">
                    {DOCS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setAttached(d.name)
                          setPicker(false)
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-white/[0.05]"
                      >
                        <FileIcon kind={d.kind} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate text-xs text-slate-200">{d.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {d.category} · {d.pages} pages
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {attached && (
                <div className="mx-2 mt-1 flex w-fit items-center gap-2 rounded-lg bg-white/[0.05] py-1 pl-1.5 pr-2 text-xs text-slate-300 ring-1 ring-white/[0.08]">
                  <FileIcon kind={DOCS.find((d) => d.name === attached)?.kind ?? 'pdf'} size="sm" />
                  {attached}
                  <button onClick={() => setAttached(null)} className="text-slate-500 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submit()
                  }
                }}
                rows={2}
                placeholder={busy ? 'Agent is working…' : 'Describe a task — e.g. “Extract all instruments from PID-204 into Excel”'}
                className="w-full resize-none bg-transparent px-3 py-2 text-[14px] text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <div className="flex items-center gap-2 px-1">
                <button onClick={() => setPicker(!picker)} className={cn('grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06] hover:text-white', picker ? 'bg-white/[0.06] text-white' : 'text-slate-400')} title="Attach from knowledge base">
                  <Paperclip size={16} />
                </button>
                <div className="relative">
                  <select
                    value={modelSel}
                    onChange={(e) => setModelSel(e.target.value)}
                    className="max-w-[170px] appearance-none truncate rounded-lg bg-white/[0.04] py-1.5 pl-7 pr-7 text-xs text-slate-300 ring-1 ring-white/[0.06] outline-none sm:max-w-none"
                  >
                    <option value="auto" className="bg-ink-900">Auto-route</option>
                    {MODELS.filter((m) => m.role !== 'embedding').map((m) => (
                      <option key={m.id} value={m.id} className="bg-ink-900">
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <Route size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                {msgs.length > 0 && !busy && (
                  <button onClick={() => setMsgs([])} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white">
                    <RotateCcw size={12} /> <span className="hidden sm:inline">New session</span>
                  </button>
                )}
                <span className="ml-auto hidden text-[11px] text-slate-600 sm:inline">Runs on {'gpu-node-01'} · nothing leaves this network</span>
                <button
                  onClick={submit}
                  disabled={busy || !input.trim()}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-900/50 transition hover:from-indigo-400 disabled:opacity-30"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={17} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-white/[0.06] p-4 xl:block">
        <Telemetry active={lastAgent ? { sc: lastAgent.sc, run: lastAgent.run, modelId: lastAgent.modelId } : null} />
      </aside>

      <PreviewModal d={preview} onClose={() => setPreview(null)} />
    </div>
  )
}
