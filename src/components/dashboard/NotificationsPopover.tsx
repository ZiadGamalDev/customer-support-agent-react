import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { socketService, SocketNotification } from "@/services/socketService";
import { useNavigate } from "react-router-dom";
import { MongoNotification } from "@/types/mongoTypes";

// You can remove the initial notifications if you prefer to start with an empty list
// or keep them for demonstration purposes
const INITIAL_NOTIFICATIONS: SocketNotification[] = [];

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

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<SocketNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    // Make sure socket is connected
    socketService.connect();

    // Join notification room for current user
    const user = socketService.getCurrentUser();
    if (user) {
      socketService.joinNotificationRoom(user.id);
    }

    // Helper function to convert MongoDB notification to our format
    const convertMongoToSocketNotification = (
      mongo: MongoNotification
    ): SocketNotification => {
      return {
        id: typeof mongo._id === "string" ? mongo._id : mongo._id,
        title: mongo.title,
        message: mongo.content,
        time: formatRelativeTime(mongo.createdAt),
        read: mongo.read,
        type: mongo.type as any,
        ticketId: mongo.reference?.id
          ? typeof mongo.reference.id === "string"
            ? mongo.reference.id
            : mongo.reference.id
          : undefined,
      };
    };

    // Subscribe to new notifications - these are already converted in the service
    const unsubNotification = socketService.onNotification(
      (newNotification) => {
        console.log("New notification received in component:", newNotification);
        setNotifications((prev) => {
          // Check if notification already exists to avoid duplicates
          const exists = prev.some((n) => n.id === newNotification.id);
          if (exists) return prev;
          return [newNotification, ...prev];
        });
      }
    );

    // Subscribe to new chat notifications
    const unsubChatNotification = socketService.onChatNotification(
      (chatNotification) => {
        console.log(
          "New chat notification received in component:",
          chatNotification
        );
        // Skip this handler - we're now handling all notifications through the onNotification handler
      }
    );

    // Subscribe to chat created events
    const unsubChatCreated = socketService.onChatCreated((chat) => {
      console.log("New chat created in component:", chat);
      // Skip this handler - we're now handling all notifications through the onNotification handler
    });

    // Clean up subscription
    return () => {
      unsubNotification();
      unsubChatNotification();
      unsubChatCreated();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    // Tell the server to mark all notifications as read
    socketService.markAllNotificationsAsRead();

    toast.success("All notifications marked as read");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setOpen(false);
    toast.success("All notifications cleared");
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Tell the server to mark this notification as read
    socketService.markNotificationAsRead(id);
  };

  const handleNotificationClick = (notification: SocketNotification) => {
    console.log(notification.id);
    // markAsRead(notification.id);

    // Navigate based on notification type
    if (
      notification.type === "ticket_assigned" ||
      notification.type === "customer_reply" ||
      notification.type === "ticket_updated"
    ) {
      if (notification.ticketId) {
        navigate(`/chat?ticket=${notification.ticketId}`);
        setOpen(false);
      }
    } else if (
      notification.type === "status_changed" &&
      notification.ticketId
    ) {
      navigate(`/tickets?highlight=${notification.ticketId}`);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length > 0 ? (
            <div className="py-2">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <button
                    className={`w-full text-left px-4 py-3 hover:bg-accent ${
                      !notification.read ? "bg-accent/40" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-1" />
                      )}
                    </div>
                  </button>
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
