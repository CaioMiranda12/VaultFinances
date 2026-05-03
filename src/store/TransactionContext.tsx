import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "receita" | "despesa";

export type Transaction = {
  id: number;
  tipo: TransactionType;
  valor: number;
  categoria: string;
  data: string;       // ISO date string "YYYY-MM-DD"
  descricao: string;
};

export type ModalMode =
  | { type: "add" }
  | { type: "edit"; transaction: Transaction }
  | { type: "delete"; transaction: Transaction }
  | null;

// ─── Seed data ────────────────────────────────────────────────────────────────

const today = new Date();
const iso = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 1, tipo: "receita", valor: 5200.0,  categoria: "Salario",       data: iso(2),  descricao: "Salario maio" },
  { id: 2, tipo: "despesa", valor: 1450.0,  categoria: "Moradia",       data: iso(2),  descricao: "Aluguel" },
  { id: 3, tipo: "despesa", valor: 320.5,   categoria: "Alimentacao",   data: iso(3),  descricao: "Supermercado" },
  { id: 4, tipo: "receita", valor: 800.0,   categoria: "Freelance",     data: iso(4),  descricao: "Projeto web" },
  { id: 5, tipo: "despesa", valor: 89.9,    categoria: "Transporte",    data: iso(5),  descricao: "Combustivel" },
  { id: 6, tipo: "despesa", valor: 45.0,    categoria: "Lazer",         data: iso(6),  descricao: "Streaming e assinaturas" },
  { id: 7, tipo: "despesa", valor: 210.0,   categoria: "Saude",         data: iso(7),  descricao: "Farmacia" },
  { id: 8, tipo: "receita", valor: 350.0,   categoria: "Outros",        data: iso(8),  descricao: "Venda objeto usado" },
  { id: 9, tipo: "despesa", valor: 130.0,   categoria: "Alimentacao",   data: iso(9),  descricao: "Restaurantes" },
  { id: 10, tipo: "despesa", valor: 60.0,   categoria: "Lazer",         data: iso(10), descricao: "Cinema e passeios" },
];

const LS_TRANSACTIONS = "finapp_transactions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function formatarData(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function dataHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Context ──────────────────────────────────────────────────────────────────

type TransactionContextValue = {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: number) => void;
  clearAll: () => void;
  modal: ModalMode;
  openAdd: () => void;
  openEdit: (t: Transaction) => void;
  openDelete: (t: Transaction) => void;
  closeModal: () => void;
  // Computed
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

const TransactionContext = createContext<TransactionContextValue | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readLS(LS_TRANSACTIONS, SEED_TRANSACTIONS)
  );
  const [modal, setModal] = useState<ModalMode>(null);

  useEffect(() => {
    localStorage.setItem(LS_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((x) => x.id)) + 1 : 1;
      return [{ ...t, id: nextId }, ...prev];
    });
  }, []);

  const updateTransaction = useCallback((updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setTransactions([]);
  }, []);

  const openAdd = useCallback(() => setModal({ type: "add" }), []);
  const openEdit = useCallback((t: Transaction) => setModal({ type: "edit", transaction: t }), []);
  const openDelete = useCallback((t: Transaction) => setModal({ type: "delete", transaction: t }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const totalReceitas = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((s, t) => s + t.valor, 0);

  const totalDespesas = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((s, t) => s + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        clearAll,
        modal,
        openAdd,
        openEdit,
        openDelete,
        closeModal,
        totalReceitas,
        totalDespesas,
        saldo,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
}
