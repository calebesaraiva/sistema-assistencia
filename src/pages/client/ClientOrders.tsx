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

export default function ClientOrders() {
  const { orders, devices } = useOrders();

  function getDeviceLabel(deviceId: string) {
    const d = devices.find((d) => d.id === deviceId);
    if (!d) return "—";
    return `${d.tipo} ${d.marca} ${d.modelo}`;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "entregue":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelada":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "finalizada":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "aguardando_peca":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "aguardando_aprovacao":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "em_andamento":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Minhas Ordens de Serviço
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Acompanhe o andamento das suas solicitações.
        </p>
      </header>

      {/* Tabela */}
      <section className="bg-slate-900/60 border border-slate-800/60 rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-sm">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Você ainda não possui ordens de serviço.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              {/* Cabeçalho da tabela */}
              <thead className="bg-slate-800/60 border-b border-slate-700 text-slate-300 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Nº OS</th>
                  <th className="px-4 py-3 text-left">Equipamento</th>
                  <th className="px-4 py-3 text-left">Defeito relatado</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Abertura</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((os, index) => (
                  <tr
                    key={os.id}
                    className={
                      "border-t border-slate-800 hover:bg-slate-800/40 transition " +
                      (index % 2 === 1 ? "bg-slate-900/40" : "")
                    }
                  >
                    <td className="px-4 py-3 font-mono text-slate-100 text-xs">
                      {os.numero}
                    </td>

                    <td className="px-4 py-3 text-slate-200">
                      {getDeviceLabel(os.deviceId)}
                    </td>

                    <td className="px-4 py-3 text-slate-300 max-w-xs">
                      <span className="line-clamp-2">
                        {os.defeitoRelatado}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border " +
                          getStatusColor(os.status)
                        }
                      >
                        {statusLabels[os.status]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {new Date(os.dataAbertura).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
