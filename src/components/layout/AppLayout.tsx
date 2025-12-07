import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { UserRole } from "../../types/auth";

interface AppLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export default function AppLayout({ children, role }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar fixo */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área principal (deslocada pra direita em desktop) */}
      <div className="flex flex-col min-h-screen md:pl-64">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 px-4 md:px-8 pt-20 pb-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
