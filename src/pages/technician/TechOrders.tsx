// src/pages/tecnico/TechOrders.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import type { OrderStatus } from "../../types/domain";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
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
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "diagnostico":
    case "aguardando_aprovacao":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "aguardando_peca":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "em_andamento":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "finalizada":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "entregue":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "cancelada":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

const STATUS_OPCOES: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "aberta", label: "Aberta" },
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "aguardando_peca", label: "Aguard. peça" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizada", label: "Finalizada" },
  { value: "entregue", label: "Entregue" },
];

export default function TechOrders() {
  const { orders, clients, devices, updateOrderStatus } = useOrders();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((os) => {
      if (statusFilter && os.status !== statusFilter) return false;

      if (!search.trim()) return true;

      const client = clients.find((c) => c.id === os.clientId);
      const device = devices.find((d) => d.id === os.deviceId);

      const equipamento = device
        ? `${device.tipo} ${device.marca} ${device.modelo}`
        : "";

      const alvo =
        `${os.numero} ${client?.nome ?? ""} ${equipamento}`.toLowerCase();

      return alvo.includes(search.toLowerCase());
    });
  }, [orders, clients, devices, statusFilter, search]);

  function handleStatus(orderId: string, status: OrderStatus) {
    updateOrderStatus(orderId, status);
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          OS sob sua responsabilidade
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Visualize e atualize rapidamente o status das ordens que estão com você.
        </p>
      </header>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* Status */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-slate-500 uppercase tracking-[0.14em]">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPCOES.map((opt) => (
              <button
                key={opt.value || "todos"}
                onClick={() => setStatusFilter(opt.value)}
                className={
                  "px-2.5 py-1.5 rounded-full text-xs border transition " +
                  (statusFilter === opt.value
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Busca */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <span className="text-[11px] text-slate-500 uppercase tracking-[0.14em]">
            Buscar
          </span>
          <input
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-full md:w-72"
            placeholder="Nº OS, cliente ou equipamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Nenhuma OS encontrada com os filtros atuais.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600 tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Nº OS</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Equipamento</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Abertura</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((os, index) => {
                  const client = clients.find((c) => c.id === os.clientId);
                  const device = devices.find((d) => d.id === os.deviceId);

                  const equipamento = device
                    ? `${device.tipo} ${device.marca} ${device.modelo}`
                    : "-";

                  return (
                    <tr
                      key={os.id}
                      className={
                        "border-t border-slate-200 hover:bg-slate-50 transition " +
                        (index % 2 === 1 ? "bg-slate-50/60" : "bg-white")
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-900">
                        {os.numero}
                      </td>
                      <td className="px-4 py-3 text-slate-900">{client?.nome ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{equipamento}</td>

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

                      <td className="px-4 py-3 text-slate-700">{formatDate(os.dataAbertura)}</td>

                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/tecnico/os/${os.id}`)}
                          className="text-xs px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100"
                        >
                          Detalhes
                        </button>

                        <button
                          onClick={() => handleStatus(os.id, "em_andamento")}
                          className="text-xs px-3 py-1.5 rounded-md border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          Em andamento
                        </button>

                        <button
                          onClick={() => handleStatus(os.id, "finalizada")}
                          className="text-xs px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        >
                          Finalizar
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
