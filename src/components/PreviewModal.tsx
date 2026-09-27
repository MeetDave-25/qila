import { useEffect } from 'react'
import { X, Download, ShieldCheck } from 'lucide-react'
import type { Deliverable } from '../data/mock'
import { Button, FileIcon } from './ui'
import { useExport } from '../lib/session'

export function PreviewBody({ d }: { d: Deliverable }) {
  const p = d.preview
  if (p.type === 'sheet')
    return (
      <div className="overflow-auto rounded-lg bg-white text-slate-800 ring-1 ring-black/10">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white">Sheet1</div>
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th className="w-8 border border-slate-200 bg-slate-100 text-[11px] text-slate-400" />
              {p.columns.map((c) => (
                <th key={c} className="whitespace-nowrap border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-left font-semibold text-slate-700">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r, i) => (
              <tr key={i} className="hover:bg-emerald-50">
                <td className="border border-slate-200 bg-slate-50 text-center text-[11px] text-slate-400">{i + 1}</td>
                {r.map((c, j) => {
                  const low = typeof c === 'number' && c < 0.92 && c <= 1 && p.columns[j].startsWith('Conf')
                  const warn = typeof c === 'string' && /fouling|watch/i.test(c)
                  return (
                    <td
                      key={j}
                      className={`whitespace-nowrap border border-slate-200 px-2.5 py-1.5 ${typeof c === 'number' ? 'text-right tabular-nums' : ''} ${low || warn ? 'bg-amber-100 font-medium text-amber-900' : ''}`}
                    >
                      {c}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  if (p.type === 'code')
    return (
      <pre className="max-h-[60vh] overflow-auto rounded-lg bg-ink-950 p-4 font-mono text-[12.5px] leading-relaxed text-slate-300 ring-1 ring-white/10">
        {p.code.split('\n').map((l, i) => (
          <div key={i} className="flex">
            <span className="mr-4 w-6 shrink-0 select-none text-right text-slate-600">{i + 1}</span>
            <span className={l.trim().startsWith('#') || l.trim().startsWith('"""') ? 'text-slate-500' : /^(import|from|def|return|if)\b/.test(l.trim()) ? 'text-violet-300' : ''}>{l || ' '}</span>
          </div>
        ))}
      </pre>
    )
  if (p.type === 'doc')
    return (
      <div className="max-h-[62vh] overflow-auto rounded-lg bg-slate-200 p-2 sm:p-8">
        <div className="mx-auto max-w-2xl bg-white px-5 py-6 text-slate-800 shadow-xl sm:px-12 sm:py-12">
          <div className={`mb-1 h-1 w-16 ${d.kind === 'pdf' ? 'bg-rose-600' : 'bg-blue-700'}`} />
          <h1 className="text-xl font-bold text-slate-900">{p.title}</h1>
          <p className="mt-1 text-xs text-slate-500">{p.meta}</p>
          {p.sections.map((s) => (
            <div key={s.h} className="mt-6">
              <h2 className={`text-sm font-bold ${d.kind === 'pdf' ? 'text-rose-800' : 'text-blue-800'}`}>{s.h}</h2>
              {s.p.map((t, i) => (
                <p key={i} className="mt-2 text-[13px] leading-relaxed">
                  {t}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  return (
    <div className="grid max-h-[62vh] gap-4 overflow-auto sm:grid-cols-2">
      {p.slides.map((s, i) => (
        <div key={i} className="relative aspect-video overflow-hidden rounded-lg bg-white p-5 text-slate-800 shadow-lg ring-1 ring-black/10">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-orange-500 to-red-600" />
          <div className="absolute right-3 top-2 text-[10px] text-slate-400">{i + 1}</div>
          <h3 className={i === 0 ? 'mt-6 text-lg font-bold text-slate-900' : 'text-sm font-bold text-slate-900'}>{s.title}</h3>
          <ul className="mt-3 space-y-1.5">
            {s.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-[12px] text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                {b}
              </li>
            ))}
          </ul>
          <div className="absolute bottom-2 left-5 text-[9px] font-medium uppercase tracking-wider text-slate-400">Refinery Unit-2 · Internal</div>
        </div>
      ))}
    </div>
  )
}

export function PreviewModal({ d, onClose }: { d: Deliverable | null; onClose: () => void }) {
  const exportFile = useExport()
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  if (!d) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div className="glass fade-up max-h-[94dvh] w-full max-w-4xl overflow-y-auto !bg-ink-900/95 p-3 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <FileIcon kind={d.kind} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-white">{d.name}</div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
              {d.size} · generated locally
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <ShieldCheck size={12} /> SHA-256 logged in audit trail
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => exportFile(d)}>
            <Download size={15} /> <span className="hidden sm:inline">Download</span>
          </Button>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white">
            <X size={18} />
          </button>
        </div>
        <PreviewBody d={d} />
      </div>
    </div>
  )
}
