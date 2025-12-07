// src/pages/OrderDetail.tsx
import { useState, useMemo, FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useOrders } from "../context/OrdersContext";
import type { OrderStatus, PaymentStatus } from "../types/domain";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    orders,
    clients,
    devices,
    services,
    updateOrderStatus,
    updateOrderLaudo,
    updateOrderPayment,
  } = useOrders();

  const ordem = useMemo(
    () => orders.find((o) => o.id === id || o.numero === id),
    [orders, id]
  );

  if (!ordem) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-slate-100">
        <p className="text-sm text-slate-300">
          Ordem de serviço não encontrada.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-3 py-2 text-sm rounded-md border border-slate-600 bg-slate-900/60 text-slate-100 hover:bg-slate-800"
        >
          Voltar
        </button>
      </div>
    );
  }

  const cliente = clients.find((c) => c.id === ordem.clientId);
  const device = devices.find((d) => d.id === ordem.deviceId);

  const servicoPrincipal = services.find((s) =>
    ordem.itens.some((i) => i.serviceId === s.id)
  );

  const totalOs = ordem.totalFinal ?? ordem.subtotal ?? 0;

  // ---------------- estados locais ----------------
  const [statusLocal, setStatusLocal] = useState<OrderStatus>(ordem.status);
  const [laudoLocal, setLaudoLocal] = useState(ordem.laudoTecnico ?? "");

  const [statusPagamentoLocal, setStatusPagamentoLocal] =
    useState<PaymentStatus>(ordem.statusPagamento ?? "pendente");

  const [formaPagamentoLocal, setFormaPagamentoLocal] = useState(
    ordem.formaPagamento ?? ""
  );

  const [valorPagoLocal, setValorPagoLocal] = useState<number>(
    ordem.valorPago ?? totalOs
  );

  const restante = Math.max(totalOs - (valorPagoLocal || 0), 0);

  // ---------------- handlers ----------------
  function handleSalvarStatus() {
    updateOrderStatus(ordem.id, statusLocal);
    alert("Status atualizado!");
  }

  function handleSalvarLaudo() {
    updateOrderLaudo(ordem.id, laudoLocal);
    alert("Laudo atualizado!");
  }

  function handleSalvarPagamento(e?: FormEvent) {
    e?.preventDefault();
    updateOrderPayment(ordem.id, {
      statusPagamento: statusPagamentoLocal,
      formaPagamento: formaPagamentoLocal || undefined,
      valorPago: valorPagoLocal,
    });
    alert("Pagamento atualizado!");
  }

  const badgeStatus: Record<OrderStatus, string> = {
    aberta: "bg-sky-500/10 text-sky-300 border-sky-500/40",
    diagnostico: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    aguardando_aprovacao:
      "bg-amber-500/10 text-amber-300 border-amber-500/40",
    aguardando_peca: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    em_andamento: "bg-blue-500/10 text-blue-300 border-blue-500/40",
    finalizada: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    entregue: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    cancelada: "bg-rose-500/10 text-rose-300 border-rose-500/40",
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 text-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              OS {ordem.numero}
            </h1>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${badgeStatus[ordem.status]}`}
            >
              {ordem.status.replace("_", " ")}
            </span>
          </div>

          <p className="text-sm text-slate-300 mt-1">
            Criada em{" "}
            {new Date(ordem.dataAbertura).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm rounded-md border border-slate-600 bg-slate-900/60 text-slate-100 hover:bg-slate-800"
          >
            Voltar
          </button>

          <Link
            to={`${location.pathname}/comanda`}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            Ver comanda
          </Link>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.25fr]">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-6">
          {/* cliente + equipamento */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-1.5">
                Dados do cliente
              </h2>
              <p className="text-sm font-medium text-slate-50">
                {cliente?.nome}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                Tel.: {cliente?.telefonePrincipal}
              </p>
              {cliente?.cpfCnpj && (
                <p className="text-sm text-slate-300">
                  CPF/CNPJ: {cliente.cpfCnpj}
                </p>
              )}
            </div>

            {/* Equipamento */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-1.5">
                Equipamento
              </h2>
              <p className="text-sm font-medium text-slate-50">
                {device?.tipo} {device?.marca} {device?.modelo}
              </p>
              {device?.imeiSerie && (
                <p className="text-sm text-slate-300 mt-1">
                  IMEI/Série: {device.imeiSerie}
                </p>
              )}
            </div>
          </div>

          {/* defeito + laudo */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Defeito relatado */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-2">
                Defeito relatado pelo cliente
              </h2>
              <p className="text-sm text-slate-200 whitespace-pre-line">
                {ordem.defeitoRelatadoCliente}
              </p>
            </div>

            {/* Laudo técnico */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-200 mb-2">
                Laudo técnico
              </h2>

              <textarea
                className="flex-1 text-sm border border-slate-600 rounded-md px-3 py-2 min-h-[120px] resize-none bg-slate-950/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Descreva testes realizados, peças trocadas, observações técnicas..."
                value={laudoLocal}
                onChange={(e) => setLaudoLocal(e.target.value)}
              />

              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleSalvarLaudo}
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Salvar laudo
                </button>
              </div>
            </div>
          </div>

          {/* Serviços / Itens */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">
              Serviços / Itens
            </h2>

            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/80 text-slate-300">
                  <tr>
                    <th className="text-left px-3 py-2">Serviço</th>
                    <th className="text-left px-3 py-2">Descrição</th>
                    <th className="text-right px-3 py-2">Valor (R$)</th>
                  </tr>
                </thead>

                <tbody>
                  {ordem.itens.map((item) => {
                    const serv = services.find((s) => s.id === item.serviceId);
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-800 bg-slate-950/40"
                      >
                        <td className="px-3 py-2 text-slate-50">
                          {serv?.nome ?? servicoPrincipal?.nome ?? "Serviço"}
                        </td>
                        <td className="px-3 py-2 text-slate-300">
                          {item.descricao}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-50">
                          R$ {item.valor.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal */}
                  <tr className="border-t border-slate-800 bg-slate-900">
                    <td
                      className="px-3 py-2 text-xs text-slate-300"
                      colSpan={2}
                    >
                      Subtotal
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-50">
                      R$ {totalOs.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          {/* Status da OS */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">
              Status da OS
            </h2>

            <label className="block text-xs font-medium text-slate-300 mb-1">
              Status atual
            </label>

            <select
              className="w-full border border-slate-600 rounded-md px-3 py-2 text-sm bg-slate-950/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={statusLocal}
              onChange={(e) => setStatusLocal(e.target.value as OrderStatus)}
            >
              <option value="aberta">Aberta</option>
              <option value="diagnostico">Em diagnóstico</option>
              <option value="aguardando_aprovacao">Aguardando aprovação</option>
              <option value="aguardando_peca">Aguardando peça</option>
              <option value="em_andamento">Em andamento</option>
              <option value="finalizada">Finalizada</option>
              <option value="entregue">Entregue</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <button
              type="button"
              onClick={handleSalvarStatus}
              className="w-full mt-3 px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Salvar status
            </button>
          </div>

          {/* Pagamento */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-700 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">
              Pagamento
            </h2>

            <div className="space-y-3">
              {/* status do pagamento */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Status do pagamento
                </label>
                <select
                  className="w-full border border-slate-600 rounded-md px-3 py-2 text-sm bg-slate-950/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  value={statusPagamentoLocal}
                  onChange={(e) =>
                    setStatusPagamentoLocal(e.target.value as PaymentStatus)
                  }
                >
                  <option value="nao_informado">Não informado</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago_parcial">Pago parcial</option>
                  <option value="pago">Pago</option>
                  <option value="cortesia">Cortesia</option>
                </select>
              </div>

              {/* forma */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Forma de pagamento
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-600 rounded-md px-3 py-2 text-sm bg-slate-950/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Ex.: Dinheiro, Pix, Cartão..."
                  value={formaPagamentoLocal}
                  onChange={(e) => setFormaPagamentoLocal(e.target.value)}
                />
              </div>

              {/* valor pago */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Valor pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-slate-600 rounded-md px-3 py-2 text-sm bg-slate-950/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  value={valorPagoLocal}
                  onChange={(e) =>
                    setValorPagoLocal(Number(e.target.value))
                  }
                />

                <p className="mt-1 text-xs text-slate-300">
                  Total da OS:{" "}
                  <span className="font-medium text-slate-50">
                    R$ {totalOs.toFixed(2)}
                  </span>
                  {restante > 0 && (
                    <>
                      {" "}
                      | Restante:{" "}
                      <span className="font-medium text-amber-300">
                        R$ {restante.toFixed(2)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSalvarPagamento}
                className="w-full mt-1 px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Salvar pagamento
              </button>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 text-slate-50 border border-slate-700 shadow-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Subtotal</span>
              <span>R$ {totalOs.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Pago</span>
              <span>
                R$ {(ordem.valorPago ?? valorPagoLocal ?? 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-semibold">
              <span>Restante</span>
              <span className={restante > 0 ? "text-amber-300" : ""}>
                R$ {restante.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
