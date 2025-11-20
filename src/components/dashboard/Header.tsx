import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationsPopover } from "./NotificationsPopover";
import { MessagesPopover } from "./MessagesPopover";
import { UserStatus } from "@/types/userTypes";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState<UserStatus>(user?.status || "available");

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (profile.success && profile.user) {
          setUser(profile.user);
          setStatus(profile.user.status || "available");
        } else {
          console.error("Failed to load user profile:", profile.message);
          // If profile fails, clear invalid token and let RequireAuth handle redirect
          authService.logout();
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        // If profile fails, clear invalid token and let RequireAuth handle redirect
        authService.logout();
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleStatusChange = async (newStatus: UserStatus) => {
    try {
      const response = await authService.updateStatus(newStatus);
      console.log(response);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement search functionality
    console.log("Searching for:", searchValue);
    // navigate to search results page or filter current page
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <header className="sticky top-0 z-10 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">

          {/* Notifications Popover */}
          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(
                    status
                  )}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => handleStatusChange("away")}>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                  Away
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="disabled" disabled>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                  Busy
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("available")}>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  Available
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  authService.logout();
                  navigate("/login");
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
