import {
  AlertCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import { CustomBarTooltip } from "../CustomBarTooltip";
import { CustomPieTooltip } from "../CustomPieTooltip";
import { useMemo } from "react";
import { formatarMoeda, useTransactions } from "@/store/TransactionContext";
import { useCategories } from "@/store/CategoryContext";

export function RelatoriosPage() {
  const { transactions, saldo, totalReceitas, totalDespesas } = useTransactions();
  const { categories } = useCategories();

  // Pie chart: despesas por categoria
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        map[t.categoria] = (map[t.categoria] ?? 0) + t.valor;
      });
    return Object.entries(map)
      .map(([nome, valor]) => {
        const cat = categories.find((c) => c.nome === nome);
        return { name: nome, value: valor, cor: cat?.cor ?? "#94a3b8" };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  // Bar chart: last 6 months income vs expenses
  const barData = useMemo(() => {
    const months: { mes: string; receitas: number; despesas: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("pt-BR", { month: "short" });
      const monthTxs = transactions.filter((t) => {
        const td = new Date(t.data + "T00:00:00");
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      months.push({
        mes: label.replace(".", ""),
        receitas: monthTxs.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0),
        despesas: monthTxs.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0),
      });
    }
    return months;
  }, [transactions]);

  return (
    <div className="flex flex-col gap-5 px-4 py-5 pb-8">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Receitas", valor: totalReceitas, color: "text-emerald-400" },
          { label: "Despesas", valor: totalDespesas, color: "text-red-400" },
          { label: "Saldo", valor: saldo, color: saldo >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map(({ label, valor, color }) => (
          <div key={label} className="p-3 rounded-xl bg-card border border-border">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">{label}</p>
            <p className={`text-sm font-bold tabular-nums ${color}`}>{formatarMoeda(valor)}</p>
          </div>
        ))}
      </div>

      {/* Bar chart: income vs expenses per month */}
      <section aria-labelledby="bar-heading">
        <h2 id="bar-heading" className="text-sm font-semibold text-foreground mb-3">
          Receitas x Despesas por Mes
        </h2>
        <div className="p-4 rounded-xl bg-card border border-border">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barCategoryGap="30%" barGap={3}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.26 0.03 255)"
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                tick={{ fill: "oklch(0.58 0.02 250)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.58 0.02 250)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                }
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "oklch(0.26 0.03 255 / 0.5)" }} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, color: "oklch(0.58 0.02 250)" }}
              />
              <Bar dataKey="receitas" name="Receitas" fill="oklch(0.72 0.19 160)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="oklch(0.58 0.18 280 / 0.7)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Pie chart: despesas by category */}
      <section aria-labelledby="pie-heading">
        <h2 id="pie-heading" className="text-sm font-semibold text-foreground mb-3">
          Despesas por Categoria
        </h2>

        {pieData.length === 0 ? (
          <div className="p-8 rounded-xl bg-card border border-border flex flex-col items-center gap-2">
            <AlertCircle size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-card border border-border">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.cor} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-col gap-2 mt-2">
              {pieData.map((d) => {
                const pct = totalDespesas > 0 ? ((d.value / totalDespesas) * 100).toFixed(0) : "0";
                return (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: d.cor }}
                      />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {formatarMoeda(d.value)}
                      </span>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}