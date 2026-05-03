import { ArrowLeftRight, BarChart3, LayoutDashboard, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems: { to: string; icon: React.ElementType; label: string }[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transacoes", icon: ArrowLeftRight, label: "Transacoes" },
  { to: "/relatorios", icon: BarChart3, label: "Relatorios" },
  { to: "/config", icon: Settings, label: "Configuracoes" },
];

export function BottomNav() {
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