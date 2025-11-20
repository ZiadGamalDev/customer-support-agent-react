
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useSocket } from "@/hooks/useSocket";
import { NotificationsPopover } from "@/components/dashboard/NotificationsPopover";
import { MessagesPopover } from "@/components/dashboard/MessagesPopover";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Use the socket hook to manage socket connection
  // Note: joinNotificationRoom is automatically called by socketService when socket connects
  useSocket();

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
