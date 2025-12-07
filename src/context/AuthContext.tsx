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

  /**
   * Login "real" com e-mail e senha (por enquanto mock).
   * Retorna o usuário logado ou null se falhar.
   */
  login: (email: string, senha: string) => Promise<User | null>;

  /**
   * Login rápido por perfil, só para testes internos.
   */
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
    clientId: "c1",          // 👈 liga no client do domínio
  },
  {
    id: "geral",
    nome: "Gerente Geral",
    email: "gerente@sistema.com",
    role: "gerente",
    lojaId: null,            // vê todas as lojas
    senha: "123456",
  },
];



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega usuário salvo no localStorage ao iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as User;

      if (parsed && parsed.role) {
        setUser(parsed);
      }
    } catch (err) {
      console.error("Erro ao carregar usuário do storage:", err);
    }
  }, []);

  // --------- login com email/senha (mock) ----------
  async function login(email: string, senha: string): Promise<User | null> {
    setLoading(true);
    try {
      // simula request HTTP
      await new Promise((res) => setTimeout(res, 600));

      const userFound = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!userFound || userFound.senha !== senha) {
        // credenciais inválidas
        return null;
      }

   const userToSave: User = {
  id: userFound.id,
  nome: userFound.nome,
  email: userFound.email,
  role: userFound.role,
  lojaId: userFound.lojaId,
};

      setUser(userToSave);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));
      } catch (err) {
        console.error("Erro ao salvar usuário no storage:", err);
      }

      return userToSave;
    } finally {
      setLoading(false);
    }
  }

// --------- loginAs por role (atalho de teste) ----------
function loginAs(role: UserRole) {
  // tenta localizar um mock real
  const userByRole = MOCK_USERS.find((u) => u.role === role);

  let userToSave: User;

  if (userByRole) {
    // 👉 Se encontrou, usa o mock real (útil p/ adm, tecnico, cliente, gerente)
    userToSave = {
      id: userByRole.id,
      nome: userByRole.nome,
      email: userByRole.email,
      role: userByRole.role,
      lojaId: userByRole.lojaId, // mantém o vínculo da loja
    };
  } else {
    // 👉 Fallback apenas para garantir (quase nunca usado)
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
      lojaId: role === "gerente" ? null : "loja-1", // gerente vê tudo
    };
  }

  setUser(userToSave);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));
  } catch (err) {
    console.error("Erro ao salvar usuário no storage:", err);
  }
}


  function logout() {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Erro ao limpar storage:", err);
    }
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
