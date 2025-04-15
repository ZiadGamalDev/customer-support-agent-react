import { useState, useEffect, useCallback } from "react";
import { socketService, SocketMessage } from "@/services/socketService";
import { Message } from "@/services/ticketService";
import { apiService } from "@/services/apiService";
import { MongoMessage, MongoUser } from "@/types/mongoTypes";

// Helper function to extract ID from different sender/receiver formats
const extractId = (entity: string | { _id: string } | null): string => {
  if (entity === null) return "system";
  if (typeof entity === "string") return entity;
  if (typeof entity === "object" && "_id" in entity) return entity._id;
  return "unknown";
};

// Helper function to convert MongoDB messages to our app format
const convertMongoMessageToAppMessage = (message: MongoMessage): Message => {
  return {
    id: message.id,
    ticketId: message.chatId,
    content: message.content,
    timestamp: message.createdAt,
    senderId: extractId(message.senderId),
    senderType: message.senderRole,
  };
};

export function useChatSocket(ticketId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial messages from MongoDB API
  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Use the new apiService to fetch messages
        const mongoMessages = await apiService.messages.getByTicketId(ticketId);

        // Convert MongoDB messages to our app format
        const formattedMessages = mongoMessages.map(
          convertMongoMessageToAppMessage
        );

        setMessages(formattedMessages);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load messages")
        );
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [ticketId]);

  // Subscribe to new messages for this ticket
  useEffect(() => {
    if (!ticketId) return;

    socketService.joinTicketRoom(ticketId);

    const unsubscribe = socketService.onMessage((socketMessage: SocketMessage) => {
      // Only add to messages if it's a chat message (not a status change)
      if (socketMessage.ticketId === ticketId && socketMessage.messageType !== 'status_change') {
        const newMessage: Message = {
          id: socketMessage.id,
          ticketId: socketMessage.ticketId,
          content: socketMessage.content,
          timestamp: socketMessage.timestamp || new Date().toISOString(),
          senderId: socketMessage.senderId,
          senderType: socketMessage.senderType,
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      unsubscribe();
      socketService.leaveTicketRoom(ticketId);
    };
  }, [ticketId]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!ticketId) return null;

      try {
        const sent = socketService.sendMessage(ticketId, content);

        if (!sent) {
          throw new Error("Failed to send message");
        }

        // Optimistic UI update until we get confirmation
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          ticketId: ticketId,
          content: content,
          timestamp: new Date().toISOString(),
          senderId: socketService.getCurrentUser().id,
          senderType: "agent",
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        return optimisticMessage;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to send message")
        );
        console.error("Error sending message:", err);
        return null;
      }
    },
    [ticketId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
