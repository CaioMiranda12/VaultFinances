import { TransactionRow } from "@/features/transactions/components/TransactionRow";
import { formatarMoeda, useTransactions } from "@/store/TransactionContext";
import { AlertCircle, ChevronRight, Eye, EyeOff, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const [saldoVisivel, setSaldoVisivel] = useState(true);
  const navigate = useNavigate();
  const { transactions, saldo, totalReceitas, totalDespesas, openAdd } = useTransactions();

  // Current month label
  const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mesCapitalized = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);

  const ultimas = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-5 px-4 py-5 pb-8">
      {/* Balance card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.26 0.08 255) 0%, oklch(0.20 0.05 260) 100%)",
          border: "1px solid oklch(0.32 0.06 255)",
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.19 160 / 0.10) 0%, transparent 70%)" }}
        />

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Saldo Atual
          </span>
          <button
            onClick={() => setSaldoVisivel((v) => !v)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label={saldoVisivel ? "Ocultar saldo" : "Mostrar saldo"}
          >
            {saldoVisivel ? (
              <Eye size={14} className="text-muted-foreground" />
            ) : (
              <EyeOff size={14} className="text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="text-4xl font-bold tracking-tight text-foreground mb-4">
          {saldoVisivel ? formatarMoeda(saldo) : "R$ ••••••"}
        </div>

        {/* Receitas / Despesas row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-400/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Receitas</p>
              <p className="text-sm font-bold text-emerald-400 tabular-nums">
                {saldoVisivel ? formatarMoeda(totalReceitas) : "••••"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-red-400/15 flex items-center justify-center flex-shrink-0">
              <TrendingDown size={14} className="text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Despesas</p>
              <p className="text-sm font-bold text-red-400 tabular-nums">
                {saldoVisivel ? formatarMoeda(totalDespesas) : "••••"}
              </p>
            </div>
          </div>
        </div>

        {/* Add transaction button */}
        <button
          onClick={openAdd}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
          style={{
            background: "oklch(0.72 0.19 160)",
            color: "oklch(0.12 0.02 255)",
          }}
        >
          <Plus size={16} />
          Nova Transacao
        </button>
      </div>

      {/* Recent transactions */}
      <section aria-labelledby="recentes-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recentes-heading" className="text-sm font-semibold text-foreground">
            Ultimas Transacoes
          </h2>
          <button
            onClick={() => navigate("/transacoes")}
            className="text-xs font-medium text-emerald-400 flex items-center gap-0.5"
          >
            Ver todas <ChevronRight size={12} />
          </button>
        </div>

        {ultimas.length === 0 ? (
          <div className="p-8 rounded-xl bg-card border border-border flex flex-col items-center gap-2">
            <AlertCircle size={24} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma transacao ainda.</p>
            <button
              onClick={openAdd}
              className="text-xs font-semibold text-emerald-400 mt-1"
            >
              Adicionar agora
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ultimas.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>

      {/* Month label footer */}
      <p className="text-center text-xs text-muted-foreground">{mesCapitalized}</p>
    </div>
  );
}