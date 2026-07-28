import { useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";
import { createCategory, getApiErrorMessage, type Category, type FinanceType } from "../api";

interface CategoryFormProps {
  type: FinanceType;
  onCreated: (category: Category) => void;
  onClose: () => void;
}

export default function CategoryForm({ type, onCreated, onClose }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const category = await createCategory(name.trim(), type);
      onCreated(category);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not create category."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:items-center">
      <section className="w-full max-w-sm rounded-[2rem] border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">New category</p><h3 className="mt-2 text-xl font-bold">Create a category</h3></div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        <div className={`mb-4 rounded-2xl p-3 text-sm ${type === "expense" ? "bg-rose-400/10 text-rose-300" : "bg-emerald-400/10 text-emerald-300"}`}>
          This category will be used for {type === "expense" ? "expenses" : "income"}.
        </div>
        {error && <p className="mb-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Category name
            <input autoFocus required value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="e.g. Groceries" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-cyan-400" />
          </label>
          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"><Check size={18} />{saving ? "Creating..." : "Create category"}</button>
        </form>
      </section>
    </div>
  );
}
