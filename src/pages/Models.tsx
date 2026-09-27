import { useMemo, useState } from 'react'
import { Cpu, Route, Power, Loader2, Plus, HardDrive, Gauge, Sparkles, ArrowRight } from 'lucide-react'
import { Badge, Button, Card, CardHeader, cn, Dot, PageHeader } from '../components/ui'
import { GPU, MODELS, ROLE_META, type ModelInfo } from '../data/mock'
import { useSession } from '../lib/session'
import { ShieldCheck } from 'lucide-react'

const ROLE_COLORS: Record<string, string> = { general: 'bg-indigo-500', coding: 'bg-orange-500', vision: 'bg-violet-500', embedding: 'bg-cyan-500' }

const RULES = [
  { when: 'Image / scanned PDF / drawing attached', signal: 'modality = image', to: 'qwen3-vl' },
  { when: 'Write, fix or run code; data analysis', signal: 'intent ∈ {code, compute}', to: 'qwen3-coder' },
  { when: 'Summaries, reports, Q&A over documents', signal: 'intent ∈ {summarise, qa, draft}', to: 'qwen3' },
  { when: 'Deep multi-step reasoning (fallback)', signal: 'complexity > 0.8', to: 'deepseek' },
  { when: 'Semantic search & retrieval', signal: 'internal', to: 'qwen3-emb' },
]

function classify(q: string) {
  const t = q.toLowerCase()
  const scores = {
    vision: /(p&id|drawing|scan|image|photo|diagram|handwrit)/.test(t) ? 0.9 : 0.05,
    coding: /(code|script|python|sql|bug|calculate|plot|analy[sz]e data|csv)/.test(t) ? 0.88 : 0.07,
    general: 0.35,
  }
  const total = scores.vision + scores.coding + scores.general
  const norm = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v / total])) as typeof scores
  const best = (Object.keys(norm) as (keyof typeof norm)[]).sort((a, b) => norm[b] - norm[a])[0]
  return { norm, best }
}

export function Models() {
  const [models, setModels] = useState<ModelInfo[]>(MODELS)
  const [q, setQ] = useState('Write a Python script to plot pump vibration from the CSV')
  const { can, toast, user } = useSession()

  const used = models.filter((m) => m.status === 'loaded').reduce((a, m) => a + m.vram, 0)
  const { norm, best } = useMemo(() => classify(q), [q])
  const target = models.find((m) => m.role === best && m.status === 'loaded') ?? models[0]

  function toggle(id: string) {
    const m = models.find((x) => x.id === id)!
    if (!can('manageModels')) {
      toast('Model management requires Admin', 'deny', `Signed in as ${user.role}. Switch to the Admin demo account.`)
      return
    }
    if (m.status === 'loaded') {
      setModels((ms) => ms.map((x) => (x.id === id ? { ...x, status: 'standby' } : x)))
      return
    }
    setModels((ms) => ms.map((x) => (x.id === id ? { ...x, status: 'loading' } : x)))
    setTimeout(() => setModels((ms) => ms.map((x) => (x.id === id ? { ...x, status: 'loaded' } : x))), 1800)
  }

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Model Router & Registry"
        subtitle="Open-weight models served locally with vLLM / Ollama. The router sends every task to the best-fit model."
        right={
          <Button variant="outline">
            <Plus size={15} /> Import model (offline bundle)
          </Button>
        }
      />

      {/* VRAM budget */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
              <HardDrive size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">VRAM budget · {GPU.name}</div>
              <div className="text-xs text-slate-500">Quantised weights + sequential loading keep 4 models resident on a single 32 GB card</div>
            </div>
          </div>
          <div className="font-mono text-2xl font-semibold text-white">
            {used.toFixed(1)} <span className="text-base text-slate-500">/ {GPU.vramTotal} GB</span>
          </div>
        </div>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/[0.05] ring-1 ring-white/[0.06]">
          {models
            .filter((m) => m.status === 'loaded')
            .map((m) => (
              <div key={m.id} className={cn('h-full border-r border-ink-950 transition-all duration-700', ROLE_COLORS[m.role])} style={{ width: `${(m.vram / GPU.vramTotal) * 100}%` }} title={`${m.name} · ${m.vram} GB`} />
            ))}
          <div className="h-full bg-slate-600/40" style={{ width: `${(2.4 / GPU.vramTotal) * 100}%` }} title="KV cache reserve" />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
          {Object.entries(ROLE_META).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={cn('h-2.5 w-2.5 rounded-sm', ROLE_COLORS[k])} /> {v.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-600/60" /> KV-cache reserve
          </span>
        </div>
      </Card>

      {/* Model cards */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {models.map((m) => (
          <Card key={m.id} className={cn('relative overflow-hidden p-5 transition', m.status !== 'loaded' && 'opacity-75')}>
            <div className={cn('pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl', ROLE_COLORS[m.role])} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge tone={ROLE_META[m.role].tone}>{ROLE_META[m.role].label}</Badge>
                <div className="mt-2.5 truncate text-[15px] font-semibold text-white">{m.name}</div>
                <div className="text-xs text-slate-500">
                  {m.params} · {m.license}
                </div>
              </div>
              <button
                onClick={() => toggle(m.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition',
                  m.status === 'loaded' && 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25 hover:bg-emerald-500/20',
                  m.status === 'standby' && 'bg-white/[0.04] text-slate-400 ring-white/10 hover:text-white',
                  m.status === 'loading' && 'bg-indigo-500/15 text-indigo-200 ring-indigo-400/30',
                )}
              >
                {m.status === 'loading' ? <Loader2 size={12} className="animate-spin" /> : m.status === 'loaded' ? <Dot pulse /> : <Power size={12} />}
                {m.status === 'loaded' ? 'Loaded' : m.status === 'loading' ? 'Loading…' : 'Standby'}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                { l: 'Quant', v: m.quant.split(' ')[0] },
                { l: 'VRAM', v: `${m.vram} GB` },
                { l: 'Context', v: m.ctx },
                { l: 'tok/s', v: m.tps },
              ].map((x) => (
                <div key={x.l} className="rounded-lg bg-white/[0.03] px-1 py-2 ring-1 ring-white/[0.04]">
                  <div className="truncate font-mono text-[12.5px] text-slate-100">{x.v}</div>
                  <div className="text-[10px] text-slate-500">{x.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Runtime: <span className="text-slate-300">{m.runtime}</span></span>
              <span>{m.requests.toLocaleString()} requests · 7d</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-emerald-500/[0.06] px-2 py-1 font-mono text-[10px] text-emerald-300/90 ring-1 ring-emerald-500/15">
              <ShieldCheck size={11} /> sha256:{hash(m.id)} · verified
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        {/* Router playground */}
        <Card className="xl:col-span-2">
          <CardHeader title="Router playground" subtitle="See how a prompt is classified in real time" icon={<Sparkles size={16} />} />
          <div className="px-5 pb-5">
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg bg-white/[0.04] p-3 text-sm text-slate-200 ring-1 ring-white/[0.08] outline-none focus:ring-indigo-500/50"
            />
            <div className="mt-4 space-y-3">
              {(
                [
                  ['general', 'General / Reasoning'],
                  ['coding', 'Coding'],
                  ['vision', 'Vision / OCR'],
                ] as const
              ).map(([k, l]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className={best === k ? 'font-medium text-white' : 'text-slate-400'}>{l}</span>
                    <span className="font-mono text-slate-400">{(norm[k] * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className={cn('h-full rounded-full transition-all duration-500', ROLE_COLORS[k], best !== k && 'opacity-40')} style={{ width: `${norm[k] * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-transparent p-3 ring-1 ring-indigo-400/20">
              <Route size={16} className="text-indigo-300" />
              <span className="text-xs text-slate-400">Routed to</span>
              <ArrowRight size={12} className="text-slate-600" />
              <span className="text-sm font-semibold text-white">{target.name}</span>
            </div>
          </div>
        </Card>

        {/* Routing rules */}
        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader title="Routing policy" subtitle="Capability registry · editable by Admin role" icon={<Cpu size={16} />} right={<Badge tone="emerald"><Gauge size={11} /> 96.8% routing accuracy</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-y border-white/[0.05] text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">When the task is…</th>
                  <th className="px-3 py-2.5 font-medium">Signal</th>
                  <th className="px-5 py-2.5 font-medium">Route to</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map((r) => {
                  const m = models.find((x) => x.id === r.to)!
                  return (
                    <tr key={r.when} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-slate-200">{r.when}</td>
                      <td className="px-3 py-3">
                        <code className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-cyan-200">{r.signal}</code>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={ROLE_META[m.role].tone}>{m.name}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function hash(s: string) {
  let out = ''
  let h = 2166136261
  for (let round = 0; out.length < 12; round++) {
    for (const c of s + round) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
    out += (h >>> 0).toString(16).padStart(8, '0')
  }
  return out.slice(0, 12) + '…'
}
