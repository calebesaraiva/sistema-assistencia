// src/pages/manager/ManagerStoresDashboard.tsx
import { useMemo } from "react";
import { useOrders } from "../../context/OrdersContext";
import type { OrderStatus } from "../../types/domain";

type LojaDashboard = {
  id: string;
  nome: string;
  cnpj?: string;
  cidadeUf?: string;
  telefone?: string;
};

// MOCK de lojas (ids batendo com AuthContext / OrdersContext)
const STORES: LojaDashboard[] = [
  {
    id: "loja-1",
    nome: "Loja Centro",
    cnpj: "00.000.000/0001-01",
    cidadeUf: "São Luís / MA",
    telefone: "(98) 99999-0001",
  },
  {
    id: "loja-2",
    nome: "Loja Shopping",
    cnpj: "00.000.000/0002-02",
    cidadeUf: "São Luís / MA",
    telefone: "(98) 99999-0002",
  },
  {
    id: "loja-3",
    nome: "Loja Barreirinhas",
    cnpj: "00.000.000/0003-03",
    cidadeUf: "Barreirinhas / MA",
    telefone: "(98) 99999-0003",
  },
];

function isEmAndamento(status: OrderStatus) {
  return (
    status === "aberta" ||
    status === "diagnostico" ||
    status === "aguardando_aprovacao" ||
    status === "aguardando_peca" ||
    status === "em_andamento"
  );
}

function isFinalizada(status: OrderStatus) {
  return status === "finalizada" || status === "entregue";
}

export default function ManagerStoresDashboard() {
  const { orders } = useOrders();

  const lojasComMetricas = useMemo(() => {
    return STORES.map((store) => {
      const osDaLoja = orders.filter((os) => os.lojaId === store.id);

      const totalOs = osDaLoja.length;
      const emAndamento = osDaLoja.filter((os) =>
        isEmAndamento(os.status)
      ).length;
      const finalizadas = osDaLoja.filter((os) =>
        isFinalizada(os.status)
      ).length;
      const canceladas = osDaLoja.filter(
        (os) => os.status === "cancelada"
      ).length;

      const faturamento = osDaLoja.reduce(
        (acc, os) => acc + (os.valorPago ?? 0),
        0
      );

      return {
        ...store,
        totalOs,
        emAndamento,
        finalizadas,
        canceladas,
        faturamento,
      };
    });
  }, [orders]);

  const totalLojasAtivas = lojasComMetricas.length;
  const totalOsTodas = lojasComMetricas.reduce(
    (acc, loja) => acc + loja.totalOs,
    0
  );
  const totalFaturamentoTodas = lojasComMetricas.reduce(
    (acc, loja) => acc + loja.faturamento,
    0
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Dashboard das lojas
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Aqui o gerente acompanha o desempenho de cada loja: volume de OS,
          status e faturamento estimado.
        </p>
      </header>

      {/* Resumo geral */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em]">
            Lojas ativas
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {totalLojasAtivas}
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em]">
            OS cadastradas (todas as lojas)
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {totalOsTodas}
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em]">
            Faturamento (estimado)
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-400">
            R$ {totalFaturamentoTodas.toFixed(2)}
          </p>
        </div>
      </section>

      {/* Lista de lojas */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Lojas cadastradas
          </h2>
          <span className="text-xs text-slate-400">
            Dados consolidados das ordens de serviço por loja
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-100">
            <thead className="bg-slate-900 border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="text-left px-3 py-2">Loja</th>
                <th className="text-left px-3 py-2">CNPJ</th>
                <th className="text-left px-3 py-2">Cidade / UF</th>
                <th className="text-left px-3 py-2">Telefone</th>
                <th className="text-center px-3 py-2">OS total</th>
                <th className="text-center px-3 py-2">Em andamento</th>
                <th className="text-center px-3 py-2">Finalizadas</th>
                <th className="text-center px-3 py-2">Canceladas</th>
                <th className="text-right px-3 py-2">Faturamento (R$)</th>
              </tr>
            </thead>

            <tbody>
              {lojasComMetricas.map((loja) => (
                <tr
                  key={loja.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80 transition"
                >
                  <td className="px-3 py-2 font-medium">{loja.nome}</td>
                  <td className="px-3 py-2 text-slate-300">
                    {loja.cnpj ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {loja.cidadeUf ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {loja.telefone ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {loja.totalOs}
                  </td>
                  <td className="px-3 py-2 text-center text-amber-300">
                    {loja.emAndamento}
                  </td>
                  <td className="px-3 py-2 text-center text-emerald-300">
                    {loja.finalizadas}
                  </td>
                  <td className="px-3 py-2 text-center text-rose-300">
                    {loja.canceladas}
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400 font-semibold">
                    {loja.faturamento.toFixed(2)}
                  </td>
                </tr>
              ))}

              {lojasComMetricas.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-slate-400"
                  >
                    Nenhuma loja encontrada.
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
