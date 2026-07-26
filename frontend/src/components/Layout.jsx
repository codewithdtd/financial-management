import { useState } from "react";
import { BarChart3, LayoutDashboard, LogOut, Menu, Moon, Sun, WalletCards, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Layout({ children, onLogout }) {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }

  function toggleLanguage() {
    const nextLanguage = i18n.language === "en" ? "vi" : "en";
    localStorage.setItem("language", nextLanguage);
    i18n.changeLanguage(nextLanguage);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="relative flex min-h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3"><button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden" aria-label={t("openMenu")}><Menu size={20} /></button><WalletCards className="text-cyan-300" size={22} /><span className="text-sm font-semibold sm:text-base">{t("appName")}</span></div>
        <div className="flex items-center gap-1"><button type="button" onClick={toggleLanguage} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-cyan-300" title={t("toggleLanguage")}>{i18n.language === "en" ? "VI" : "EN"}</button><button type="button" onClick={toggleTheme} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-300" title={theme === "dark" ? t("switchToLight") : t("switchToDark")} aria-label={t("toggleLanguage")}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button><button type="button" onClick={onLogout} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-rose-300" title={t("logout")}><LogOut size={17} /><span className="hidden sm:inline">{t("logout")}</span></button></div>
      </header>

      {menuOpen && <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={t("navigation")}><button type="button" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-slate-950/70" aria-label={t("close")} /><aside className="relative h-full w-[min(19rem,85vw)] border-r border-slate-800 bg-slate-900 p-4 shadow-2xl"><div className="mb-8 flex items-center justify-between"><span className="font-semibold">{t("navigation")}</span><button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800" aria-label={t("close")}><X size={20} /></button></div><nav className="space-y-2"><a href="#dashboard" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300"><LayoutDashboard size={18} /> {t("dashboard")}</a><a href="#transactions" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800"><BarChart3 size={18} /> {t("transactions")}</a></nav></aside></div>}

      <div className="flex min-h-[calc(100vh-4rem)]"><aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/70 p-4 lg:block"><nav className="space-y-2"><a href="#dashboard" className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-300"><LayoutDashboard size={18} /> {t("dashboard")}</a><a href="#transactions" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800"><BarChart3 size={18} /> {t("transactions")}</a></nav></aside><main id="dashboard" className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">{children}</div></main></div>
    </div>
  );
}
