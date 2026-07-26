import { useState, type ChangeEvent, type FormEvent } from "react";
import { UserPlus, WalletCards } from "lucide-react";
import { getApiErrorMessage, registerUser } from "../api";
import { useTranslation } from "react-i18next";

interface RegisterProps {
  onRegistered: () => void;
  onShowLogin: () => void;
}

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register({ onRegistered, onShowLogin }: RegisterProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterForm>({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function handleChange(event: ChangeEvent<HTMLInputElement>): void { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); setError(""); }
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> { event.preventDefault(); setError(""); if (form.password.length < 8) { setError(t("passwordLength")); return; } if (form.password !== form.confirmPassword) { setError(t("passwordsMismatch")); return; } setLoading(true); try { await registerUser(form.email, form.password); onRegistered(); } catch (requestError) { setError(getApiErrorMessage(requestError, t("registrationFailed"))); } finally { setLoading(false); } }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8"><section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8"><div className="mb-7 text-center"><WalletCards className="mx-auto mb-3 text-cyan-300" size={32} /><h1 className="text-2xl font-bold">{t("createYourAccount")}</h1><p className="mt-2 text-sm text-slate-400">{t("startTracking")}</p></div>{error && <p className="mb-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}<form className="space-y-4" onSubmit={handleSubmit}><label className="block text-sm text-slate-300">{t("email")}<input required type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400" /></label><label className="block text-sm text-slate-300">{t("password")}<input required type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400" /></label><label className="block text-sm text-slate-300">{t("confirmPassword")}<input required type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400" /></label><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"><UserPlus size={18} />{loading ? t("creatingAccount") : t("register")}</button></form><button type="button" onClick={onShowLogin} className="mt-5 w-full text-center text-sm text-slate-400 hover:text-cyan-300">{t("alreadyRegistered")} <span className="font-semibold">{t("login")}</span></button></section></main>;
}
