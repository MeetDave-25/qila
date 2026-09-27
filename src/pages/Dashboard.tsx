import { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { Activity, Bot, Database, WifiOff, Cpu, ArrowRight, Thermometer, Zap, ScanLine, FileSearch, Code2, Presentation, Lock, Gauge, IndianRupee, Users, Leaf, TrendingUp } from 'lucide-react'
import { useSession } from '../lib/session'
import { Badge, Button, Card, CardHeader, Dot, FileIcon, PageHeader, Progress, Stat } from '../components/ui'
import { DOCS, GPU, HISTORY, MODELS, ROLE_META } from '../data/mock'
import type { PageId } from '../components/Shell'

function seed(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    t: `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
    gpu: Math.round(35 + 30 * Math.sin(i / 3) + Math.random() * 18),
    req: Math.round(20 + 14 * Math.sin(i / 2.4 + 1) + Math.random() * 10),
  }))
}

const TASK_MIX = [
  { name: 'Document / RAG', value: 42, c: '#818cf8' },
  { name: 'Vision / OCR', value: 23, c: '#a78bfa' },
  { name: 'Coding', value: 21, c: '#fb923c' },
  { name: 'Reasoning', value: 14, c: '#22d3ee' },
]

const RECENT = [
  { icon: ScanLine, t: 'Extract P&ID tag list', who: 'R. Sharma', model: 'Qwen3-VL', time: '2 min ago', ok: true },
  { icon: FileSearch, t: 'P-101 maintenance summary', who: 'A. Iyer', model: 'Qwen3-14B', time: '18 min ago', ok: true },
  { icon: Code2, t: 'HX-301 efficiency analysis', who: 'R. Sharma', model: 'Qwen3-Coder', time: '41 min ago', ok: true },
  { icon: Presentation, t: 'Hot work toolbox talk', who: 'S. Khan', model: 'Qwen3-14B', time: '1 h ago', ok: true },
  { icon: FileSearch, t: 'Compare vendor quotes (valves)', who: 'P. Nair', model: 'Qwen3-14B', time: '2 h ago', ok: false },
]

export function Dashboard({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [data, setData] = useState(() => seed(24))
  const [util, setUtil] = useState(64)
  const { user } = useSession()

  useEffect(() => {
    const t = setInterval(() => {
      setUtil(Math.round(52 + Math.random() * 30))
      setData((d) => {
        const last = d[d.length - 1]
        const i = d.length
        return [...d.slice(1), { t: last.t, gpu: Math.round(35 + 30 * Math.sin(i / 3 + Date.now() / 9e5) + Math.random() * 18), req: Math.round(20 + Math.random() * 24) }]
      })
    }, 2500)
    return () => clearInterval(t)
  }, [])

  const loaded = MODELS.filter((m) => m.status === 'loaded')
  const vramUsed = loaded.reduce((a, m) => a + m.vram, 0)

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`${greet()}, ${user.name.split(" ")[0]}`}
        subtitle="Everything is running on-premise. Here is what your AI workbench has been doing today."
        right={
          <Button onClick={() => onNavigate('workbench')}>
            <Bot size={16} /> New agent task
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Agent tasks today" value="148" sub={<span><span className="text-emerald-400">↑ 23%</span> vs yesterday</span>} icon={<Bot size={17} />} />
        <Stat label="Documents indexed" value="12,406" sub={`${DOCS.length} added this week · 38.2K chunks`} icon={<Database size={17} />} accent="cyan" />
        <Stat label="Hours saved (est.)" value="96.5" sub="based on manual task baselines" icon={<Zap size={17} />} accent="amber" />
        <Stat label="External egress" value={<span className="text-emerald-300">0 B</span>} sub="Air-gap verified continuously" icon={<WifiOff size={17} />} accent="emerald" />
      </div>

      <ImpactStrip />

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="GPU utilisation & request load"
            subtitle={`${GPU.name} · ${GPU.host}`}
            icon={<Activity size={16} />}
            right={
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-400" /> GPU %</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Requests</span>
              </div>
            }
          />
          <div className="h-64 px-2 pb-3 xl:h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#818cf8" stopOpacity={0.45} />
                    <stop offset="1" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="1" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0c1120', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="gpu" stroke="#818cf8" strokeWidth={2} fill="url(#g1)" isAnimationActive={false} />
                <Area type="monotone" dataKey="req" stroke="#22d3ee" strokeWidth={2} fill="url(#g2)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="GPU node health" subtitle="Live telemetry" icon={<Cpu size={16} />} right={<Badge tone="emerald"><Dot pulse /> healthy</Badge>} />
          <div className="space-y-4 px-5 pb-5">
            <div>
              <div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-400">Compute utilisation</span><span className="font-mono text-white">{util}%</span></div>
              <Progress value={util} />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-400">VRAM allocated</span><span className="font-mono text-white">{vramUsed.toFixed(1)} / {GPU.vramTotal} GB</span></div>
              <Progress value={(vramUsed / GPU.vramTotal) * 100} tone="cyan" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { l: 'Temp', v: '61°C', i: Thermometer },
                { l: 'Power', v: '182 W', i: Zap },
                { l: 'Queue', v: '2', i: Activity },
              ].map((x) => (
                <div key={x.l} className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.05]">
                  <x.i size={14} className="text-slate-500" />
                  <div className="mt-1.5 font-mono text-sm text-white">{x.v}</div>
                  <div className="text-[11px] text-slate-500">{x.l}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.05] pt-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Loaded models</div>
              <div className="space-y-2">
                {loaded.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <Dot />
                    <span className="flex-1 truncate text-slate-300">{m.name}</span>
                    <Badge tone={ROLE_META[m.role].tone}>{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Task mix (auto-routed)" subtitle="Last 7 days · 1,026 tasks" icon={<Bot size={16} />} />
          <div className="flex items-center gap-4 px-5 pb-5">
            <div className="relative h-40 w-40 shrink-0">
              <PieChart width={160} height={160}>
                <Pie data={TASK_MIX} dataKey="value" cx={80} cy={80} innerRadius={50} outerRadius={72} paddingAngle={3} stroke="none" isAnimationActive={false}>
                  {TASK_MIX.map((d) => (
                    <Cell key={d.name} fill={d.c} />
                  ))}
                </Pie>
              </PieChart>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-mono text-lg font-semibold text-white">1,026</div>
                  <div className="text-[10px] text-slate-500">tasks</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {TASK_MIX.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.c }} />
                  <span className="flex-1 text-slate-300">{d.name}</span>
                  <span className="font-mono text-slate-400">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent agent runs"
            subtitle="Across your team"
            icon={<Activity size={16} />}
            right={
              <button onClick={() => onNavigate('workbench')} className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
                Open <ArrowRight size={12} />
              </button>
            }
          />
          <div className="space-y-1 px-3 pb-3">
            {RECENT.map((r) => (
              <div key={r.t} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.03]">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-slate-400 ring-1 ring-white/[0.06]">
                  <r.icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-slate-200">{r.t}</div>
                  <div className="text-[11px] text-slate-500">{r.who} · {r.model} · {r.time}</div>
                </div>
                {r.ok ? <Badge tone="emerald">done</Badge> : <Badge tone="amber">review</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Latest deliverables"
            subtitle="Generated on-premise"
            icon={<FileIcon kind="docx" size="sm" />}
            right={
              <button onClick={() => onNavigate('deliverables')} className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200">
                View all <ArrowRight size={12} />
              </button>
            }
          />
          <div className="space-y-1 px-3 pb-3">
            {HISTORY.slice(0, 5).map((d) => (
              <div key={d.name} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.03]">
                <FileIcon kind={d.kind} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-slate-200">{d.name}</div>
                  <div className="text-[11px] text-slate-500">{d.size} · {d.created}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const IMPACT = [
  { i: Lock, t: 'Security & Sovereignty', v: '0 B', s: 'confidential data sent outside · 12,406 docs protected', c: 'text-indigo-300 bg-indigo-500/10 ring-indigo-400/20' },
  { i: Gauge, t: 'Productivity', v: '96.5 h', s: 'engineering hours saved today · 4.1× faster reports', c: 'text-emerald-300 bg-emerald-500/10 ring-emerald-400/20' },
  { i: IndianRupee, t: 'Economic', v: '₹4.2 L', s: 'cloud AI/API fees avoided this month', c: 'text-amber-300 bg-amber-500/10 ring-amber-400/20' },
  { i: Users, t: 'Social & Workforce', v: '61', s: 'staff onboarded · 1,380 SOP questions answered', c: 'text-violet-300 bg-violet-500/10 ring-violet-400/20' },
  { i: Leaf, t: 'Environmental', v: '3,120', s: 'paper pages digitised · 18 site trips avoided', c: 'text-teal-300 bg-teal-500/10 ring-teal-400/20' },
]

export function ImpactStrip() {
  return (
    <Card className="mt-4">
      <CardHeader title="Impact this month" subtitle="Measured from usage logs against manual baselines" icon={<TrendingUp size={16} />} />
      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-5">
        {IMPACT.map((x) => (
          <div key={x.t} className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.05]">
            <div className={`grid h-8 w-8 place-items-center rounded-lg ring-1 ${x.c}`}>
              <x.i size={15} />
            </div>
            <div className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">{x.t}</div>
            <div className="mt-0.5 text-2xl font-semibold text-white">{x.v}</div>
            <div className="mt-0.5 text-[11.5px] leading-snug text-slate-400">{x.s}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
