import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, Plus } from "lucide-react";
import { createTransaction, getWallets } from "../api";

const emptyForm = {
  amount: "",
  type: "expense",
  wallet_id: "",
  category_id: "",
  description: "",
};

export default function TransactionForm({ categories = [], onSaved, initialType = "expense" }) {
  // useState stores values that must survive React renders and update the UI.
  // A normal `let amount = 0` would not notify React when its value changes.
  const [form, setForm] = useState(emptyForm);
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // The dashboard opens this sheet with either income or expense preselected.
  useEffect(() => {
    setForm((current) => ({ ...current, type: initialType, category_id: "" }));
  }, [initialType]);

  // useEffect runs after mount and loads the Wallet options required by the API.
  useEffect(() => {
    async function loadWallets() {
      try {
        setWallets(await getWallets());
      } catch {
        setError("Không thể tải danh sách ví.");
      } finally {
        setLoadingWallets(false);
      }
    }
    loadWallets();
  }, []);

  // Only categories matching the selected transaction type are valid.
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type],
  );

  function handleChange(event) {
    const { name, value } = event.target;

    // Controlled component: state is the source of truth for the input value.
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { category_id: "" } : {}),
    }));
    setError("");
    setSuccess(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      return;
    }
    if (!form.wallet_id || !form.category_id) {
      setError("Vui lòng chọn ví và danh mục.");
      return;
    }

    try {
      setSaving(true);
      await createTransaction({
        amount: Number(form.amount),
        type: form.type,
        description: form.description.trim() || null,
        wallet_id: Number(form.wallet_id),
        category_id: Number(form.category_id),
      });

      // Reset editable fields after HTTP 201, but keep selected options.
      setForm((current) => ({
        ...emptyForm,
        wallet_id: current.wallet_id,
        category_id: current.category_id,
      }));
      setSuccess(true);
      onSaved?.();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Không thể lưu giao dịch.");
    } finally {
      setSaving(false);
    }
  }

  // The popup is temporary feedback.  Clearing it in an effect keeps the
  // timer tied to the success state and avoids leaving a timer running after
  // the component is removed from the page.
  useEffect(() => {
    if (!success) return undefined;

    const timerId = window.setTimeout(() => setSuccess(false), 1800);
    return () => window.clearTimeout(timerId);
  }, [success]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300"><Plus size={18} /></div>
        <div><h2 className="font-semibold text-slate-100">Giao dịch mới</h2><p className="text-sm text-slate-400">Thu hoặc chi tiền trong ví</p></div>
      </div>
      {error && <p className="mb-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => handleChange({ target: { name: "type", value: "expense" } })} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${form.type === "expense" ? "border-rose-400/50 bg-rose-400/10 text-rose-300" : "border-slate-700 text-slate-400"}`}><ArrowDownLeft size={16} /> Chi</button>
          <button type="button" onClick={() => handleChange({ target: { name: "type", value: "income" } })} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm ${form.type === "income" ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-slate-700 text-slate-400"}`}><ArrowUpRight size={16} /> Thu</button>
        </div>
        <label className="block text-sm text-slate-300">Số tiền<input required min="0.01" step="0.01" name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0.00" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400" /></label>
        <label className="block text-sm text-slate-300">Ghi chú<input name="description" value={form.description} onChange={handleChange} maxLength="255" placeholder="Ví dụ: Ăn trưa" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400" /></label>
        <label className="block text-sm text-slate-300">Ví<select required name="wallet_id" value={form.wallet_id} onChange={handleChange} disabled={loadingWallets} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400"><option value="">{loadingWallets ? "Đang tải ví..." : "Chọn ví"}</option>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name} ({wallet.balance})</option>)}</select></label>
        <label className="block text-sm text-slate-300">Danh mục<select required name="category_id" value={form.category_id} onChange={handleChange} disabled={!visibleCategories.length} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400"><option value="">{visibleCategories.length ? "Chọn danh mục" : "Chưa có danh mục phù hợp"}</option>{visibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <button type="submit" disabled={saving || loadingWallets || !visibleCategories.length} className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu giao dịch"}</button>
      </form>

      {success && (
        <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="animate-[success-pop_180ms_ease-out] w-full max-w-xs rounded-2xl border border-emerald-400/30 bg-slate-900 px-6 py-8 text-center shadow-2xl sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/25">
              <Check size={42} strokeWidth={3} />
            </div>
            <p className="mt-4 text-lg font-semibold text-emerald-300">Thêm thành công</p>
            <p className="mt-1 text-sm text-slate-400">Giao dịch đã được lưu.</p>
          </div>
        </div>
      )}
    </section>
  );
}
