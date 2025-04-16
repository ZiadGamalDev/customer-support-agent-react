// import { io, Socket } from "socket.io-client";
// import { toast } from "sonner";
// import { authService, User } from "./authService";
// import { MongoMessage, MongoObjectId } from "@/types/mongoTypes";

// export interface SocketMessage {
//   id: string;
//   ticketId: string;
//   content: string;
//   timestamp: string;
//   senderId: string;
//   senderType: "agent" | "customer" | "system";
//   messageType?: "chat" | "status_change";  // Add this field
//   attachments?: { name: string; url: string }[];
// }

// export interface SocketNotification {
//   id: string;
//   title: string;
//   message: string;
//   time: string;
//   read: boolean;
//   type:
//     | "ticket_assigned"
//     | "customer_reply"
//     | "ticket_updated"
//     | "status_changed"
//     | "system";
//   ticketId?: string;
// }

// type MessageHandler = (message: SocketMessage) => void;
// type NotificationHandler = (notification: SocketNotification) => void;
// type ChatNotificationHandler = (notification: any) => void;

// class SocketService {
//   private socket: Socket | null = null;
//   private messageHandlers: MessageHandler[] = [];
//   private notificationHandlers: NotificationHandler[] = [];
//   private chatNotificationHandlers: ChatNotificationHandler[] = [];
//   private connected: boolean = false;

//   connect() {
//     if (this.socket) return;

//     const user = authService.getCurrentUser();
//     if (!user) return;

//     const SOCKET_URL = "http://localhost:3000";

//     this.socket = io(SOCKET_URL, {
//       auth: {
//         token: user.id,
//       },
//       transports: ["websocket"],
//     });

//     this.socket.on("connect", () => {
//       this.connected = true;
//       console.log("Socket connected");

//       if (user.role === "agent") {
//         this.joinNotificationRoom(user.id);
//       }
//     });

//     this.socket.on("disconnect", () => {
//       this.connected = false;
//       console.log("Socket disconnected");
//     });

//     this.socket.on("error", (error) => {
//       console.error("Socket error:", error);
//       toast.error(`Socket error: ${error.message || "Unknown error"}`);
//     });

//     this.socket.on("messageReceived", ({ message }) => {
//       console.log("Message received:", message);

//       const mongoMessage = message as MongoMessage;

//       let senderId: string;
//       let senderType: "agent" | "customer" | "system";

//       if (typeof mongoMessage.senderId === "string") {
//         senderId = mongoMessage.senderId;
//       } else {
//         senderId = mongoMessage.senderId._id;
//       }

//       senderType = mongoMessage.senderRole;

//       const socketMessage: SocketMessage = {
//         id: mongoMessage.id,
//         ticketId: mongoMessage.chatId,
//         content: mongoMessage.content,
//         timestamp: mongoMessage.createdAt,
//         senderId: senderId,
//         senderType: senderType,
//       };

//       this.messageHandlers.forEach((handler) => handler(socketMessage));
//     });

//     this.socket.on("messageDelivered", ({ message }) => {
//       console.log("Message delivered:", message);
//     });

//     this.socket.on("notification", (notification: SocketNotification) => {
//       toast(notification.title, {
//         description: notification.message,
//         action: notification.ticketId
//           ? {
//               label: "View",
//               onClick: () => {
//                 window.location.href = `/chat?ticket=${notification.ticketId}`;
//               },
//             }
//           : undefined,
//       });

//       this.notificationHandlers.forEach((handler) => handler(notification));
//     });

//     this.socket.on("chatNotified", (notification) => {
//       toast("New Chat Assigned", {
//         description: `A new chat has been assigned to you: ${
//           notification.subject || ""
//         }`,
//         action: notification.chatId
//           ? {
//               label: "View",
//               onClick: () => {
//                 window.location.href = `/chat?ticket=${notification.chatId}`;
//               },
//             }
//           : undefined,
//       });

//       this.chatNotificationHandlers.forEach((handler) => handler(notification));
//     });
//   }

//   joinNotificationRoom(agentId: string) {
//     if (!this.socket || !this.connected) return;

//     console.log("Joining notification room for agent:", agentId);
//     this.socket.emit("joinNotification", agentId);
//   }

//   joinChatRoom(chatId: string, userType: "agent") {
//     if (!this.socket || !this.connected) return;

//     console.log("Joining chat room:", chatId, "as", userType);
//     this.socket.emit("joinChat", { chatId, userType });
//   }

//   disconnect() {
//     if (!this.socket) return;

//     this.socket.disconnect();
//     this.socket = null;
//     this.connected = false;
//   }

//   sendMessage(chatId: string, content: string) {
//     if (!this.socket || !this.connected) {
//       console.error("Socket not connected");
//       return false;
//     }

//     const user = authService.getCurrentUser();
//     if (!user) {
//       console.error("No authenticated user");
//       return false;
//     }

//     console.log("Sending message with payload:", {
//       chatId,
//       content,
//     });

//     // Add event listener for any errors
//     this.socket.once("sendMessageError", (error) => {
//       console.error("Error sending message:", error);
//     });

//     // // Add event listener for success confirmation
//     // this.socket.once("messageSent", (response) => {
//     //   console.log("Message sent successfully:", response);
//     // });

//     this.socket.emit("sendMessage", {
//       chatId,
//       message: content,
//     });

//     return true;
//   }

//   onMessage(handler: MessageHandler) {
//     this.messageHandlers.push(handler);
//     return () => {
//       this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
//     };
//   }

//   onNotification(handler: NotificationHandler) {
//     this.notificationHandlers.push(handler);
//     return () => {
//       this.notificationHandlers = this.notificationHandlers.filter(
//         (h) => h !== handler
//       );
//     };
//   }

//   onChatNotification(handler: ChatNotificationHandler) {
//     this.chatNotificationHandlers.push(handler);
//     return () => {
//       this.chatNotificationHandlers = this.chatNotificationHandlers.filter(
//         (h) => h !== handler
//       );
//     };
//   }

//   markNotificationAsRead(notificationId: string) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit("markNotificationRead", { notificationId });
//   }

//   markAllNotificationsAsRead() {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit("markAllNotificationsRead");
//   }

//   joinTicketRoom(ticketId: string) {
//     if (!this.socket || !this.connected) return;

//     const user = authService.getCurrentUser();
//     if (!user) return;
//     console.log("Joining ticket room:", ticketId, "as agentt");
//     this.joinChatRoom(ticketId, "agent");
//   }

//   leaveTicketRoom(ticketId: string) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit("leaveChat", { chatId: ticketId });
//   }

//   getCurrentUser(): User {
//     return authService.getCurrentUser();
//   }

//   isConnected(): boolean {
//     return this.connected;
//   }
// }

// export const socketService = new SocketService();

import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { authService, User } from "./authService";
import {
  MongoMessage,
  MongoObjectId,
  MongoNotification,
} from "@/types/mongoTypes";

export interface SocketMessage {
  id: string;
  ticketId: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderType: "agent" | "customer" | "system";
  messageType?: "chat" | "status_change";
  attachments?: { name: string; url: string }[];
}

export interface SocketNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type:
    | "ticket_assigned"
    | "customer_reply"
    | "ticket_updated"
    | "status_changed"
    | "system";
  ticketId?: string;
}

type MessageHandler = (message: SocketMessage) => void;
type NotificationHandler = (notification: SocketNotification) => void;
type ChatNotificationHandler = (notification: any) => void;
type ChatCreatedHandler = (chat: any) => void;

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private notificationHandlers: NotificationHandler[] = [];
  private chatNotificationHandlers: ChatNotificationHandler[] = [];
  private chatCreatedHandlers: ChatCreatedHandler[] = [];
  private connected: boolean = false;

  connect() {
    if (this.socket) {
      console.log("Socket already connected, skipping reconnect");
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) {
      console.error("No user available for socket connection");
      return;
    }

    console.log("Attempting to connect socket with user:", user.id);
    const SOCKET_URL = "http://localhost:3000";

    this.socket = io(SOCKET_URL, {
      auth: {
        token: user.id,
      },
      transports: ["websocket"],
    });

    this.socket.off("connect");
    this.socket.off("disconnect");
    this.socket.off("error");
    this.socket.off("messageReceived");
    this.socket.off("messageDelivered");
    this.socket.off("notification");
    this.socket.off("chatNotified");
    this.socket.off("chatCreated");

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("Socket connected");

      if (user.role === "agent") {
        this.joinNotificationRoom(user.id);
      }
    });

    this.socket.on("disconnect", () => {
      this.connected = false;
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error(`Socket error: ${error.message || "Unknown error"}`);
    });

    this.socket.on("messageReceived", ({ message }) => {
      console.log("Message received:", message);

      const mongoMessage = message as MongoMessage;

      let senderId: string;
      let senderType: "agent" | "customer" | "system";

      if (typeof mongoMessage.senderId === "string") {
        senderId = mongoMessage.senderId;
      } else {
        senderId = mongoMessage.senderId._id;
      }

      senderType = mongoMessage.senderRole;

      const socketMessage: SocketMessage = {
        id: mongoMessage.id,
        ticketId: mongoMessage.chatId,
        content: mongoMessage.content,
        timestamp: mongoMessage.createdAt,
        senderId: senderId,
        senderType: senderType,
      };

      this.messageHandlers.forEach((handler) => handler(socketMessage));
    });

    this.socket.on("messageDelivered", ({ message }) => {
      console.log("Message delivered:", message);
    });

    this.socket.on("notification", (notification: MongoNotification) => {
      console.log("Notification received:", notification);

      // Convert MongoNotification to SocketNotification
      const socketNotification: SocketNotification = {
        id:
          typeof notification._id === "string"
            ? notification._id
            : notification._id,
        title: notification.title,
        message: notification.content,
        time: formatRelativeTime(notification.createdAt),
        read: notification.read,
        type: notification.type as any, // Cast to the appropriate type
        ticketId: notification.reference?.id
          ? typeof notification.reference.id === "string"
            ? notification.reference.id
            : notification.reference.id
          : undefined,
      };

      toast(notification.title, {
        description: notification.content,
        action: notification.reference?.id
          ? {
              label: "View",
              onClick: () => {
                window.location.href = `/chat?ticket=${
                  typeof notification.reference.id === "string"
                    ? notification.reference.id
                    : notification.reference.id
                }`;
              },
            }
          : undefined,
      });

      this.notificationHandlers.forEach((handler) =>
        handler(socketNotification)
      );
    });

    this.socket.on("chatNotified", (notification, chat) => {
      console.log("Chat notification received:", notification, chat);

      // Create a SocketNotification from the chatNotified event
      const socketNotification: SocketNotification = {
        id: notification._id || notification.id || String(Date.now()),
        title: "New Chat Assigned",
        message: notification.subject || "A new chat has been assigned to you",
        time: "Just now",
        read: false,
        type: "ticket_assigned",
        ticketId: notification.reference.id || notification._id || chat._id,
      };

      toast(socketNotification.title, {
        description: socketNotification.message,
        action: socketNotification.ticketId
          ? {
              label: "View",
              onClick: () => {
                window.location.href = `/tickets`;
              },
            }
          : undefined,
      });

      this.chatNotificationHandlers.forEach((handler) => handler(notification));
      // Also send as regular notification for components only listening to notifications
      this.notificationHandlers.forEach((handler) =>
        handler(socketNotification)
      );
    });

    this.socket.on("chatCreated", (chat) => {
      console.log("Chat created event received:", chat);

      // Create a SocketNotification from the chatCreated event
      const socketNotification: SocketNotification = {
        id: String(Date.now()),
        title: "New Chat Created",
        message: chat.subject || "A new chat has been created",
        time: "Just now",
        read: false,
        type: "ticket_assigned",
        ticketId: chat._id,
      };

      toast(socketNotification.title, {
        description: socketNotification.message,
        action: chat._id
          ? {
              label: "View",
              onClick: () => {
                window.location.href = `/chat?ticket=${chat._id}`;
              },
            }
          : undefined,
      });

      this.chatCreatedHandlers.forEach((handler) => handler(chat));
      // Also send as regular notification for components only listening to notifications
      this.notificationHandlers.forEach((handler) =>
        handler(socketNotification)
      );
    });
  }

  joinNotificationRoom(agentId: string) {
    if (!this.socket || !this.connected) return;

    console.log("Joining notification room for agent:", agentId);
    this.socket.emit("joinNotification", agentId);

    // Important: Also join the room with agentId directly
    // This is needed because backend sends to agentId room
    this.socket.emit("joinRoom", agentId);
  }

  joinChatRoom(chatId: string, userType: "agent") {
    if (!this.socket || !this.connected) return;

    console.log("Joining chat room:", chatId, "as", userType);
    this.socket.emit("joinChat", { chatId, userType });
  }

  disconnect() {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
    this.connected = false;
  }

  // sendMessage(chatId: string, content: string) {
  //   if (!this.socket || !this.connected) {
  //     console.error("Socket not connected");
  //     return false;
  //   }

  //   const user = authService.getCurrentUser();
  //   if (!user) {
  //     console.error("No authenticated user");
  //     return false;
  //   }

  //   console.log("Sending message with payload:", {
  //     chatId,
  //     content,
  //   });

  //   // Add event listener for any errors
  //   this.socket.once("sendMessageError", (error) => {
  //     console.error("Error sending message:", error);
  //   });

  //   this.socket.emit("sendMessage", {
  //     chatId,
  //     message: content,
  //   });

  //   return true;
  // }

  // Modify the sendMessage method in socketService

  sendMessage(chatId: string, content: string) {
    if (!this.socket || !this.connected) {
      console.error("Socket not connected, attempting to reconnect");

      // Try to reconnect
      this.connect();

      // If still not connected, return false
      if (!this.connected) {
        toast.error(
          "Unable to connect to chat server. Please refresh the page."
        );
        return false;
      }

      // Ensure we're in the right room
      this.joinChatRoom(chatId, "agent");
    }

    const user = authService.getCurrentUser();
    if (!user) {
      console.error("No authenticated user");
      return false;
    }

    console.log("Sending message with payload:", {
      chatId,
      content,
    });

    this.socket.emit("sendMessage", {
      chatId,
      message: content,
    });

    return true;
  }
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onNotification(handler: NotificationHandler) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  onChatNotification(handler: ChatNotificationHandler) {
    this.chatNotificationHandlers.push(handler);
    return () => {
      this.chatNotificationHandlers = this.chatNotificationHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  onChatCreated(handler: ChatCreatedHandler) {
    this.chatCreatedHandlers.push(handler);
    return () => {
      this.chatCreatedHandlers = this.chatCreatedHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  markNotificationAsRead(notificationId: string) {
    if (!this.socket || !this.connected) return;

    this.socket.emit("markNotificationRead", { notificationId });
  }

  markAllNotificationsAsRead() {
    if (!this.socket || !this.connected) return;

    this.socket.emit("markAllNotificationsRead");
  }

  joinTicketRoom(ticketId: string) {
    if (!this.socket || !this.connected) return;

    const user = authService.getCurrentUser();
    if (!user) return;
    console.log("Joining ticket room:", ticketId, "as agent");
    this.joinChatRoom(ticketId, "agent");
  }

  leaveTicketRoom(ticketId: string) {
    if (!this.socket || !this.connected) return;

    this.socket.emit("leaveChat", { chatId: ticketId });
  }

  getCurrentUser(): User {
    return authService.getCurrentUser();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const socketService = new SocketService();
