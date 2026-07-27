import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, X } from "lucide-react";
import { createTransaction, getApiErrorMessage, getWallets, type Category, type FinanceType, type Wallet } from "../api";

interface TransactionFormProps {
  categories?: Category[];
  initialType?: FinanceType;
  onSaved?: () => void;
  onClose: () => void;
}

interface FormState {
  amount: string;
  type: FinanceType;
  wallet_id: string;
  category_id: string;
  description: string;
}

const blank: FormState = { amount: "", type: "expense", wallet_id: "", category_id: "", description: "" };

export default function TransactionForm({ categories = [], initialType = "expense", onSaved, onClose }: TransactionFormProps) {
  const [form, setForm] = useState<FormState>({ ...blank, type: initialType });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getWallets().then(setWallets).catch(() => setError("Could not load wallets."));
  }, []);

  useEffect(() => {
    setForm((current) => ({ ...current, type: initialType, category_id: "" }));
  }, [initialType]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(false), 1800);
    return () => window.clearTimeout(timer);
  }, [success]);

  const visibleCategories = useMemo(() => categories.filter((category) => category.type === form.type), [categories, form.type]);

  function change(name: keyof FormState, value: string): void {
    setForm((current) => ({ ...current, [name]: value, ...(name === "type" ? { category_id: "" } : {}) }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) { setError("Amount must be greater than zero."); return; }
    if (!form.wallet_id || !form.category_id) { setError("Please choose a wallet and category."); return; }
    setSaving(true);
    try {
      await createTransaction({ amount: Number(form.amount), type: form.type, description: form.description.trim() || null, wallet_id: Number(form.wallet_id), category_id: Number(form.category_id) });
      setForm((current) => ({ ...blank, wallet_id: current.wallet_id, category_id: current.category_id }));
      setSuccess(true);
      onSaved?.();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save transaction."));
    } finally {
      setSaving(false);
    }
  }

  return <section className="relative rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">New transaction</p><h2 className="mt-1 text-xl font-bold">Add money movement</h2></div><button type="button" onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700" aria-label="Close"><X size={19} /></button></div>{error && <p className="mb-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}<form className="space-y-4" onSubmit={submit}><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => change("type", "expense")} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold ${form.type === "expense" ? "border-rose-400 bg-rose-400/10 text-rose-300" : "border-slate-700 text-slate-400"}`}><ArrowDownLeft size={18} /> Expense</button><button type="button" onClick={() => change("type", "income")} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold ${form.type === "income" ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-slate-700 text-slate-400"}`}><ArrowUpRight size={18} /> Income</button></div><label className="block text-sm text-slate-300">Amount<input required min="0.01" step="0.01" name="amount" type="number" value={form.amount} onChange={(event) => change("amount", event.target.value)} placeholder="0.00" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg outline-none focus:border-cyan-400" /></label><label className="block text-sm text-slate-300">Wallet<div className="mt-2 flex gap-2 overflow-x-auto pb-1">{wallets.map((wallet) => <button type="button" key={wallet.id} onClick={() => change("wallet_id", String(wallet.id))} className={`shrink-0 rounded-2xl border px-4 py-3 text-left text-sm ${form.wallet_id === String(wallet.id) ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-slate-700 text-slate-400"}`}><span className="block font-semibold">{wallet.name}</span><span className="text-xs">{wallet.balance}</span></button>)}</div></label><label className="block text-sm text-slate-300">Category<div className="mt-2 flex flex-wrap gap-2">{visibleCategories.map((category) => <button type="button" key={category.id} onClick={() => change("category_id", String(category.id))} className={`rounded-full border px-4 py-2 text-sm ${form.category_id === String(category.id) ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-slate-700 text-slate-400"}`}>{category.name}</button>)}</div></label><label className="block text-sm text-slate-300">Note<input name="description" value={form.description} onChange={(event) => change("description", event.target.value)} maxLength={255} placeholder="Optional note" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400" /></label><button disabled={saving} className="w-full rounded-2xl bg-cyan-400 px-4 py-3.5 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{saving ? "Saving..." : "Save transaction"}</button></form>{success && <div role="status" className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="w-full max-w-xs rounded-3xl bg-slate-900 px-6 py-8 text-center shadow-2xl"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-slate-950"><Check size={42} strokeWidth={3} /></div><p className="mt-4 text-lg font-bold text-emerald-300">Saved successfully</p><p className="mt-1 text-sm text-slate-400">Your transaction was recorded.</p></div></div>}</section>;
}
