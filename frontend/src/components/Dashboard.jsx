import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, History, Plus, WalletCards } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCashflowByMonth, getExpenseByCategory, getTransactions, getWallets } from "../api";

const chartColors = ["#22d3ee", "#818cf8", "#34d399", "#fbbf24", "#fb7185"];

function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

export default function Dashboard({ refreshKey, onAddTransaction }) {
  const [wallets, setWallets] = useState([]);
  const [cashflow, setCashflow] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const today = now.toISOString().slice(0, 10);
        const [walletData, cashflowData, expenseData, transactionData] = await Promise.all([
          getWallets(),
          getCashflowByMonth(),
          getExpenseByCategory(firstDay, today),
          getTransactions(),
        ]);
        setWallets(walletData);
        setCashflow(cashflowData);
        setExpenses(expenseData);
        setTransactions(transactionData);
      } catch {
        setError("Không thể tải dữ liệu Dashboard.");
      }
    }
    loadDashboard();
  }, [refreshKey]);

  const totals = useMemo(() => {
    const income = cashflow.reduce((sum, item) => sum + Number(item.total_income || 0), 0);
    const spent = cashflow.reduce((sum, item) => sum + Number(item.total_expense || 0), 0);
    const remaining = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
    return { income, spent, remaining };
  }, [cashflow, wallets]);

  const balanceChart = [
    { name: "Đã chi", value: totals.spent },
    { name: "Còn lại", value: Math.max(totals.remaining, 0) },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-cyan-400 to-blue-500 p-5 text-slate-950 shadow-xl sm:p-7">
        <div className="flex items-start justify-between">
          <div><p className="text-sm font-medium text-slate-950/70">Tổng số dư</p><p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{money(totals.remaining)}</p></div>
          <div className="rounded-2xl bg-white/20 p-3"><CircleDollarSign size={24} /></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white/15 p-3"><p className="text-slate-950/65">Tổng thu</p><strong className="mt-1 block text-lg">{money(totals.income)}</strong></div><div className="rounded-2xl bg-slate-950/10 p-3"><p className="text-slate-950/65">Đã chi</p><strong className="mt-1 block text-lg">{money(totals.spent)}</strong></div></div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onAddTransaction("expense")} className="flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-rose-400 px-4 py-4 font-bold text-slate-950 shadow-lg shadow-rose-950/20 transition active:scale-[0.98] hover:bg-rose-300"><ArrowDownLeft size={22} /> Chi tiền</button>
        <button type="button" onClick={() => onAddTransaction("income")} className="flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 font-bold text-slate-950 shadow-lg shadow-emerald-950/20 transition active:scale-[0.98] hover:bg-emerald-300"><ArrowUpRight size={22} /> Nhận tiền</button>
      </section>

      {error && <p className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Lịch sử dòng tiền</h2><p className="text-xs text-slate-500">Thu và chi theo tháng</p></div><History className="text-cyan-300" size={20} /></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={cashflow} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="month" tickFormatter={(month) => `T${month}`} stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} /><Tooltip formatter={(value) => money(value)} /><Bar dataKey="total_income" name="Thu" fill="#34d399" radius={[4, 4, 0, 0]} /><Bar dataKey="total_expense" name="Chi" fill="#fb7185" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"><div className="mb-2 flex items-center justify-between"><div><h2 className="font-semibold">Đã chi / Còn lại</h2><p className="text-xs text-slate-500">Tỷ lệ trên tổng quan</p></div><WalletCards className="text-cyan-300" size={20} /></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={balanceChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4}>{balanceChart.map((item, index) => <Cell key={item.name} fill={index === 0 ? "#fb7185" : "#22d3ee"} />)}</Pie><Tooltip formatter={(value) => money(value)} /></PieChart></ResponsiveContainer></div></div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Giao dịch gần đây</h2><button type="button" onClick={() => onAddTransaction("expense")} className="rounded-full bg-slate-800 p-2 text-cyan-300" aria-label="Thêm giao dịch"><Plus size={17} /></button></div><div className="divide-y divide-slate-800">{transactions.length ? transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3">{transaction.type === "income" ? <ArrowUpRight className="shrink-0 text-emerald-400" size={18} /> : <ArrowDownLeft className="shrink-0 text-rose-400" size={18} />}<div className="min-w-0"><p className="truncate text-sm text-slate-200">{transaction.description || "Giao dịch"}</p><p className="text-xs text-slate-500">{transaction.date_time ? new Date(transaction.date_time).toLocaleDateString("vi-VN") : ""}</p></div></div><strong className={transaction.type === "income" ? "text-sm text-emerald-400" : "text-sm text-rose-400"}>{transaction.type === "income" ? "+" : "-"}{money(transaction.amount)}</strong></div>) : <p className="py-8 text-center text-sm text-slate-500">Chưa có giao dịch</p>}</div></section>
    </div>
  );
}
