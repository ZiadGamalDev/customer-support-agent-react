// MongoDB model types based on the actual API responses

export type MongoObjectId = string;

export interface MongoUser {
  _id: MongoObjectId;
  name: string;
  email: string;
  role?: string;
}

export interface MongoMessage {
  id: MongoObjectId; // Note: This is 'id' not '_id'
  chatId: MongoObjectId;
  senderId: MongoObjectId | MongoUser | null; // Can be null, string ID, or user object
  receiverId: MongoObjectId | MongoUser | null; // Can be null, string ID, or user object
  content: string;
  status: "sent" | "delivered" | "read";
  senderRole: "agent" | "customer" | "system";
  createdAt: string;
  updatedAt?: string;
  subject?: string;
  customerId?: MongoObjectId;
}

export interface MongoChat {
  id: MongoObjectId;
  agentId: MongoObjectId;
  title: string;
  description: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  customerUnreadCount: number;
  agentUnreadCount: number;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  customer: MongoObjectId;
}

export interface MongoNotification {
  _id: MongoObjectId;
  userId: MongoObjectId;
  type: string;
  title: string;
  content: string;
  read: boolean;
  reference: {
    model: string;
    id: MongoObjectId;
  };
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  username: string;
  email: string;
  phoneNumbers: string[];
  addresses: string[];
  role: string;
  isEmailVerified: boolean;
  age: number;
  isLoggedIn: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  message: string;
  user: Customer;
}

export interface OrderItem {
  _id: string;
  title: string;
  quantity: number;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderItems: OrderItem[];
  phoneNumbers: string[];
  shippingAddress: ShippingAddress;
  shippingPrice: number;
  totalPrice: number;
  paymentMethod: "stripe" | "cash";
  orderStatus: "Pending" | "Paid" | "Placed" | "Delivered";
  isPaid: boolean;
  paidAt: string;
  isDelivered: boolean;
  deliveredAt: string;
  payment_intent: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}
