import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { StoresProvider } from "./context/StoresContext";
import ToastListener from "./components/feedback/ToastListener";

function App() {
  return (
    <AuthProvider>
      <StoresProvider>
        <OrdersProvider>
          <ToastListener />
          <AppRoutes />
        </OrdersProvider>
      </StoresProvider>
    </AuthProvider>
  );
}

export default App;
