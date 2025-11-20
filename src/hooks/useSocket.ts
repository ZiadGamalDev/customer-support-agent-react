import { useEffect, useState } from "react";
import {
  socketService,
  SocketMessage,
  SocketNotification,
} from "../services/socketService";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    // Connect to the socket server if not already connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Update connection status immediately
    setIsConnected(socketService.isConnected());

    // Set up connection status listener with longer interval to reduce re-renders
    const checkConnectionInterval = setInterval(() => {
      const connected = socketService.isConnected();
      setIsConnected((prev) => {
        // Only update state if connection status actually changed
        if (prev !== connected) {
          return connected;
        }
        return prev;
      });
    }, 5000); // Increased from 2s to 5s to reduce unnecessary checks

    // Clean up on unmount
    return () => {
      clearInterval(checkConnectionInterval);
    };
  }, []);

  return {
    isConnected,
    sendMessage: socketService.sendMessage.bind(socketService),
    joinTicketRoom: socketService.joinTicketRoom.bind(socketService),
    leaveTicketRoom: socketService.leaveTicketRoom.bind(socketService),
    joinNotificationRoom:
      socketService.joinNotificationRoom.bind(socketService),
    joinChatRoom: socketService.joinChatRoom.bind(socketService),
    markNotificationAsRead:
      socketService.markNotificationAsRead.bind(socketService),
    markAllNotificationsAsRead:
      socketService.markAllNotificationsAsRead.bind(socketService),
    onMessage: socketService.onMessage.bind(socketService),
    onNotification: socketService.onNotification.bind(socketService),
    onChatNotification: socketService.onChatNotification.bind(socketService),
  };
}
