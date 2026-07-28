import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, Plus, X } from "lucide-react";
import { createTransaction, getApiErrorMessage, type Category, type FinanceType } from "../api";
import CategoryForm from "./CategoryForm";

interface TransactionFormProps {
  categories?: Category[];
  initialType?: FinanceType;
  onCategoryCreated?: (category: Category) => void;
  onSaved?: () => void;
  onClose: () => void;
}

interface FormState {
  amount: string;
  type: FinanceType;
  category_id: string;
  description: string;
}

const blank: FormState = { amount: "", type: "expense", category_id: "", description: "" };

export default function TransactionForm({ categories = [], initialType = "expense", onCategoryCreated, onSaved, onClose }: TransactionFormProps) {
  const [form, setForm] = useState<FormState>({ ...blank, type: initialType });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

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

  function handleCategoryCreated(category: Category): void {
    onCategoryCreated?.(category);
    change("category_id", String(category.id));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) { setError("Amount must be greater than zero."); return; }
    if (!form.category_id) { setError("Please choose or create a category."); return; }
    setSaving(true);
    try {
      await createTransaction({ amount: Number(form.amount), type: form.type, description: form.description.trim() || null, category_id: Number(form.category_id) });
      setForm({ ...blank, type: form.type });
      setSuccess(true);
      onSaved?.();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save transaction."));
    } finally {
      setSaving(false);
    }
  }

  return <section className="relative rounded-[2rem] border border-slate-700/80 bg-slate-900 p-5 shadow-2xl sm:p-6"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">New transaction</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Move your money</h2><p className="mt-1 text-sm text-slate-500">Keep your financial timeline up to date.</p></div><button type="button" onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700" aria-label="Close"><X size={19} /></button></div>{error && <p className="mb-4 rounded-2xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}<form className="space-y-5" onSubmit={submit}><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-1"><button type="button" onClick={() => change("type", "expense")} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${form.type === "expense" ? "bg-rose-400 text-slate-950 shadow" : "text-slate-500 hover:text-slate-200"}`}><ArrowDownLeft size={18} /> Expense</button><button type="button" onClick={() => change("type", "income")} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${form.type === "income" ? "bg-emerald-400 text-slate-950 shadow" : "text-slate-500 hover:text-slate-200"}`}><ArrowUpRight size={18} /> Income</button></div><label className="block text-sm font-medium text-slate-300">Amount<div className="relative mt-2"><span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">VND</span><input required min="0.01" step="0.01" name="amount" type="number" value={form.amount} onChange={(event) => change("amount", event.target.value)} placeholder="0" className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-4 pl-16 pr-4 text-2xl font-bold outline-none transition focus:border-cyan-400" /></div></label><div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-slate-300">Category</span><button type="button" onClick={() => setCategoryFormOpen(true)} className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20"><Plus size={14} /> New</button></div><div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">{visibleCategories.map((category) => <button type="button" key={category.id} onClick={() => change("category_id", String(category.id))} className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${form.category_id === String(category.id) ? "border-cyan-400 bg-cyan-400/15 text-cyan-300" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}>{category.name}</button>)}{visibleCategories.length === 0 && <button type="button" onClick={() => setCategoryFormOpen(true)} className="w-full rounded-2xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-500 hover:border-cyan-400 hover:text-cyan-300">No categories yet. Create one</button>}</div></div><label className="block text-sm font-medium text-slate-300">Note<input name="description" value={form.description} onChange={(event) => change("description", event.target.value)} maxLength={255} placeholder="Optional note" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400" /></label><button disabled={saving} className="w-full rounded-2xl bg-cyan-400 px-4 py-4 font-bold text-slate-950 shadow-lg transition hover:bg-cyan-300 disabled:opacity-50">{saving ? "Saving..." : "Save transaction"}</button></form>{categoryFormOpen && <CategoryForm type={form.type} onCreated={handleCategoryCreated} onClose={() => setCategoryFormOpen(false)} />}{success && <div role="status" className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="w-full max-w-xs rounded-[2rem] border border-emerald-400/20 bg-slate-900 px-6 py-8 text-center shadow-2xl"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-slate-950"><Check size={42} strokeWidth={3} /></div><p className="mt-4 text-lg font-bold text-emerald-300">Saved successfully</p><p className="mt-1 text-sm text-slate-400">Your transaction was recorded.</p></div></div>}</section>;
}
