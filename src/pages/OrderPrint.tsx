// src/pages/OrderPrint.tsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrders } from "../context/OrdersContext";

export default function OrderPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, clients, devices, services } = useOrders();

  const ordem = useMemo(
    () => orders.find((o) => o.id === id || o.numero === id),
    [orders, id]
  );

  if (!ordem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white px-6 py-4 rounded-xl shadow-md border border-slate-200">
          <p className="text-sm text-slate-700">
            Ordem de serviço não encontrada para impressão.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const cliente = clients.find((c) => c.id === ordem.clientId);
  const device = devices.find((d) => d.id === ordem.deviceId);

  const totalOs = ordem.totalFinal ?? ordem.subtotal ?? 0;
  const valorPago = ordem.valorPago ?? 0;
  const restante = Math.max(totalOs - valorPago, 0);

  const dataAbertura = ordem.dataAbertura
    ? new Date(ordem.dataAbertura).toLocaleDateString("pt-BR")
    : "-";

  const dataPrevisao = ordem.dataPrevisao
    ? new Date(ordem.dataPrevisao).toLocaleDateString("pt-BR")
    : "-";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-4 print:bg-white">
      {/* barra superior (esconde na impressão) */}
      <div className="max-w-3xl mx-auto mb-4 px-4 print:hidden">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Imprimir comanda
          </button>
        </div>
      </div>

      {/* área da comanda */}
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl print:shadow-none print:rounded-none print:border print:border-slate-300 px-6 py-6 text-[13px] leading-snug">
        {/* topo - dados da loja */}
        <header className="border-b border-slate-200 pb-3 mb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                Nexus Tech Assistência
              </h1>
              <p className="text-[11px] text-slate-700">
                CNPJ 00.000.000/0000-00 • Rua Exemplo, 123 - Bairro - Cidade/UF
              </p>
              <p className="text-[11px] text-slate-700">
                Tel: (98) 00000-0000 • WhatsApp: (98) 00000-0000
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Ordem de Serviço</p>
              <p className="text-xl font-bold tracking-[0.2em] text-slate-900">
                {ordem.numero}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Abertura: {dataAbertura}
              </p>
            </div>
          </div>
        </header>

        {/* dados cliente / aparelho */}
        <section className="border-b border-slate-200 pb-3 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h2 className="font-semibold text-[12px] mb-1 text-slate-800">
                Dados do cliente
              </h2>
              <p className="text-[13px] font-medium text-slate-900">
                {cliente?.nome ?? "—"}
              </p>
              <p className="text-[12px] text-slate-700">
                Tel: {cliente?.telefonePrincipal ?? "—"}
              </p>
              {cliente?.cpfCnpj && (
                <p className="text-[12px] text-slate-700">
                  CPF/CNPJ: {cliente.cpfCnpj}
                </p>
              )}
              {cliente?.email && (
                <p className="text-[12px] text-slate-700">
                  E-mail: {cliente.email}
                </p>
              )}
            </div>

            <div>
              <h2 className="font-semibold text-[12px] mb-1 text-slate-800">
                Equipamento
              </h2>
              <p className="text-[13px] font-medium text-slate-900">
                {device?.tipo} {device?.marca} {device?.modelo}
              </p>
              {device?.cor && (
                <p className="text-[12px] text-slate-700">Cor: {device.cor}</p>
              )}
              {device?.imeiSerie && (
                <p className="text-[12px] text-slate-700">
                  IMEI/Série: {device.imeiSerie}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-[12px] text-slate-700">
                Previsão de entrega: {dataPrevisao}
              </p>
              {ordem.prioridade && (
                <p className="text-[12px] text-slate-700">
                  Prioridade:{" "}
                  <span className="font-medium">
                    {ordem.prioridade === "urgente" ? "Urgente" : "Normal"}
                  </span>
                </p>
              )}
            </div>
            <div className="text-right">
              {ordem.statusPagamento && (
                <p className="text-[12px] text-slate-700">
                  Status pagamento:{" "}
                  <span className="font-medium">
                    {ordem.statusPagamento === "pago"
                      ? "Pago"
                      : ordem.statusPagamento === "pago_parcial"
                      ? "Pago parcial"
                      : ordem.statusPagamento === "pendente"
                      ? "Pendente"
                      : ordem.statusPagamento === "cortesia"
                      ? "Cortesia"
                      : "Não informado"}
                  </span>
                </p>
              )}
              {ordem.formaPagamento && (
                <p className="text-[12px] text-slate-700">
                  Forma: {ordem.formaPagamento}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* defeito / laudo */}
        <section className="border-b border-slate-200 pb-3 mb-3 space-y-2">
          <div>
            <h2 className="font-semibold text-[12px] mb-1 text-slate-800">
              Defeito relatado pelo cliente
            </h2>
            <p className="text-[12px] text-slate-800 whitespace-pre-line">
              {ordem.defeitoRelatadoCliente}
            </p>
          </div>

          {ordem.laudoTecnico && (
            <div>
              <h2 className="font-semibold text-[12px] mb-1 text-slate-800">
                Laudo técnico
              </h2>
              <p className="text-[12px] text-slate-800 whitespace-pre-line">
                {ordem.laudoTecnico}
              </p>
            </div>
          )}
        </section>

        {/* serviços / valores */}
        <section className="border-b border-slate-200 pb-3 mb-3">
          <h2 className="font-semibold text-[12px] mb-2 text-slate-800">
            Serviços / Itens
          </h2>
          <table className="w-full text-[12px] border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-2 py-1 text-left">
                  Descrição
                </th>
                <th className="border border-slate-200 px-2 py-1 text-right">
                  Valor (R$)
                </th>
              </tr>
            </thead>
            <tbody>
              {ordem.itens.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 1 ? "bg-slate-50/70" : "bg-white"}
                >
                  <td className="border border-slate-200 px-2 py-1">
                    {item.descricao}
                  </td>
                  <td className="border border-slate-200 px-2 py-1 text-right">
                    {item.valor.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                  Total
                </td>
                <td className="border border-slate-200 px-2 py-1 text-right font-semibold">
                  {totalOs.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 text-[12px] text-slate-800 flex justify-between">
            <span>
              Valor pago:{" "}
              <span className="font-semibold">
                R$ {valorPago.toFixed(2)}
              </span>
            </span>
            <span>
              Restante:{" "}
              <span className="font-semibold">
                R$ {restante.toFixed(2)}
              </span>
            </span>
          </div>
        </section>

        {/* assinaturas / observações */}
        <section className="mt-4 space-y-4">
          <div className="text-[11px] text-slate-700">
            <p>
              <span className="font-semibold">Observações importantes:</span>{" "}
              Ao deixar o equipamento, o cliente concorda que:
            </p>
            <ul className="list-disc ml-4 mt-1 space-y-0.5">
              <li>
                Equipamentos com sinais de oxidação ou queda podem apresentar
                novos defeitos durante o reparo.
              </li>
              <li>
                Após {ordem.diasGarantia ?? 90} dias da conclusão, não havendo
                retirada, poderá ser cobrada taxa de armazenamento.
              </li>
              <li>
                Garantia cobre apenas o serviço/peça realizada(s), não defeitos
                diferentes do relatado.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-6">
            <div className="text-center text-[11px] text-slate-700">
              <div className="border-t border-slate-400 mt-8 pt-1">
                Assinatura do cliente
              </div>
            </div>
            <div className="text-center text-[11px] text-slate-700">
              <div className="border-t border-slate-400 mt-8 pt-1">
                Assinatura / carimbo da loja
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-6 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Nexus Tech Assistência • Sistema de Ordens de Serviço
        </footer>
      </div>
    </div>
  );
}
