import type { ReactNode } from 'react'
import {
  User,
  MonitorSmartphone,
  Bot,
  Route,
  Wrench,
  Database,
  ShieldCheck,
  FileOutput,
  Lock,
  Globe,
  CheckCircle2,
  Boxes,
  ArrowDown,
  Ban,
} from 'lucide-react'
import { Badge, Card, CardHeader, cn, Dot, PageHeader } from '../components/ui'
import type { PageId } from '../components/Shell'

function Node({
  icon,
  title,
  sub,
  chips,
  tone = 'indigo',
  latency,
  onClick,
  className,
}: {
  icon: ReactNode
  title: string
  sub: string
  chips?: { l: string; c?: string }[]
  tone?: 'indigo' | 'violet' | 'emerald' | 'rose' | 'cyan' | 'orange'
  latency?: string
  onClick?: () => void
  className?: string
}) {
  const t = {
    indigo: 'from-indigo-500/15 ring-indigo-400/25 text-indigo-300',
    violet: 'from-violet-500/15 ring-violet-400/25 text-violet-300',
    emerald: 'from-emerald-500/15 ring-emerald-400/25 text-emerald-300',
    rose: 'from-rose-500/15 ring-rose-400/25 text-rose-300',
    cyan: 'from-cyan-500/15 ring-cyan-400/25 text-cyan-300',
    orange: 'from-orange-500/15 ring-orange-400/25 text-orange-300',
  }[tone]
  return (
    <button
      onClick={onClick}
      className={cn('group relative flex flex-col rounded-2xl bg-gradient-to-b to-ink-900/80 p-4 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40', t, className)}
    >
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">{title}</div>
          <div className="truncate text-[11px] text-slate-400">{sub}</div>
        </div>
        <Dot pulse />
      </div>
      {chips && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c.l} className={cn('rounded-md px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset', c.c ?? 'bg-white/[0.04] text-slate-300 ring-white/10')}>
              {c.l}
            </span>
          ))}
        </div>
      )}
      {latency && <div className="mt-2 font-mono text-[10px] text-slate-500">p50 {latency}</div>}
    </button>
  )
}

const H = ({ className }: { className?: string }) => (
  <div className={cn('hidden items-center lg:flex', className)}>
    <div className="flow-x w-full" />
  </div>
)
const V = ({ className }: { className?: string }) => (
  <div className={cn('flex justify-center', className)}>
    <div className="flow-y h-6" />
  </div>
)

const STEPS = [
  { n: 1, t: 'Requirement Analysis', d: 'Use cases, data, security, hardware' },
  { n: 2, t: 'Infrastructure Setup', d: 'OS, Docker, GPU drivers, model runtime' },
  { n: 3, t: 'Model Deployment', d: 'LLM, vision, coding and embedding models' },
  { n: 4, t: 'Document Intelligence', d: 'OCR, parsing, multimodal' },
  { n: 5, t: 'Knowledge Base', d: 'Ingestion, embeddings, Qdrant' },
  { n: 6, t: 'Agent Layer', d: 'Planner, tools, verification' },
  { n: 7, t: 'Deliverables', d: 'DOCX, XLSX, PPTX, PDF' },
  { n: 8, t: 'Testing & Security', d: 'Functional tests, model routing, air-gap validation' },
]

const STACK = [
  ['Frontend', 'React 19 · TypeScript · Tailwind CSS'],
  ['Backend', 'FastAPI · Python 3.12'],
  ['Agent framework', 'LangGraph / custom orchestrator'],
  ['Model runtime', 'vLLM 0.9 · Ollama 0.6'],
  ['Models (open-weight)', 'Qwen3 · Qwen3-Coder · Qwen3-VL · Qwen3-Embedding'],
  ['OCR & documents', 'PaddleOCR-VL · PyMuPDF'],
  ['File generation', 'python-docx · openpyxl · python-pptx'],
  ['Databases', 'PostgreSQL 16 (relational) · Qdrant 1.12 (vector)'],
  ['Sandbox & security', 'Docker (isolated) · nftables firewall · RBAC'],
  ['Hardware', 'On-prem GPU server, 24–32 GB VRAM'],
]

export function Architecture({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="System Map"
        subtitle="Live view of every QILA component inside the on-premise boundary. Click any block to open it."
        right={
          <Badge tone="emerald" className="!px-3 !py-1.5 !text-xs">
            <Dot pulse /> 11 / 11 services healthy
          </Badge>
        }
      />

      <Card className="relative overflow-hidden p-4 sm:p-6">
        <div className="grid-bg absolute inset-0 opacity-50" />
        {/* Internet (outside) */}
        <div className="relative mb-4 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/[0.07] px-3 py-2 text-xs text-rose-200 ring-1 ring-rose-500/25">
            <Globe size={15} className="text-rose-300" /> Internet / Cloud AI APIs
            <Ban size={14} className="text-rose-400" />
            <span className="font-mono text-rose-300">0 connections</span>
          </div>
        </div>

        {/* On-prem boundary */}
        <div className="relative rounded-2xl border-2 border-dashed border-emerald-500/30 bg-ink-950/40 p-4 sm:p-6">
          <div className="absolute -top-3 left-6 flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
            <Lock size={11} /> On-premise · air-gapped boundary
          </div>

          {/* Row 1 */}
          <div className="grid items-center gap-3 lg:grid-cols-[1fr_40px_1.3fr_40px_1.5fr]">
            <Node icon={<User size={16} />} title="Users" sub="Engineers · Operators · Admins" chips={[{ l: 'LDAP / SSO' }, { l: 'RBAC' }]} tone="cyan" />
            <H />
            <Node icon={<MonitorSmartphone size={16} />} title="QILA Web Workbench" sub="Chat · Files · Tasks · Outputs" chips={[{ l: 'React' }, { l: 'FastAPI' }]} latency="38 ms" onClick={() => onNavigate('workbench')} />
            <H />
            <Node
              icon={<Bot size={16} />}
              title="Agent Orchestrator"
              sub="Plan → Act → Verify loop"
              chips={[{ l: 'LangGraph' }, { l: 'max 12 steps' }, { l: 'tool allow-list' }]}
              tone="violet"
              latency="1.2 s / step"
              onClick={() => onNavigate('workbench')}
            />
          </div>

          <V className="my-2" />

          {/* Row 2 */}
          <div className="grid gap-3 lg:grid-cols-3">
            <Node
              icon={<Route size={16} />}
              title="Model Router"
              sub="Selects the right model per task"
              chips={[
                { l: 'General LLM', c: 'bg-indigo-500/15 text-indigo-200 ring-indigo-400/30' },
                { l: 'Coding LLM', c: 'bg-orange-500/15 text-orange-200 ring-orange-400/30' },
                { l: 'Vision LLM', c: 'bg-violet-500/15 text-violet-200 ring-violet-400/30' },
                { l: 'Embedding', c: 'bg-cyan-500/15 text-cyan-200 ring-cyan-400/30' },
              ]}
              latency="11 ms"
              onClick={() => onNavigate('models')}
            />
            <Node
              icon={<Wrench size={16} />}
              title="Tools & Sandbox"
              sub="Local tools for execution"
              chips={[{ l: 'File tools' }, { l: 'Python sandbox' }, { l: 'Excel tool' }, { l: 'Word/PPT' }, { l: 'Calculator' }]}
              tone="orange"
              latency="0.74 s"
              onClick={() => onNavigate('sandbox')}
            />
            <Node
              icon={<Database size={16} />}
              title="Knowledge Base (RAG)"
              sub="Company docs · Qdrant + PostgreSQL"
              chips={[{ l: 'SOPs' }, { l: 'Manuals' }, { l: 'Reports' }, { l: 'Past correspondence' }]}
              tone="rose"
              latency="38 ms"
              onClick={() => onNavigate('knowledge')}
            />
          </div>

          <V className="my-2" />

          {/* Row 3 */}
          <div className="grid items-center gap-3 lg:grid-cols-[1fr_40px_1fr]">
            <Node
              icon={<ShieldCheck size={16} />}
              title="Verification Layer"
              sub="Check output · validate sources · ensure accuracy"
              chips={[{ l: 'citation check' }, { l: 'recompute numbers' }, { l: 'human review' }]}
              tone="violet"
              onClick={() => onNavigate('workbench')}
            />
            <H />
            <Node
              icon={<FileOutput size={16} />}
              title="Output Generator"
              sub="Real, editable files"
              chips={[
                { l: 'DOCX', c: 'bg-blue-500/15 text-blue-200 ring-blue-400/30' },
                { l: 'XLSX', c: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/30' },
                { l: 'PPTX', c: 'bg-orange-500/15 text-orange-200 ring-orange-400/30' },
                { l: 'PDF', c: 'bg-rose-500/15 text-rose-200 ring-rose-400/30' },
                { l: 'Code', c: 'bg-sky-500/15 text-sky-200 ring-sky-400/30' },
              ]}
              tone="emerald"
              onClick={() => onNavigate('deliverables')}
            />
          </div>

          <V className="my-2" />

          {/* Row 4 */}
          <button onClick={() => onNavigate('security')} className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-emerald-500/[0.07] px-4 py-3.5 ring-1 ring-emerald-500/25 transition hover:bg-emerald-500/[0.1]">
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Lock size={16} /> Security & Monitoring
            </span>
            {['Air-gap', 'RBAC', 'Egress control', 'Audit logs', 'No external calls'].map((x) => (
              <span key={x} className="flex items-center gap-1.5 text-xs text-slate-300">
                <CheckCircle2 size={13} className="text-emerald-400" /> {x}
              </span>
            ))}
          </button>

          {/* Infra row */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { t: 'GPU Server Cluster', s: 'gpu-node-01 · RTX A5000 32 GB', i: Boxes },
              { t: 'Secure Vector Database', s: 'Qdrant · 38.2K chunks · encrypted', i: Database },
              { t: 'Local Document Ingest & OCR', s: 'PaddleOCR-VL · PyMuPDF', i: FileOutput },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5 ring-1 ring-white/[0.06]">
                <x.i size={16} className="text-slate-400" />
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-slate-200">{x.t}</div>
                  <div className="truncate text-[11px] text-slate-500">{x.s}</div>
                </div>
                <Dot pulse />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Methodology & implementation" subtitle="Deployment pipeline status for this site" icon={<CheckCircle2 size={16} />} />
          <div className="grid gap-2 px-5 pb-5 sm:grid-cols-2">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">{s.n}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-100">{s.t}</div>
                  <div className="truncate text-[11px] text-slate-500">{s.d}</div>
                </div>
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title="Technology stack" subtitle="100% open-source, runs offline" icon={<Boxes size={16} />} />
          <div className="px-5 pb-5">
            {STACK.map(([k, v]) => (
              <div key={k} className="flex gap-3 border-b border-white/[0.04] py-2 text-[12.5px] last:border-0">
                <span className="w-36 shrink-0 text-slate-500">{k}</span>
                <span className="text-slate-200">{v}</span>
              </div>
            ))}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <ArrowDown size={12} /> All images and weights installed from an offline bundle with verified checksums
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
