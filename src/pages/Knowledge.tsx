import { useMemo, useRef, useState } from 'react'
import { UploadCloud, Search, ScanLine, Layers, Binary, DatabaseZap, CheckCircle2, Loader2, PenLine, Filter, Sparkles } from 'lucide-react'
import { Badge, Card, CardHeader, cn, FileIcon, PageHeader, Progress, Stat } from '../components/ui'
import { DOCS, type KDoc } from '../data/mock'
import { useSession } from '../lib/session'

const PIPE = [
  { l: 'Upload', i: UploadCloud },
  { l: 'OCR / Vision', i: ScanLine },
  { l: 'Chunking', i: Layers },
  { l: 'Embedding', i: Binary },
  { l: 'Indexed', i: DatabaseZap },
]

const CATS = ['All', 'SOP', 'Manual', 'Report', 'Drawing', 'Correspondence'] as const

const SEARCH_RESULTS = [
  { doc: 'SOP-OPS-042_Pump_Startup.pdf', loc: 'p. 5 · §5.2', score: 0.91, text: 'Verify seal flush flow is established (≥ 4 L/min) before starting the pump. Record reading in the startup checklist.' },
  { doc: 'Centrifugal_Pump_OEM_Manual.pdf', loc: 'p. 88', score: 0.86, text: 'Mechanical seal failures are most often caused by dry running at start-up or insufficient flush.' },
  { doc: 'P-101_Maintenance_Log_Aug2026.pdf', loc: 'p. 7 (handwritten)', score: 0.78, text: '12/08 — seal leak DE side. Flush line found partially choked. Cleaned & restarted.' },
]

/* A simplified P&ID sketch with detected-tag overlays */
function PidViewer() {
  const tags = [
    { x: 64, y: 80, t: 'V-2041' },
    { x: 196, y: 58, t: 'FT-2051' },
    { x: 318, y: 117, t: 'CV-2043' },
    { x: 250, y: 184, t: 'PSV-2045' },
    { x: 96, y: 186, t: 'PT-2053' },
    { x: 380, y: 58, t: 'TT-2052' },
  ]
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#f7f5ee] ring-1 ring-black/20">
      <svg viewBox="0 0 460 250" className="block w-full">
        <defs>
          <pattern id="paper" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="#e6e2d4" strokeWidth=".5" />
          </pattern>
        </defs>
        <rect width="460" height="250" fill="url(#paper)" />
        <g stroke="#1e293b" strokeWidth="1.6" fill="none">
          {/* main line */}
          <path d="M20 80 H250 V130 H440" />
          <path d="M250 130 V200 H60 V80" strokeDasharray="0" />
          {/* HX */}
          <rect x="220" y="110" width="60" height="40" rx="20" fill="#f7f5ee" />
          <path d="M226 120 L274 140 M226 140 L274 120" strokeWidth="1" />
          {/* pump */}
          <circle cx="60" cy="200" r="14" fill="#f7f5ee" />
          <path d="M60 186 L74 200 L60 214" strokeWidth="1.2" />
          {/* valves */}
          <path d="M56 72 L72 88 M56 88 L72 72" />
          <path d="M310 122 L326 138 M310 138 L326 122" />
          <path d="M318 122 V104" />
          <rect x="310" y="96" width="16" height="8" fill="#f7f5ee" />
          {/* instruments */}
          <circle cx="196" cy="58" r="11" fill="#f7f5ee" />
          <path d="M196 69 V80" strokeDasharray="3 2" />
          <circle cx="380" cy="58" r="11" fill="#f7f5ee" />
          <path d="M380 69 V130" strokeDasharray="3 2" />
          <circle cx="96" cy="186" r="11" fill="#f7f5ee" />
          <path d="M250 150 V176" />
          <path d="M242 176 H258 L250 190 Z" fill="#f7f5ee" />
        </g>
        <g fontFamily="monospace" fontSize="7" fill="#1e293b" textAnchor="middle">
          <text x="196" y="56">FT</text>
          <text x="196" y="63">2051</text>
          <text x="380" y="56">TT</text>
          <text x="380" y="63">2052</text>
          <text x="96" y="184">PT</text>
          <text x="96" y="191">2053</text>
          <text x="250" y="162">HX-301</text>
          <text x="60" y="228">P-101</text>
          <text x="130" y="76">6"-CW-2041-CS</text>
          <text x="400" y="244" fontSize="6">PID-204 · SHEET 1/3 · REV C</text>
        </g>
        {tags.map((t) => (
          <g key={t.t}>
            <rect x={t.x - 18} y={t.y - 16} width="36" height="32" rx="3" fill="rgba(99,102,241,.08)" stroke="#6366f1" strokeWidth="1.2" />
            <rect x={t.x - 18} y={t.y - 25} width={t.t.length * 5 + 6} height="9" rx="2" fill="#6366f1" />
            <text x={t.x - 15} y={t.y - 18.5} fontSize="6.5" fill="white" fontFamily="monospace">
              {t.t}
            </text>
          </g>
        ))}
      </svg>
      <div className="scanline" />
    </div>
  )
}

const NOTE_LINES = [
  { raw: '14/09  Night shift - R. Kumar', text: '14/09 Night shift — R. Kumar', conf: 0.93 },
  { raw: 'P-101 vib. high ~7.1 mm/s → maint.', text: 'P-101 vibration high ≈ 7.1 mm/s, informed maintenance', conf: 0.88, key: true },
  { raw: 'HX-301 out temp 46°C (norm 41)', text: 'HX-301 outlet temperature 46 °C (normal 41 °C)', conf: 0.9, key: true },
  { raw: 'CV-2043 hunting - manual 40%', text: 'CV-2043 hunting — switched to manual at 40 %', conf: 0.86, key: true },
  { raw: 'Handed over to A shift @ 06:00', text: 'Handed over to A shift at 06:00', conf: 0.92 },
]

function HandwritingViewer() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative overflow-hidden rounded-xl bg-[#fdfbf3] p-5 shadow-inner ring-1 ring-black/20" style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 31px, #c7d2fe 31px 32px)', backgroundPositionY: '20px' }}>
        <div className="absolute inset-y-0 left-10 w-px bg-rose-300" />
        <div className="handwriting relative pl-8 text-[13.5px] leading-[32px] text-[#1e3a8a]" style={{ transform: 'rotate(-0.6deg)' }}>
          {NOTE_LINES.map((l, i) => (
            <div key={i} className={cn('truncate whitespace-nowrap px-1', l.key && 'rounded bg-violet-500/10 outline outline-1 -outline-offset-4 outline-violet-500/50')}>
              {l.raw}
            </div>
          ))}
        </div>
        <div className="scanline" />
      </div>
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Recognised text → structured events</div>
        {NOTE_LINES.map((l, i) => (
          <div key={i} className={cn('rounded-lg p-2.5 ring-1', l.key ? 'bg-violet-500/[0.07] ring-violet-400/25' : 'bg-white/[0.02] ring-white/[0.05]')}>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 text-xs text-slate-200">{l.text}</span>
              <span className={cn('font-mono text-[10px]', l.conf < 0.88 ? 'text-amber-300' : 'text-emerald-300')}>{l.conf.toFixed(2)}</span>
            </div>
            {l.key && (
              <div className="mt-1.5 flex gap-1">
                <Badge tone="violet">equipment event</Badge>
                <Badge>linked: {l.text.split(' ')[0]}</Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Knowledge() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('All')
  const [docs, setDocs] = useState<KDoc[]>(DOCS)
  const [ingest, setIngest] = useState<{ name: string; stage: number; pct: number } | null>(null)
  const [q, setQ] = useState('What causes seal failure on P-101 at start-up?')
  const [searched, setSearched] = useState(true)
  const [drag, setDrag] = useState(false)
  const [vtab, setVtab] = useState<'pid' | 'hand'>('pid')
  const { can, toast, user } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const list = useMemo(() => (cat === 'All' ? docs : docs.filter((d) => d.category === cat)), [cat, docs])

  function runIngest(name: string) {
    if (ingest) return
    if (!can('upload')) {
      toast('Upload blocked by RBAC', 'deny', `Role "${user.role}" cannot add documents.`)
      return
    }
    let stage = 0
    let pct = 0
    setIngest({ name, stage, pct })
    const t = setInterval(() => {
      pct += 7 + Math.random() * 9
      if (pct >= 100) {
        pct = 0
        stage++
      }
      if (stage >= PIPE.length - 1) {
        clearInterval(t)
        setIngest({ name, stage: PIPE.length - 1, pct: 100 })
        const kind = name.toLowerCase().endsWith('.docx') ? 'docx' : name.toLowerCase().match(/\.(png|jpg|jpeg)$/) ? 'png' : 'pdf'
        setDocs((d) => [
          { id: `n${Date.now()}`, name, kind, category: 'Report', pages: 6, chunks: 44, ocr: true, added: '2026-09-27', owner: 'You' },
          ...d,
        ])
        toast(`${name} indexed`, 'ok', 'OCR → chunked → embedded locally · 44 chunks')
        setTimeout(() => setIngest(null), 2200)
        return
      }
      setIngest({ name, stage, pct: Math.min(pct, 100) })
    }, 120)
  }

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Knowledge Base" subtitle="Company SOPs, manuals, drawings and correspondence — parsed, embedded and searchable entirely on-premise." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Documents" value="12,406" sub="PDF · DOCX · images · CSV" icon={<Layers size={17} />} />
        <Stat label="Vector chunks" value="38.2K" sub="Qdrant · 1024-dim · HNSW" icon={<Binary size={17} />} accent="cyan" />
        <Stat label="OCR'd pages" value="4,871" sub="incl. 612 handwritten" icon={<ScanLine size={17} />} accent="amber" />
        <Stat label="Retrieval hit-rate" value="94.1%" sub="top-5 · weekly eval set" icon={<Sparkles size={17} />} accent="emerald" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        {/* Upload + pipeline */}
        <Card className="xl:col-span-2">
          <CardHeader title="Ingest documents" subtitle="Local OCR + embedding pipeline" icon={<UploadCloud size={16} />} />
          <div className="px-5 pb-5">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) runIngest(f.name)
                e.target.value = ''
              }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDrag(true)
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDrag(false)
                const f = e.dataTransfer.files?.[0]
                runIngest(f ? f.name : 'Scanned_Document.pdf')
              }}
              className={cn(
                'grid-bg flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition',
                drag ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15 hover:border-indigo-400/50 hover:bg-white/[0.02]',
              )}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30">
                <UploadCloud size={22} />
              </div>
              <div className="mt-3 text-sm font-medium text-slate-200">Drop files or click to upload</div>
              <div className="mt-1 text-xs text-slate-500">Scanned PDFs, P&IDs, handwritten notes, DOCX, XLSX, images</div>
              <div className="mt-2 text-[11px] text-emerald-400/80">Files never leave this server</div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              {PIPE.map((p, i) => {
                const s = !ingest ? 'idle' : ingest.stage > i || (ingest.stage === i && ingest.pct >= 100) ? 'done' : ingest.stage === i ? 'active' : 'idle'
                return (
                  <div key={p.l} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'grid h-9 w-9 place-items-center rounded-xl ring-1 transition',
                          s === 'done' && 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
                          s === 'active' && 'bg-indigo-500/25 text-indigo-200 ring-indigo-400/50',
                          s === 'idle' && 'bg-white/[0.03] text-slate-600 ring-white/[0.06]',
                        )}
                      >
                        {s === 'active' ? <Loader2 size={15} className="animate-spin" /> : s === 'done' ? <CheckCircle2 size={15} /> : <p.i size={15} />}
                      </div>
                      <span className="text-center text-[10px] text-slate-500">{p.l}</span>
                    </div>
                    {i < PIPE.length - 1 && <div className={cn('mx-1 mb-5 h-px flex-1', ingest && ingest.stage > i ? 'bg-emerald-500/40' : 'bg-white/10')} />}
                  </div>
                )
              })}
            </div>
            {!ingest && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { k: 'OCR engine', v: 'PaddleOCR-VL' },
                  { k: 'PDF parser', v: 'PyMuPDF' },
                  { k: 'Embeddings', v: 'Qwen3-Embedding' },
                  { k: 'Vector store', v: 'Qdrant (local)' },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.05]">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{x.k}</div>
                    <div className="text-xs font-medium text-slate-200">{x.v}</div>
                  </div>
                ))}
              </div>
            )}
            {ingest && (
              <div className="fade-up mt-3 rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="truncate text-slate-300">{ingest.name}</span>
                  <span className="text-slate-500">{ingest.stage >= PIPE.length - 1 ? 'Indexed ✓' : PIPE[ingest.stage].l}</span>
                </div>
                <Progress value={((ingest.stage + ingest.pct / 100) / (PIPE.length - 1)) * 100} tone={ingest.stage >= PIPE.length - 1 ? 'emerald' : 'indigo'} />
              </div>
            )}
          </div>
        </Card>

        {/* Vision preview */}
        <Card className="xl:col-span-3">
          <CardHeader
            title={vtab === 'pid' ? 'Vision parsing · PID-204_Cooling_Water_Loop.pdf' : 'Handwriting OCR · Shift_Handover_Notes_Wk37.png'}
            subtitle={vtab === 'pid' ? 'PaddleOCR-VL + Qwen3-VL · 16 symbols detected · confidence 0.95' : 'PaddleOCR-VL handwriting model · 38 lines · confidence 0.89'}
            icon={<ScanLine size={16} />}
            right={
              <div className="flex rounded-lg p-0.5 ring-1 ring-white/[0.08]">
                {(
                  [
                    ['pid', 'P&ID drawing'],
                    ['hand', 'Handwritten'],
                  ] as const
                ).map(([k, l]) => (
                  <button key={k} onClick={() => setVtab(k)} className={cn('rounded-md px-2.5 py-1 text-xs transition', vtab === k ? 'bg-violet-500/20 text-violet-200' : 'text-slate-400 hover:text-white')}>
                    {l}
                  </button>
                ))}
              </div>
            }
          />
          <div className="px-5 pb-5">
            {vtab === 'pid' ? (
              <>
                <PidViewer />
                <div className="mt-3 flex flex-wrap gap-2">
                  {['6 valves', '4 instruments', '1 heat exchanger', '1 pump', '9 line numbers'].map((x) => (
                    <Badge key={x} tone="indigo">{x}</Badge>
                  ))}
                </div>
              </>
            ) : (
              <HandwritingViewer />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        {/* Docs table */}
        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader
            title="Indexed documents"
            subtitle={`${list.length} shown`}
            icon={<Filter size={16} />}
            right={
              <div className="hidden gap-1 md:flex">
                {CATS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={cn('rounded-md px-2 py-1 text-xs transition', cat === c ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-400 hover:bg-white/[0.05]')}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-y border-white/[0.05] text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 text-right font-medium">Pages</th>
                  <th className="px-3 py-2.5 text-right font-medium">Chunks</th>
                  <th className="px-3 py-2.5 font-medium">Processing</th>
                  <th className="px-5 py-2.5 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id} className="fade-up border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <FileIcon kind={d.kind} size="sm" />
                        <span className="max-w-[260px] truncate text-slate-200">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge>{d.category}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-400">{d.pages}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-400">{d.chunks}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {d.ocr && <Badge tone="violet"><ScanLine size={10} /> OCR</Badge>}
                        {d.handwritten && <Badge tone="amber"><PenLine size={10} /> Handwritten</Badge>}
                        {!d.ocr && <Badge tone="emerald">Native text</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-slate-400">{d.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Search */}
        <Card className="xl:col-span-2">
          <CardHeader title="Test retrieval" subtitle="Hybrid search: BM25 + dense vectors + reranker" icon={<Search size={16} />} />
          <div className="px-5 pb-5">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSearched(false)
                setTimeout(() => setSearched(true), 650)
              }}
              className="relative"
            >
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-lg bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-slate-200 ring-1 ring-white/[0.08] outline-none focus:ring-indigo-500/50"
              />
            </form>
            <div className="mt-2 text-[11px] text-slate-500">3 results · 38 ms · Qwen3-Embedding-0.6B</div>
            <div className="mt-3 space-y-2.5">
              {searched
                ? SEARCH_RESULTS.map((r, i) => (
                    <div key={r.doc} className="fade-up rounded-lg bg-white/[0.02] p-3 ring-1 ring-white/[0.06]" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium text-slate-200">{r.doc}</span>
                        <span className="ml-auto font-mono text-[11px] text-emerald-300">{r.score.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{r.loc}</div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{r.text}</p>
                      <Progress value={r.score * 100} tone="emerald" className="mt-2 !h-1" />
                    </div>
                  ))
                : [0, 1, 2].map((i) => <div key={i} className="shimmer h-24 rounded-lg bg-white/[0.02]" />)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
