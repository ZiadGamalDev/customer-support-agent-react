import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Ticket } from "@/services/ticketService";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Users,
  Ticket as TicketIcon,
  Inbox,
  CheckCircle2,
  Clock,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

interface Stats {
  chat: {
    total: number;
    resolved: number;
    pending: number;
    open: number;
    new: number;
  };
}

interface RecentChat {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  agent?: {
    name: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [stats, setStats] = useState<Stats | null>(null);
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_SUPPORT_API_URL?.replace(/\/+$/, '')}/dashboard/statistics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setStats(data.statistics);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_SUPPORT_API_URL?.replace(/\/+$/, '')}/dashboard/recent-chats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error("Failed to fetch recent chats", error);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchStats();
    fetchChats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your support
          tickets.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          <SkeletonCard count={4} />
        ) : (
          <>
            <StatCard
              title="Total Chats"
              value={stats?.chat.total ?? 0}
              icon={<TicketIcon />}
            />
            <StatCard
              title="Resolved Chats"
              value={stats?.chat.resolved ?? 0}
              icon={<CheckCircle2 />}
            />
            <StatCard
              title="Pending Chats"
              value={stats?.chat.pending ?? 0}
              icon={<Clock />}
            />
            <StatCard
              title="Open Chats"
              value={stats?.chat.open ?? 0}
              icon={<Inbox />}
            />
            <StatCard
              title="New Chats"
              value={stats?.chat.new ?? 0}
              icon={<AlertCircle />}
            />
          </>
        )}
      </div>

      {/* Tickets */}
      <Tabs defaultValue="recent">
        <div className="flex items-center justify-between mt-6">
          <TabsList>
            <TabsTrigger value="recent">Recent Tickets</TabsTrigger>
          </TabsList>
          <button
            onClick={() => navigate("/tickets")}
            className="text-sm text-primary flex items-center"
          >
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <TabsContent value="recent" className="space-y-4 mt-4">
          {loadingChats ? (
            <SkeletonCard count={2} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.isArray(chats) &&
                chats.map((chat) => (
                  <Card key={chat.id}>
                    <CardHeader>
                      <CardTitle className="capitalize">{chat.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {new Date(chat.createdAt).toLocaleString()}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          chat.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : chat.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {chat.priority.charAt(0).toUpperCase() +
                          chat.priority.slice(1)}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Assigned to:{" "}
                        <span className="text-primary">
                          {chat.agent?.name || "Unassigned"}
                        </span>
                      </p>
                      <p className="text-sm">{chat.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

// Stat Card component
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <Card className="flex flex-col justify-between">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// Skeleton Card component (for loading)
const SkeletonCard = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="animate-pulse rounded-lg border bg-muted p-4 h-24"
      ></div>
    ))}
  </>
);
