// src/pages/client/ClientDashboard.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import { useAuth } from "../../context/AuthContext";
import type { OrderStatus } from "../../types/domain";

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

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { orders, devices } = useOrders();

  const clientId = user?.clientId ?? null;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");

  // =============== LISTA DE OS DO CLIENTE ===============
  const lista = useMemo(() => {
    let result = orders;

    if (clientId) {
      result = result.filter((os) => os.clientId === clientId);
    }

    if (statusFilter) {
      result = result.filter((os) => os.status === statusFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((os) => {
        const device = devices.find((d) => d.id === os.deviceId);
        const alvo = (
          `${os.numero} ${os.defeitoRelatadoCliente ?? ""} ${device?.modelo ?? ""}`
        ).toLowerCase();
        return alvo.includes(s);
      });
    }

    return result.sort((a, b) =>
      (b.dataAbertura ?? "").localeCompare(a.dataAbertura ?? "")
    );
  }, [orders, clientId, search, statusFilter, devices]);

  // ================= METRICS =================
  const metrics = useMemo(() => {
    const abertas = lista.filter((o) => o.status === "aberta").length;
    const andamento = lista.filter((o) =>
      ["diagnostico", "em_andamento", "aguardando_peca", "aguardando_aprovacao"].includes(
        o.status
      )
    ).length;
    const finalizadas = lista.filter((o) =>
      ["finalizada", "entregue"].includes(o.status)
    ).length;

    return { abertas, andamento, finalizadas };
  }, [lista]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Cabeçalho */}
      <header className="mb-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Olá, {user?.nome?.split(" ")[0] ?? "cliente"} 👋
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Acompanhe aqui suas ordens de serviço, status e histórico.
        </p>
      </header>

      {/* Cards resumo */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            OS abertas
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {metrics.abertas}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-amber-200">
            Em andamento
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-50">
            {metrics.andamento}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-emerald-200">
            Finalizadas / entregues
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-50">
            {metrics.finalizadas}
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Busca */}
        <input
          type="text"
          className="flex-1 rounded-md px-3 py-2 text-sm
            bg-slate-900/80 border border-slate-700
            text-slate-100 placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          placeholder="Buscar por número da OS ou modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              statusFilter === ""
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-slate-900 text-slate-200 border-slate-600 hover:bg-slate-800"
            }`}
          >
            Todos
          </button>

          {Object.keys(statusLabels).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as OrderStatus)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                statusFilter === s
                  ? "bg-sky-500 text-white border-sky-400"
                  : "bg-slate-900 text-slate-200 border-slate-600 hover:bg-slate-800"
              }`}
            >
              {statusLabels[s as OrderStatus]}
            </button>
          ))}
        </div>
      </section>

      {/* Lista */}
      <section className="bg-slate-900/60 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        {lista.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhuma ordem encontrada. Assim que você tiver OS, elas aparecerão aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-700">
                <tr className="text-xs text-slate-300 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Nº OS</th>
                  <th className="px-4 py-3 text-left">Equipamento</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Abertura</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((os, idx) => {
                  const device = devices.find((d) => d.id === os.deviceId);

                  return (
                    <tr
                      key={os.id}
                      className={
                        "border-t border-slate-800 transition " +
                        (idx % 2 === 1 ? "bg-slate-950/40" : "bg-slate-950/20")
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-100">
                        {os.numero}
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {device ? `${device.tipo} ${device.marca} ${device.modelo}` : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border " +
                            statusColors[os.status]
                          }
                        >
                          {statusLabels[os.status]}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-200">
                        {formatDate(os.dataAbertura)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/cliente/os?focus=${os.id}`}
                          className="text-xs font-medium text-sky-400 hover:text-sky-300"
                        >
                          Detalhes →
                        </Link>
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
