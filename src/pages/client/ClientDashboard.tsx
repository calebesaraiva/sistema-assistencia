export default function ClientDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Cabeçalho */}
      <header className="mb-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
          Olá, cliente 👋
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Acompanhe aqui suas ordens de serviço, status e histórico.
        </p>
      </header>

      {/* Card de estado vazio */}
      <section className="rounded-2xl border border-slate-800/60 bg-slate-900/70 shadow-[0_18px_60px_rgba(0,0,0,0.6)] p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl">
            🔧
          </div>

          <p className="text-slate-100 font-medium text-sm md:text-base">
            Seu painel ainda está sendo configurado.
          </p>

          <p className="text-slate-400 text-xs md:text-sm max-w-md">
            Assim que você tiver ordens de serviço abertas, elas vão aparecer
            aqui com status, datas e detalhes do equipamento.
          </p>
        </div>
      </section>
    </div>
  );
}
