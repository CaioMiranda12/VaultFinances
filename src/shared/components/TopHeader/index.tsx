import { Wallet } from "lucide-react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "Inicio",
  "/transacoes": "Transacoes",
  "/relatorios": "Relatorios",
  "/config": "Configuracoes",
};

export function TopHeader() {
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