import { useState } from 'react'
import {
  Container,
  FolderOpen,
  FileCode2,
  FileSpreadsheet,
  Presentation,
  Calculator,
  ScanLine,
  Search,
  FileText,
  Globe,
  Play,
  Loader2,
  Lock,
  Cpu,
  Timer,
  WifiOff,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader, cn, PageHeader, Stat, type Tone } from '../components/ui'
import { useSession } from '../lib/session'

const TOOLS: { name: string; id: string; icon: typeof Globe; desc: string; scope: string; risk: 'low' | 'medium' | 'high'; approval: boolean; enabled: boolean; calls: number }[] = [
  { name: 'File tools', id: 'fs.read / fs.write', icon: FolderOpen, desc: 'Read the knowledge base and write to /deliverables only', scope: 'scoped paths', risk: 'medium', approval: false, enabled: true, calls: 1840 },
  { name: 'Python sandbox', id: 'python.sandbox', icon: FileCode2, desc: 'Run generated code in an isolated container', scope: 'no network', risk: 'medium', approval: false, enabled: true, calls: 214 },
  { name: 'Excel tool', id: 'excel.write', icon: FileSpreadsheet, desc: 'Create XLSX files with openpyxl, including formulas and formatting', scope: '/deliverables', risk: 'low', approval: false, enabled: true, calls: 96 },
  { name: 'Word / PPT generator', id: 'docx.write · pptx.write', icon: Presentation, desc: 'Create reports and decks from plant templates', scope: '/deliverables', risk: 'low', approval: false, enabled: true, calls: 131 },
  { name: 'PDF exporter', id: 'pdf.export', icon: FileText, desc: 'Convert to archival PDF/A with a signature block', scope: '/deliverables', risk: 'low', approval: false, enabled: true, calls: 58 },
  { name: 'Calculator', id: 'calc.evaluate', icon: Calculator, desc: 'Exact arithmetic and unit conversion, so the LLM never guesses numbers', scope: 'pure', risk: 'low', approval: false, enabled: true, calls: 702 },
  { name: 'OCR / Vision', id: 'ocr.paddle_vl', icon: ScanLine, desc: 'PaddleOCR-VL + Qwen3-VL for scans, handwriting and P&IDs', scope: 'read-only', risk: 'low', approval: false, enabled: true, calls: 388 },
  { name: 'Knowledge search', id: 'rag.hybrid_search', icon: Search, desc: 'BM25 + vector search over Qdrant with a reranker', scope: 'read-only', risk: 'low', approval: false, enabled: true, calls: 2911 },
  { name: 'Web / HTTP access', id: 'http.*', icon: Globe, desc: 'Permanently disabled in air-gapped mode', scope: 'blocked', risk: 'high', approval: true, enabled: false, calls: 0 },
]

const RISK_TONE: Record<string, Tone> = { low: 'emerald', medium: 'amber', high: 'rose' }

const PRESETS: { label: string; code: string; out: string[]; err?: boolean }[] = [
  {
    label: 'Pump power calc',
    code: `# Hydraulic power of pump P-101
rho, g = 998, 9.81        # kg/m³, m/s²
Q = 180 / 3600            # m³/s
H = 62                    # m head
eff = 0.74
P = rho * g * Q * H / eff / 1000
print(f"Shaft power: {P:.1f} kW")`,
    out: ['Shaft power: 41.0 kW'],
  },
  {
    label: 'Pandas analysis',
    code: `import pandas as pd
df = pd.read_csv('/kb/HX-301_Sensor_Readings_Sep.csv')
print(df.shape)
print(df[['T_hot_in_C','T_cold_out_C']].mean().round(1))`,
    out: ['(720, 7)', 'T_hot_in_C      84.6', 'T_cold_out_C    41.2', 'dtype: float64'],
  },
  {
    label: 'Try internet access',
    code: `import requests
requests.get("https://pypi.org/simple/numpy")`,
    out: [
      'Traceback (most recent call last):',
      '  File "<sandbox>", line 2, in <module>',
      "requests.exceptions.ConnectionError: Failed to resolve 'pypi.org'",
      '[policy] container started with --network=none → egress impossible',
    ],
    err: true,
  },
]

const HISTORY = [
  { id: 'sbx-7f3a', task: 'HX-301 efficiency', user: 'r.sharma', dur: '0.92 s', exit: 0 },
  { id: 'sbx-7f39', task: 'HX-301 efficiency', user: 'r.sharma', dur: '0.61 s', exit: 1 },
  { id: 'sbx-7f31', task: 'P-101 reliability metrics', user: 'a.iyer', dur: '0.18 s', exit: 0 },
  { id: 'sbx-7f2c', task: 'Spare parts forecast', user: 'p.nair', dur: '2.40 s', exit: 0 },
  { id: 'sbx-7f22', task: 'Untrusted script (pip install)', user: 'sandbox', dur: '0.05 s', exit: 137 },
]

export function Sandbox() {
  const { can, toast, user } = useSession()
  const [preset, setPreset] = useState(0)
  const [code, setCode] = useState(PRESETS[0].code)
  const [out, setOut] = useState<{ lines: string[]; err?: boolean; boot: string[] } | null>(null)
  const [running, setRunning] = useState(false)

  const run = () => {
    if (!can('sandbox')) {
      toast('Sandbox blocked by RBAC', 'deny', `Role "${user.role}" cannot execute code.`)
      return
    }
    const p = PRESETS.find((x) => x.code === code)
    const netTry = /requests|urllib|socket|http/.test(code)
    const lines = p ? p.out : netTry ? PRESETS[2].out : ['Process finished (exit 0)']
    setRunning(true)
    setOut({ lines: [], boot: [] })
    const boot = ['▸ docker run --rm --network=none --read-only --cpus=2 -m 4g qila-sandbox:py3.12', '▸ seccomp profile: qila-strict · user: nobody · timeout 60s', '▸ container sbx-7f4b started in 312 ms']
    boot.forEach((b, i) => setTimeout(() => setOut((o) => o && { ...o, boot: [...o.boot, b] }), 250 * (i + 1)))
    setTimeout(() => {
      setOut({ boot, lines, err: p?.err || netTry })
      setRunning(false)
    }, 1300)
  }

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Tools & Sandbox" subtitle="Every local tool the agent can call, with least-privilege scopes, and the isolated container where generated code runs." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Registered tools" value="9" sub="8 enabled · 1 hard-disabled" icon={<Container size={17} />} />
        <Stat label="Sandbox runs (7d)" value="214" sub="98.1% exit 0 on first or second try" icon={<Terminal size={17} />} accent="cyan" />
        <Stat label="Avg. execution" value="0.74 s" sub="container cold start 312 ms" icon={<Timer size={17} />} accent="amber" />
        <Stat label="Sandbox network" value={<span className="text-emerald-300">none</span>} sub="--network=none on every run" icon={<WifiOff size={17} />} accent="emerald" />
      </div>

      {/* Tool registry */}
      <Card className="mt-4 overflow-hidden">
        <CardHeader title="Tool registry" subtitle="What the agent is allowed to do. Anything not listed here is impossible." icon={<ShieldCheck size={16} />} />
        <div className="grid gap-3 px-5 pb-5 md:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((t) => (
            <div key={t.id} className={cn('rounded-xl p-4 ring-1 transition', t.enabled ? 'bg-white/[0.02] ring-white/[0.06] hover:ring-indigo-400/25' : 'bg-rose-500/[0.04] ring-rose-500/20')}>
              <div className="flex items-start gap-3">
                <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1', t.enabled ? 'bg-indigo-500/10 text-indigo-300 ring-indigo-400/20' : 'bg-rose-500/10 text-rose-300 ring-rose-400/20')}>
                  <t.icon size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{t.name}</span>
                    {!t.enabled && <Lock size={12} className="text-rose-300" />}
                  </div>
                  <code className="font-mono text-[11px] text-cyan-300/80">{t.id}</code>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', t.enabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300')}>{t.enabled ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-400">{t.desc}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge tone={RISK_TONE[t.risk]}>risk: {t.risk}</Badge>
                <Badge>scope: {t.scope}</Badge>
                {t.approval && <Badge tone="violet">human approval</Badge>}
                <span className="ml-auto text-[10px] text-slate-500">{t.calls.toLocaleString()} calls</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        {/* Console */}
        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader
            title="Sandbox console"
            subtitle="Run code exactly the way the agent does"
            icon={<Terminal size={16} />}
            right={
              <div className="hidden gap-1 sm:flex">
                {PRESETS.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setPreset(i)
                      setCode(p.code)
                      setOut(null)
                    }}
                    className={cn('rounded-md px-2 py-1 text-xs transition', preset === i ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-400 hover:bg-white/[0.05]')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            }
          />
          <div className="px-5 pb-5">
            <div className="overflow-hidden rounded-xl bg-ink-950 ring-1 ring-white/[0.08]">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">main.py · python 3.12</span>
                <Button onClick={run} disabled={running} className="ml-auto !px-3 !py-1 !text-xs">
                  {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run
                </Button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={8}
                className="w-full resize-none bg-transparent p-4 font-mono text-[12.5px] leading-relaxed text-slate-200 outline-none"
              />
              <div className="min-h-[120px] border-t border-white/[0.06] bg-black/30 p-4 font-mono text-[12px] leading-relaxed">
                {!out && <span className="text-slate-600">Output will appear here…</span>}
                {out?.boot.map((b) => (
                  <div key={b} className="text-slate-500">
                    {b}
                  </div>
                ))}
                {out?.lines.map((l, i) => (
                  <div key={i} className={cn('fade-up', out.err ? (l.startsWith('[policy]') ? 'mt-1 text-emerald-300' : 'text-rose-300') : 'text-slate-100')}>
                    {l}
                  </div>
                ))}
                {out && !running && (
                  <div className={cn('mt-2 text-[11px]', out.err ? 'text-amber-300' : 'text-emerald-400')}>
                    {out.err ? '✗ exit 1 · attempt logged to audit trail' : '✓ exit 0 · container destroyed · 0 B egress'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader title="Container isolation" subtitle="Applied to every execution" icon={<Lock size={16} />} />
            <div className="grid grid-cols-2 gap-2 px-5 pb-5">
              {[
                ['Image', 'qila-sandbox:py3.12'],
                ['Network', 'none'],
                ['Filesystem', 'read-only + /tmp'],
                ['User', 'nobody (uid 65534)'],
                ['CPU / RAM', '2 cores · 4 GB'],
                ['Timeout', '60 s hard kill'],
                ['Syscalls', 'seccomp: qila-strict'],
                ['Packages', 'offline mirror only'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.05]">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                  <div className="truncate font-mono text-xs text-slate-200">{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Recent executions" icon={<Cpu size={16} />} />
            <div className="px-3 pb-3">
              {HISTORY.map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] hover:bg-white/[0.03]">
                  <code className="font-mono text-[11px] text-slate-500">{h.id}</code>
                  <span className="min-w-0 flex-1 truncate text-slate-300">{h.task}</span>
                  <span className="font-mono text-[11px] text-slate-500">{h.dur}</span>
                  <Badge tone={h.exit === 0 ? 'emerald' : h.exit === 137 ? 'rose' : 'amber'}>exit {h.exit}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
