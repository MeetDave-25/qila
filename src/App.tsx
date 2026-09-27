import { useState } from 'react'
import { Shell, type PageId } from './components/Shell'
import { SessionProvider, type User } from './lib/session'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Workbench } from './pages/Workbench'
import { Knowledge } from './pages/Knowledge'
import { Models } from './pages/Models'
import { Sandbox } from './pages/Sandbox'
import { Deliverables } from './pages/Deliverables'
import { Security } from './pages/Security'
import { Architecture } from './pages/Architecture'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<PageId>('dashboard')

  if (!user) return <Login onLogin={setUser} />

  return (
    <SessionProvider
      user={user}
      onLogout={() => {
        setUser(null)
        setPage('dashboard')
      }}
    >
      <Shell page={page} onNavigate={setPage}>
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'workbench' && <Workbench />}
        {page === 'knowledge' && <Knowledge />}
        {page === 'models' && <Models />}
        {page === 'sandbox' && <Sandbox />}
        {page === 'deliverables' && <Deliverables />}
        {page === 'security' && <Security />}
        {page === 'architecture' && <Architecture onNavigate={setPage} />}
      </Shell>
    </SessionProvider>
  )
}
