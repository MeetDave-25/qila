import type { ReactNode } from 'react'
import { FileSpreadsheet, FileText, Presentation, FileCode2, FileImage, File, Castle } from 'lucide-react'

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('glass', className)}>{children}</div>
}

export function CardHeader({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-indigo-300 ring-1 ring-white/10">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

const tones = {
  slate: 'bg-slate-500/10 text-slate-300 ring-slate-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/25',
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/25',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/25',
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/25',
  orange: 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
} as const
export type Tone = keyof typeof tones

export function Badge({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Dot({ tone = 'emerald', pulse }: { tone?: 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan'; pulse?: boolean }) {
  const c = { emerald: 'bg-emerald-400', amber: 'bg-amber-400', rose: 'bg-rose-400', slate: 'bg-slate-500', cyan: 'bg-cyan-400' }[tone]
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', c)} />}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', c)} />
    </span>
  )
}

export function Progress({ value, className, tone = 'indigo' }: { value: number; className?: string; tone?: 'indigo' | 'emerald' | 'amber' | 'cyan' }) {
  const g = {
    indigo: 'from-indigo-500 to-violet-400',
    emerald: 'from-emerald-500 to-teal-300',
    amber: 'from-amber-500 to-orange-300',
    cyan: 'from-cyan-500 to-sky-300',
  }[tone]
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]', className)}>
      <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', g)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  className?: string
  disabled?: boolean
}) {
  const v = {
    primary:
      'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-indigo-500 ring-1 ring-inset ring-white/15',
    ghost: 'text-slate-300 hover:bg-white/[0.05] hover:text-white',
    outline: 'text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.05] bg-white/[0.02]',
  }[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
        v,
        className,
      )}
    >
      {children}
    </button>
  )
}

export type FileKind = 'docx' | 'xlsx' | 'pptx' | 'pdf' | 'py' | 'png' | 'csv'

export function FileIcon({ kind, size = 'md' }: { kind: FileKind; size?: 'sm' | 'md' | 'lg' }) {
  const map: Record<FileKind, { I: typeof File; c: string }> = {
    docx: { I: FileText, c: 'from-blue-500 to-blue-700' },
    xlsx: { I: FileSpreadsheet, c: 'from-emerald-500 to-green-700' },
    pptx: { I: Presentation, c: 'from-orange-500 to-red-600' },
    pdf: { I: FileText, c: 'from-rose-500 to-rose-700' },
    py: { I: FileCode2, c: 'from-sky-500 to-indigo-600' },
    png: { I: FileImage, c: 'from-fuchsia-500 to-purple-700' },
    csv: { I: FileSpreadsheet, c: 'from-teal-500 to-cyan-700' },
  }
  const { I, c } = map[kind]
  const s = { sm: 'h-7 w-7 rounded-md', md: 'h-10 w-10 rounded-lg', lg: 'h-14 w-14 rounded-xl' }[size]
  const is = { sm: 14, md: 18, lg: 26 }[size]
  return (
    <div className={cn('grid shrink-0 place-items-center bg-gradient-to-br text-white shadow-lg shadow-black/30', s, c)}>
      <I size={is} strokeWidth={2} />
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  icon,
  accent = 'indigo',
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon: ReactNode
  accent?: 'indigo' | 'emerald' | 'cyan' | 'amber'
}) {
  const a = {
    indigo: 'from-indigo-500/20 text-indigo-300',
    emerald: 'from-emerald-500/20 text-emerald-300',
    cyan: 'from-cyan-500/20 text-cyan-300',
    amber: 'from-amber-500/20 text-amber-300',
  }[accent]
  return (
    <Card className="relative overflow-hidden p-5">
      <div className={cn('pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl', a)} />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <div className={cn('grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br to-white/[0.02] ring-1 ring-white/10', a)}>{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </Card>
  )
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {right}
    </div>
  )
}

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-14 w-14 rounded-2xl' : 'h-10 w-10 rounded-xl'
  const inner = size === 'lg' ? 'rounded-[14px]' : 'rounded-[10px]'
  return (
    <div className={cn('relative grid shrink-0 place-items-center bg-gradient-to-br from-saffron via-indigo-500 to-indgreen p-[1.5px] shadow-lg shadow-indigo-950/60', box)}>
      <div className={cn('grid h-full w-full place-items-center bg-ink-900', inner)}>
        <Castle size={size === 'lg' ? 28 : 20} className="text-white" strokeWidth={1.8} />
      </div>
    </div>
  )
}
