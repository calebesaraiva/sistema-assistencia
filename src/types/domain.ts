// =========================
// ENUMS / TYPES BÁSICOS
// =========================

export type OrderStatus =
  | "aberta"
  | "diagnostico"
  | "aguardando_aprovacao"
  | "aguardando_peca"
  | "em_andamento"
  | "finalizada"
  | "entregue"
  | "cancelada";

export type PaymentStatus =
  | "nao_informado"
  | "pendente"
  | "pago_parcial"
  | "pago"
  | "cortesia";

export type Priority = "normal" | "urgente";

export type OrderItemType = "servico" | "peca";

export type OrderPhotoType = "entrada" | "durante" | "saida" | "anexo";


// =========================
// CLIENTE
// =========================

export interface Address {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

export interface Client {
  id: string;
  nome: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  email?: string;
  cpfCnpj?: string;
  endereco?: Address;
  observacoes?: string;
}


// =========================
// EQUIPAMENTO
// =========================

export interface Device {
  id: string;
  clientId: string;
  tipo: string;       // Celular, Notebook, etc.
  marca: string;
  modelo: string;
  cor?: string;
  imeiSerie?: string;
  senhaDesbloqueio?: string;
  acessoriosEntregues?: string;      // texto livre por enquanto
  condicaoFisicaEntrada?: string;
  possuiOxidacao?: boolean;
  ligavaNaEntrada?: boolean;
  observacoes?: string;
}


// =========================
// SERVIÇOS (cadastro do ADM)
// =========================

export interface ServiceDefinition {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string; // Celular, Notebook, etc.
  valorBase: number;
  prazoEstimadoDias?: number;
  garantiaDiasPadrao?: number;
}


// =========================
// LOG / HISTÓRICO
// =========================

export interface ServiceOrderLog {
  id: string;
  dataHora: string;       // ISO
  usuarioId: string;
  acao: string;           // "STATUS_ALTERADO", "OBS_ADICIONADA", etc.
  descricao: string;
}


// =========================
// ITENS DA OS (orçamento)
// =========================

// Modelo simples que você já usa hoje nas telas
export interface ServiceItem {
  id: string;
  serviceId: string;
  descricao: string;
  valor: number;
}

// Versão mais completa, mantendo compatibilidade com ServiceItem
export interface ServiceOrderItem extends ServiceItem {
  tipo?: OrderItemType;       // servico ou peca
  quantidade?: number;
  valorUnitario?: number;     // se quiser usar no futuro
  valorTotal?: number;        // se quiser usar no futuro
}


// =========================
// FOTOS / ANEXOS
// =========================

export interface ServiceOrderPhoto {
  id: string;
  tipo: OrderPhotoType;
  url: string;               // depois isso vem do backend/storage
  descricao?: string;
  criadoEm: string;          // ISO
}


// =========================
// ORDEM DE SERVIÇO
// =========================

export interface ServiceOrder {
  id: string;
  numero: string;

  clientId: string;
  deviceId: string;
  tecnicoId: string;

  status: OrderStatus;
  prioridade?: Priority;

  origem?: string;         // loja, whatsapp, site...

  dataAbertura: string;
  dataPrevisao?: string;
  dataAprovacaoOrcamento?: string;
  dataConclusao?: string;
  dataEntrega?: string;

  // Problema e laudo
  // CAMPO QUE O SISTEMA JÁ USA HOJE:
  defeitoRelatado?: string;
  // Opcional extra, se quiser separar:
  defeitoRelatadoCliente?: string;
  defeitoConstatado?: string;
  testesRealizados?: string;
  laudoTecnico?: string;
  observacoesInternas?: string;
  observacoes?: string;       // campo simples que você já usava

  // Orçamento e valores
  itens: ServiceOrderItem[];
  subtotal: number;
  desconto?: number;
  acrescimo?: number;
  totalFinal: number;

  orcamentoAprovado?: boolean;
  orcamentoAprovadoPor?: string;
  metodoAprovacao?: string;
  dataOrcamentoAprovado?: string;

  // Pagamento
  statusPagamento?: PaymentStatus;
  formaPagamento?: string;
  valorPago?: number;
  dataPagamento?: string;

  // Garantia
  tipoGarantia?: string; // "loja", "fabricante", "sem_garantia"
  diasGarantia?: number;

  // Fotos / anexos / histórico
  fotos?: ServiceOrderPhoto[];
  logs?: ServiceOrderLog[];

  // Autorizações / assinaturas (pra futuro)
  clienteAssinouEntrada?: boolean;
  clienteAssinouSaida?: boolean;
  clienteAssinaturaImagemUrl?: string;
}
