import { useState } from "react";
import { UserPlus, WalletCards } from "lucide-react";
import { registerUser } from "../api";

export default function Register({ onRegistered, onShowLogin }) {
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      await registerUser(form.email, form.password);
      onRegistered();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-7 text-center">
          <WalletCards className="mx-auto mb-3 text-cyan-300" size={32} />
          <h1 className="text-2xl font-bold text-slate-100">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-slate-400">Bắt đầu theo dõi tài chính của bạn</p>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-300">Email<input required type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400" /></label>
          <label className="block text-sm text-slate-300">Mật khẩu<input required type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400" /></label>
          <label className="block text-sm text-slate-300">Xác nhận mật khẩu<input required type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400" /></label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"><UserPlus size={18} />{loading ? "Đang đăng ký..." : "Đăng ký"}</button>
        </form>

        <button type="button" onClick={onShowLogin} className="mt-5 w-full text-center text-sm text-slate-400 hover:text-cyan-300">Đã có tài khoản? <span className="font-semibold">Đăng nhập</span></button>
      </section>
    </main>
  );
}
