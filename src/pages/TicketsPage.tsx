import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { apiService } from "@/services/apiService";
import { MongoChat } from "@/types/mongoTypes";

const TicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<MongoChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<
    "low" | "medium" | "high" | "urgent" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  // Fetch tickets from the API
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // Use apiService instead of ticketService
        const fetchedTickets = await apiService.tickets.getAll();
        console.log(fetchedTickets);
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Apply filters
  const filteredTickets = tickets.filter((ticket) => {
    // Status filter
    if (filterStatus && ticket.status !== filterStatus) return false;

    // Priority filter
    if (filterPriority && ticket.priority !== filterPriority) return false;

    // Search query filter (check title and description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Status display helpers
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Circle className="h-4 w-4 text-blue-500" />;
      case "open":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "open":
        return "success";
      case "pending":
        return "warning";
      case "resolved":
        return "outline";
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Priority display helpers
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "secondary";
      case "high":
        return "warning";
      case "urgent":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Date formatting
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";

      const date = new Date(dateString);

      // Check if date is invalid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  // Handler for click on a ticket
  const handleTicketClick = (ticketId: string) => {
    localStorage.setItem("ticketId", ticketId.toString());
    navigate(`/chat?ticket=${ticketId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Manage Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tickets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterStatus || "all"}
                onValueChange={(value) =>
                  setFilterStatus(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPriority || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilterPriority(null);
                  } else {
                    setFilterPriority(
                      value as "low" | "medium" | "high" | "urgent"
                    );
                  }
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <SelectValue placeholder="Priority" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">ID</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Updated
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Priority
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTickets.length > 0 ? (
                      currentTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleTicketClick(ticket.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(ticket.status)}
                              <Badge
                                variant={
                                  getStatusBadgeVariant(ticket.status) as any
                                }
                              >
                                {ticket.status.charAt(0).toUpperCase() +
                                  ticket.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {ticket.title}
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {ticket.description}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {ticket.id.substring(ticket.id.length - 8)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {formatDate(ticket.createdAt)}
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant={
                                getPriorityBadgeVariant(ticket.priority) as any
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                localStorage.setItem("ticketId", ticket.id);
                                navigate(`/chat?ticket=${ticket.id}`);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No tickets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
