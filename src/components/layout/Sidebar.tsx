// src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

type MenuItem = {
  to: string;
  label: string;
};

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  // ===== MENUS POR TIPO DE USUÁRIO =====
  const adminMenu: MenuItem[] = [
    { to: "/adm", label: "Painel" },
    { to: "/adm/os", label: "Ordens de serviço" },
    { to: "/adm/clientes", label: "Clientes" },
    { to: "/adm/servicos", label: "Serviços" },
    { to: "/adm/usuarios", label: "Usuários" },
  ];

  const tecnicoMenu: MenuItem[] = [
    { to: "/tecnico", label: "Dashboard" },
    { to: "/tecnico/os", label: "Minhas OS" },
  ];

  const clientMenu: MenuItem[] = [
    { to: "/cliente", label: "Visão geral" },
    { to: "/cliente/os", label: "Minhas ordens de serviço" },
    { to: "/cliente/historico", label: "Histórico de OS" },
  ];

  const gerenteMenu: MenuItem[] = [
  { to: "/gerente", label: "Visão geral do sistema" },
  { to: "/gerente/lojas", label: "Dashboard lojas" },
  { to: "/gerente/os", label: "OS (todas lojas)" },
  { to: "/gerente/usuarios-lojistas", label: "Usuários / Lojistas" },
];

  // escolhe o menu pela role
  let menu: MenuItem[];

  switch (role) {
    case "tecnico":
      menu = tecnicoMenu;
      break;
    case "cliente":
      menu = clientMenu;
      break;
    case "gerente":
      menu = gerenteMenu;
      break;
    case "adm":
    default:
      menu = adminMenu;
      break;
  }

  const pathname = location.pathname;

  // item ativo pelo maior prefixo
  const activeItem = menu.reduce<MenuItem | null>((current, item) => {
    const isMatch =
      pathname === item.to || pathname.startsWith(item.to + "/");

    if (!isMatch) return current;
    if (!current) return item;
    return item.to.length > current.to.length ? item : current;
  }, null);

  function handleLogout() {
    logout();
    onClose();
  }

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden
          transition-opacity
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        onClick={onClose}
      />

      {/* SIDEBAR FIXO */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
          border-r border-slate-800/60 shadow-2xl
          transform transition-transform duration-300
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-16 flex flex-col justify-center px-5 border-b border-slate-800/60">
          <span className="text-xl font-semibold text-white tracking-tight">
            Nexus Tech
          </span>
          <span className="text-xs text-slate-400">
            Sistema de Assistência Técnica
          </span>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((m) => {
            const active = activeItem?.to === m.to;

            return (
              <Link
                key={m.to}
                to={m.to}
                onClick={onClose}
                className={`
                  flex items-center justify-between
                  px-3 py-2.5 rounded-lg text-sm font-medium
                  transition
                  ${
                    active
                      ? "bg-indigo-500 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }
                `}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé - botão sair */}
        <div className="border-t border-slate-800/60 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 
              rounded-lg border border-slate-700 bg-slate-900/80 
              px-3 py-2 text-sm text-slate-100 
              hover:bg-slate-800 hover:border-slate-500 
              active:scale-[0.98] transition"
          >
            <span>Sair</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M9 6H7.5C6.7 6 6 6.7 6 7.5v9c0 .8.7 1.5 1.5 1.5H9"
                stroke="#e2e8f0"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M10 12h9"
                stroke="#e2e8f0"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M16 9l3 3-3 3"
                stroke="#e2e8f0"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
