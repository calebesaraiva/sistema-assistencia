// src/pages/admin/AdminClients.tsx
import { useState } from "react";
import { useOrders } from "../../context/OrdersContext";
import { useUiFeedback } from "../../hooks/useUiFeedback";

export default function AdminClients() {
  const { clients, devices, createClient, createDevice } = useOrders();
  const { showToast, withLoading } = useUiFeedback();

  // Estados do novo cliente
  const [nome, setNome] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  // Estados do novo equipamento
  const [owner, setOwner] = useState("");
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [cor, setCor] = useState("");
  const [imei, setImei] = useState("");

  // Estados do novo usuário (visual por enquanto)
  const [userNome, setUserNome] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("cliente");

  // loading dos botões
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isSavingDevice, setIsSavingDevice] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // --------- Ações ---------
  async function handleSaveClient() {
    if (!nome || !tel1) {
      showToast("Preencha nome e telefone principal.", "error");
      return;
    }

    try {
      await withLoading(setIsSavingClient, async () => {
        createClient({
          nome,
          telefonePrincipal: tel1,
          telefoneSecundario: tel2,
          email,
          cpfCnpj: cpf,
        });
      });

      showToast("Cliente cadastrado com sucesso!", "success");

      setNome("");
      setTel1("");
      setTel2("");
      setEmail("");
      setCpf("");
    } catch (err) {
      console.error(err);
      showToast("Erro ao cadastrar cliente. Tente novamente.", "error");
    }
  }

  async function handleSaveDevice() {
    if (!owner || !tipo || !marca || !modelo) {
      showToast(
        "Preencha todos os campos obrigatórios do equipamento.",
        "error"
      );
      return;
    }

    try {
      await withLoading(setIsSavingDevice, async () => {
        createDevice({
          clientId: owner,
          tipo,
          marca,
          modelo,
          cor,
          imeiSerie: imei,
        });
      });

      showToast("Equipamento cadastrado com sucesso!", "success");

      setTipo("");
      setMarca("");
      setModelo("");
      setCor("");
      setImei("");
    } catch (err) {
      console.error(err);
      showToast("Erro ao cadastrar equipamento. Tente novamente.", "error");
    }
  }

  async function handleSaveUser() {
    if (!userNome || !userEmail) {
      showToast("Preencha nome e e-mail do usuário.", "error");
      return;
    }

    try {
      await withLoading(setIsSavingUser, async () => {
        // Apenas visual/mock por enquanto
        console.log("Usuário mock:", {
          userNome,
          userEmail,
          userRole,
        });
      });

      showToast(
        `Usuário mock criado: ${userNome} (${userRole})`,
        "info"
      );

      setUserNome("");
      setUserEmail("");
      setUserRole("cliente");
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar usuário (mock).", "error");
    }
  }

  // --------- JSX ---------
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-50 tracking-tight">
          Clientes, equipamentos e usuários
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cadastre clientes, vincule equipamentos e crie usuários do sistema.
        </p>
      </div>

      {/* GRID 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* CARD 1 - NOVO CLIENTE */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] space-y-3">
          <h2 className="text-lg font-semibold text-slate-50 mb-1">
            Novo cliente
          </h2>

          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Nome completo *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Telefone principal *"
            value={tel1}
            onChange={(e) => setTel1(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Telefone secundário"
            value={tel2}
            onChange={(e) => setTel2(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="CPF/CNPJ"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />

          <button
            onClick={handleSaveClient}
            disabled={isSavingClient}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-medium rounded-lg px-4 py-2 mt-1 hover:brightness-110 hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingClient ? "Salvando..." : "Salvar cliente"}
          </button>
        </div>

        {/* CARD 2 - NOVO EQUIPAMENTO */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] space-y-3">
          <h2 className="text-lg font-semibold text-slate-50 mb-1">
            Novo equipamento
          </h2>

          <select
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">Cliente dono do equipamento *</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.telefonePrincipal})
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Tipo (Celular, Notebook, etc.) *"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Marca *"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Modelo *"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Cor"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="IMEI / Número de série"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
          />

          <button
            onClick={handleSaveDevice}
            disabled={isSavingDevice}
            className="w-full bg-slate-900 text-slate-50 text-sm font-medium rounded-lg px-4 py-2 mt-1 border border-slate-600 hover:bg-slate-800 hover:border-slate-400 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingDevice ? "Salvando..." : "Salvar equipamento"}
          </button>
        </div>

        {/* CARD 3 - NOVO USUÁRIO */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] space-y-3">
          <h2 className="text-lg font-semibold text-slate-50 mb-1">
            Novo usuário
          </h2>

          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="Nome completo *"
            value={userNome}
            onChange={(e) => setUserNome(e.target.value)}
          />
          <input
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            placeholder="E-mail de acesso *"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <select
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-900/70 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/80"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
          >
            <option value="adm">Administrador</option>
            <option value="tecnico">Técnico</option>
            <option value="cliente">Cliente</option>
          </select>

          <button
            onClick={handleSaveUser}
            disabled={isSavingUser}
            className="w-full bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2 mt-1 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingUser ? "Criando..." : "Criar usuário (mock)"}
          </button>

          <p className="text-xs text-slate-400 mt-1">
            * Nesta versão, o cadastro de usuário é apenas visual. Depois podemos
            integrar com o backend de autenticação.
          </p>
        </div>
      </div>

      {/* LISTA DE CLIENTES */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-slate-50">
            Clientes cadastrados
          </h2>
          <span className="text-sm text-slate-400">
            {clients.length} cliente(s)
          </span>
        </div>

        <div className="space-y-3">
          {clients.map((c) => {
            const devs = devices.filter((d) => d.clientId === c.id);
            return (
              <div
                key={c.id}
                className="bg-slate-900/70 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-1 shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
              >
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <div className="font-medium text-slate-50">{c.nome}</div>
                    <div className="text-sm text-slate-300">
                      Tel.: {c.telefonePrincipal}
                    </div>
                    {c.cpfCnpj && (
                      <div className="text-xs text-slate-400">
                        CPF/CNPJ: {c.cpfCnpj}
                      </div>
                    )}
                    {c.email && (
                      <div className="text-xs text-slate-400">
                        E-mail: {c.email}
                      </div>
                    )}
                  </div>

                  <span className="text-xs bg-slate-800 text-slate-100 px-3 py-1 rounded-full border border-slate-600">
                    {devs.length} equipamento(s)
                  </span>
                </div>

                {devs.length > 0 && (
                  <div className="mt-2 text-xs text-slate-300">
                    <span className="font-semibold">Equipamentos: </span>
                    {devs
                      .map((d) => `${d.tipo} ${d.marca} ${d.modelo}`)
                      .join(" • ")}
                  </div>
                )}
              </div>
            );
          })}

          {clients.length === 0 && (
            <div className="text-sm text-slate-400">
              Nenhum cliente cadastrado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
