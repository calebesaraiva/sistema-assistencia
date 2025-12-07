// src/pages/admin/AdminNewOrder.tsx
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useOrders } from "../../context/OrdersContext";
import { useNavigate } from "react-router-dom";

export default function AdminNewOrder() {
  const { clients, devices, services, createOrder } = useOrders();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [deviceId, setDeviceId] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [valor, setValor] = useState(services[0]?.valorBase ?? 0);
  const [defeitoRelatadoCliente, setDefeitoRelatadoCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const devicesDoCliente = useMemo(
    () => devices.filter((d) => d.clientId === clientId),
    [devices, clientId]
  );

  function handleChangeClient(id: string) {
    setClientId(id);
    const primeiro = devices.find((d) => d.clientId === id);
    setDeviceId(primeiro?.id ?? "");
  }

  function handleChangeService(id: string) {
    setServiceId(id);
    const serv = services.find((s) => s.id === id);
    if (serv) setValor(serv.valorBase);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!clientId || !deviceId || !serviceId || !defeitoRelatadoCliente) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    createOrder({
      clientId,
      deviceId,
      serviceId,
      valor: Number(valor),
      defeitoRelatadoCliente,
      observacoes,
    });

    alert("Ordem de serviço criada com sucesso!");
    navigate("/adm/os");
  }

  if (!deviceId && devicesDoCliente[0]?.id) {
    setDeviceId(devicesDoCliente[0].id);
  }

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

      {/* FORM */}
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
            {devicesDoCliente.map((d) => (
              <option key={d.id} value={d.id}>
                {d.tipo} {d.marca} {d.modelo}
              </option>
            ))}

            {devicesDoCliente.length === 0 && (
              <option value="">
                Nenhum equipamento cadastrado para o cliente
              </option>
            )}
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
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-5 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Salvar OS
          </button>
        </div>
      </form>
    </div>
  );
}
