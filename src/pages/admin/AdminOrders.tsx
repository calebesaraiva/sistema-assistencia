// src/pages/admin/AdminOrders.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import type { OrderStatus, PaymentStatus } from "../../types/domain";
import { useUiFeedback } from "../../hooks/useUiFeedback";

const statusLabel: Record<OrderStatus, string> = {
  aberta: "Aberta",
  diagnostico: "Em diagnóstico",
  aguardando_aprovacao: "Aguard. aprovação",
  aguardando_peca: "Aguard. peça",
  em_andamento: "Em andamento",
  finalizada: "Finalizada",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

// cores em tema dark
const statusColor: Record<OrderStatus, string> = {
  aberta: "bg-sky-900/40 text-sky-300 border-sky-500/40",
  diagnostico: "bg-amber-900/30 text-amber-300 border-amber-500/40",
  aguardando_aprovacao: "bg-amber-900/30 text-amber-300 border-amber-500/40",
  aguardando_peca: "bg-amber-900/30 text-amber-300 border-amber-500/40",
  em_andamento: "bg-indigo-900/40 text-indigo-300 border-indigo-500/40",
  finalizada: "bg-emerald-900/40 text-emerald-300 border-emerald-500/40",
  entregue: "bg-emerald-900/40 text-emerald-300 border-emerald-500/40",
  cancelada: "bg-rose-900/40 text-rose-300 border-rose-500/40",
};

const payLabel: Record<PaymentStatus, string> = {
  nao_informado: "Não informado",
  pendente: "Pendente",
  pago_parcial: "Pago parcial",
  pago: "Pago",
  cortesia: "Cortesia",
};

const payColor: Record<PaymentStatus, string> = {
  nao_informado: "bg-slate-900/40 text-slate-300 border-slate-600/60",
  pendente: "bg-rose-900/40 text-rose-300 border-rose-500/50",
  pago_parcial: "bg-amber-900/30 text-amber-300 border-amber-500/50",
  pago: "bg-emerald-900/40 text-emerald-300 border-emerald-500/50",
  cortesia: "bg-sky-900/40 text-sky-300 border-sky-500/40",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

export default function AdminOrders() {
  const { orders, clients, devices } = useOrders();
  const { showToast, withLoading } = useUiFeedback();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"todas" | OrderStatus>("todas");
  const [paymentFilter, setPaymentFilter] =
    useState<"todos" | PaymentStatus>("todos");
  const [isExporting, setIsExporting] = useState(false);

  // ===== MÉTRICAS =====
  const total = orders.length;
  const abertas = orders.filter((o) => o.status === "aberta").length;
  const emAndamento = orders.filter((o) => o.status === "em_andamento").length;
  const finalizadas = orders.filter((o) => o.status === "finalizada").length;

  // ===== LISTA FILTRADA =====
  const listaFiltrada = useMemo(() => {
    return orders.filter((os) => {
      const cliente = clients.find((c) => c.id === os.clientId);
      const device = devices.find((d) => d.id === os.deviceId);

      // filtro de status
      if (statusFilter !== "todas" && os.status !== statusFilter) return false;

      // filtro de pagamento
      if (
        paymentFilter !== "todos" &&
        (os.statusPagamento ?? "nao_informado") !== paymentFilter
      ) {
        return false;
      }

      // busca textual
      if (search.trim()) {
        const termo = search.toLowerCase();

        const matchesNumero = os.numero.toLowerCase().includes(termo);
        const matchesCliente = (cliente?.nome ?? "")
          .toLowerCase()
          .includes(termo);
        const matchesDevice = (
          `${device?.tipo ?? ""} ${device?.marca ?? ""} ${device?.modelo ?? ""}`
        )
          .toLowerCase()
          .includes(termo);

        if (!matchesNumero && !matchesCliente && !matchesDevice) return false;
      }

      return true;
    });
  }, [orders, clients, devices, search, statusFilter, paymentFilter]);

  // ===== EXPORTAR CSV =====
  async function handleExportCsv() {
    if (listaFiltrada.length === 0) {
      showToast("Não há OS na lista atual para exportar.", "info");
      return;
    }

    try {
      await withLoading(setIsExporting, async () => {
        const header = [
          "NumeroOS",
          "StatusOS",
          "StatusPagamento",
          "ClienteNome",
          "ClienteTelefone",
          "Equipamento",
          "ValorTotal",
          "ValorPago",
          "DataAbertura",
          "DataConclusao",
          "DataPagamento",
        ];

        const rows = listaFiltrada.map((os) => {
          const cliente = clients.find((c) => c.id === os.clientId);
          const device = devices.find((d) => d.id === os.deviceId);
          const payStatus = os.statusPagamento ?? "nao_informado";
          const equipamento = device
            ? `${device.tipo ?? ""} ${device.marca ?? ""} ${
                device.modelo ?? ""
              }`.trim()
            : "";

          const total = os.totalFinal ?? os.subtotal ?? 0;
          const valorPago = os.valorPago ?? 0;

          return [
            os.numero,
            statusLabel[os.status],
            payLabel[payStatus],
            cliente?.nome ?? "",
            cliente?.telefonePrincipal ?? "",
            equipamento,
            total.toString().replace(".", ","),
            valorPago.toString().replace(".", ","),
            formatDate(os.dataAbertura),
            formatDate(os.dataConclusao),
            formatDate(os.dataPagamento),
          ];
        });

        const csvContent =
          "\uFEFF" +
          [header, ...rows]
            .map((cols) =>
              cols
                .map((c) => {
                  const v = c ?? "";
                  return `"${String(v).replace(/"/g, '""')}"`;
                })
                .join(";")
            )
            .join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const hoje = new Date().toISOString().slice(0, 10);

        link.href = url;
        link.setAttribute("download", `ordens-servico-${hoje}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });

      showToast("CSV exportado com sucesso.", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao exportar CSV. Tente novamente.", "error");
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* HEADER */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Todas as Ordens de Serviço
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Gerencie todas as OS criadas na assistência técnica.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </button>

          <Link
            to="/adm/nova-os"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-[0.98] transition"
          >
            + Nova OS
          </Link>
        </div>
      </header>

      {/* CARDS RESUMO */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de OS", value: total },
          { label: "Abertas", value: abertas },
          { label: "Em andamento", value: emAndamento },
          { label: "Finalizadas", value: finalizadas },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)] p-5"
          >
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-50 mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      {/* FILTROS */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)] p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Campo de busca */}
        <input
          type="text"
          className="flex-1 rounded-md px-3 py-2 text-sm
            bg-slate-900/80 border border-slate-700
            text-slate-100 placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          placeholder="Buscar por número, cliente ou equipamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Selects */}
        <div className="flex flex-wrap gap-2">
          <select
            className="border border-slate-700 rounded-md px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "todas"
                  ? "todas"
                  : (e.target.value as OrderStatus)
              )
            }
          >
            <option value="todas">Status (todos)</option>
            <option value="aberta">Aberta</option>
            <option value="diagnostico">Em diagnóstico</option>
            <option value="aguardando_aprovacao">Aguard. aprovação</option>
            <option value="aguardando_peca">Aguard. peça</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizada">Finalizada</option>
            <option value="entregue">Entregue</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <select
            className="border border-slate-700 rounded-md px-3 py-2 text-sm bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value === "todos"
                  ? "todos"
                  : (e.target.value as PaymentStatus)
              )
            }
          >
            <option value="todos">Pagamento (todos)</option>
            <option value="nao_informado">Não informado</option>
            <option value="pendente">Pendente</option>
            <option value="pago_parcial">Pago parcial</option>
            <option value="pago">Pago</option>
            <option value="cortesia">Cortesia</option>
          </select>
        </div>
      </section>

      {/* TABELA */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">OS</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Equipamento</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pagamento</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {listaFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    Nenhuma OS encontrada com os filtros atuais.
                  </td>
                </tr>
              )}

              {listaFiltrada.map((os, index) => {
                const cliente = clients.find((c) => c.id === os.clientId);
                const device = devices.find((d) => d.id === os.deviceId);
                const total = os.totalFinal ?? os.subtotal ?? 0;
                const payStatus = os.statusPagamento ?? "nao_informado";

                return (
                  <tr
                    key={os.id}
                    className={
                      "border-t border-slate-800/70 hover:bg-slate-900/70 transition " +
                      (index % 2 === 1 ? "bg-slate-950/40" : "bg-slate-950/20")
                    }
                  >
                    {/* Número OS */}
                    <td className="px-4 py-2 font-mono text-xs text-slate-200">
                      {os.numero}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-2">
                      <div className="text-sm text-slate-50">
                        {cliente?.nome ?? "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cliente?.telefonePrincipal}
                      </div>
                    </td>

                    {/* Equipamento */}
                    <td className="px-4 py-2">
                      <div className="text-sm text-slate-50">
                        {device
                          ? `${device.tipo} ${device.marca} ${device.modelo}`
                          : "—"}
                      </div>
                      {device?.imeiSerie && (
                        <div className="text-[11px] text-slate-400">
                          IMEI/Série: {device.imeiSerie}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs ${statusColor[os.status]}`}
                      >
                        {statusLabel[os.status]}
                      </span>
                    </td>

                    {/* Pagamento */}
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs ${payColor[payStatus]}`}
                      >
                        {payLabel[payStatus]}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-2 text-right font-medium text-slate-50">
                      R$ {total.toFixed(2)}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-2 text-right space-x-2 text-xs">
                      <Link
                        to={`/adm/os/${os.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 transition"
                      >
                        Detalhes
                      </Link>
                      <Link
                        to={`/adm/os/${os.id}/comanda`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 transition"
                      >
                        Comanda
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
