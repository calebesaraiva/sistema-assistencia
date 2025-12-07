// src/pages/admin/AdminDashboard.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import type { ServiceOrder } from "../../types/domain";

function formatCurrency(value: number | undefined) {
  if (value == null) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

type Periodo = "7d" | "30d" | "mes" | "ano";

function getPeriodoRange(tipo: Periodo) {
  const hoje = new Date();
  const end = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
    23,
    59,
    59,
    999
  );
  const start = new Date(end);

  switch (tipo) {
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "mes":
      start.setDate(1);
      break;
    case "ano":
      start.setMonth(0, 1);
      break;
  }

  return { start, end };
}

export default function AdminDashboard() {
  const { orders } = useOrders();
  const navigate = useNavigate();

  const {
    totalOs,
    abertas,
    emAndamento,
    finalizadasOuEntregues,
    faturamentoPrevistoGeral,
    faturamentoPagoGeral,
    ultimasOs,
  } = useMemo(() => {
    const totalOs = orders.length;

    const abertas = orders.filter((o) => o.status === "aberta").length;
    const emAndamento = orders.filter((o) => o.status === "em_andamento").length;
    const finalizadasOuEntregues = orders.filter((o) =>
      ["finalizada", "entregue"].includes(o.status)
    ).length;

    const faturamentoPrevistoGeral = orders.reduce(
      (acc, o) => acc + (o.totalFinal ?? 0),
      0
    );

    const faturamentoPagoGeral = orders.reduce(
      (acc, o) => acc + (o.valorPago ?? 0),
      0
    );

    const ultimasOs = [...orders]
      .sort((a, b) => {
        const da = a.dataAbertura ?? "";
        const db = b.dataAbertura ?? "";
        return db.localeCompare(da);
      })
      .slice(0, 6);

    return {
      totalOs,
      abertas,
      emAndamento,
      finalizadasOuEntregues,
      faturamentoPrevistoGeral,
      faturamentoPagoGeral,
      ultimasOs,
    };
  }, [orders]);

  const [periodo, setPeriodo] = useState<Periodo>("30d");

  const resumoPeriodo = useMemo(() => {
    if (!orders.length) {
      const { start, end } = getPeriodoRange(periodo);
      return {
        start,
        end,
        osNoPeriodo: 0,
        osPagasPeriodo: 0,
        previstoPeriodo: 0,
        recebidoPeriodo: 0,
      };
    }

    const { start, end } = getPeriodoRange(periodo);

    const osAbertasPeriodo = orders.filter((o) => {
      if (!o.dataAbertura) return false;
      const d = new Date(o.dataAbertura);
      return d >= start && d <= end;
    });

    const osPagasPeriodo = orders.filter((o) => {
      if (!o.dataPagamento) return false;
      const d = new Date(o.dataPagamento);
      return d >= start && d <= end;
    });

    const previstoPeriodo = osAbertasPeriodo.reduce(
      (acc, o) => acc + (o.totalFinal ?? 0),
      0
    );

    const recebidoPeriodo = osPagasPeriodo.reduce(
      (acc, o) => acc + (o.valorPago ?? 0),
      0
    );

    return {
      start,
      end,
      osNoPeriodo: osAbertasPeriodo.length,
      osPagasPeriodo: osPagasPeriodo.length,
      previstoPeriodo,
      recebidoPeriodo,
    };
  }, [orders, periodo]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            Visão geral da assistência
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Acompanhe rapidamente o movimento de ordens de serviço e faturamento.
          </p>
        </div>

        <Link
          to="/adm/nova-os"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-[0.98] transition"
        >
          + Nova OS
        </Link>
      </div>

      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {/* Total de OS */}
        <button
          type="button"
          onClick={() => navigate("/adm/os")}
          className="text-left rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 shadow-sm hover:border-sky-500/40 transition"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total de OS
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-50">
              {totalOs}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Todas as ordens registradas no sistema.
          </p>
        </button>

        {/* Abertas */}
        <button
          type="button"
          onClick={() => navigate("/adm/os?status=aberta")}
          className="text-left rounded-2xl border border-sky-500/50 bg-slate-900 px-4 py-4 shadow-sm hover:bg-slate-900/90 transition"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-sky-400">
            OS abertas
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-50">
              {abertas}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Aguardando diagnóstico ou início do serviço.
          </p>
        </button>

        {/* Em andamento */}
        <button
          type="button"
          onClick={() => navigate("/adm/os?status=em_andamento")}
          className="text-left rounded-2xl border border-amber-400/60 bg-slate-900 px-4 py-4 shadow-sm hover:bg-slate-900/90 transition"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
            Em andamento
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-50">
              {emAndamento}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Em bancada ou aguardando peças/retorno.
          </p>
        </button>

        {/* Finalizadas / Entregues */}
        <button
          type="button"
          onClick={() => navigate("/adm/os?status=concluidas")}
          className="text-left rounded-2xl border border-emerald-400/60 bg-slate-900 px-4 py-4 shadow-sm hover:bg-slate-900/90 transition"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
            Finalizadas / entregues
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-50">
              {finalizadasOuEntregues}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Serviços concluídos e em garantia/cobrança.
          </p>
        </button>

        {/* Faturamento previsto (geral) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 shadow-sm md:col-span-2 xl:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Faturamento previsto (geral)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-50">
              {formatCurrency(faturamentoPrevistoGeral)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Soma do valor final de todas as OS cadastradas.
          </p>
        </div>

        {/* Faturamento recebido (geral) */}
        <div className="rounded-2xl border border-emerald-500/50 bg-slate-900 px-4 py-4 shadow-sm md:col-span-1 xl:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
            Faturamento recebido (geral)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-emerald-200">
              {formatCurrency(faturamentoPagoGeral)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Somente OS com pagamento lançado.
          </p>
        </div>
      </div>

      {/* Resumo financeiro por período */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-50">
              Resumo financeiro por período
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Baseado na data de abertura (previsto) e na data de pagamento
              (recebido).
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {`De ${formatDate(resumoPeriodo.start.toISOString())} até ${formatDate(
                resumoPeriodo.end.toISOString()
              )}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Período:</span>
            <select
              className="border border-slate-600 rounded-md px-2 py-1 text-xs text-slate-100 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as Periodo)}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="mes">Mês atual</option>
              <option value="ano">Ano atual</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              OS abertas no período
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-50">
              {resumoPeriodo.osNoPeriodo}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-200">
              OS pagas no período
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-100">
              {resumoPeriodo.osPagasPeriodo}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Previsto no período
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-50">
              {formatCurrency(resumoPeriodo.previstoPeriodo)}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-3 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-200">
              Recebido no período
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-100">
              {formatCurrency(resumoPeriodo.recebidoPeriodo)}
            </p>
          </div>
        </div>
      </div>

      {/* Últimas OS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-medium text-slate-50">
              Últimas ordens de serviço
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visão rápida das últimas OS criadas no sistema.
            </p>
          </div>

          <Link
            to="/adm/os"
            className="text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            Ver todas →
          </Link>
        </div>

        {ultimasOs.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            Nenhuma OS cadastrada ainda. Comece criando uma nova ordem.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/70">
                <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Nº OS</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Abertura</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {ultimasOs.map((os: ServiceOrder) => (
                  <tr
                    key={os.id}
                    className="border-t border-slate-800 hover:bg-slate-950/60 transition"
                  >
                    <td className="px-4 py-3 font-medium text-slate-50">
                      {os.numero}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border " +
                          (os.status === "aberta"
                            ? "bg-slate-900 text-slate-100 border-slate-600"
                            : os.status === "em_andamento"
                            ? "bg-amber-500/10 text-amber-200 border-amber-400/60"
                            : ["finalizada", "entregue"].includes(os.status)
                            ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/60"
                            : "bg-slate-900 text-slate-200 border-slate-600")
                        }
                      >
                        {os.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(os.dataAbertura)}
                    </td>
                    <td className="px-4 py-3 text-slate-50">
                      {formatCurrency(os.totalFinal)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {os.valorPago && os.valorPago > 0
                        ? formatCurrency(os.valorPago)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/adm/os/${os.id}`}
                        className="text-xs font-medium text-sky-400 hover:text-sky-300"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
