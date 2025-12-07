export type UserRole = "cliente" | "tecnico" | "adm" | "gerente";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  lojaId: string | null;

  // ligações com o domínio
  clientId?: string;   // se for cliente
  tecnicoId?: string;  // se for técnico
  admId?: string;      // se quiser diferenciar no futuro
}
