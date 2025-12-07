import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";

function App() {
  return (
    <AuthProvider>
      <OrdersProvider>
        <AppRoutes />
      </OrdersProvider>
    </AuthProvider>
  );
}

export default App;
