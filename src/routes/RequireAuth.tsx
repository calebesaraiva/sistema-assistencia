import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege qualquer rota que precise estar logado.
 * Se não tiver user, redireciona para /login.
 */
export default function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center text-slate-300 p-6">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
