// src/pages/client/ClientHistory.tsx
import { useMemo } from "react";
import { useOrders } from "../../context/OrdersContext";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function formatCurrency(valor: number | undefined) {
  if (valor == null) return "-";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ClientHistory() {
  const { orders } = useOrders();

  const historico = useMemo(
    () =>
      orders
        .filter((os) =>
          ["finalizada", "entregue", "cancelada"].includes(os.status)
        )
        .sort((a, b) => {
          const da = a.dataConclusao ?? a.dataAbertura;
          const db = b.dataConclusao ?? b.dataAbertura;
          return (db ?? "").localeCompare(da ?? "");
        }),
    [orders]
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Título */}
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Histórico de ordens de serviço
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Aqui você acompanha as OS já finalizadas, entregues ou canceladas.
        </p>
      </header>

      {/* Card principal */}
      <section className="rounded-2xl border border-slate-800/70 bg-slate-900/70 shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden backdrop-blur-sm">
        {/* Cabeçalho do card */}
        <div className="px-4 py-3 border-b border-slate-800/70 bg-slate-900/80 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-100">
            {historico.length === 0
              ? "Nenhuma OS finalizada ainda."
              : `${historico.length} ordem(ns) no histórico`}
          </span>
        </div>

        {/* Sem OS */}
        {historico.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-300">
            <div className="mb-4 flex justify-center">
              <div className="h-11 w-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-lg">
                📄
              </div>
            </div>
            <p className="font-medium text-slate-100">
              Nenhuma OS finalizada por enquanto.
            </p>
            <p className="mt-1 text-slate-400">
              Assim que uma OS for finalizada ou entregue, ela aparecerá aqui.
            </p>
          </div>
        ) : (
          // Tabela
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              {/* Cabeçalho */}
              <thead className="bg-slate-900/90 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Nº OS</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Abertura</th>
                  <th className="px-4 py-3 text-left">Conclusão</th>
                  <th className="px-4 py-3 text-left">Total</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((os, index) => (
                  <tr
                    key={os.id}
                    className={
                      "border-t border-slate-800 hover:bg-slate-800/50 transition " +
                      (index % 2 === 1 ? "bg-slate-900/40" : "")
                    }
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-100">
                      {os.numero}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border " +
                          (os.status === "entregue"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : os.status === "cancelada"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200")
                        }
                      >
                        {os.status === "entregue" && "Entregue"}
                        {os.status === "finalizada" && "Finalizada"}
                        {os.status === "cancelada" && "Cancelada"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(os.dataAbertura)}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(os.dataConclusao)}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-50">
                      {formatCurrency(os.totalFinal)}
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
