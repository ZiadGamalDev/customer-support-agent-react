import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Message } from "@/services/ticketService";
import { authService, User } from "@/services/authService";
import { toast } from "sonner";
import {
  LoaderCircle,
  Send,
  User as UserIcon,
  ExternalLink,
  Clock,
  Tag,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TicketStatusDialog } from "@/components/chat/TicketStatusDialog";
import { useChatSocket } from "@/hooks/useChatSocket";
import { apiService } from "@/services/apiService";
import { MongoChat, Customer } from "@/types/mongoTypes";
import { socketService } from "@/services/socketService";

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTicketId = searchParams.get("ticket");

  localStorage.setItem("ticketId", initialTicketId);

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<MongoChat[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTicketId
  );
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [ticketFilter, setTicketFilter] = useState<string>("all");

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
  } = useChatSocket(selectedTicketId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSenderObject = (
    sender: any
  ): sender is { _id: string; name: string; email: string } => {
    return typeof sender === "object" && sender !== null && "_id" in sender;
  };

  const getSenderName = (message: Message) => {
    if (
      typeof message.senderId === "object" &&
      isSenderObject(message.senderId)
    ) {
      return message.senderId;
    }

    if (message.senderType === "agent") {
      return "Agent";
    } else {
      return customer?.username || "Customer";
    }
  };

  const getSenderAvatar = (message: Message) => {
    if (
      typeof message.senderId === "object" &&
      isSenderObject(message.senderId)
    ) {
      return message.senderId;
    }

    if (message.senderType === "agent") {
      return "A";
    } else {
      return customer?.username.charAt(0) || "C";
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const fetchedTickets = await apiService.tickets.getAll();
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

  const filteredTickets = tickets.filter((ticket) => {
    if (ticketFilter === "all") return true;
    return ticket.status === ticketFilter;
  });

  const convertMongoTicketToTicket = (mongoTicket: MongoChat): Ticket => {
    return {
      id: mongoTicket.id,
      subject: mongoTicket.title,
      description: mongoTicket.description,
      status: mongoTicket.status,
      priority: mongoTicket.priority,
      customer: mongoTicket.customer,
      agentId: mongoTicket.agentId,
      createdAt: mongoTicket.createdAt,
      updatedAt: mongoTicket.createdAt, // Using createdAt since MongoDB doesn't have updatedAt
    };
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!selectedTicketId) return;

      try {
        const mongoTicket = await apiService.tickets.getById(selectedTicketId);

        console.log(mongoTicket);
        if (!mongoTicket) {
          toast.error("Ticket not found");
          return;
        }

        const ticket = convertMongoTicketToTicket(mongoTicket);
        setSelectedTicket(ticket);
        console.log(ticket);
        // Get customer details using the ID

        const customer = await apiService.customer.getCustomerById(
          ticket.customer
        );
        console.log(customer);
        setCustomer(customer);
      } catch (error) {
        console.error("Failed to fetch ticket details:", error);
        toast.error("Failed to load ticket details");
      }
    };

    if (selectedTicketId) {
      fetchTicketDetails();
    } else {
      setSelectedTicket(null);
      setCustomer(null);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const ticketId = localStorage.getItem("ticketId");

  // Modify the useEffect in ChatPage that handles socket room joining

  useEffect(() => {
    // Get ticketId from either URL params or localStorage as fallback
    const activeTicketId = selectedTicketId || localStorage.getItem("ticketId");

    if (activeTicketId) {
      console.log("Joining chat room for ticket:", activeTicketId);

      // Make sure socket is connected before attempting to join
      if (socketService.isConnected()) {
        socketService.joinChatRoom(activeTicketId, "agent");
      } else {
        // If not connected, reconnect first then join
        socketService.connect();
        // Give it a moment to connect before joining
        setTimeout(() => {
          socketService.joinChatRoom(activeTicketId, "agent");
        }, 500);
      }
    }

    // Clean up function
    return () => {
      if (activeTicketId) {
        socketService.leaveTicketRoom(activeTicketId);
      }
    };
  }, [selectedTicketId]); // Depend on selectedTicketId instead of ticketId from localStorage

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedTicketId ||
      !newMessage.trim() ||
      !authService.getCurrentUser()
    )
      return;

    setSendingMessage(true);
    try {
      const message = await sendMessage(newMessage);
      console.log(message);
      if (message) {
        setNewMessage("");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (
    ticketId: string,
    newStatus: Ticket["status"]
  ) => {
    try {
      // Call the API to update status
      const updatedTicket = await apiService.tickets.updateStatus(
        ticketId,
        newStatus
      );

      // Update local tickets state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: updatedTicket.status }
            : ticket
        )
      );

      // Update selected ticket if it's the one being modified
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: updatedTicket.status } : null
        );
      }

      // Don't add status changes to chat messages
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Chat Support</h1>
        <p className="text-muted-foreground">
          Manage support conversations with customers
        </p>
      </div>

      <div className="flex flex-1 gap-4 h-full overflow-hidden">
        <Card className="w-full md:w-1/3 flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tickets</CardTitle>
              <Select value={ticketFilter} onValueChange={setTicketFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoaderCircle className="animate-spin h-8 w-8 text-muted-foreground" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No tickets available
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors ${
                        selectedTicketId === ticket.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-1">
                            {ticket.title}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ticket.status === "open"
                              ? "default"
                              : ticket.status === "pending"
                              ? "secondary"
                              : ticket.status === "resolved"
                              ? "outline"
                              : "destructive"
                          }
                          className="ml-2"
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {ticket.description}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {selectedTicket ? (
          <Card className="w-full md:w-2/3 flex flex-col overflow-hidden">
            <CardHeader className="px-6 py-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-1"></div>
                </div>
                <div className="flex items-center gap-2">
                  <TicketStatusDialog
                    ticket={selectedTicket}
                    onStatusChange={handleStatusChange}
                  />

                  {customer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center text-xs"
                      onClick={() => navigate(`/customer/${customer._id}`)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Customer Info
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <LoaderCircle className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Clock className="h-12 w-12 text-muted-foreground/60 mb-2" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isAgent = message.senderType === "agent";
                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isAgent ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex items-start gap-2 max-w-[75%] ${
                                isAgent ? "flex-row-reverse" : ""
                              }`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getSenderAvatar(message)}
                                </AvatarFallback>
                                {/* <AvatarImage
                                  src={
                                    typeof message.senderId === "object" &&
                                    isSenderObject(message.senderId)
                                      ? "" // You could add avatar URL here if available in the MongoDB data
                                     :
                                  }
                                /> */}
                              </Avatar>
                              <div>
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    isAgent
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.content}
                                </div>
                                <p
                                  className={`text-xs mt-1 ${
                                    isAgent ? "text-right" : "text-left"
                                  } text-muted-foreground`}
                                >
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center space-x-2"
                  >
                    <Input
                      className="flex-1"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <Button type="submit" disabled={sendingMessage}>
                      {sendingMessage ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="hidden lg:flex flex-col w-64 border-l p-4 space-y-4">
                {customer ? (
                  <>
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarFallback>
                          {customer.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-medium">{customer.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Contact Info</p>
                      {customer.phoneNumbers[0] && (
                        <p className="text-sm text-muted-foreground">
                          {customer.phoneNumbers[0]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Customer Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/customer/${customer._id}`)}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">
                      Customer info not available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="w-full md:w-2/3 flex items-center justify-center">
            <CardContent className="text-center p-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <h3 className="text-lg font-medium">No Ticket Selected</h3>
              <p className="text-muted-foreground mt-1">
                Select a ticket from the left to start chatting
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
