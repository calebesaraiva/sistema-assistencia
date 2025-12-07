// src/types/store.ts
export interface Loja {
  id: string; // ex: "loja-1"
  nomeFantasia: string; // ex: "Nexus Tech São Luís"
  nome: string; 
  cnpj?: string;

  telefone?: string;
  whatsapp?: string;
  email?: string;

  enderecoLinha1?: string; // ex: "Av. Cajueiro, 123 - Bairro Tal"
  enderecoLinha2?: string; // ex: "Sala 05 - Shopping X"
  cidade?: string;         // ex: "São Luís"
  uf?: string;             // ex: "MA";
}
