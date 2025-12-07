// src/pages/manager/ManagerDashboard.tsx
import { useMemo } from "react";
import { useOrders } from "../../context/OrdersContext";
import { useStores } from "../../context/StoresContext";
import type { OrderStatus } from "../../types/domain";

const STATUS_EM_ANDAMENTO: OrderStatus[] = [
  "aberta",
  "diagnostico",
  "aguardando_aprovacao",
  "aguardando_peca",
  "em_andamento",
];

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function ManagerDashboard() {
  const { orders } = useOrders();
  const { stores } = useStores();

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const metrics = useMemo(() => {
    const totalLojas = stores.length;
    const totalOs = orders.length;

    const osEmAndamento = orders.filter((os) =>
      STATUS_EM_ANDAMENTO.includes(os.status)
    ).length;

    // Faturamento do mês atual
    // Critério simples:
    //  - statusPagamento = "pago" ou "pago_parcial"
    //  - dataPagamento (ou dataConclusao, se não tiver) no mês atual
    const faturamentoMes = orders.reduce((acc, os) => {
      const statusPg = os.statusPagamento;
      if (statusPg !== "pago" && statusPg !== "pago_parcial") return acc;

      const dataRefStr = os.dataPagamento ?? os.dataConclusao ?? os.dataAbertura;
      if (!dataRefStr) return acc;

      const dataRef = new Date(dataRefStr);
      if (
        Number.isNaN(dataRef.getTime()) ||
        dataRef.getMonth() !== mesAtual ||
        dataRef.getFullYear() !== anoAtual
      ) {
        return acc;
      }

      const valor =
        typeof os.valorPago === "number" && os.valorPago > 0
          ? os.valorPago
          : os.totalFinal ?? os.subtotal ?? 0;

      return acc + valor;
    }, 0);

    return {
      totalLojas,
      totalOs,
      osEmAndamento,
      faturamentoMes,
    };
  }, [orders, stores, mesAtual, anoAtual]);

  return (
    <div className="space-y-6 text-slate-50">
      {/* Cabeçalho */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Visão geral do sistema
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Aqui o gerente acompanha o desempenho geral das lojas, quantidade de
          ordens de serviço e faturamento consolidado do sistema.
        </p>
      </header>

      {/* Cards principais */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Lojas ativas */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Lojas ativas
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {metrics.totalLojas}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Quantidade de lojas cadastradas no sistema.
          </p>
        </div>

        {/* OS em andamento */}
        <div className="rounded-2xl border border-sky-500/40 bg-sky-950/40 px-5 py-4 shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-sky-200">
            OS em andamento (todas)
          </p>
          <p className="mt-2 text-3xl font-semibold text-sky-50">
            {metrics.osEmAndamento}
          </p>
          <p className="mt-1 text-xs text-sky-100/80">
            Soma de OS abertas, em diagnóstico, aguardando aprovação/peça ou em
            andamento.
          </p>
        </div>

        {/* Faturamento mês */}
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-5 py-4 shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-200">
            Faturamento do mês
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-400">
            {formatMoney(metrics.faturamentoMes)}
          </p>
          <p className="mt-1 text-xs text-emerald-100/80">
            Considera OS com pagamento registrado neste mês.
          </p>
        </div>
      </section>

      {/* Seção extra opcional: resumo rápido */}
      <section className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Resumo rápido
        </h2>
        <p className="text-sm text-slate-300">
          Existem{" "}
          <span className="font-semibold text-slate-50">
            {metrics.totalOs}
          </span>{" "}
          ordens de serviço registradas no sistema, sendo{" "}
          <span className="font-semibold text-sky-300">
            {metrics.osEmAndamento}
          </span>{" "}
          em andamento neste momento.
        </p>
      </section>
    </div>
  );
}
