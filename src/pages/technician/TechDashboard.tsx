// src/pages/tecnico/TechOrders.tsx
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";

const statusLabels: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_peca: "Aguardando peça",
  finalizada: "Finalizada",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const statusColors: Record<string, string> = {
  aberta: "bg-sky-500/10 text-sky-300 border-sky-500/40",
  em_andamento: "bg-blue-500/10 text-blue-300 border-blue-500/40",
  aguardando_aprovacao: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  aguardando_peca: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  finalizada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  entregue: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  cancelada: "bg-rose-500/10 text-rose-300 border-rose-500/40",
};

export default function TechOrders() {
  const { orders, clients, devices, updateOrderStatus } = useOrders();

  function getClientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.nome ?? "—";
  }

  function getDeviceLabel(deviceId: string) {
    const d = devices.find((d) => d.id === deviceId);
    if (!d) return "—";
    return `${d.tipo} ${d.marca} ${d.modelo}`;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-slate-50">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Minhas ordens de serviço
        </h1>
        <p className="text-sm text-slate-300">
          Visualize e atualize rapidamente o status das OS em que você está trabalhando.
        </p>
      </header>

      {/* Card tabela */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-700">
              <tr className="text-xs font-medium text-slate-300 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Nº OS</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Equipamento</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Abertura</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((os, index) => (
                <tr
                  key={os.id}
                  className={
                    "border-t border-slate-800 transition " +
                    (index % 2 === 1 ? "bg-slate-950/40" : "bg-slate-950/20") +
                    " hover:bg-slate-900/70"
                  }
                >
                  {/* Nº OS */}
                  <td className="px-4 py-2 font-mono text-xs text-slate-100">
                    {os.numero}
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-2">
                    <div className="text-sm text-slate-50">
                      {getClientName(os.clientId)}
                    </div>
                  </td>

                  {/* Equipamento */}
                  <td className="px-4 py-2 text-slate-200">
                    {getDeviceLabel(os.deviceId)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2">
                    <span
                      className={
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border " +
                        (statusColors[os.status] ??
                          "bg-slate-700/40 text-slate-200 border-slate-500")
                      }
                    >
                      {statusLabels[os.status] ?? os.status}
                    </span>
                  </td>

                  {/* Data abertura */}
                  <td className="px-4 py-2 text-slate-200">
                    {os.dataAbertura
                      ? new Date(os.dataAbertura).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-2 text-right space-x-2">
                    <Link
                      to={`/tecnico/os/${os.id}`}
                      className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border border-slate-600 bg-slate-950/60 text-slate-100 hover:bg-slate-800"
                    >
                      Detalhes
                    </Link>

                    <button
                      type="button"
                      className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border border-blue-500/60 bg-blue-600/20 text-blue-100 hover:bg-blue-600/30"
                      onClick={() => updateOrderStatus(os.id, "em_andamento")}
                    >
                      Em andamento
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border border-emerald-500/60 bg-emerald-600/20 text-emerald-100 hover:bg-emerald-600/30"
                      onClick={() => updateOrderStatus(os.id, "finalizada")}
                    >
                      Finalizar
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    Nenhuma OS atribuída a você no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
