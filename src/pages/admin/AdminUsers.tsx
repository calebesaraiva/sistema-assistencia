// src/pages/admin/AdminUsers.tsx
import { useState } from "react";
import { useUiFeedback } from "../../hooks/useUiFeedback";

type UserRole = "adm" | "tecnico" | "cliente";

interface UserRow {
  id: string;
  nome: string;
  email?: string;
  role: UserRole;
  ativo: boolean;
}

const MOCK_USERS: UserRow[] = [
  {
    id: "1",
    nome: "Administrador Padrão",
    email: "admin@nexustech.com",
    role: "adm",
    ativo: true,
  },
  {
    id: "2",
    nome: "Técnico João",
    email: "tecnico@nexustech.com",
    role: "tecnico",
    ativo: true,
  },
  {
    id: "3",
    nome: "Cliente Teste",
    email: "cliente@nexustech.com",
    role: "cliente",
    ativo: true,
  },
];

const roleLabel: Record<UserRole, string> = {
  adm: "Administrador",
  tecnico: "Técnico",
  cliente: "Cliente",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const { showToast, withLoading } = useUiFeedback();

  const total = users.length;

  async function handleToggleStatus(user: UserRow) {
    if (loadingId) return; // evita spam de clique

    setLoadingId(user.id);

    try {
      await withLoading(setIsToggling, async () => {
        // aqui no futuro entra a chamada de API, ex:
        // await api.patch(`/users/${user.id}/status`, { ativo: !user.ativo });

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, ativo: !u.ativo } : u
          )
        );

        // se quiser manter um “delay fake” pra sentir o loading:
        // await new Promise((resolve) => setTimeout(resolve, 500));
      });

      showToast(
        user.ativo
          ? `Usuário "${user.nome}" desativado.`
          : `Usuário "${user.nome}" ativado.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar status do usuário. Tente novamente.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Usuários do sistema
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Veja quem tem acesso ao sistema de assistência técnica.
          </p>
        </div>

        <div className="text-sm">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full 
            bg-slate-900/70 border border-slate-700 text-slate-100 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {total} usuário(s)
          </span>
        </div>
      </header>

      {/* Lista de usuários */}
      <div
        className="rounded-2xl border border-slate-800/80 bg-slate-950/60 
        backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        {/* Cabeçalho tabela */}
        <div
          className="border-b border-slate-800/80 px-4 py-3 text-xs font-semibold 
          text-slate-400 uppercase tracking-wide grid grid-cols-12"
        >
          <div className="col-span-3">Nome</div>
          <div className="col-span-5">E-mail</div>
          <div className="col-span-2">Perfil</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Linhas */}
        <ul className="divide-y divide-slate-800/80">
          {users.map((u) => (
            <li
              key={u.id}
              className="px-4 py-4 text-sm grid grid-cols-12 items-center 
              bg-slate-950/40 hover:bg-slate-900/60 transition-colors"
            >
              {/* Nome */}
              <div className="col-span-3 font-medium text-slate-100">
                {u.nome}
              </div>

              {/* Email */}
              <div className="col-span-5 text-slate-300">
                {u.email ?? "—"}
              </div>

              {/* Perfil */}
              <div className="col-span-2">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full 
                  bg-slate-900/80 border border-slate-700 text-xs text-slate-200"
                >
                  {roleLabel[u.role]}
                </span>
              </div>

              {/* Status + ação */}
              <div className="col-span-2 text-right">
                <div className="inline-flex flex-col items-end gap-1">
                  <span
                    className={
                      "inline-flex items-center px-3 py-1 rounded-full text-xs border " +
                      (u.ativo
                        ? "bg-emerald-900/40 text-emerald-300 border-emerald-600"
                        : "bg-slate-900 text-slate-400 border-slate-700")
                    }
                  >
                    <span
                      className={
                        "w-1.5 h-1.5 rounded-full mr-1.5 " +
                        (u.ativo ? "bg-emerald-400" : "bg-slate-500")
                      }
                    />
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    disabled={loadingId === u.id || isToggling}
                    className="text-[11px] text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === u.id
                      ? "Atualizando..."
                      : u.ativo
                      ? "Desativar"
                      : "Ativar"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé */}
      <p className="text-xs text-slate-500">
        * Nesta versão os usuários estão fixos no frontend apenas para teste
        visual. Depois podemos integrar com API, cadastro e permissões reais.
      </p>
    </div>
  );
}
