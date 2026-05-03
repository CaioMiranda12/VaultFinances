import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = {
  id: number;
  nome: string;
  cor: string; // hex or tailwind-safe color string
};

export type CategoryModalMode =
  | { type: "delete"; category: Category }
  | null;

// ─── Seed data ────────────────────────────────────────────────────────────────

export const SEED_CATEGORIES: Category[] = [
  { id: 1,  nome: "Salario",       cor: "#34d399" },
  { id: 2,  nome: "Freelance",     cor: "#60a5fa" },
  { id: 3,  nome: "Alimentacao",   cor: "#fb923c" },
  { id: 4,  nome: "Moradia",       cor: "#a78bfa" },
  { id: 5,  nome: "Transporte",    cor: "#38bdf8" },
  { id: 6,  nome: "Saude",         cor: "#f472b6" },
  { id: 7,  nome: "Lazer",         cor: "#facc15" },
  { id: 8,  nome: "Educacao",      cor: "#4ade80" },
  { id: 9,  nome: "Outros",        cor: "#94a3b8" },
];

const LS_CATEGORIES = "finapp_categories";

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type CategoryContextValue = {
  categories: Category[];
  addCategory: (nome: string, cor: string) => void;
  deleteCategory: (id: number) => void;
  categoryModal: CategoryModalMode;
  openDeleteCategory: (c: Category) => void;
  closeCategoryModal: () => void;
};

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() =>
    readLS(LS_CATEGORIES, SEED_CATEGORIES)
  );
  const [categoryModal, setCategoryModal] = useState<CategoryModalMode>(null);

  useEffect(() => {
    localStorage.setItem(LS_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback((nome: string, cor: string) => {
    setCategories((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1;
      return [...prev, { id: nextId, nome, cor }];
    });
  }, []);

  const deleteCategory = useCallback((id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const openDeleteCategory = useCallback((c: Category) => {
    setCategoryModal({ type: "delete", category: c });
  }, []);

  const closeCategoryModal = useCallback(() => setCategoryModal(null), []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        deleteCategory,
        categoryModal,
        openDeleteCategory,
        closeCategoryModal,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories(): CategoryContextValue {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used within CategoryProvider");
  return ctx;
}
