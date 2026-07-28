import type { ReactNode } from "react";
import { BarChart3, LayoutDashboard, LogOut, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3"><WalletCards className="text-cyan-300" size={22} /><span className="text-sm font-semibold sm:text-base">{t("appName")}</span></div>
        <button type="button" onClick={onLogout} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300" title={t("logout")}><LogOut size={17} /><span>{t("logout")}</span></button>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/70 p-4 lg:block"><nav className="space-y-2"><a href="#dashboard" className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300"><LayoutDashboard size={18} /> {t("dashboard")}</a><a href="#transactions" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800"><BarChart3 size={18} /> {t("transactions")}</a></nav></aside>
        <main id="dashboard" className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">{children}</div></main>
      </div>
    </div>
  );
}
