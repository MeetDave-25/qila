import { useState } from 'react'
import { Fingerprint, Loader2, Lock, ShieldCheck, User as UserIcon, WifiOff, Cpu, FileCheck2, Route } from 'lucide-react'
import { Logo, cn, Dot } from '../components/ui'
import { DEMO_USERS, type User } from '../lib/session'

const FEATURES = [
  { i: WifiOff, t: 'Fully air-gapped', d: 'Runs on your own GPU server. Nothing leaves the plant network.' },
  { i: Route, t: 'Right model, every task', d: 'Qwen3, Qwen3-Coder and Qwen3-VL are auto-routed per task.' },
  { i: Cpu, t: 'Agents that act', d: 'The agent plans, uses local tools, runs code in a sandbox and verifies.' },
  { i: FileCheck2, t: 'Real deliverables', d: 'DOCX, XLSX, PPTX and PDF files with a full audit trail.' },
]

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [sel, setSel] = useState(0)
  const [pwd, setPwd] = useState('••••••••••')
  const [busy, setBusy] = useState(false)
  const u = DEMO_USERS[sel]

  const submit = () => {
    setBusy(true)
    setTimeout(() => onLogin(u), 900)
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-white/[0.06] lg:block">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-[100px]" />
        <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute right-24 top-10 h-40 w-40 rounded-full bg-saffron/10 blur-[80px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <div className="text-2xl font-bold tracking-[0.2em] text-white">QILA</div>
              <div className="text-xs text-slate-400">Sovereign On-Premise Agentic AI Workbench</div>
            </div>
          </div>

          <div>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.1] tracking-tight text-white">
              Your AI. <br />
              Your fort. <br />
              <span className="text-gradient">Zero leaks.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-400">
              Industrial-grade AI for P&IDs, reports, SOPs and code. It runs entirely inside your walls, on open-weight models you control.
            </p>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.t} className="glass !rounded-xl p-4">
                  <f.i size={18} className="text-indigo-300" />
                  <div className="mt-2 text-sm font-medium text-white">{f.t}</div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-400">{f.d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>SIH 2026 · PS 26117</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>Team Crew Infinity</span>
            <span className="ml-auto flex items-center gap-1.5 text-emerald-400/80">
              <Dot pulse /> gpu-node-01 online
            </span>
          </div>
        </div>
      </div>

      {/* Sign-in */}
      <div className="flex items-center justify-center p-6">
        <div className="fade-up w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo />
            <div className="text-xl font-bold tracking-[0.2em] text-white">QILA</div>
          </div>
          <h2 className="text-2xl font-semibold text-white">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">Use your plant directory (LDAP) account.</p>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Username</span>
              <div className="relative mt-1.5">
                <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input readOnly value={`${u.username}@plant.local`} className="w-full rounded-lg bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-slate-200 ring-1 ring-white/[0.08] outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Password</span>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  className="w-full rounded-lg bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-slate-200 ring-1 ring-white/[0.08] outline-none focus:ring-indigo-500/50"
                />
              </div>
            </label>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-slate-400">Demo account (role-based access)</div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map((d, i) => (
                <button
                  key={d.username}
                  onClick={() => setSel(i)}
                  className={cn(
                    'rounded-xl p-2.5 text-left ring-1 transition',
                    sel === i ? 'bg-indigo-500/15 ring-indigo-400/50' : 'bg-white/[0.02] ring-white/[0.08] hover:bg-white/[0.04]',
                  )}
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 text-[10px] font-bold text-white">{d.initials}</div>
                  <div className="mt-2 text-xs font-medium text-slate-200">{d.role}</div>
                  <div className="truncate text-[10px] text-slate-500">{d.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-900/50 ring-1 ring-inset ring-white/15 transition hover:from-indigo-400 disabled:opacity-70"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {busy ? 'Verifying with on-prem directory…' : 'Sign in securely'}
          </button>
          <button onClick={submit} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm text-slate-300 ring-1 ring-white/[0.08] hover:bg-white/[0.04]">
            <Fingerprint size={16} /> Smart-card / biometric
          </button>

          <div className="mt-8 flex items-start gap-2 rounded-lg bg-emerald-500/[0.06] p-3 text-[11.5px] leading-relaxed text-emerald-200/80 ring-1 ring-emerald-500/15">
            <WifiOff size={14} className="mt-0.5 shrink-0 text-emerald-400" />
            Authentication happens on this server. No cloud identity provider is contacted.
          </div>
        </div>
      </div>
    </div>
  )
}
