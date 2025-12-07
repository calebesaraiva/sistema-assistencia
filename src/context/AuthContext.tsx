import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import type { UserRole } from "../types/auth";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);

  function loginAs(role: UserRole) {
    const fakeUser: User = {
      id: "1",
      nome:
        role === "cliente"
          ? "Cliente Teste"
          : role === "tecnico"
          ? "Técnico Teste"
          : "Administrador",
      email: `${role}@teste.com`,
      role,
    };
    setUser(fakeUser);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
