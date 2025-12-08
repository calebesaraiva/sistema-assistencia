// src/pages/manager/ManagerUsersStores.tsx
import { useMemo, useState } from "react";
import { useOrders } from "../../context/OrdersContext";
import type { UserRole } from "../../types/auth";

// ---- Tipos auxiliares ----
type Loja = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  cidadeUf: string;
};

type ManagerUserRow = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  lojaId: string | null;
};

// ---- MOCKS INICIAIS (constantes) ----
const INITIAL_STORES: Loja[] = [
  {
    id: "loja-1",
    nome: "Loja Centro",
    cnpj: "00.111.222/0001-33",
    telefone: "(98) 99999-0001",
    cidadeUf: "São Luís / MA",
  },
  {
    id: "loja-2",
    nome: "Loja Shopping",
    cnpj: "11.222.333/0001-44",
    telefone: "(98) 99999-0002",
    cidadeUf: "São Luís / MA",
  },
  {
    id: "loja-3",
    nome: "Loja Barreirinhas",
    cnpj: "22.333.444/0001-55",
    telefone: "(98) 99999-0003",
    cidadeUf: "Barreirinhas / MA",
  },
];

const INITIAL_USERS: ManagerUserRow[] = [
  {
    id: "u1",
    nome: "Adm Loja Centro",
    email: "adm@loja1.com",
    role: "adm",
    lojaId: "loja-1",
  },
  {
    id: "u2",
    nome: "Técnico Loja Centro",
    email: "tecnico@loja1.com",
    role: "tecnico",
    lojaId: "loja-1",
  },
  {
    id: "u3",
    nome: "Adm Loja Shopping",
    email: "adm@loja2.com",
    role: "adm",
    lojaId: "loja-2",
  },
  {
    id: "u4",
    nome: "Adm Loja Barreirinhas",
    email: "adm@loja3.com",
    role: "adm",
    lojaId: "loja-3",
  },
];

// ---- Helpers ----
function roleLabel(role: UserRole) {
  switch (role) {
    case "adm":
      return "Admin. da loja";
    case "tecnico":
      return "Técnico";
    case "cliente":
      return "Cliente";
    case "gerente":
      return "Gerente geral";
    default:
      return role;
  }
}

export default function ManagerUsersStores() {
  const { orders } = useOrders();

  // estado local (mock) de lojas e usuários
  const [stores, setStores] = useState<Loja[]>(INITIAL_STORES);
  const [users, setUsers] = useState<ManagerUserRow[]>(INITIAL_USERS);

  // ===== ESTATÍSTICAS POR LOJA =====
  const statsPorLoja = useMemo(() => {
    const mapa = new Map<string, { qtdeOs: number; totalMes: number }>();

    // inicia todas as lojas com zero
    for (const store of stores) {
      mapa.set(store.id, { qtdeOs: 0, totalMes: 0 });
    }

    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    for (const os of orders) {
      // enquanto o tipo não tiver lojaId certinho, usamos any
      const lojaId = (os as any).lojaId as string | undefined;
      if (!lojaId) continue;

      const stats = mapa.get(lojaId);
      if (!stats) continue;

      stats.qtdeOs += 1;

      const dt = new Date(os.dataAbertura);
      if (
        !Number.isNaN(dt.getTime()) &&
        dt.getMonth() === mesAtual &&
        dt.getFullYear() === anoAtual
      ) {
        const valor = os.totalFinal ?? os.subtotal ?? 0;
        stats.totalMes += valor;
      }
    }

    return mapa;
  }, [orders, stores]);

  // ===== AÇÕES – LOJAS =====

  function handleAddStoreMock() {
    const id = `loja-${Date.now()}`;
    const novaLoja: Loja = {
      id,
      nome: `Nova loja (mock)`,
      cnpj: "00.000.000/0000-00",
      telefone: "(00) 00000-0000",
      cidadeUf: "Cidade / UF",
    };
    setStores((prev) => [...prev, novaLoja]);
  }

  function handleEditStore(id: string) {
    const store = stores.find((s) => s.id === id);
    if (!store) return;

    const novoNome =
      window.prompt("Nome da loja:", store.nome) ?? store.nome;
    const novoTelefone =
      window.prompt("Telefone da loja:", store.telefone) ?? store.telefone;

    setStores((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, nome: novoNome, telefone: novoTelefone } : s
      )
    );
  }

  function handleDeleteStore(id: string) {
    const store = stores.find((s) => s.id === id);
    if (!store) return;

    const confirma = window.confirm(
      `Remover a loja "${store.nome}"? (mock, apenas na UI)`
    );
    if (!confirma) return;

    setStores((prev) => prev.filter((s) => s.id !== id));

    // opcional: também remover usuários ligados a essa loja
    setUsers((prev) => prev.filter((u) => u.lojaId !== id));
  }

  // ===== AÇÕES – USUÁRIOS =====

  function handleAddUserMock() {
    const id = `user-${Date.now()}`;
    const lojaPadrao = stores[0]?.id ?? null;

    const novoUser: ManagerUserRow = {
      id,
      nome: "Novo Usuário (mock)",
      email: "novo@sistema.com",
      role: "tecnico",
      lojaId: lojaPadrao,
    };

    setUsers((prev) => [...prev, novoUser]);
  }

  function handleEditUser(id: string) {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const novoNome =
      window.prompt("Nome do usuário:", user.nome) ?? user.nome;
    const novoEmail =
      window.prompt("E-mail do usuário:", user.email) ?? user.email;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, nome: novoNome, email: novoEmail } : u
      )
    );
  }

  function handleDeleteUser(id: string) {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const confirma = window.confirm(
      `Remover o usuário "${user.nome}"? (mock, apenas na UI)`
    );
    if (!confirma) return;

    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  // ===== RENDER =====

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Usuários / Lojistas
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Aqui o gerente gerencia as lojas, administradores de cada loja e
          visão geral dos usuários do sistema.
        </p>
      </header>

      {/* BLOCO 1 – LOJAS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Lojas cadastradas
          </h2>
          <button
            type="button"
            onClick={handleAddStoreMock}
            className="text-xs px-3 py-1.5 rounded-md border border-emerald-500/50 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
          >
            + Cadastrar nova loja (mock)
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stores.map((store) => {
            const stats = statsPorLoja.get(store.id) ?? {
              qtdeOs: 0,
              totalMes: 0,
            };

            const adminLoja = users.find(
              (u) => u.lojaId === store.id && u.role === "adm"
            );

            return (
              <div
                key={store.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-50">
                      {store.nome}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {store.cidadeUf}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditStore(store.id)}
                      className="rounded-md px-2 py-1 text-[11px] border border-slate-700 text-slate-200 hover:bg-slate-800"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStore(store.id)}
                      className="rounded-md px-2 py-1 text-[11px] border border-red-600/60 text-red-300 hover:bg-red-600/10"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-0.5">
                  <p>CNPJ: {store.cnpj}</p>
                  <p>Telefone: {store.telefone}</p>
                </div>

                {adminLoja && (
                  <div className="mt-2 rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2 text-xs text-slate-300">
                    <p className="text-[11px] font-medium text-slate-400 mb-1">
                      Administrador da loja
                    </p>
                    <p>{adminLoja.nome}</p>
                    <p className="text-slate-400 text-[11px]">
                      {adminLoja.email}
                    </p>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                  <div>
                    <p className="text-[11px] text-slate-400">OS totais</p>
                    <p className="text-sm font-semibold text-slate-50">
                      {stats.qtdeOs}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">
                      Faturamento (mês)
                    </p>
                    <p className="text-sm font-semibold text-emerald-400">
                      R$ {stats.totalMes.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BLOCO 2 – USUÁRIOS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Usuários do sistema
          </h2>
          <button
            type="button"
            onClick={handleAddUserMock}
            className="text-xs px-3 py-1.5 rounded-md border border-sky-500/50 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 transition"
          >
            + Cadastrar usuário (mock)
          </button>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">E-mail</th>
                  <th className="text-left px-4 py-3">Perfil</th>
                  <th className="text-left px-4 py-3">Loja</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => {
                  const loja = stores.find((s) => s.id === u.lojaId);

                  return (
                    <tr
                      key={u.id}
                      className={
                        "border-t border-slate-800 " +
                        (index % 2 === 1
                          ? "bg-slate-950/40"
                          : "bg-slate-950/10")
                      }
                    >
                      <td className="px-4 py-3 text-slate-50">{u.nome}</td>
                      <td className="px-4 py-3 text-slate-300">{u.email}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {roleLabel(u.role)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {loja?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditUser(u.id)}
                            className="rounded-md px-2 py-1 text-[11px] border border-slate-700 text-slate-200 hover:bg-slate-800"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-md px-2 py-1 text-[11px] border border-red-600/60 text-red-300 hover:bg-red-600/10"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
