import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user } = useAuth();

  const initials = user?.nome
    ? user.nome
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const roleLabel =
    user?.role === "adm"
      ? "Administrador"
      : user?.role === "tecnico"
      ? "Técnico"
      : user?.role === "cliente"
      ? "Cliente"
      : "";

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-md border-b border-slate-800 shadow-[0_6px_24px_rgba(0,0,0,0.55)]">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between">
        {/* LEFT - Logo + Burger */}
        <div className="flex items-center gap-3">
          {/* Mobile burger */}
          <button
            onClick={onToggleSidebar}
            aria-label="Abrir menu"
            className="md:hidden p-2 rounded-md hover:bg-white/10 active:scale-95 transition"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="#e2e8f0"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Logo / Título */}
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold text-white tracking-tight">
              Nexus Tech
            </span>
            <span className="hidden sm:block text-xs text-slate-300">
              Sistema de Assistência Técnica
            </span>
          </div>
        </div>

        {/* RIGHT - User (sem botão sair) */}
        <div className="flex items-center gap-4">
          {/* Nome + cargo (desktop) */}
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-white truncate max-w-[220px]">
              {user?.nome ?? "Usuário"}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">
              {roleLabel}
            </span>
          </div>

          {/* Avatar + nome (mobile) */}
          <div className="flex items-center gap-2">
            <span className="md:hidden text-[11px] text-slate-200 max-w-[120px] truncate">
              {user?.nome ?? "Usuário"}
            </span>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 via-slate-800 to-slate-950 text-white flex items-center justify-center text-sm font-semibold shadow-md ring-1 ring-indigo-500/40 select-none">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
