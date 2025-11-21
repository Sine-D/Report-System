'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar({ onLogout }) {
  const pathname = usePathname();
  async function handleLogout() {
    try {
      if (onLogout) {
        await onLogout();
        return;
      }
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/auth/Login';
    } catch {
      window.location.href = '/auth/Login';
    }
  }

  const navItems = [
    { href: "/Stock", label: "Stock", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { href: "/GRN", label: "GRN", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c.943 0 1.833.37 2.5 1.037A3.536 3.536 0 0115.537 11c0 .943-.37 1.833-1.037 2.5A3.536 3.536 0 0112 14.537 3.536 3.536 0 019.5 13.5 3.536 3.536 0 018.463 11c0-.943.37-1.833 1.037-2.5A3.536 3.536 0 0112 8zm0-6l5 5h-3a2 2 0 01-2-2V2zM6 19a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2v1m3 6l-3 3m0 0l-3-3m3 3V10" />
      </svg>
    )},
    { href: "/Invoice", label: "Invoice", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { href: "/Reports/DailySummary", label: "Reports", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
      </svg>
    )},
    { href: "/Add", label: "Add Items", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )},
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-5 border-b">
          <div className="flex items-center gap-2">
            <Image src="/globallogo.png" alt="Global POS" width={28} height={28} />
            <span className="font-semibold text-gray-800">GLOBAL POS</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <span className={`shrink-0 ${active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t">
          <button onClick={handleLogout} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#b23b3b] text-white hover:bg-[#8a0c03] transition-colors">
            <Image src="/logout.png" alt="logout" width={18} height={18} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 max-w-[25%] ${active ? 'text-green-600' : 'text-gray-600'}`}
              >
                <span className={`shrink-0 ${active ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}


