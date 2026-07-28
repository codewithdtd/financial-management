import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Layout from "./components/Layout";
import TransactionForm from "./components/TransactionForm";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import { getCategories, getStoredToken, logoutUser, type Category, type FinanceType } from "./api";
import { X } from "lucide-react";

export default function App(): ReactNode {
  // Lazy initialization reads localStorage once when App first mounts.
  const [token, setToken] = useState(() => getStoredToken());
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] = useState<FinanceType>("expense");
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLoginSuccess(newToken: string): void {
    setToken(newToken);
  }

  function handleLogout() {
    logoutUser();
    setToken(null);
    setAuthView("login");
  }

  function openTransactionForm(type: FinanceType): void {
    setTransactionType(type);
    setFormOpen(true);
  }

  function handleTransactionSaved() {
    setRefreshKey((current) => current + 1);
    // Keep the modal mounted briefly so the success animation is visible.
    window.setTimeout(() => setFormOpen(false), 1800);
  }

  function handleCategoryCreated(category: Category): void {
    setCategories((current) => [...current, category]);
  }

  // App owns shared Category data and passes it into the form as props.
  useEffect(() => {
    if (!token) {
      setCategories([]);
      return;
    }
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, [token]);

  // Conditional rendering is a simple protected-route alternative.  No token
  // means the dashboard tree is not rendered at all.
  if (!token) {
    return authView === "login" ? (
      <Login onLoginSuccess={handleLoginSuccess} onShowRegister={() => setAuthView("register")} />
    ) : (
      <Register onRegistered={() => setAuthView("login")} onShowLogin={() => setAuthView("login")} />
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <Dashboard refreshKey={refreshKey} onAddTransaction={openTransactionForm} />
      {formOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Thêm giao dịch">
          <div className="max-h-[92vh] w-full overflow-y-auto sm:max-w-lg">
            <div className="flex justify-end pb-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700" aria-label="Đóng"><X size={20} /></button></div>
            <TransactionForm categories={categories} initialType={transactionType} onCategoryCreated={handleCategoryCreated} onSaved={handleTransactionSaved} onClose={() => setFormOpen(false)} />
          </div>
        </div>
      )}
      <div className="hidden">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
        <p className="text-sm font-medium text-cyan-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Tổng quan tài chính</h1>
      </section>
      </div>
    </Layout>
  );
}
