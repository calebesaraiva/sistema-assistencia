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
  defeitoRelatadoCliente: string; // mesmo nome usado no AdminNewOrder
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

  // OS
  createOrder: (data: CreateOrderInput) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderLaudo: (orderId: string, laudo: string) => void;
  updateOrderPayment: (
    orderId: string,
    data: {
      statusPagamento: PaymentStatus;
      formaPagamento?: string;
      valorPago?: number;
    }
  ) => void;

  // Serviços
  createService: (data: CreateServiceInput) => void;
  updateService: (id: string, data: CreateServiceInput) => void;
  deleteService: (id: string) => void;

  // Clientes / dispositivos
  createClient: (data: CreateClientInput) => void;
  createDevice: (data: CreateDeviceInput) => void;
}

const OrdersContext = createContext<OrdersContextProps | undefined>(undefined);

// =================== MOCKS INICIAIS ===================

const initialClients: Client[] = [
  {
    id: "c1",
    nome: "João Silva",
    telefonePrincipal: "(98) 99999-0001",
    cpfCnpj: "111.111.111-11",
  },
  {
    id: "c2",
    nome: "Maria Souza",
    telefonePrincipal: "(98) 99999-0002",
    cpfCnpj: "222.222.222-22",
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
  },
  {
    id: "d2",
    clientId: "c2",
    tipo: "Notebook",
    marca: "Dell",
    modelo: "Inspiron 15",
    imeiSerie: "ABC-987654",
  },
];

const initialServices: ServiceDefinition[] = [
  { id: "s1", nome: "Troca de tela", valorBase: 350 },
  { id: "s2", nome: "Formatação", valorBase: 150 },
];

const initialOrders: ServiceOrder[] = [
  {
    id: "os1",
    numero: "0001",
    clientId: "c1",
    deviceId: "d1",
    tecnicoId: "1",
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
  },
  {
    id: "os2",
    numero: "0002",
    clientId: "c2",
    deviceId: "d2",
    tecnicoId: "1",
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

  // =================== OS ===================

  function createOrder(data: CreateOrderInput) {
    const usuarioId = user?.id ?? "sistema";

    setOrders((prev) => {
      const numero = getNextOrderNumber(prev);
      const id = `os-${Date.now()}`;

      const newOrder: ServiceOrder = {
        id,
        numero,
        clientId: data.clientId,
        deviceId: data.deviceId,
        tecnicoId: "1",
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

  function updateOrderStatus(orderId: string, status: OrderStatus) {
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

  function updateOrderLaudo(orderId: string, laudo: string) {
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

  function updateOrderPayment(
    orderId: string,
    data: {
      statusPagamento: PaymentStatus;
      formaPagamento?: string;
      valorPago?: number;
    }
  ) {
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

  function createService(data: CreateServiceInput) {
    const id = `s-${Date.now()}`;
    const novo: ServiceDefinition = {
      id,
      nome: data.nome,
      valorBase: data.valorBase,
    };
    setServices((prev) => [...prev, novo]);
  }

  function updateService(id: string, data: CreateServiceInput) {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, nome: data.nome, valorBase: data.valorBase } : s
      )
    );
  }

  function deleteService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  // =================== CLIENTES / DISPOSITIVOS ===================

  function createClient(data: CreateClientInput) {
    const id = `c-${Date.now()}`;
    const novo: Client = {
      id,
      nome: data.nome,
      telefonePrincipal: data.telefonePrincipal,
      telefoneSecundario: data.telefoneSecundario,
      email: data.email,
      cpfCnpj: data.cpfCnpj,
    };
    setClients((prev) => [...prev, novo]);
  }

  function createDevice(data: CreateDeviceInput) {
    const id = `d-${Date.now()}`;
    const novo: Device = {
      id,
      clientId: data.clientId,
      tipo: data.tipo,
      marca: data.marca,
      modelo: data.modelo,
      cor: data.cor,
      imeiSerie: data.imeiSerie,
    };
    setDevices((prev) => [...prev, novo]);
  }

  // =================== FILTRO POR PERFIL ===================

  const filteredOrders = useMemo(() => {
    if (!user) return orders;

    if (user.role === "cliente") {
      // por enquanto fixo, depois podemos ligar cliente do login
      const clientIdDoUsuario = "c1";
      return orders.filter((os) => os.clientId === clientIdDoUsuario);
    }

    if (user.role === "tecnico") {
      return orders.filter((os) => os.tecnicoId === user.id);
    }

    return orders; // adm vê tudo
  }, [orders, user]);

  return (
    <OrdersContext.Provider
      value={{
        clients,
        devices,
        services,
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
