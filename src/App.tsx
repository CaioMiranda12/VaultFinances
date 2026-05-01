import { useState, useMemo } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Wallet,
  TrendingUp,
  TrendingDown,
  Tag,
  AlertCircle,
  Check,
  X,
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
import {
  TransactionProvider,
  useTransactions,
} from "./context/TransactionContext";
import type { Transaction } from "./context/TransactionContext";
import { formatarData, formatarMoeda } from "./context/TransactionContext";
import {
  CategoryProvider,
  useCategories,
} from "./context/CategoryContext";
import type { Category } from "./context/CategoryContext";
import ModalContainer from "./components/modals/ModalContainer";
import { DashboardPage } from "./components/DashboardPage";
import { TransacoesPage } from "./components/TransactionsPage";


<>
  <DashboardPage />

  <TransacoesPage />
</>

// ─── Recharts custom tooltip ──────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: "oklch(0.22 0.03 255)", border: "1px solid oklch(0.30 0.04 255)" }}>
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatarMoeda(p.value)}
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { cor: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "oklch(0.22 0.03 255)", border: "1px solid oklch(0.30 0.04 255)" }}>
      <p className="font-bold text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{formatarMoeda(item.value)}</p>
    </div>
  );
}

// ─── Relatorios ───────────────────────────────────────────────────────────────

function RelatoriosPage() {
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

// ─── Configuracoes ────────────────────────────────────────────────────────────

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

function ConfiguracoesPage() {
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

// ─── Bottom navigation ────────────────────────────────────────────────────────

const navItems: { to: string; icon: React.ElementType; label: string }[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transacoes", icon: ArrowLeftRight, label: "Transacoes" },
  { to: "/relatorios", icon: BarChart3, label: "Relatorios" },
  { to: "/config", icon: Settings, label: "Configuracoes" },
];

function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-50"
      style={{
        background: "oklch(0.16 0.03 255 / 0.96)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid oklch(0.28 0.04 255)",
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
      }}
      aria-label="Navegacao principal"
    >
      <div className="flex items-stretch">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 pt-3 pb-2 min-h-[60px] relative transition-all no-underline"
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: "oklch(0.72 0.19 160)" }}
                />
              )}
              <Icon
                size={20}
                className={isActive ? "text-emerald-400" : "text-muted-foreground"}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`text-[9px] font-semibold leading-none transition-colors text-center ${isActive ? "text-emerald-400" : "text-muted-foreground"
                  }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Top header ───────────────────────────────────────────────────────────────

const routeTitles: Record<string, string> = {
  "/": "Inicio",
  "/transacoes": "Transacoes",
  "/relatorios": "Relatorios",
  "/config": "Configuracoes",
};

function TopHeader() {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "Financas";

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{
        background: "oklch(0.14 0.025 255 / 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(0.22 0.03 255)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(0.72 0.19 160)" }}
          aria-hidden="true"
        >
          <Wallet size={14} style={{ color: "oklch(0.12 0.02 255)" }} />
        </div>
        <span className="text-base font-bold text-foreground tracking-tight">{title}</span>
      </div>
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: "oklch(0.32 0.08 255)" }}
        aria-label="Perfil do usuario"
      >
        <span className="text-emerald-400">EU</span>
      </button>
    </header>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

function AppShell() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-[oklch(0.10_0.02_255)]">
      <div
        className="relative w-full max-w-sm min-h-screen flex flex-col"
        style={{ background: "oklch(0.14 0.025 255)" }}
      >
        <TopHeader />
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 12px))" }}
          id="main-content"
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transacoes" element={<TransacoesPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/config" element={<ConfiguracoesPage />} />
          </Routes>
        </main>
        <BottomNav />
        <ModalContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CategoryProvider>
      <TransactionProvider>
        <AppShell />
      </TransactionProvider>
    </CategoryProvider>
  );
}
