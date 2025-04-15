import { MongoObjectId } from "@/types/mongoTypes";
import { User } from "./authService";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinDate: string;
}

export interface Order {
  id: string;
  customer: string;
  orderNumber: string;
  date: string;
  total: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "refunded"
    | "cancelled";
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'new'|"open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  customer: MongoObjectId;
  agentId?: string;
  tags?: string[];
}

export interface Message {
  id: string;
  ticketId: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderType: "agent" | "customer" | "system";
  attachments?: { name: string; url: string }[];
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1234567890",
    joinDate: "2023-01-15",
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1987654321",
    joinDate: "2023-02-20",
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol@example.com",
    phone: "+1122334455",
    joinDate: "2023-03-10",
    avatar: "/placeholder.svg",
  },
];

const mockOrders: Order[] = [
  {
    id: "1",
    customer: "1",
    orderNumber: "ORD-001",
    date: "2023-06-15",
    total: 129.99,
    status: "delivered",
    items: [
      { id: "item1", name: "Wireless Headphones", quantity: 1, price: 79.99 },
      { id: "item2", name: "Phone Case", quantity: 1, price: 24.99 },
      { id: "item3", name: "Screen Protector", quantity: 1, price: 25.01 },
    ],
  },
  {
    id: "2",
    customer: "1",
    orderNumber: "ORD-002",
    date: "2023-07-20",
    total: 249.99,
    status: "shipped",
    items: [{ id: "item4", name: "Smart Watch", quantity: 1, price: 249.99 }],
  },
  {
    id: "3",
    customer: "2",
    orderNumber: "ORD-003",
    date: "2023-07-25",
    total: 1299.99,
    status: "processing",
    items: [
      { id: "item5", name: "Laptop", quantity: 1, price: 1199.99 },
      { id: "item6", name: "Laptop Sleeve", quantity: 1, price: 100.0 },
    ],
  },
];

const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Wireless headphones not connecting",
    description:
      "I bought the headphones last week and they won't connect to my phone.",
    status: "open",
    priority: "medium",
    createdAt: "2023-07-16T14:30:00Z",
    updatedAt: "2023-07-16T14:30:00Z",
    customer: "1",
    agentId: "1",
    tags: ["hardware", "connectivity"],
  },
  {
    id: "2",
    subject: "Request for refund",
    description: "I would like to return my smart watch and get a refund.",
    status: "pending",
    priority: "high",
    createdAt: "2023-07-21T09:15:00Z",
    updatedAt: "2023-07-21T11:45:00Z",
    customer: "1",
    agentId: "1",
    tags: ["refund", "return"],
  },
  {
    id: "3",
    subject: "Laptop screen flickering",
    description: "The screen on my new laptop flickers when on battery power.",
    status: "open",
    priority: "urgent",
    createdAt: "2023-07-26T16:20:00Z",
    updatedAt: "2023-07-26T16:20:00Z",
    customer: "2",
    tags: ["hardware", "display"],
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    ticketId: "1",
    content:
      "Hello, my new wireless headphones won't connect to my iPhone. I've tried resetting them multiple times.",
    timestamp: "2023-07-16T14:30:00Z",
    senderId: "1",
    senderType: "customer",
  },
  {
    id: "2",
    ticketId: "1",
    content:
      "Hi Alice, I'm sorry to hear about this issue. Could you please tell me what model of headphones you purchased?",
    timestamp: "2023-07-16T14:45:00Z",
    senderId: "1",
    senderType: "agent",
  },
  {
    id: "3",
    ticketId: "1",
    content: "They are the SoundWave X3 model.",
    timestamp: "2023-07-16T15:00:00Z",
    senderId: "1",
    senderType: "customer",
  },
  {
    id: "4",
    ticketId: "2",
    content:
      "I'd like to return my smart watch and get a refund. It doesn't have the features that were advertised.",
    timestamp: "2023-07-21T09:15:00Z",
    senderId: "1",
    senderType: "customer",
  },
  {
    id: "5",
    ticketId: "2",
    content:
      "I understand your concern. Could you please specify which features are missing?",
    timestamp: "2023-07-21T09:30:00Z",
    senderId: "1",
    senderType: "agent",
  },
  {
    id: "6",
    ticketId: "3",
    content:
      "The screen on my new laptop flickers when I use it on battery power. It works fine when plugged in.",
    timestamp: "2023-07-26T16:20:00Z",
    senderId: "2",
    senderType: "customer",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ticketService = {
  // Ticket operations
  getTickets: async (filters?: {
    status?: Ticket["status"];
    priority?: Ticket["priority"];
    agentId?: string;
    search?: string;
  }): Promise<Ticket[]> => {
    await delay(500);

    let filteredTickets = [...mockTickets];

    if (filters) {
      if (filters.status) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.status === filters.status
        );
      }

      if (filters.priority) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.priority === filters.priority
        );
      }

      if (filters.agentId) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.agentId === filters.agentId
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTickets = filteredTickets.filter(
          (ticket) =>
            ticket.subject.toLowerCase().includes(searchLower) ||
            ticket.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredTickets;
  },

  getTicketById: async (id: string): Promise<Ticket | null> => {
    await delay(300);
    return mockTickets.find((ticket) => ticket.id === id) || null;
  },

  updateTicket: async (
    id: string,
    updates: Partial<Ticket>
  ): Promise<Ticket> => {
    await delay(500);

    const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === id);
    if (ticketIndex === -1) throw new Error("Ticket not found");

    mockTickets[ticketIndex] = {
      ...mockTickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return mockTickets[ticketIndex];
  },

  // Customer operations
  getCustomers: async (search?: string): Promise<Customer[]> => {
    await delay(500);

    if (!search) return mockCustomers;

    const searchLower = search.toLowerCase();
    return mockCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
    );
  },

  getCustomerById: async (id: string): Promise<Customer | null> => {
    await delay(300);
    return mockCustomers.find((customer) => customer.id === id) || null;
  },

  // Orders
  getOrdersByCustomerId: async (customer: string): Promise<Order[]> => {
    await delay(500);
    return mockOrders.filter((order) => order.customer === customer);
  },

  // Messages
  getMessagesByTicketId: async (ticketId: string): Promise<Message[]> => {
    await delay(300);
    return mockMessages.filter((message) => message.ticketId === ticketId);
  },

  sendMessage: async (
    ticketId: string,
    content: string,
    sender: User
  ): Promise<Message> => {
    await delay(300);

    const newMessage: Message = {
      id: (mockMessages.length + 1).toString(),
      ticketId,
      content,
      timestamp: new Date().toISOString(),
      senderId: sender.id,
      senderType: "agent",
    };

    mockMessages.push(newMessage);

    // Update the ticket's updatedAt
    const ticketIndex = mockTickets.findIndex(
      (ticket) => ticket.id === ticketId
    );
    if (ticketIndex !== -1) {
      mockTickets[ticketIndex].updatedAt = newMessage.timestamp;
    }

    return newMessage;
  },
};
