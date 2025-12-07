// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

import Login from "../pages/auth/Login";
import AppLayout from "../components/layout/AppLayout";

// CLIENTE
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientOrders from "../pages/client/ClientOrders";
import ClientHistory from "../pages/client/ClientHistory";

// TÉCNICO
import TechDashboard from "../pages/technician/TechDashboard";
import TechOrders from "../pages/technician/TechOrders";

// ADMIN
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminNewOrder from "../pages/admin/AdminNewOrder";
import AdminServices from "../pages/admin/AdminServices";
import AdminClients from "../pages/admin/AdminClients";
import AdminUsers from "../pages/admin/AdminUsers";

// GERENTE
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerStoresDashboard from "../pages/manager/ManagerStoresDashboard";
import ManagerOrdersAll from "../pages/manager/ManagerOrdersAll";

// OS (compartilhadas)
import OrderDetail from "../pages/OrderDetail";
import OrderPrint from "../pages/OrderPrint";

interface PrivateRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

function getHomeByRole(role: UserRole) {
  switch (role) {
    case "adm":
      return "/adm";
    case "tecnico":
      return "/tecnico";
    case "gerente":
      return "/gerente";
    case "cliente":
    default:
      return "/cliente";
  }
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100 bg-slate-950">
        Carregando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getHomeByRole(user.role)} replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? <Navigate to={getHomeByRole(user.role)} replace /> : <Login />
        }
      />

      {/* RAIZ "/" */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={getHomeByRole(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ========== CLIENTE ========== */}
      <Route
        path="/cliente"
        element={
          <PrivateRoute roles={["cliente"]}>
            <AppLayout role="cliente">
              <ClientDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/cliente/historico"
        element={
          <PrivateRoute roles={["cliente"]}>
            <AppLayout role="cliente">
              <ClientHistory />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/cliente/os"
        element={
          <PrivateRoute roles={["cliente"]}>
            <AppLayout role="cliente">
              <ClientOrders />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* ========== TÉCNICO ========== */}
      <Route
        path="/tecnico"
        element={
          <PrivateRoute roles={["tecnico", "adm", "gerente"]}>
            <AppLayout role="tecnico">
              <TechDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tecnico/os"
        element={
          <PrivateRoute roles={["tecnico", "adm", "gerente"]}>
            <AppLayout role="tecnico">
              <TechOrders />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tecnico/os/:id"
        element={
          <PrivateRoute roles={["tecnico", "adm", "gerente"]}>
            <AppLayout role="tecnico">
              <OrderDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tecnico/os/:id/comanda"
        element={
          <PrivateRoute roles={["tecnico", "adm", "gerente"]}>
            <OrderPrint />
          </PrivateRoute>
        }
      />

      {/* ========== ADMIN ========== */}
      <Route
        path="/adm"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <AdminDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/os"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <AdminOrders />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/os/:id"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <OrderDetail />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/os/:id/comanda"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <OrderPrint />
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/nova-os"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <AdminNewOrder />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/servicos"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <AdminServices />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/clientes"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <AdminClients />
            </AppLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/adm/usuarios"
        element={
          <PrivateRoute roles={["adm", "gerente"]}>
            <AppLayout role="adm">
              <AdminUsers />
            </AppLayout>
          </PrivateRoute>
        }
      />

      {/* ========== GERENTE ========== */}
      <Route
        path="/gerente"
        element={
          <PrivateRoute roles={["gerente"]}>
            <AppLayout role="gerente">
              <ManagerDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
  path="/gerente/lojas"
  element={
    <PrivateRoute roles={["gerente"]}>
      <AppLayout role="gerente">
        <ManagerStoresDashboard />
      </AppLayout>
    </PrivateRoute>
  }
/>

<Route
  path="/gerente/os"
  element={
    <PrivateRoute roles={["gerente"]}>
      <AppLayout role="gerente">
        <ManagerOrdersAll />
      </AppLayout>
    </PrivateRoute>
  }
/>


      {/* ========== CATCH-ALL ========== */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to={getHomeByRole(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
