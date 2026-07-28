import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCashflowByMonth, getExpenseByCategory, type CashflowPoint, type ExpenseByCategoryPoint } from "../api";

interface DashboardChartsProps {
  // Component cha thay đổi giá trị này sau khi TransactionForm lưu thành công.
  // Đây là "tín hiệu refresh", không phải dữ liệu biểu đồ.
  refreshKey: number;
}

interface ExpenseChartPoint {
  name: string;
  value: number;
}

const CHART_COLORS = ["#78c8e8", "#9b8cff", "#73d69b", "#f4bd68", "#f08383", "#8fa5e8"];

function money(value: number | string | null | undefined): string {
  return `${Number(value || 0).toLocaleString("en-US")} VND`;
}

export default function DashboardCharts({ refreshKey }: DashboardChartsProps) {
  const [expenses, setExpenses] = useState<ExpenseChartPoint[]>([]);
  const [cashflow, setCashflow] = useState<CashflowPoint[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // useEffect với dependency [refreshKey] chạy lần đầu khi component mount,
    // sau đó chạy lại mỗi khi component cha báo có dữ liệu mới.
    async function loadCharts(): Promise<void> {
      try {
        setError("");
        const now = new Date();
        const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const toDate = now.toISOString().slice(0, 10);

        // Promise.all cho phép gọi song song hai API, giúp giảm thời gian chờ.
        const [expenseData, cashflowData] = await Promise.all([
          getExpenseByCategory(fromDate, toDate),
          getCashflowByMonth(),
        ]);

        // API trả tuple/object thống kê đã được map thành JSON.
        // Chuẩn hóa về dạng { name, value } để PieChart đọc bằng dataKey.
        setExpenses(expenseData.map((item: ExpenseByCategoryPoint) => ({
          name: item.category_name,
          value: Number(item.total_amount),
        })));
        setCashflow(cashflowData);
      } catch {
        setError("Could not load chart data.");
      }
    }

    void loadCharts();
  }, [refreshKey]);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      {error && <p className="xl:col-span-2 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="font-semibold">Cashflow history</h2>
          <p className="text-xs text-slate-500">Monthly income and expenses</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflow} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={(month: number) => `M${month}`} stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip formatter={(value) => money(value as number)} />
              <Bar dataKey="total_income" name="Income" fill="#63dfa0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total_expense" name="Expense" fill="#f27687" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="font-semibold">Expenses by category</h2>
          <p className="text-xs text-slate-500">Current month spending</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenses} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                {expenses.map((item, index) => <Cell key={item.name} name={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => money(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
          {expenses.map((item, index) => <span key={item.name} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />{item.name}</span>)}
        </div>
      </div>
    </section>
  );
}
