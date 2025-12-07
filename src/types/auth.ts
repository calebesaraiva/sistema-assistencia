export type UserRole = "cliente" | "tecnico" | "adm";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}
