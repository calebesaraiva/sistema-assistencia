import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  function handleLogin(role: "cliente" | "tecnico" | "adm") {
    loginAs(role);
    if (role === "cliente") navigate("/cliente");
    if (role === "tecnico") navigate("/tecnico");
    if (role === "adm") navigate("/adm");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] p-8 animate-fade-in">

        {/* brilho suave */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-transparent to-indigo-500/10" />

        <div className="relative">
          <h1 className="text-2xl font-semibold text-center text-slate-50 tracking-tight">
            Sistema de Assistência Técnica
          </h1>

          <p className="text-sm text-slate-400 mt-2 mb-6 text-center">
            Selecione um perfil para entrar{" "}
            <span className="inline-flex items-center rounded-full border border-slate-600/60 px-2 py-0.5 text-[11px] font-medium text-slate-300 ml-1">
              modo teste
            </span>
          </p>

          <div className="flex flex-col gap-3">

            {/* CLIENTE — corrigido */}
            <button
              onClick={() => handleLogin("cliente")}
              className="
                w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-50
                bg-gradient-to-r from-sky-500 to-indigo-500
                hover:brightness-110 hover:shadow-lg hover:shadow-sky-500/30
                active:scale-[0.98]
                transition-all duration-150
              "
            >
              Entrar como Cliente
            </button>

            {/* TÉCNICO */}
            <button
              onClick={() => handleLogin("tecnico")}
              className="
                w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-100
                border border-slate-600/70 bg-slate-900/40
                hover:bg-slate-800/70 hover:border-slate-400/80
                hover:-translate-y-[1px] active:scale-[0.98]
                transition-all duration-150
              "
            >
              Entrar como Técnico
            </button>

            {/* ADM */}
            <button
              onClick={() => handleLogin("adm")}
              className="
                w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-100
                border border-slate-600/70 bg-slate-900/40
                hover:bg-slate-800/70 hover:border-slate-400/80
                hover:-translate-y-[1px] active:scale-[0.98]
                transition-all duration-150
              "
            >
              Entrar como Administrador
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
