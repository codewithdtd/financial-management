import { useEffect, useState, type ReactNode } from "react";
import Layout from "./components/Layout";
import TransactionForm from "./components/TransactionForm";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import { getCategories, getStoredToken, logoutUser, type Category, type FinanceType } from "./api";

export default function App(): ReactNode {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] = useState<FinanceType>("expense");
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLoginSuccess(newToken: string): void {
    setToken(newToken);
  }

  function handleLogout(): void {
    logoutUser();
    setToken(null);
    setAuthView("login");
    setFormOpen(false);
  }

  function openTransactionForm(type: FinanceType): void {
    setTransactionType(type);
    setFormOpen(true);
  }

  function handleTransactionSaved(): void {
    setRefreshKey((current) => current + 1);
    window.setTimeout(() => setFormOpen(false), 1800);
  }

  function handleCategoryCreated(category: Category): void {
    setCategories((current) => [...current, category]);
  }

  useEffect(() => {
    if (!token) {
      setCategories([]);
      return;
    }
    void getCategories().then(setCategories).catch(() => setCategories([]));
  }, [token]);

  useEffect(() => {
    const handleExpiredSession = (): void => {
      setToken(null);
      setAuthView("login");
      setFormOpen(false);
    };
    window.addEventListener("auth:logout", handleExpiredSession);
    return () => window.removeEventListener("auth:logout", handleExpiredSession);
  }, []);

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
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Add transaction">
          <div className="max-h-[92vh] w-full overflow-y-auto sm:max-w-lg">
            {/* TransactionForm owns the only close button for this modal. */}
            <TransactionForm categories={categories} initialType={transactionType} onCategoryCreated={handleCategoryCreated} onSaved={handleTransactionSaved} onClose={() => setFormOpen(false)} />
          </div>
        </div>
      )}
    </Layout>
  );
}
