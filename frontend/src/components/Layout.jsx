import { useState } from "react";
import { BarChart3, LayoutDashboard, LogOut, Menu, WalletCards, X } from "lucide-react";

export default function Layout({ children, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden" aria-label="Mở menu">
            <Menu onClick={() => setMenuOpen(true)} size={20} />
          </button>
          <WalletCards className="text-cyan-300" size={22} />
          <span className="font-semibold">Finance OS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">Personal Finance</span>
          <button type="button" onClick={onLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-rose-300" title="Đăng xuất">
            <LogOut size={17} /> <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <button type="button" onClick={closeMenu} className="absolute inset-0 bg-slate-950/70" aria-label="Close menu" />
          <aside className="relative h-full w-[min(19rem,85vw)] border-r border-slate-800 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-semibold text-slate-100">Navigation</span>
              <button type="button" onClick={closeMenu} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800" aria-label="Close menu"><X size={20} /></button>
            </div>
            <nav className="space-y-2">
              <a href="#dashboard" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300"><LayoutDashboard size={18} /> Dashboard</a>
              <a href="#transactions" onClick={closeMenu} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100"><BarChart3 size={18} /> Transactions</a>
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/70 p-4 lg:block">
          <nav aria-label="Điều hướng chính" className="space-y-2">
            <a href="#dashboard" className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300">
              <LayoutDashboard size={18} /> Dashboard
            </a>
            <a href="#transactions" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100">
              <BarChart3 size={18} /> Transactions
            </a>
          </nav>
        </aside>

        <main id="dashboard" className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
