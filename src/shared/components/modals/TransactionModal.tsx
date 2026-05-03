import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { dataHoje, Transaction, TransactionType, useTransactions } from "@/store/TransactionContext";
import { useCategories } from "@/store/CategoryContext";

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  tipo: TransactionType;
  valor: string;
  categoria: string;
  data: string;
  descricao: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function initialForm(tx?: Transaction): FormState {
  return {
    tipo: tx?.tipo ?? "despesa",
    valor: tx ? String(tx.valor) : "",
    categoria: tx?.categoria ?? "",
    data: tx?.data ?? dataHoje(),
    descricao: tx?.descricao ?? "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TransactionModal() {
  const { modal, closeModal, addTransaction, updateTransaction } = useTransactions();
  const { categories } = useCategories();

  const isOpen = modal?.type === "add" || modal?.type === "edit";
  const editing = modal?.type === "edit" ? modal.transaction : undefined;

  const [form, setForm] = useState<FormState>(initialForm(editing));
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(editing));
      setErrors({});
    }
  }, [isOpen, editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function validate(): boolean {
    const e: FormErrors = {};
    const num = parseFloat(form.valor.replace(",", "."));
    if (!form.valor.trim()) e.valor = "Informe o valor.";
    else if (isNaN(num)) e.valor = "Valor deve ser um numero.";
    else if (num <= 0) e.valor = "Valor deve ser maior que zero.";
    if (!form.categoria.trim()) e.categoria = "Selecione uma categoria.";
    if (!form.data.trim()) e.data = "Informe a data.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      tipo: form.tipo,
      valor: parseFloat(form.valor.replace(",", ".")),
      categoria: form.categoria,
      data: form.data,
      descricao: form.descricao.trim(),
    };
    if (editing) {
      updateTransaction({ ...payload, id: editing.id });
    } else {
      addTransaction(payload);
    }
    closeModal();
  }

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  if (!isOpen) return null;

  const title = editing ? "Editar Transacao" : "Nova Transacao";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm rounded-t-2xl flex flex-col max-h-[92dvh]"
        style={{ background: "oklch(0.18 0.025 255)", border: "1px solid oklch(0.26 0.03 255)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-border">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5 overflow-y-auto" noValidate>
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
              {(["despesa", "receita"] as TransactionType[]).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => set("tipo", tipo)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${form.tipo === tipo
                    ? tipo === "receita"
                      ? "bg-emerald-400/20 text-emerald-400 shadow-sm"
                      : "bg-red-400/20 text-red-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tipo === "receita" ? "Receita" : "Despesa"}
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="tm-valor" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Valor (R$)
            </label>
            <input
              id="tm-valor"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={form.valor}
              onChange={(e) => set("valor", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-input text-foreground text-sm placeholder:text-muted-foreground outline-none border transition-colors ${errors.valor ? "border-destructive" : "border-border focus:border-ring"
                }`}
            />
            {errors.valor && (
              <p role="alert" className="text-xs text-destructive mt-1.5">{errors.valor}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="tm-cat" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Categoria
            </label>
            <select
              id="tm-cat"
              value={form.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-input text-foreground text-sm outline-none border appearance-none transition-colors ${errors.categoria ? "border-destructive" : "border-border focus:border-ring"
                }`}
            >
              <option value="" disabled>Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
            {errors.categoria && (
              <p role="alert" className="text-xs text-destructive mt-1.5">{errors.categoria}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label htmlFor="tm-data" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Data
            </label>
            <input
              id="tm-data"
              type="date"
              value={form.data}
              onChange={(e) => set("data", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-input text-foreground text-sm outline-none border transition-colors ${errors.data ? "border-destructive" : "border-border focus:border-ring"
                }`}
            />
            {errors.data && (
              <p role="alert" className="text-xs text-destructive mt-1.5">{errors.data}</p>
            )}
          </div>

          {/* Descricao */}
          <div>
            <label htmlFor="tm-desc" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Descricao <span className="normal-case font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="tm-desc"
              type="text"
              placeholder="Ex: Compras no mercado"
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-input text-foreground text-sm placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-muted-foreground bg-muted hover:bg-border transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors"
              style={{
                background: "oklch(0.72 0.19 160)",
                color: "oklch(0.12 0.02 255)",
              }}
            >
              {editing ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
