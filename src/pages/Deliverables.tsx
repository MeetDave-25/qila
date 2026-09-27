import { useState } from 'react'
import { Download, Eye, LayoutGrid, List } from 'lucide-react'
import { Badge, Card, cn, FileIcon, PageHeader } from '../components/ui'
import { HISTORY, type Deliverable } from '../data/mock'
import { PreviewModal } from '../components/PreviewModal'
import { useExport } from '../lib/session'

const FILTERS = ['all', 'docx', 'xlsx', 'pptx', 'pdf', 'py'] as const

export function Deliverables() {
  const [f, setF] = useState<(typeof FILTERS)[number]>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [preview, setPreview] = useState<Deliverable | null>(null)
  const download = useExport()
  const items = HISTORY.filter((d) => f === 'all' || d.kind === f)

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Deliverables" subtitle="Real Word, Excel, PowerPoint and code files produced by agents — versioned, hashed and audit-logged." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition',
              f === x ? 'bg-indigo-500/20 text-indigo-200 ring-indigo-400/30' : 'text-slate-400 ring-white/[0.06] hover:bg-white/[0.04]',
            )}
          >
            {x === 'all' ? 'All files' : `.${x}`}
          </button>
        ))}
        <div className="ml-auto flex rounded-lg p-0.5 ring-1 ring-white/[0.06]">
          {(['grid', 'list'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn('grid h-7 w-8 place-items-center rounded-md', view === v ? 'bg-white/[0.08] text-white' : 'text-slate-500')}>
              {v === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((d) => (
            <Card key={d.name} className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-indigo-400/25">
              <button onClick={() => setPreview(d)} className="grid-bg relative block h-36 w-full overflow-hidden border-b border-white/[0.05] bg-ink-850/60">
                <Thumb d={d} />
                <div className="absolute inset-0 grid place-items-center bg-ink-950/60 opacity-0 transition group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur">
                    <Eye size={14} /> Preview
                  </span>
                </div>
              </button>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <FileIcon kind={d.kind} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-100">{d.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {d.size} · {d.created} · {d.by}
                    </div>
                  </div>
                  <button onClick={() => download(d)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-white/[0.06] hover:text-white">
                    <Download size={14} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>{d.task}</Badge>
                  <Badge tone="indigo">{d.model.split('-').slice(0, 2).join('-')}</Badge>
                  {d.created === 'Today' && <Badge tone="emerald">verified</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-white/[0.05] text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">File</th>
                <th className="hidden px-3 py-3 font-medium md:table-cell">Task</th>
                <th className="hidden px-3 py-3 font-medium lg:table-cell">Model</th>
                <th className="px-3 py-3 font-medium">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.name} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <FileIcon kind={d.kind} size="sm" />
                      <div>
                        <div className="text-slate-200">{d.name}</div>
                        <div className="text-[11px] text-slate-500">{d.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-slate-400 md:table-cell">{d.task}</td>
                  <td className="hidden px-3 py-3 text-slate-400 lg:table-cell">{d.model}</td>
                  <td className="px-3 py-3 text-slate-400">
                    {d.created} · {d.by}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setPreview(d)} className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => download(d)} className="rounded-md p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white">
                      <Download size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <PreviewModal d={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

function Thumb({ d }: { d: Deliverable }) {
  const p = d.preview
  const base = 'absolute left-1/2 top-5 w-[78%] -translate-x-1/2 rounded-md bg-white shadow-2xl shadow-black/50 transition group-hover:scale-[1.03]'
  if (p.type === 'sheet')
    return (
      <div className={cn(base, 'overflow-hidden')}>
        <div className="h-3 bg-emerald-700" />
        {p.rows.slice(0, 6).map((r, i) => (
          <div key={i} className="flex border-b border-slate-200">
            {r.slice(0, 5).map((_, j) => (
              <div key={j} className={cn('h-3.5 flex-1 border-r border-slate-200', i === 0 && 'bg-slate-100')} />
            ))}
          </div>
        ))}
      </div>
    )
  if (p.type === 'slides')
    return (
      <div className={cn(base, 'aspect-video p-3')}>
        <div className="absolute inset-y-0 left-0 w-1 rounded-l-md bg-orange-500" />
        <div className="h-2 w-2/3 rounded bg-slate-800" />
        <div className="mt-2 space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1 w-1/2 rounded bg-slate-300" />
          ))}
        </div>
      </div>
    )
  if (p.type === 'code')
    return (
      <div className={cn(base, '!bg-ink-950 p-2.5 text-left ring-1 ring-white/10')}>
        {p.code
          .split('\n')
          .slice(0, 9)
          .map((l, i) => (
            <div key={i} className="truncate font-mono text-[6px] leading-[9px] text-slate-400">
              {l || ' '}
            </div>
          ))}
      </div>
    )
  return (
    <div className={cn(base, 'h-40 p-3')}>
      <div className="h-0.5 w-6 bg-blue-700" />
      <div className="mt-1 h-2 w-3/4 rounded bg-slate-800" />
      <div className="mt-2 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
        ))}
      </div>
    </div>
  )
}
