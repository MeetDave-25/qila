import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  Bot,
  Database,
  Cpu,
  FolderOutput,
  ShieldCheck,
  Search,
  Bell,
  WifiOff,
  ChevronsUpDown,
  Server,
  Container,
  Workflow,
  LogOut,
  KeyRound,
} from 'lucide-react'
import { cn, Dot, Logo } from './ui'
import { GPU } from '../data/mock'
import { useSession } from '../lib/session'

export type PageId = 'dashboard' | 'workbench' | 'knowledge' | 'models' | 'sandbox' | 'deliverables' | 'security' | 'architecture'

const NAV: { group: string; items: { id: PageId; label: string; icon: typeof Bot; badge?: string }[] }[] = [
  {
    group: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'workbench', label: 'Agent Workbench', icon: Bot, badge: 'AI' },
      { id: 'knowledge', label: 'Knowledge Base', icon: Database },
      { id: 'deliverables', label: 'Deliverables', icon: FolderOutput },
    ],
  },
  {
    group: 'Platform',
    items: [
      { id: 'models', label: 'Model Router', icon: Cpu },
      { id: 'sandbox', label: 'Tools & Sandbox', icon: Container },
      { id: 'security', label: 'Air-Gap Security', icon: ShieldCheck },
      { id: 'architecture', label: 'System Map', icon: Workflow },
    ],
  },
]
const ALL = NAV.flatMap((g) => g.items)

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono tabular-nums">{now.toLocaleTimeString('en-GB')}</span>
}

function UserMenu() {
  const { user, logout } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [])
  const roleTone = { Admin: 'text-rose-300 bg-rose-500/10', Engineer: 'text-indigo-300 bg-indigo-500/10', Viewer: 'text-slate-300 bg-slate-500/15' }[user.role]
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-white/[0.04]">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold text-white">{user.initials}</div>
        <div className="hidden text-left leading-tight sm:block">
          <div className="text-xs font-medium text-slate-200">{user.name}</div>
          <div className="text-[11px] text-slate-500">{user.title}</div>
        </div>
      </button>
      {open && (
        <div className="glass fade-up absolute right-0 top-12 z-40 w-64 !bg-ink-850/95 p-2">
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-xs text-slate-500">{user.username}@plant.local</div>
            <span className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', roleTone)}>
              <KeyRound size={11} /> Role: {user.role}
            </span>
          </div>
          <div className="my-1 h-px bg-white/[0.06]" />
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Shell({ page, onNavigate, children }: { page: PageId; onNavigate: (p: PageId) => void; children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [page])
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo />
          <div>
            <div className="text-lg font-bold leading-none tracking-[0.18em] text-white">QILA</div>
            <div className="mt-1 whitespace-nowrap text-[10.5px] font-medium tracking-wide text-slate-500">Your AI. Your fort.</div>
          </div>
        </div>

        <button className="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 text-left ring-1 ring-white/[0.06] hover:bg-white/[0.05]">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-300">
            <Server size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-slate-200">Refinery Unit-2</div>
            <div className="truncate text-[11px] text-slate-500">{GPU.host}</div>
          </div>
          <ChevronsUpDown size={14} className="text-slate-500" />
        </button>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3">
          {NAV.map((g) => (
            <div key={g.group} className="space-y-0.5">
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{g.group}</p>
              {g.items.map((n) => {
                const active = page === n.id
                return (
                  <button
                    key={n.id}
                    onClick={() => onNavigate(n.id)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                      active ? 'bg-gradient-to-r from-indigo-500/15 to-transparent text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-indigo-400 shadow-[0_0_12px] shadow-indigo-400" />}
                    <n.icon size={17} className={active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.badge && <span className="rounded bg-gradient-to-r from-indigo-500 to-violet-500 px-1.5 py-px text-[10px] font-semibold text-white">{n.badge}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Air-gap card */}
        <button onClick={() => onNavigate('security')} className="m-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-4 text-left transition hover:border-emerald-400/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <WifiOff size={14} /> AIR-GAPPED MODE
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-white">0</span>
            <span className="text-xs text-slate-400">bytes external egress</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Verified <Clock />
          </div>
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-30 flex h-16 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-ink-900/40 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo />
            <select
              value={page}
              onChange={(e) => onNavigate(e.target.value as PageId)}
              className="rounded-lg bg-white/[0.04] px-2 py-1.5 text-sm text-slate-200 ring-1 ring-white/10"
            >
              {ALL.map((n) => (
                <option key={n.id} value={n.id} className="bg-ink-900">
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search documents, tags, SOPs, past answers…"
              onKeyDown={(e) => e.key === 'Enter' && onNavigate('knowledge')}
              className="w-full rounded-lg bg-white/[0.04] py-2 pl-9 pr-14 text-sm text-slate-200 placeholder:text-slate-500 ring-1 ring-white/[0.06] outline-none focus:ring-indigo-500/50"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">Ctrl K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20 sm:flex">
              <Dot pulse /> Offline · On-Prem
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 ring-1 ring-white/[0.06] xl:flex">
              <Cpu size={13} className="text-cyan-300" /> {GPU.name} · 25.1 / {GPU.vramTotal} GB
            </div>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </button>
            <UserMenu />
          </div>
        </header>
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
