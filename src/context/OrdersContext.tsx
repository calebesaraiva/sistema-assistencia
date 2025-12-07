import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
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


const STORAGE_KEY = "nexus-tech-data-v1";

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [services, setServices] = useState<ServiceDefinition[]>(initialServices);
  const [orders, setOrders] = useState<ServiceOrder[]>(initialOrders);

  // ============ CARREGAR DO LOCALSTORAGE NA INICIALIZAÇÃO ============
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        clients?: Client[];
        devices?: Device[];
        services?: ServiceDefinition[];
        orders?: ServiceOrder[];
      };

      if (parsed.clients && Array.isArray(parsed.clients)) {
        setClients(parsed.clients);
      }
      if (parsed.devices && Array.isArray(parsed.devices)) {
        setDevices(parsed.devices);
      }
      if (parsed.services && Array.isArray(parsed.services)) {
        setServices(parsed.services);
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
      }
    } catch (err) {
      console.error("[OrdersProvider] Erro ao carregar dados do localStorage:", err);
    }
  }, []);

  // ============ SALVAR NO LOCALSTORAGE QUANDO MUDAR ============
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const payload = {
        clients,
        devices,
        services,
        orders,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("[OrdersProvider] Erro ao salvar dados no localStorage:", err);
    }
  }, [clients, devices, services, orders]);

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
      statusPagamento: "nao_informado",
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

  const agora = new Date().toISOString();
  const statusFinal: OrderStatus[] = ["finalizada", "entregue", "cancelada"];

  setOrders((prev) =>
    prev.map((os) => {
      if (os.id !== orderId) return os;

      const isFinal = statusFinal.includes(status);

      const atualizado: ServiceOrder = {
        ...os,
        status,
        // se virou finalizada/entregue/cancelada e não tinha dataConclusao, seta agora
        dataConclusao:
          isFinal && !os.dataConclusao ? agora : os.dataConclusao,
        logs: [
          ...(os.logs ?? []),
          createLog({
            acao: "STATUS_ALTERADO",
            descricao: `Status alterado para "${status}"`,
            usuarioId,
          }),
        ],
      };

      return atualizado;
    })
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
    prev.map((os) => {
      if (os.id !== orderId) return os;

      const totalOs = os.totalFinal ?? os.subtotal ?? 0;

      let valorPago = data.valorPago ?? os.valorPago ?? 0;
      let statusPagamento: PaymentStatus = data.statusPagamento;

      // Normalização básica
      if (
        statusPagamento === "pendente" ||
        statusPagamento === "nao_informado"
      ) {
        valorPago = 0;
      }

      if (statusPagamento === "pago" && valorPago === 0 && totalOs > 0) {
        // marcou como pago mas não informou valor -> assume total
        valorPago = totalOs;
      }

      if (statusPagamento === "cortesia") {
        // cortesia: quitado, mas sem pagamento financeiro
        valorPago = 0;
      }

      // Ajuste automático baseado no valor pago (exceto cortesia)
      if (totalOs > 0 && statusPagamento !== "cortesia") {
        if (valorPago >= totalOs) {
          statusPagamento = "pago";
          valorPago = totalOs; // trava no máximo total
        } else if (valorPago > 0 && valorPago < totalOs) {
          // se pagou algo mas veio como pendente/pago, força parcial
          if (
            statusPagamento === "pendente" ||
            statusPagamento === "nao_informado" ||
            statusPagamento === "pago"
          ) {
            statusPagamento = "pago_parcial";
          }
        } else if (valorPago === 0 && statusPagamento === "pago_parcial") {
          statusPagamento = "pendente";
        }
      }

      // Data de pagamento
      let dataPagamento = os.dataPagamento;
      const agora = new Date().toISOString();

      if (
        statusPagamento === "pago" ||
        statusPagamento === "pago_parcial" ||
        statusPagamento === "cortesia"
      ) {
        dataPagamento = dataPagamento ?? agora;
      } else if (
        statusPagamento === "pendente" ||
        statusPagamento === "nao_informado"
      ) {
        dataPagamento = undefined;
      }

      const atualizado: ServiceOrder = {
        ...os,
        statusPagamento,
        formaPagamento: data.formaPagamento,
        valorPago,
        dataPagamento,
        logs: [
          ...(os.logs ?? []),
          createLog({
            acao: "PAGAMENTO_ATUALIZADO",
            descricao: `Pagamento atualizado: status "${statusPagamento}", valor pago R$ ${valorPago
              .toFixed(2)
              .replace(".", ",")}`,
            usuarioId,
          }),
        ],
      };

      return atualizado;
    })
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
