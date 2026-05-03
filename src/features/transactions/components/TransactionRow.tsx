import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { formatarData, formatarMoeda, Transaction, useTransactions } from "@/store/TransactionContext";
import { useCategories } from "@/store/CategoryContext";


export function TransactionRow({
  tx,
  showActions = false,
}: {
  tx: Transaction;
  showActions?: boolean;
}) {
  const { openEdit, openDelete } = useTransactions();
  const { categories } = useCategories();
  const isReceita = tx.tipo === "receita";

  const cat = categories.find((c) => c.nome === tx.categoria);
  const cor = cat?.cor ?? "#94a3b8";

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border gap-3">
      {/* Icon dot */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${cor}20` }}
      >
        {isReceita ? (
          <ArrowDownLeft size={16} style={{ color: cor }} />
        ) : (
          <ArrowUpRight size={16} style={{ color: cor }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate leading-tight">
          {tx.descricao || tx.categoria}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: `${cor}20`, color: cor }}
          >
            {tx.categoria}
          </span>
          <span className="text-[10px] text-muted-foreground">{formatarData(tx.data)}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`text-sm font-bold tabular-nums ${isReceita ? "text-emerald-400" : "text-foreground"
            }`}
        >
          {isReceita ? "+" : "-"}
          {formatarMoeda(tx.valor)}
        </span>
        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(tx)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Editar"
            >
              <Pencil size={13} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => openDelete(tx)}
              className="p-1.5 rounded-lg hover:bg-destructive/15 transition-colors"
              aria-label="Excluir"
            >
              <Trash2 size={13} className="text-destructive" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}