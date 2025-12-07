// src/pages/tecnico/TechDashboard.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import type { OrderStatus } from "../../types/domain";
import { useUiFeedback } from "../../hooks/useUiFeedback";

const statusLabels: Record<OrderStatus, string> = {
  aberta: "Aberta",
  diagnostico: "Em diagnóstico",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_peca: "Aguardando peça",
  em_andamento: "Em andamento",
  finalizada: "Finalizada",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const statusColors: Record<OrderStatus, string> = {
  aberta: "bg-sky-500/10 text-sky-300 border-sky-500/40",
  diagnostico: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  aguardando_aprovacao: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  aguardando_peca: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  em_andamento: "bg-blue-500/10 text-blue-300 border-blue-500/40",
  finalizada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  entregue: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  cancelada: "bg-rose-500/10 text-rose-300 border-rose-500/40",
};

const PRIORITARIAS: OrderStatus[] = [
  "diagnostico",
  "aguardando_aprovacao",
  "aguardando_peca",
  "em_andamento",
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export default function TechDashboard() {
  const { orders, clients, devices, updateOrderStatus } = useOrders();
  const { showToast, withLoading } = useUiFeedback();

  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [search, setSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ====== MÉTRICAS RÁPIDAS ======
  const metrics = useMemo(() => {
    const total = orders.length;
    const diagnostico = orders.filter((o) => o.status === "diagnostico").length;
    const aguardandoPeca = orders.filter(
      (o) => o.status === "aguardando_peca"
    ).length;
    const emAndamento = orders.filter(
      (o) => o.status === "em_andamento"
    ).length;
    const finalizadasOuEntregues = orders.filter((o) =>
      ["finalizada", "entregue"].includes(o.status)
    ).length;

    return {
      total,
      diagnostico,
      aguardandoPeca,
      emAndamento,
      finalizadasOuEntregues,
    };
  }, [orders]);

  // ====== LISTA FILTRADA (FOCO NAS PRIORITÁRIAS) ======
  const lista = useMemo(() => {
    return orders
      .filter((os) => PRIORITARIAS.includes(os.status))
      .filter((os) => {
        if (statusFilter && os.status !== statusFilter) return false;

        if (!search.trim()) return true;

        const cliente = clients.find((c) => c.id === os.clientId);
        const device = devices.find((d) => d.id === os.deviceId);

        const textoBusca = (
          `${os.numero} ${cliente?.nome ?? ""} ${device?.tipo ?? ""} ${
            device?.marca ?? ""
          } ${device?.modelo ?? ""}`
        )
          .toLowerCase()
          .trim();

        return textoBusca.includes(search.toLowerCase().trim());
      })
      .sort((a, b) => {
        const da = a.dataAbertura ?? "";
        const db = b.dataAbertura ?? "";
        return db.localeCompare(da);
      });
  }, [orders, clients, devices, statusFilter, search]);

  function getClientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.nome ?? "—";
  }

  function getDeviceLabel(deviceId: string) {
    const d = devices.find((d) => d.id === deviceId);
    if (!d) return "—";
    return `${d.tipo} ${d.marca} ${d.modelo}`;
  }

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    if (updatingOrderId) return; // evita duplo clique

    try {
      setUpdatingOrderId(orderId);
      await withLoading(setIsUpdatingStatus, async () => {
        await updateOrderStatus(orderId, status);
      });
      showToast("Status da OS atualizado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      showToast(
        "Não foi possível atualizar o status. Tente novamente.",
        "error"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-slate-50">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Painel do técnico
        </h1>
        <p className="text-sm text-slate-300">
          Visão rápida das OS em diagnóstico, aguardando peça e em andamento.
        </p>
      </header>

      {/* CARDS RESUMO */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Total de OS
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {metrics.total}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-amber-200">
            Em diagnóstico / aguard. aprova.
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-50">
            {metrics.diagnostico}
          </p>
        </div>

        <div className="rounded-2xl border border-sky-500/40 bg-sky-950/40 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-sky-200">
            Aguardando peça
          </p>
          <p className="mt-1 text-2xl font-semibold text-sky-50">
            {metrics.aguardandoPeca}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-emerald-200">
            Finalizadas / entregues
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-50">
            {metrics.finalizadasOuEntregues}
          </p>
        </div>
      </section>

      {/* FILTROS RÁPIDOS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Busca */}
        <input
          type="text"
          className="flex-1 rounded-md px-3 py-2 text-sm
            bg-slate-900/80 border border-slate-700
            text-slate-100 placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400"
          placeholder="Buscar por nº OS, cliente ou equipamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filtro de status */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              statusFilter === ""
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-slate-900 text-slate-200 border-slate-600 hover:bg-slate-800"
            }`}
          >
            Todos
          </button>
          {PRIORITARIAS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                statusFilter === s
                  ? "bg-sky-500 text-white border-sky-400"
                  : "bg-slate-900 text-slate-200 border-slate-600 hover:bg-slate-800"
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </section>

      {/* TABELA PRINCIPAL */}
      <section className="bg-slate-900/60 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
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
              {lista.map((os, index) => (
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
                    {formatDate(os.dataAbertura)}
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
                      disabled={
                        isUpdatingStatus && updatingOrderId === os.id
                      }
                      className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border border-blue-500/60 bg-blue-600/20 text-blue-100 hover:bg-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleStatusChange(os.id, "em_andamento")}
                    >
                      {isUpdatingStatus && updatingOrderId === os.id
                        ? "Atualizando..."
                        : "Em andamento"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        isUpdatingStatus && updatingOrderId === os.id
                      }
                      className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border border-emerald-500/60 bg-emerald-600/20 text-emerald-100 hover:bg-emerald-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleStatusChange(os.id, "finalizada")}
                    >
                      {isUpdatingStatus && updatingOrderId === os.id
                        ? "Atualizando..."
                        : "Finalizar"}
                    </button>
                  </td>
                </tr>
              ))}

              {lista.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    Nenhuma OS prioritária encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
