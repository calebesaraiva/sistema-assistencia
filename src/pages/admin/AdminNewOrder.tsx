// src/pages/admin/AdminNewOrder.tsx
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useOrders } from "../../context/OrdersContext";
import { useNavigate } from "react-router-dom";
import { useUiFeedback } from "../../hooks/useUiFeedback";

export default function AdminNewOrder() {
  const { clients, devices, services, createOrder } = useOrders();
  const navigate = useNavigate();
  const { showToast, withLoading } = useUiFeedback();

  const [clientId, setClientId] = useState<string>("");
  const [deviceId, setDeviceId] = useState("");
  const [serviceId, setServiceId] = useState<string>("");
  const [valor, setValor] = useState<number>(0);
  const [defeitoRelatadoCliente, setDefeitoRelatadoCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quando os clientes chegarem (mock ou API), define o primeiro como padrão se ainda não tiver um selecionado
  useEffect(() => {
    if (!clientId && clients.length > 0) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  // Quando os serviços chegarem (mock ou API), define o primeiro como padrão e já puxa o valor base
  useEffect(() => {
    if (!serviceId && services.length > 0) {
      setServiceId(services[0].id);
      setValor(services[0].valorBase);
    }
  }, [services, serviceId]);

  const devicesDoCliente = useMemo(
    () => devices.filter((d) => d.clientId === clientId),
    [devices, clientId]
  );

  // sempre que mudar o cliente, define o primeiro device dele (se existir)
  useEffect(() => {
    if (!devicesDoCliente.length) {
      setDeviceId("");
      return;
    }
    // se o device atual não pertence ao cliente, troca
    const aindaExiste = devicesDoCliente.some((d) => d.id === deviceId);
    if (!aindaExiste) {
      setDeviceId(devicesDoCliente[0].id);
    }
  }, [devicesDoCliente, deviceId]);

  function handleChangeClient(id: string) {
    setClientId(id);
  }

  function handleChangeService(id: string) {
    setServiceId(id);
    const serv = services.find((s) => s.id === id);
    if (serv) setValor(serv.valorBase);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!clientId || !deviceId || !serviceId || !defeitoRelatadoCliente.trim()) {
      showToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    try {
      await withLoading(setIsSubmitting, async () => {
        await createOrder({
          clientId,
          deviceId,
          serviceId,
          valor: Number(valor),
          defeitoRelatadoCliente: defeitoRelatadoCliente.trim(),
          observacoes: observacoes.trim() || undefined,
        });
      });

      showToast("Ordem de serviço criada com sucesso!", "success");
      navigate("/adm/os");
    } catch (error) {
      console.error(error);
      showToast("Erro ao criar a OS. Tente novamente.", "error");
    }
  }

  const hasBasicData = clients.length > 0 && services.length > 0;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      {/* TÍTULO */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          Nova Ordem de Serviço
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Preencha os dados abaixo para registrar uma nova OS no sistema.
        </p>
      </div>

      {/* Se não tiver cliente ou serviço cadastrado, avisa (mesmo estilo do card) */}
      {!hasBasicData ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 text-sm text-slate-600">
          É necessário ter pelo menos um <strong>cliente</strong> e um{" "}
          <strong>serviço</strong> cadastrados antes de abrir uma OS.
        </div>
      ) : (
        /* FORM */
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 space-y-5 backdrop-blur-xl"
        >
          {/* CLIENTE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Cliente *
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
              value={clientId}
              onChange={(e) => handleChangeClient(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.telefonePrincipal})
                </option>
              ))}
            </select>
          </div>

          {/* EQUIPAMENTO */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Equipamento *
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              {devicesDoCliente.length === 0 && (
                <option value="">
                  Nenhum equipamento cadastrado para o cliente
                </option>
              )}

              {devicesDoCliente.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.tipo} {d.marca} {d.modelo}
                </option>
              ))}
            </select>
          </div>

          {/* SERVIÇO */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Serviço principal *
            </label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
              value={serviceId}
              onChange={(e) => handleChangeService(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} (R$ {s.valorBase.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* VALOR */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
            />
          </div>

          {/* DEFEITO RELATADO */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Defeito relatado pelo cliente *
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[90px] bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
              value={defeitoRelatadoCliente}
              onChange={(e) => setDefeitoRelatadoCliente(e.target.value)}
              placeholder="Descreva o problema informado pelo cliente"
            />
          </div>

          {/* OBSERVAÇÕES */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Observações
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm min-h-[70px] bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais, condição física do aparelho, prazos..."
            />
          </div>

          {/* AÇÕES */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/adm/os")}
              className="px-4 py-2 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-100 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Salvando..." : "Salvar OS"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
