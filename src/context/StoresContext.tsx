// src/context/StoresContext.tsx
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Loja } from "../types/store";

interface StoresContextProps {
  stores: Loja[];
  getStoreById: (id: string | null | undefined) => Loja | undefined;
}

const StoresContext = createContext<StoresContextProps | undefined>(
  undefined
);

// mock inicial de lojas
const LOJAS_MOCK: Loja[] = [
  {
    id: "loja-1",
    nomeFantasia: "Nexus Tech São Luís",
    razaoSocial: "Nexus Tech Soluções em Tecnologia LTDA",
    cnpj: "12.345.678/0001-99",
    telefone: "(98) 3333-0000",
    whatsapp: "(98) 9 7003-6464",
    email: "contato@nexustech.com",
    enderecoLinha1: "Av. Cajueiro, 123 - Residencial Canaã",
    enderecoLinha2: "Barreirinhas - MA",
    cidade: "Barreirinhas",
    uf: "MA",
  },
  {
    id: "loja-2",
    nomeFantasia: "Nexus Tech São Luís",
    razaoSocial: "Nexus Tech São Luís ME",
    cnpj: "98.765.432/0001-11",
    telefone: "(98) 4002-8922",
    whatsapp: "(98) 9 9999-9999",
    email: "slz@nexustech.com",
    enderecoLinha1: "Rua 2, Quadra 7, Saramanta 2",
    enderecoLinha2: "Paço do Lumiar - MA",
    cidade: "Paço do Lumiar",
    uf: "MA",
  },
];

export function StoresProvider({ children }: { children: ReactNode }) {
  const [stores] = useState<Loja[]>(LOJAS_MOCK);

  function getStoreById(id: string | null | undefined) {
    if (!id) return undefined;
    return stores.find((l) => l.id === id);
  }

  return (
    <StoresContext.Provider value={{ stores, getStoreById }}>
      {children}
    </StoresContext.Provider>
  );
}

export function useStores() {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores deve ser usado dentro de StoresProvider");
  }
  return ctx;
}
