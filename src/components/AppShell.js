'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/auth/Login'

  return (
    <div className={`min-h-screen ${isLogin ? '' : 'md:pl-64'} bg-gray-100`}>
      {!isLogin && <Sidebar />}
      <main className={`min-h-screen ${isLogin ? '' : 'pb-16 md:pb-0'}`}>
        {children}
      </main>
    </div>
  )
}


