import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, ShieldX, Info } from 'lucide-react'
import type { Deliverable } from '../data/mock'
import { download } from './files'

export type Role = 'Admin' | 'Engineer' | 'Viewer'

export interface User {
  name: string
  initials: string
  title: string
  role: Role
  username: string
}

export const DEMO_USERS: User[] = [
  { name: 'Rohan Sharma', initials: 'RS', title: 'Process Engineer', role: 'Engineer', username: 'r.sharma' },
  { name: 'Anita Iyer', initials: 'AI', title: 'IT / AI Platform Admin', role: 'Admin', username: 'admin' },
  { name: 'Priya Nair', initials: 'PN', title: 'Procurement Analyst', role: 'Viewer', username: 'p.nair' },
]

type ToastTone = 'ok' | 'deny' | 'info'
interface Toast {
  id: number
  msg: string
  sub?: string
  tone: ToastTone
}

interface Session {
  user: User
  logout: () => void
  toast: (msg: string, tone?: ToastTone, sub?: string) => void
  can: (perm: 'export' | 'sandbox' | 'manageModels' | 'upload') => boolean
}

const Ctx = createContext<Session | null>(null)

const PERMS: Record<Role, string[]> = {
  Admin: ['export', 'sandbox', 'manageModels', 'upload'],
  Engineer: ['export', 'sandbox', 'upload'],
  Viewer: [],
}

export function SessionProvider({ user, onLogout, children }: { user: User; onLogout: () => void; children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, tone: ToastTone = 'ok', sub?: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, tone, sub }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const can = useCallback((p: 'export' | 'sandbox' | 'manageModels' | 'upload') => PERMS[user.role].includes(p), [user.role])

  return (
    <Ctx.Provider value={{ user, logout: onLogout, toast, can }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[340px] max-w-[calc(100vw-2.5rem)] flex-col gap-2">
        {toasts.map((t) => {
          const I = t.tone === 'ok' ? CheckCircle2 : t.tone === 'deny' ? ShieldX : Info
          const c = t.tone === 'ok' ? 'text-emerald-300 ring-emerald-500/25' : t.tone === 'deny' ? 'text-rose-300 ring-rose-500/30' : 'text-indigo-300 ring-indigo-500/25'
          return (
            <div key={t.id} className={`fade-up flex items-start gap-3 rounded-xl bg-ink-850/95 p-3.5 shadow-2xl shadow-black/60 ring-1 backdrop-blur-xl ${c}`}>
              <I size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-100">{t.msg}</div>
                {t.sub && <div className="mt-0.5 text-xs text-slate-400">{t.sub}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export function useSession() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSession outside SessionProvider')
  return s
}

/** Export a deliverable, enforcing RBAC and writing an audit toast. */
export function useExport() {
  const { can, toast, user } = useSession()
  return (d: Deliverable) => {
    if (!can('export')) {
      toast('Export blocked by RBAC', 'deny', `Role "${user.role}" cannot export files. Event written to audit log.`)
      return
    }
    download(d)
    toast(`Exported ${d.name}`, 'ok', 'SHA-256 recorded in audit trail')
  }
}
