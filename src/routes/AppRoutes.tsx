// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
import AdminClients from "../pages/admin/AdminClients"; // Clientes & equipamentos & usuário
import AdminUsers from "../pages/admin/AdminUsers";     // Lista de usuários

// OS (compartilhadas)
import OrderDetail from "../pages/OrderDetail";
import OrderPrint from "../pages/OrderPrint";

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[];
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    if (user.role === "cliente") return <Navigate to="/cliente" replace />;
    if (user.role === "tecnico") return <Navigate to="/tecnico" replace />;
    if (user.role === "adm") return <Navigate to="/adm" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

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
            <PrivateRoute roles={["tecnico", "adm"]}>
              <AppLayout role="tecnico">
                <TechDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tecnico/os"
          element={
            <PrivateRoute roles={["tecnico", "adm"]}>
              <AppLayout role="tecnico">
                <TechOrders />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tecnico/os/:id"
          element={
            <PrivateRoute roles={["tecnico", "adm"]}>
              <AppLayout role="tecnico">
                <OrderDetail />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tecnico/os/:id/comanda"
          element={
            <PrivateRoute roles={["tecnico", "adm"]}>
              <OrderPrint />
            </PrivateRoute>
          }
        />

        {/* ========== ADMIN ========== */}
        <Route
          path="/adm"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <AdminDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/adm/os"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <AdminOrders />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* DETALHE DE OS (ADMIN) */}
        <Route
          path="/adm/os/:id"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <OrderDetail />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* COMANDA (ADMIN) */}
        <Route
          path="/adm/os/:id/comanda"
          element={
            <PrivateRoute roles={["adm"]}>
              <OrderPrint />
            </PrivateRoute>
          }
        />

        <Route
          path="/adm/nova-os"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <AdminNewOrder />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/adm/servicos"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <AdminServices />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Clientes & equipamentos & usuário */}
        <Route
          path="/adm/clientes"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <AdminClients />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Usuários (lista) */}
        <Route
          path="/adm/usuarios"
          element={
            <PrivateRoute roles={["adm"]}>
              <AppLayout role="adm">
                <AdminUsers />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
