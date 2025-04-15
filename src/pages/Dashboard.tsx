
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ticketService } from "@/services/ticketService";
import type { Ticket } from "@/services/ticketService";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users, Ticket as TicketIcon, Inbox, CheckCircle2, Clock, AlertCircle, LoaderCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const fetchedTickets = await ticketService.getTickets({ agentId: user?.id });
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user?.id]);

  // Calculate counts and group tickets
  const openTickets = tickets.filter(ticket => ticket.status === "open");
  const pendingTickets = tickets.filter(ticket => ticket.status === "pending");
  const resolvedTickets = tickets.filter(ticket => ticket.status === "resolved");
  
  const highPriorityTickets = tickets.filter(ticket => ticket.priority === "high" || ticket.priority === "urgent");

  const stats = [
    {
      title: "Total Assigned",
      value: tickets.length,
      icon: TicketIcon,
    },
    {
      title: "Open",
      value: openTickets.length,
      icon: Inbox,
    },
    {
      title: "Pending",
      value: pendingTickets.length,
      icon: Clock,
    },
    {
      title: "Resolved",
      value: resolvedTickets.length,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your support tickets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground/50" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="recent">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recent">Recent Tickets</TabsTrigger>
            <TabsTrigger value="priority">High Priority</TabsTrigger>
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
          {loading ? (
            <div className="flex justify-center p-6">
              <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.slice(0, 4).map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-lg font-medium">
                      {ticket.subject}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <span className="text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        ticket.priority === "urgent" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : 
                        ticket.priority === "high" ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" : 
                        ticket.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : 
                        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/chat?ticket=${ticket.id}`)}
                        className="text-sm text-primary"
                      >
                        View details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No tickets assigned to you</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="priority" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center p-6">
              <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : highPriorityTickets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {highPriorityTickets.slice(0, 4).map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">
                        {ticket.subject}
                      </CardTitle>
                      {ticket.priority === "urgent" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <span className="text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        ticket.priority === "urgent" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : 
                        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/chat?ticket=${ticket.id}`)}
                        className="text-sm text-primary"
                      >
                        View details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No high priority tickets</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
