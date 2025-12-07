// src/pages/admin/AdminServices.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useOrders } from "../../context/OrdersContext";
import { useUiFeedback } from "../../hooks/useUiFeedback";

export default function AdminServices() {
  const { services, createService, updateService, deleteService } = useOrders();
  const { showToast, withLoading } = useUiFeedback();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [valorBase, setValorBase] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function resetForm() {
    setEditingId(null);
    setNome("");
    setValorBase(0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !valorBase) {
      showToast("Preencha o nome e o valor base do serviço.", "error");
      return;
    }

    try {
      await withLoading(setIsSaving, async () => {
        if (editingId) {
          await updateService(editingId, { nome: nome.trim(), valorBase });
        } else {
          await createService({ nome: nome.trim(), valorBase });
        }
      });

      showToast(
        editingId
          ? "Serviço atualizado com sucesso!"
          : "Serviço criado com sucesso!",
        "success"
      );
      resetForm();
    } catch (err) {
      console.error(err);
      showToast("Ocorreu um erro ao salvar o serviço.", "error");
    }
  }

  function handleEdit(id: string) {
    const serv = services.find((s) => s.id === id);
    if (!serv) {
      showToast("Serviço não encontrado.", "error");
      return;
    }
    setEditingId(id);
    setNome(serv.nome);
    setValorBase(serv.valorBase);
  }

  async function handleDelete(id: string) {
    const serv = services.find((s) => s.id === id);
    if (!serv) {
      showToast("Serviço não encontrado.", "error");
      return;
    }

    const ok = window.confirm(
      `Tem certeza que deseja excluir o serviço "${serv.nome}"?`
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      await withLoading(setIsDeleting, async () => {
        await deleteService(id);
      });
      showToast(`Serviço "${serv.nome}" excluído com sucesso.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Não foi possível excluir o serviço.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      {/* Título */}
      <h1 className="text-3xl font-semibold text-white tracking-tight">
        Serviços
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)] p-6 space-y-5 max-w-xl"
      >
        <h2 className="text-lg font-medium text-slate-100">
          {editingId ? "Editar serviço" : "Novo serviço"}
        </h2>

        {/* Nome */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-200">
            Nome do serviço
          </label>
          <input
            type="text"
            className="w-full rounded-md px-3 py-2 text-sm
              bg-slate-900/80 border border-slate-700
              text-slate-100 placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Troca de tela, Limpeza interna..."
          />
        </div>

        {/* Valor */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-200">
            Valor base (R$)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md px-3 py-2 text-sm
              bg-slate-900/80 border border-slate-700
              text-slate-100 placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
            value={valorBase}
            onChange={(e) => setValorBase(Number(e.target.value))}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-md border border-slate-600 
                bg-slate-900 text-slate-200 hover:bg-slate-800 transition
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 text-sm rounded-md 
              bg-indigo-500 text-white font-medium
              hover:bg-indigo-600 active:scale-[0.98] transition
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving
              ? "Salvando..."
              : editingId
              ? "Salvar alterações"
              : "Adicionar serviço"}
          </button>
        </div>
      </form>

      {/* Tabela */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.65)] p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-800">
              <th className="py-3 px-2">Nome</th>
              <th className="py-3 px-2">Valor base (R$)</th>
              <th className="py-3 px-2 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {services.map((s) => (
              <tr
                key={s.id}
                className="border-b border-slate-800/70 bg-slate-950/40 hover:bg-slate-900/70 transition"
              >
                <td className="py-3 px-2 font-medium text-slate-100">
                  {s.nome}
                </td>

                <td className="py-3 px-2 text-slate-200">
                  {s.valorBase.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="py-3 px-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(s.id)}
                    disabled={isSaving || (isDeleting && deletingId === s.id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-slate-600 
                      text-slate-100 bg-slate-900 hover:bg-slate-800 transition
                      disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    disabled={isSaving || (isDeleting && deletingId === s.id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-rose-500/70 
                      text-rose-300 bg-slate-900 hover:bg-rose-950/60 transition
                      disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDeleting && deletingId === s.id
                      ? "Excluindo..."
                      : "Excluir"}
                  </button>
                </td>
              </tr>
            ))}

            {services.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-slate-400 text-sm"
                >
                  Nenhum serviço cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
