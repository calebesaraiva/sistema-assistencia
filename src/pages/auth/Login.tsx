// src/pages/auth/Login.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUiFeedback } from "../../hooks/useUiFeedback";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast, withLoading } = useUiFeedback();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !senha.trim()) {
      showToast("Preencha o e-mail e a senha.", "error");
      return;
    }

    try {
      await withLoading(setIsSubmitting, async () => {
        // autentica usando o AuthContext
        const user = await login(email.trim().toLowerCase(), senha.trim());

        if (!user) {
          // força cair no catch com um erro conhecido
          throw new Error("INVALID_CREDENTIALS");
        }

        // aqui o TypeScript sabe certinho o tipo de user
        showToast(`Bem-vindo, ${user.nome}!`, "success");

        switch (user.role) {
          case "cliente":
            navigate("/cliente");
            break;
          case "tecnico":
            navigate("/tecnico");
            break;
          case "adm":
            navigate("/adm");
            break;
          case "gerente":
            navigate("/gerente");
            break;
        }
      });
    } catch (err: any) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        showToast("E-mail ou senha inválidos.", "error");
      } else {
        console.error(err);
        showToast("Erro ao entrar. Tente novamente.", "error");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] p-8 animate-fade-in">
        {/* brilho suave */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-transparent to-indigo-500/10" />

        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-slate-50 tracking-tight">
              Sistema de Assistência Técnica
            </h1>
            <p className="text-sm text-slate-400">
              Acesse com seu usuário e senha para continuar.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Para testes: <br />
              <span className="font-mono">
                adm@teste.com / tecnico@teste.com / cliente@teste.com
              </span>
              <br />
              <span className="font-mono">gerente@sistema.com</span>
              <br />
              senha: <span className="font-mono">123456</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                E-mail
              </label>
              <input
                type="email"
                autoComplete="username"
                className="w-full rounded-xl px-3 py-2.5 text-sm
                  bg-slate-900/70 border border-slate-700
                  text-slate-50 placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-200">
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl px-3 py-2.5 text-sm
                  bg-slate-900/70 border border-slate-700
                  text-slate-50 placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-50
                bg-gradient-to-r from-sky-500 to-indigo-500
                hover:brightness-110 hover:shadow-lg hover:shadow-sky-500/30
                active:scale-[0.98]
                transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
