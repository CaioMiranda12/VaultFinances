import { Category, useCategories } from "@/store/CategoryContext";
import { useTransactions } from "@/store/TransactionContext";
import { Check, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";

const PRESET_COLORS = [
  "#34d399", "#60a5fa", "#fb923c", "#a78bfa",
  "#38bdf8", "#f472b6", "#facc15", "#4ade80",
  "#f87171", "#94a3b8",
];

function ConfiguracoesCategoryRow({ cat }: { cat: Category }) {
  const { openDeleteCategory } = useCategories();
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: cat.cor }}
        />
        <span className="text-sm font-medium text-foreground">{cat.nome}</span>
      </div>
      <button
        onClick={() => openDeleteCategory(cat)}
        className="p-1.5 rounded-lg hover:bg-destructive/15 transition-colors"
        aria-label={`Excluir categoria ${cat.nome}`}
      >
        <Trash2 size={14} className="text-destructive" />
      </button>
    </div>
  );
}

export function ConfiguracoesPage() {
  const { categories, addCategory } = useCategories();
  const { clearAll } = useTransactions();

  const [novoNome, setNovoNome] = useState("");
  const [novaCor, setNovaCor] = useState(PRESET_COLORS[0]);
  const [erroNome, setErroNome] = useState("");
  const [adicionado, setAdicionado] = useState(false);
  const [confirmLimpar, setConfirmLimpar] = useState(false);

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome) { setErroNome("Informe o nome da categoria."); return; }
    if (categories.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
      setErroNome("Ja existe uma categoria com esse nome.");
      return;
    }
    addCategory(nome, novaCor);
    setNovoNome("");
    setNovaCor(PRESET_COLORS[0]);
    setErroNome("");
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-5 pb-8">
      {/* Categories section */}
      <section aria-labelledby="cat-heading">
        <h2 id="cat-heading" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 px-1">
          Categorias
        </h2>

        {/* Add form */}
        <form
          onSubmit={handleAddCategory}
          className="p-4 rounded-xl bg-card border border-border flex flex-col gap-3 mb-3"
        >
          <p className="text-xs font-semibold text-muted-foreground">Nova categoria</p>

          <div>
            <input
              type="text"
              placeholder="Nome da categoria"
              value={novoNome}
              onChange={(e) => { setNovoNome(e.target.value); setErroNome(""); }}
              className={`w-full px-3 py-2.5 rounded-lg bg-input text-sm text-foreground placeholder:text-muted-foreground outline-none border transition-colors ${erroNome ? "border-destructive" : "border-border focus:border-ring"
                }`}
            />
            {erroNome && (
              <p role="alert" className="text-xs text-destructive mt-1">{erroNome}</p>
            )}
          </div>

          {/* Color picker */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">Cor</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setNovaCor(cor)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{ background: cor }}
                  aria-label={`Cor ${cor}`}
                >
                  {novaCor === cor && (
                    <Check size={12} style={{ color: "oklch(0.12 0.02 255)" }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background: adicionado ? "oklch(0.52 0.14 160)" : "oklch(0.72 0.19 160)",
              color: "oklch(0.12 0.02 255)",
            }}
          >
            {adicionado ? (
              <>
                <Check size={14} />
                Adicionado!
              </>
            ) : (
              <>
                <Tag size={14} />
                Adicionar Categoria
              </>
            )}
          </button>
        </form>

        {/* Category list */}
        {categories.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-border">
            {categories.map((cat) => (
              <ConfiguracoesCategoryRow key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section aria-labelledby="danger-heading">
        <h2 id="danger-heading" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 px-1">
          Zona de Perigo
        </h2>
        <div className="rounded-xl overflow-hidden border border-destructive/30">
          {!confirmLimpar ? (
            <button
              onClick={() => setConfirmLimpar(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={17} className="text-destructive" />
              <div className="text-left">
                <p className="text-sm font-semibold text-destructive">Limpar todos os dados</p>
                <p className="text-xs text-muted-foreground mt-0.5">Remove todas as transacoes registradas</p>
              </div>
            </button>
          ) : (
            <div className="px-4 py-3.5 bg-card flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">Tem certeza?</p>
              <p className="text-xs text-muted-foreground">Todos os dados serao apagados permanentemente.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmLimpar(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold text-muted-foreground bg-muted hover:bg-border transition-colors"
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  onClick={() => { clearAll(); setConfirmLimpar(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                >
                  <Trash2 size={14} /> Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Gerenciador Financeiro v1.0.0
      </p>
    </div>
  );
}