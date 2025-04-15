
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useSocket } from "@/hooks/useSocket";
import { NotificationsPopover } from "@/components/dashboard/NotificationsPopover";
import { MessagesPopover } from "@/components/dashboard/MessagesPopover";
import { authService } from "@/services/authService";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Use the socket hook to manage socket connection
  const { isConnected, joinNotificationRoom } = useSocket();
  
  // Join notification room on component mount
  useEffect(() => {
    if (isConnected) {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        joinNotificationRoom(currentUser.id);
      }
    }
  }, [isConnected, joinNotificationRoom]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
