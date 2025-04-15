
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  MessageSquare,
  Ticket,
  Settings,
  UserCircle,
  LogOut,
  X,
} from "lucide-react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Chat",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Tickets",
      href: "/tickets",
      icon: <Ticket className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  // For mobile
  const SidebarMobile = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[240px] p-0 bg-background border-r">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Support Desk</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-secondary"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    setIsOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {user?.name.charAt(0)}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <ModeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // For desktop
  const SidebarDesktop = (
    <div className={cn("hidden md:flex flex-col h-screen w-[240px] border-r bg-background", 
      !isOpen && "hidden")}>
      <div className="flex items-center h-14 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Support Desk</h1>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                location.pathname === item.href && "bg-secondary"
              )}
              asChild
            >
              <Link to={item.href}>
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <ModeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {SidebarMobile}
      {SidebarDesktop}
    </>
  );
}
