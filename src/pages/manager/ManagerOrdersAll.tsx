// src/pages/manager/ManagerAllOrders.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import type { OrderStatus } from "../../types/domain";

// Mesmo mock de lojas que usamos no dashboard do gerente
const STORES = [
  { id: "loja-1", nome: "Loja Centro" },
  { id: "loja-2", nome: "Loja Shopping" },
  { id: "loja-3", nome: "Loja Barreirinhas" },
];

const STATUS_OPCOES: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "Todos os status" },
  { value: "aberta", label: "Aberta" },
  { value: "diagnostico", label: "Em diagnóstico" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aguardando_peca", label: "Aguardando peça" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizada", label: "Finalizada" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

function getStatusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    aberta: "Aberta",
    diagnostico: "Em diagnóstico",
    aguardando_aprovacao: "Aguardando aprovação",
    aguardando_peca: "Aguardando peça",
    em_andamento: "Em andamento",
    finalizada: "Finalizada",
    entregue: "Entregue",
    cancelada: "Cancelada",
  };
  return map[status] ?? status;
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "aberta":
      return "bg-sky-500/10 text-sky-300 border-sky-500/40";
    case "diagnostico":
    case "aguardando_aprovacao":
      return "bg-amber-500/10 text-amber-300 border-amber-500/40";
    case "aguardando_peca":
      return "bg-violet-500/10 text-violet-300 border-violet-500/40";
    case "em_andamento":
      return "bg-blue-500/10 text-blue-300 border-blue-500/40";
    case "finalizada":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    case "entregue":
      return "bg-teal-500/10 text-teal-300 border-teal-500/40";
    case "cancelada":
      return "bg-rose-500/10 text-rose-300 border-rose-500/40";
    default:
      return "bg-slate-500/10 text-slate-300 border-slate-500/40";
  }
}

export default function ManagerAllOrders() {
  const { orders, clients, devices } = useOrders();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [storeFilter, setStoreFilter] = useState("");
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((os) => {
      // filtro por loja
      if (storeFilter && os.lojaId !== storeFilter) return false;

      // filtro por status
      if (statusFilter && os.status !== statusFilter) return false;

      if (!search.trim()) return true;

      const client = clients.find((c) => c.id === os.clientId);
      const device = devices.find((d) => d.id === os.deviceId);
      const loja = STORES.find((s) => s.id === os.lojaId);

      const alvo = (
        `${os.numero} ${client?.nome ?? ""} ${device?.tipo ?? ""} ${
          device?.marca ?? ""
        } ${device?.modelo ?? ""} ${loja?.nome ?? ""}`
      )
        .toLowerCase()
        .trim();

      return alvo.includes(search.toLowerCase().trim());
    });
  }, [orders, clients, devices, storeFilter, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          OS de todas as lojas
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Visão consolidada das ordens de serviço de todas as lojas do sistema.
        </p>
      </header>

      {/* Filtros - no estilo da sua tela atual */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          className="w-full md:w-1/4 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          {STATUS_OPCOES.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Loja */}
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="w-full md:w-1/4 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          <option value="">Todas as lojas</option>
          {STORES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>

        {/* Busca */}
        <input
          className="w-full md:w-1/2 border border-slate-700 rounded-md px-3 py-2 text-sm bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          placeholder="Buscar por nº OS, cliente, equipamento ou loja..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* Tabela */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">
            Nenhuma OS encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Nº OS</th>
                  <th className="text-left px-4 py-3">Loja</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Equipamento</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Abertura</th>
                  <th className="text-right px-4 py-3">Total (R$)</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((os, index) => {
                  const client = clients.find((c) => c.id === os.clientId);
                  const device = devices.find((d) => d.id === os.deviceId);
                  const loja = STORES.find((s) => s.id === os.lojaId);

                  const equipamento = device
                    ? `${device.tipo} ${device.marca} ${device.modelo}`
                    : "-";

                  return (
                    <tr
                      key={os.id}
                      className={
                        "border-t border-slate-800 hover:bg-slate-900/80 transition " +
                        (index % 2 === 1 ? "bg-slate-950/40" : "bg-slate-950/10")
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-100">
                        {os.numero}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {loja?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {client?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {equipamento}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border " +
                            getStatusColor(os.status)
                          }
                        >
                          {getStatusLabel(os.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {formatDate(os.dataAbertura)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        R$ {(os.totalFinal ?? os.subtotal ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/adm/os/${os.id}`)}
                          className="text-xs px-3 py-1.5 rounded-md border border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-100"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => navigate(`/adm/os/${os.id}/comanda`)}
                          className="text-xs px-3 py-1.5 rounded-md border border-slate-500 bg-slate-800 hover:bg-slate-700 text-slate-100"
                        >
                          Comanda
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
