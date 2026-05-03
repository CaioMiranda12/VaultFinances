import { Routes, Route } from "react-router-dom";
import { TopHeader } from "./shared/components/TopHeader";
import { DashboardPage } from "./features/dashboard/components/DashboardPage";
import { TransacoesPage } from "./features/transactions/components/TransactionsPage";
import { RelatoriosPage } from "./features/reports/components/RelatoriosPage";
import { ConfiguracoesPage } from "./features/settings/components/CategoriesPage";
import { BottomNav } from "./shared/components/BottomNavigation";
import ModalContainer from "./shared/components/modals/ModalContainer";
import { CategoryProvider } from "./store/CategoryContext";
import { TransactionProvider } from "./store/TransactionContext";

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
