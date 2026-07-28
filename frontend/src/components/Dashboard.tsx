import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Plus, WalletCards } from "lucide-react";
import { getCashflowByMonth, getTransactions, type CashflowPoint, type FinanceType, type Transaction } from "../api";
import DashboardCharts from "./DashboardCharts";

interface DashboardProps {
  refreshKey: number;
  onAddTransaction: (type: FinanceType) => void;
}

function money(value: number | string | null | undefined): string {
  return `${Number(value || 0).toLocaleString("en-US")} VND`;
}

export default function Dashboard({ refreshKey, onAddTransaction }: DashboardProps) {
  const [cashflow, setCashflow] = useState<CashflowPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary(): Promise<void> {
      try {
        const [cashflowData, transactionData] = await Promise.all([getCashflowByMonth(), getTransactions()]);
        setCashflow(cashflowData);
        setTransactions(transactionData);
        setError("");
      } catch {
        setError("Could not load dashboard data.");
      }
    }
    void loadSummary();
  }, [refreshKey]);

  const totals = useMemo(() => ({
    income: cashflow.reduce((sum, item) => sum + Number(item.total_income || 0), 0),
    spent: cashflow.reduce((sum, item) => sum + Number(item.total_expense || 0), 0),
    balance: cashflow.reduce((sum, item) => sum + Number(item.total_income || 0) - Number(item.total_expense || 0), 0),
  }), [cashflow]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-[1.75rem] bg-gradient-to-br from-cyan-400 to-blue-500 p-5 text-slate-950 shadow-xl sm:p-7">
        <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-950/70">Total balance</p><p className="mt-2 text-3xl font-bold sm:text-4xl">{money(totals.balance)}</p></div><div className="rounded-2xl bg-white/20 p-3"><CircleDollarSign size={24} /></div></div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white/15 p-3"><p className="text-slate-950/65">Income</p><strong className="mt-1 block text-lg">{money(totals.income)}</strong></div><div className="rounded-2xl bg-slate-950/10 p-3"><p className="text-slate-950/65">Spent</p><strong className="mt-1 block text-lg">{money(totals.spent)}</strong></div></div>
      </section>

      <section className="grid grid-cols-2 gap-3"><button type="button" onClick={() => onAddTransaction("expense")} className="flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-rose-400 px-4 py-4 font-bold text-slate-950 shadow-lg active:scale-[.98]"><ArrowDownLeft size={22} /> Expense</button><button type="button" onClick={() => onAddTransaction("income")} className="flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 font-bold text-slate-950 shadow-lg active:scale-[.98]"><ArrowUpRight size={22} /> Income</button></section>
      {error && <p className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}

      <DashboardCharts refreshKey={refreshKey} />

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recent transactions</h2><button type="button" onClick={() => onAddTransaction("expense")} className="rounded-full bg-slate-800 p-2 text-cyan-300" aria-label="Add transaction"><Plus size={17} /></button></div><div className="divide-y divide-slate-800">{transactions.length ? transactions.map((transaction) => <div key={transaction.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3">{transaction.type === "income" ? <ArrowUpRight className="shrink-0 text-emerald-400" size={18} /> : <ArrowDownLeft className="shrink-0 text-rose-400" size={18} />}<div className="min-w-0"><p className="truncate text-sm">{transaction.description || "Transaction"}</p><p className="text-xs text-slate-500">{transaction.date_time ? new Date(transaction.date_time).toLocaleDateString("en-US") : ""}</p></div></div><strong className={transaction.type === "income" ? "text-sm text-emerald-400" : "text-sm text-rose-400"}>{transaction.type === "income" ? "+" : "-"}{money(transaction.amount)}</strong></div>) : <p className="py-8 text-center text-sm text-slate-500">No transactions yet</p>}</div></section>
    </div>
  );
}
