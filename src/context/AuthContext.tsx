// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, UserRole } from "../types/auth";

interface AuthContextProps {
  user: User | null;
  loading: boolean;

  login: (email: string, senha: string) => Promise<User | null>;
  loginAs: (role: UserRole) => void;

  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const STORAGE_KEY = "@sistema-assistencia:user";

type MockUser = User & { senha: string };

const MOCK_USERS: MockUser[] = [
  {
    id: "adm-loja-1",
    nome: "Administrador Loja 1",
    email: "adm@loja1.com",
    role: "adm",
    lojaId: "loja-1",
    senha: "123456",
    admId: "adm-loja-1",
  },
  {
    id: "tec-loja-1",
    nome: "Técnico Loja 1",
    email: "tecnico@loja1.com",
    role: "tecnico",
    lojaId: "loja-1",
    senha: "123456",
    tecnicoId: "tec-loja-1",
  },
  {
    id: "cli-loja-1",
    nome: "Cliente Loja 1",
    email: "cliente@loja1.com",
    role: "cliente",
    lojaId: "loja-1",
    senha: "123456",
    clientId: "c1",
  },
  {
    id: "geral",
    nome: "Gerente Geral",
    email: "gerente@sistema.com",
    role: "gerente",
    lojaId: null,
    senha: "123456",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
    }
  }, []);

  // LOGIN REAL (mock)
  async function login(email: string, senha: string): Promise<User | null> {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));

      const found = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!found || found.senha !== senha) return null;

      // 👉 Agora mantém *todos* os IDs especiais
      const userToSave: User = {
        id: found.id,
        nome: found.nome,
        email: found.email,
        role: found.role,
        lojaId: found.lojaId,
        clientId: found.clientId,
        tecnicoId: found.tecnicoId,
        admId: found.admId,
      };

      setUser(userToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));
      return userToSave;
    } finally {
      setLoading(false);
    }
  }

  // LOGIN RÁPIDO (atalho)
  function loginAs(role: UserRole) {
    const found = MOCK_USERS.find((u) => u.role === role);

    let userToSave: User;

    if (found) {
      // 👉 mantém TUDO certinho
      userToSave = {
        id: found.id,
        nome: found.nome,
        email: found.email,
        role: found.role,
        lojaId: found.lojaId,
        clientId: found.clientId,
        tecnicoId: found.tecnicoId,
        admId: found.admId,
      };
    } else {
      // fallback
      userToSave = {
        id: "fake",
        nome:
          role === "cliente"
            ? "Cliente Teste"
            : role === "tecnico"
            ? "Técnico Teste"
            : role === "adm"
            ? "Administrador Teste"
            : "Gerente Geral",
        email: `${role}@teste.com`,
        role,
        lojaId: role === "gerente" ? null : "loja-1",
      };
    }

    setUser(userToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
