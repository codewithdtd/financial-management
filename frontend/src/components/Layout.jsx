import { BarChart3, LayoutDashboard, Menu, WalletCards } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden" aria-label="Mở menu">
            <Menu size={20} />
          </button>
          <WalletCards className="text-cyan-300" size={22} />
          <span className="font-semibold">Finance OS</span>
        </div>
        <span className="text-sm text-slate-400">Personal Finance</span>
      </header>

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

        <main id="dashboard" className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
