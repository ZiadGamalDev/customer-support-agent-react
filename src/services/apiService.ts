import axios from "axios";
import { toast } from "sonner";
import { MongoMessage, MongoChat, MongoObjectId, CustomerResponse, Customer } from "@/types/mongoTypes";
import { authService } from "./authService";
import { OrdersResponse } from './../types/mongoTypes';
import { Order } from "./../types/mongoTypes";

// Base API URL - this should be configured from environment variables in a real app
const API_URL = "http://localhost:3000"; // Replace with your actual backend URL

// Create an axios instance with authentication headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to add the authorization header to every request
api.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add an interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Message related API calls
  messages: {
    getByTicketId: async (ticketId: string): Promise<MongoMessage[]> => {
      try {
        const response = await api.get(`/messages/agent/${ticketId}`);
        console.log(response.data);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return []; // Return empty array on error
      }
    },

    send: async (ticketId: string, content: string): Promise<MongoMessage> => {
      try {
        const response = await api.post(`/messages`, {
          chatId: ticketId,
          content,
        });
        return response.data;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
  },

  // Ticket (Chat) related API calls
  tickets: {
    getAll: async (): Promise<MongoChat[]> => {
      try {
        const response = await api.get("/chats/agent");

        // Add response type checking
        if (!response.data || typeof response.data === "string") {
          console.error("Invalid response format:", response.data);
          return [];
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching tickets:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
          });
        } else {
          console.error("Error fetching tickets:", error);
        }
        throw error;
      }
    },

    getById: async (ticketId: string): Promise<MongoChat> => {
      try {
        const response = await api.get(`/chats/agent/show/${ticketId}`);
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        throw error;
      }
    },

    updateStatus: async (
      ticketId: string,
      status: string
    ): Promise<MongoChat> => {
      try {
        const response = await api.put(`/chats/agent/${ticketId}/${status}`);
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error("Error updating ticket status:", error);
        throw error;
      }
    },
  },

  customer: {
    getCustomerById: async (customerId: string): Promise<Customer | any> => {
      try {
        const response = await axios.get<CustomerResponse>(
          `https://e-commerce-api-tau-five.vercel.app/profile/${customerId}`
        );

        console.log('Customer data:', response.data);
        
        if (response.data && response.data.user) {
          return response.data.user;
        }
        
        return null;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching customer:", {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          });
        } else {
          console.error("Error fetching customer:", error);
        }
        return null;
      }
    },

    getCustomerOrders: async (customerId: string): Promise<Order[]> => {
      try {
        const response = await axios.get<OrdersResponse>(
          `https://e-commerce-api-tau-five.vercel.app/order/my-orders/${customerId}`
        );

        console.log('Orders data:', response.data);
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        return [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching orders:", {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          });
        } else {
          console.error("Error fetching orders:", error);
        }
        return [];
      }
    },
  },
};
