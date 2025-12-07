import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

/**
 * Protege rotas específicas por papel:
 * Exemplo: <RequireRole role="adm">...</RequireRole>
 */
export default function RequireRole({ role }: { role: UserRole }) {
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

  if (user.role !== role) {
    // sem permissão → manda para página do perfil do usuário
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}
