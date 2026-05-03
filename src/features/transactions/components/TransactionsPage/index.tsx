
import { AlertCircle, ArrowDownLeft, ArrowUpRight, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { TransactionRow } from "../TransactionRow";
import { formatarMoeda, useTransactions } from "@/store/TransactionContext";
import { useCategories } from "@/store/CategoryContext";

const PERIODOS = ["Tudo", "Este mes", "Mes passado", "Este ano"] as const;
type Periodo = (typeof PERIODOS)[number];

export function TransacoesPage() {
  const { transactions, openAdd, totalReceitas, totalDespesas } = useTransactions();
  const { categories } = useCategories();

  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo>("Tudo");

  const filtered = useMemo(() => {
    const agora = new Date();
    return transactions.filter((tx) => {
      if (filtroTipo !== "todos" && tx.tipo !== filtroTipo) return false;
      if (filtroCategoria !== "todas" && tx.categoria !== filtroCategoria) return false;

      const txDate = new Date(tx.data + "T00:00:00");
      if (filtroPeriodo === "Este mes") {
        if (txDate.getMonth() !== agora.getMonth() || txDate.getFullYear() !== agora.getFullYear())
          return false;
      } else if (filtroPeriodo === "Mes passado") {
        const lastMonth = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
        if (txDate.getMonth() !== lastMonth.getMonth() || txDate.getFullYear() !== lastMonth.getFullYear())
          return false;
      } else if (filtroPeriodo === "Este ano") {
        if (txDate.getFullYear() !== agora.getFullYear()) return false;
      }
      return true;
    });
  }, [transactions, filtroTipo, filtroCategoria, filtroPeriodo]);

  return (
    <div className="flex flex-col gap-4 px-4 py-5 pb-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft size={14} className="text-emerald-400" />
            <span className="text-xs text-muted-foreground">Total Receitas</span>
          </div>
          <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatarMoeda(totalReceitas)}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={14} className="text-red-400" />
            <span className="text-xs text-muted-foreground">Total Despesas</span>
          </div>
          <p className="text-lg font-bold text-red-400 tabular-nums">{formatarMoeda(totalDespesas)}</p>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted">
        {(["todos", "receita", "despesa"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${filtroTipo === t
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
              }`}
          >
            {t === "todos" ? "Todos" : t === "receita" ? "Receitas" : "Despesas"}
          </button>
        ))}
      </div>

      {/* Period + Category filters */}
      <div className="flex gap-2">
        {/* Period */}
        <div className="relative flex-1">
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value as Periodo)}
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-card border border-border text-xs text-foreground outline-none"
          >
            {PERIODOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Category */}
        <div className="relative flex-1">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-card border border-border text-xs text-foreground outline-none"
          >
            <option value="todas">Todas categ.</option>
            {categories.map((c) => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground -mb-1">
        {filtered.length} {filtered.length === 1 ? "transacao" : "transacoes"}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl bg-card border border-border flex flex-col items-center gap-2">
          <AlertCircle size={24} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma transacao encontrada para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} showActions />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 z-30"
        style={{
          background: "oklch(0.72 0.19 160)",
          boxShadow: "0 4px 20px oklch(0.72 0.19 160 / 0.40)",
        }}
        aria-label="Nova transacao"
      >
        <Plus size={22} style={{ color: "oklch(0.12 0.02 255)" }} />
      </button>
    </div>
  );
}