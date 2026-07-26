import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import TransactionForm from "./components/TransactionForm";
import Login from "./components/Login";
import Register from "./components/Register";
import { getCategories, getStoredToken, logoutUser } from "./api";

export default function App() {
  // Lazy initialization reads localStorage once when App first mounts.
  const [token, setToken] = useState(() => getStoredToken());
  const [authView, setAuthView] = useState("login");
  const [categories, setCategories] = useState([]);

  function handleLoginSuccess(newToken) {
    setToken(newToken);
  }

  function handleLogout() {
    logoutUser();
    setToken(null);
    setAuthView("login");
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
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <TransactionForm categories={categories} onSaved={() => {}} />
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm font-medium text-cyan-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Tổng quan tài chính</h1>
      </section>
      </div>
    </Layout>
  );
}
