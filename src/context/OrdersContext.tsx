// src/context/OrdersContext.tsx
import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Client,
  Device,
  ServiceDefinition,
  ServiceOrder,
  OrderStatus,
  PaymentStatus,
  ServiceOrderLog,
} from "../types/domain";
import { useAuth } from "./AuthContext";

interface CreateOrderInput {
  clientId: string;
  deviceId: string;
  serviceId: string;
  valor: number;
  defeitoRelatadoCliente: string;
  observacoes?: string;
}

interface CreateServiceInput {
  nome: string;
  valorBase: number;
}

interface CreateClientInput {
  nome: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  email?: string;
  cpfCnpj?: string;
}

interface CreateDeviceInput {
  clientId: string;
  tipo: string;
  marca: string;
  modelo: string;
  cor?: string;
  imeiSerie?: string;
}

interface OrdersContextProps {
  clients: Client[];
  devices: Device[];
  services: ServiceDefinition[];
  orders: ServiceOrder[];

  createOrder: (data: CreateOrderInput) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderLaudo: (orderId: string, laudo: string) => Promise<void>;
  updateOrderPayment: (
    orderId: string,
    data: {
      statusPagamento: PaymentStatus;
      formaPagamento?: string;
      valorPago?: number;
    }
  ) => Promise<void>;

  createService: (data: CreateServiceInput) => Promise<void>;
  updateService: (id: string, data: CreateServiceInput) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  createClient: (data: CreateClientInput) => Promise<void>;
  createDevice: (data: CreateDeviceInput) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextProps | undefined>(undefined);

// =================== MOCKS INICIAIS ===================
// 2 lojas só pra exemplo
const LOJA_1 = "loja-1";
const LOJA_2 = "loja-2";

const initialClients: Client[] = [
  {
    id: "c1",
    nome: "João Silva",
    telefonePrincipal: "(98) 99999-0001",
    cpfCnpj: "111.111.111-11",
    lojaId: LOJA_1,
  },
  {
    id: "c2",
    nome: "Maria Souza",
    telefonePrincipal: "(98) 99999-0002",
    cpfCnpj: "222.222.222-22",
    lojaId: LOJA_1,
  },
  {
    id: "c3",
    nome: "Carlos Lima",
    telefonePrincipal: "(98) 99999-0003",
    cpfCnpj: "333.333.333-33",
    lojaId: LOJA_2,
  },
];

const initialDevices: Device[] = [
  {
    id: "d1",
    clientId: "c1",
    tipo: "Celular",
    marca: "Apple",
    modelo: "iPhone 11",
    imeiSerie: "123456789",
    lojaId: LOJA_1,
  },
  {
    id: "d2",
    clientId: "c2",
    tipo: "Notebook",
    marca: "Dell",
    modelo: "Inspiron 15",
    imeiSerie: "ABC-987654",
    lojaId: LOJA_1,
  },
  {
    id: "d3",
    clientId: "c3",
    tipo: "Celular",
    marca: "Samsung",
    modelo: "Galaxy S21",
    imeiSerie: "XYZ-123456",
    lojaId: LOJA_2,
  },
];

const initialServices: ServiceDefinition[] = [
  { id: "s1", nome: "Troca de tela", valorBase: 350, lojaId: LOJA_1 },
  { id: "s2", nome: "Formatação", valorBase: 150, lojaId: LOJA_1 },
  { id: "s3", nome: "Limpeza interna", valorBase: 120, lojaId: LOJA_2 },
];

const initialOrders: ServiceOrder[] = [
  {
    id: "os1",
    numero: "0001",
    clientId: "c1",
    deviceId: "d1",
    tecnicoId: "2",
    status: "aberta",
    dataAbertura: "2025-11-30",
    dataPrevisao: "2025-12-05",
    defeitoRelatadoCliente: "Tela quebrada após queda.",
    observacoesInternas: "Cliente precisa para trabalho.",
    itens: [
      {
        id: "i1",
        serviceId: "s1",
        descricao: "Troca completa do conjunto da tela",
        valor: 380,
      },
    ],
    subtotal: 380,
    totalFinal: 380,
    lojaId: LOJA_1,
  },
  {
    id: "os2",
    numero: "0002",
    clientId: "c2",
    deviceId: "d2",
    tecnicoId: "2",
    status: "em_andamento",
    dataAbertura: "2025-12-01",
    defeitoRelatadoCliente: "Notebook muito lento.",
    itens: [
      {
        id: "i2",
        serviceId: "s2",
        descricao: "Formatação + instalação básica",
        valor: 180,
      },
    ],
    subtotal: 180,
    totalFinal: 180,
    lojaId: LOJA_1,
  },
  {
    id: "os3",
    numero: "0003",
    clientId: "c3",
    deviceId: "d3",
    tecnicoId: "2",
    status: "diagnostico",
    dataAbertura: "2025-12-02",
    defeitoRelatadoCliente: "Não liga.",
    itens: [
      {
        id: "i3",
        serviceId: "s3",
        descricao: "Limpeza interna completa",
        valor: 150,
      },
    ],
    subtotal: 150,
    totalFinal: 150,
    lojaId: LOJA_2,
  },
];

// Gera próximo número sequencial de OS (0001, 0002, ...)
function getNextOrderNumber(currentOrders: ServiceOrder[]) {
  const nums = currentOrders.map((o) => Number(o.numero));
  const max = nums.length ? Math.max(...nums) : 0;
  const next = max + 1;
  return String(next).padStart(4, "0");
}

// Helper para criar logs
function createLog(params: {
  acao: string;
  descricao: string;
  usuarioId: string;
}): ServiceOrderLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dataHora: new Date().toISOString(),
    usuarioId: params.usuarioId,
    acao: params.acao,
    descricao: params.descricao,
  };
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [services, setServices] = useState<ServiceDefinition[]>(initialServices);
  const [orders, setOrders] = useState<ServiceOrder[]>(initialOrders);

  const currentStoreId = user?.lojaId ?? null;
  const isGerente = user?.role === "gerente";

  // =================== OS ===================

  async function createOrder(data: CreateOrderInput): Promise<void> {
    const usuarioId = user?.id ?? "sistema";
    const lojaId = currentStoreId ?? LOJA_1; // fallback

    setOrders((prev) => {
      const numero = getNextOrderNumber(prev);
      const id = `os-${Date.now()}`;

      const newOrder: ServiceOrder = {
        id,
        numero,
        clientId: data.clientId,
        deviceId: data.deviceId,
        tecnicoId: user?.role === "tecnico" ? user.id : "2",
        status: "aberta",
        dataAbertura: new Date().toISOString(),
        defeitoRelatadoCliente: data.defeitoRelatadoCliente,
        observacoesInternas: data.observacoes,
        itens: [
          {
            id: `item-${Date.now()}`,
            serviceId: data.serviceId,
            descricao: "Serviço principal",
            valor: data.valor,
          },
        ],
        subtotal: data.valor,
        totalFinal: data.valor,
        lojaId,
        logs: [
          createLog({
            acao: "OS_CRIADA",
            descricao: "Ordem de serviço criada.",
            usuarioId,
          }),
        ],
      };

      return [...prev, newOrder];
    });
  }

  async function updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<void> {
    const usuarioId = user?.id ?? "sistema";

    setOrders((prev) =>
      prev.map((os) =>
        os.id === orderId
          ? {
              ...os,
              status,
              logs: [
                ...(os.logs ?? []),
                createLog({
                  acao: "STATUS_ALTERADO",
                  descricao: `Status alterado para "${status}"`,
                  usuarioId,
                }),
              ],
            }
          : os
      )
    );
  }

  async function updateOrderLaudo(
    orderId: string,
    laudo: string
  ): Promise<void> {
    const usuarioId = user?.id ?? "sistema";

    setOrders((prev) =>
      prev.map((os) =>
        os.id === orderId
          ? {
              ...os,
              laudoTecnico: laudo,
              logs: [
                ...(os.logs ?? []),
                createLog({
                  acao: "LAUDO_ATUALIZADO",
                  descricao: "Laudo técnico atualizado.",
                  usuarioId,
                }),
              ],
            }
          : os
      )
    );
  }

  async function updateOrderPayment(
    orderId: string,
    data: {
      statusPagamento: PaymentStatus;
      formaPagamento?: string;
      valorPago?: number;
    }
  ): Promise<void> {
    const usuarioId = user?.id ?? "sistema";

    setOrders((prev) =>
      prev.map((os) =>
        os.id === orderId
          ? {
              ...os,
              statusPagamento: data.statusPagamento,
              formaPagamento: data.formaPagamento,
              valorPago: data.valorPago,
              dataPagamento:
                data.statusPagamento === "pago" ||
                data.statusPagamento === "pago_parcial"
                  ? new Date().toISOString()
                  : os.dataPagamento,
              logs: [
                ...(os.logs ?? []),
                createLog({
                  acao: "PAGAMENTO_ATUALIZADO",
                  descricao: `Pagamento marcado como "${data.statusPagamento}"`,
                  usuarioId,
                }),
              ],
            }
          : os
      )
    );
  }

  // =================== SERVIÇOS ===================

  async function createService(data: CreateServiceInput): Promise<void> {
    const id = `s-${Date.now()}`;
    const novo: ServiceDefinition = {
      id,
      nome: data.nome,
      valorBase: data.valorBase,
      lojaId: currentStoreId ?? LOJA_1,
    };
    setServices((prev) => [...prev, novo]);
  }

  async function updateService(
    id: string,
    data: CreateServiceInput
  ): Promise<void> {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, nome: data.nome, valorBase: data.valorBase } : s
      )
    );
  }

  async function deleteService(id: string): Promise<void> {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  // =================== CLIENTES / DISPOSITIVOS ===================

  async function createClient(data: CreateClientInput): Promise<void> {
    const id = `c-${Date.now()}`;
    const novo: Client = {
      id,
      nome: data.nome,
      telefonePrincipal: data.telefonePrincipal,
      telefoneSecundario: data.telefoneSecundario,
      email: data.email,
      cpfCnpj: data.cpfCnpj,
      lojaId: currentStoreId ?? LOJA_1,
    };
    setClients((prev) => [...prev, novo]);
  }

  async function createDevice(data: CreateDeviceInput): Promise<void> {
    const id = `d-${Date.now()}`;
    const novo: Device = {
      id,
      clientId: data.clientId,
      tipo: data.tipo,
      marca: data.marca,
      modelo: data.modelo,
      cor: data.cor,
      imeiSerie: data.imeiSerie,
      lojaId: currentStoreId ?? LOJA_1,
    };
    setDevices((prev) => [...prev, novo]);
  }

  // =================== FILTROS POR LOJA / PERFIL ===================

  const filteredClients = useMemo(() => {
    if (!user || isGerente || !currentStoreId) return clients;
    return clients.filter((c) => c.lojaId === currentStoreId);
  }, [clients, user, isGerente, currentStoreId]);

  const filteredDevices = useMemo(() => {
    if (!user || isGerente || !currentStoreId) return devices;
    return devices.filter((d) => d.lojaId === currentStoreId);
  }, [devices, user, isGerente, currentStoreId]);

  const filteredServices = useMemo(() => {
    if (!user || isGerente || !currentStoreId) return services;
    return services.filter((s) => s.lojaId === currentStoreId);
  }, [services, user, isGerente, currentStoreId]);

  const filteredOrders = useMemo(() => {
    if (!user) return orders;

    // gerente vê tudo
    if (isGerente) return orders;

    let result = orders;

    // filtra por loja do usuário (adm, técnico, cliente)
    if (currentStoreId) {
      result = result.filter((os) => os.lojaId === currentStoreId);
    }

    if (user.role === "cliente") {
      // TODO: ligar user.id ao clientId de verdade
if (user.role === "cliente" && user.clientId) {
  result = result.filter((os) => os.clientId === user.clientId);
}
    }

    if (user.role === "tecnico") {
      result = result.filter((os) => os.tecnicoId === user.id);
    }

    return result;
  }, [orders, user, isGerente, currentStoreId]);

  return (
    <OrdersContext.Provider
      value={{
        clients: filteredClients,
        devices: filteredDevices,
        services: filteredServices,
        orders: filteredOrders,
        createOrder,
        updateOrderStatus,
        updateOrderLaudo,
        updateOrderPayment,
        createService,
        updateService,
        deleteService,
        createClient,
        createDevice,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders deve ser usado dentro de OrdersProvider");
  }
  return ctx;
}
