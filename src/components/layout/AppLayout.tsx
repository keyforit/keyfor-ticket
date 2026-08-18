import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { DebugPanel } from './DebugPanel'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <TopNav />
      <DebugPanel />
      <main className="min-h-[calc(100vh-3rem)]">
        <Outlet />
      </main>
    </div>
  )
}
