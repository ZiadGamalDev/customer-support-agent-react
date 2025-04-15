import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LoaderCircle, MessageCircle, ArrowLeft, Package, CalendarDays } from "lucide-react";
import { apiService } from "@/services/apiService";
import { Customer, MongoChat, Order } from "@/types/mongoTypes";

const CustomerInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<MongoChat[]>([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Fetch customer details using apiService
        const customerData = await apiService.customer.getCustomerById(id);
        if (!customerData) {
          toast.error("Customer not found");
          navigate("/dashboard");
          return;
        }
        setCustomer(customerData);
        
        // Fetch customer orders using apiService
        const ordersData = await apiService.customer.getCustomerOrders(id);
        setOrders(ordersData);
        
        // Fetch customer tickets
        const ticketsData = await apiService.tickets.getAll();
        const customerTickets = ticketsData.filter(ticket => ticket.customer === id);
        setTickets(customerTickets);
      } catch (error) {
        console.error("Failed to fetch customer data:", error);
        toast.error("Failed to load customer information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleChatWithCustomer = async () => {
    try {
      // Check if there's an open ticket for this customer
      const openTicket = tickets.find(ticket => 
        ticket.status === "open" || ticket.status === "pending"
      );
      
      if (openTicket) {
        // If there's an open ticket, navigate to it
        navigate(`/chat?ticket=${openTicket.id}`);
      } else {
        // If no open tickets, check if we should create a new one or use most recent
        if (tickets.length > 0) {
          // Navigate to most recent ticket
          const sortedTickets = [...tickets].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          navigate(`/chat?ticket=${sortedTickets[0].id}`);
        } else {
          // No tickets at all, we should create a new one
          // This would typically be handled by a backend API
          toast.info("Creating new support ticket...");
          
          // For now, just navigate to chat with customer ID
          navigate(`/chat?customer=${id}`);
        }
      }
    } catch (error) {
      console.error("Error navigating to chat:", error);
      toast.error("Failed to open chat");
    }
  };

  const CustomerInfoSection = () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarFallback>{customer?.username?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-xl font-semibold">{customer?.username}</h3>
        <p className="text-muted-foreground">{customer?.email}</p>
        {customer?.phoneNumbers && customer.phoneNumbers.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {customer.phoneNumbers[0]}
          </p>
        )}
      </div>
    </div>
  );

  const CustomerMetrics = () => (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div>
        <p className="text-sm text-muted-foreground">Customer Since</p>
        <p className="font-medium">{formatDate(customer?.createdAt || '')}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Orders</p>
        <p className="font-medium">{orders.length}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Tickets</p>
        <p className="font-medium">{tickets.length}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Total Spent</p>
        <p className="font-medium">
          {formatCurrency(orders.reduce((sum, order) => sum + order.totalPrice, 0))}
        </p>
      </div>
    </div>
  );

  const OrdersTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order._id}>
            <TableCell className="font-medium">{order._id}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>{order.orderItems.length} items</TableCell>
            <TableCell>
              <Badge
                variant={
                  order.isPaid ? "outline" : "default"
                }
              >
                {order.orderStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(order.totalPrice)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <LoaderCircle className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground mb-4">Customer not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Basic details about the customer</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <CustomerInfoSection />
            <CustomerMetrics />
            <div className="mt-6">
              <Button onClick={handleChatWithCustomer}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Customer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions and orders</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[...orders, ...tickets]
                .sort((a, b) => {
                  const dateA = new Date('_id' in a ? a.createdAt : a.createdAt);
                  const dateB = new Date('_id' in b ? b.createdAt : b.createdAt);
                  return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {'_id' in item ? (
                      // Order item
                      <>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="font-medium">New Order: {item._id}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(item.createdAt)} • {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </>
                    ) : (
                      // Ticket item
                      <>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                          <p className="font-medium">Support Ticket: {item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(item.createdAt)}
                            <Badge variant="outline" className="ml-1">
                              {item.status}
                            </Badge>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              
              {([...orders, ...tickets].length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activity found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="mt-6">
        <TabsList>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageCircle className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Order History</CardTitle>
              <CardDescription>Complete order history for this customer</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders found for this customer</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <OrdersTable />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tickets" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>All support tickets from this customer</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                  <p className="text-muted-foreground">No tickets found for this customer</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                          <TableCell>
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
                            >
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ticket.priority === "urgent"
                                  ? "destructive"
                                  : ticket.priority === "high"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/chat?ticket=${ticket.id}`)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerInfo;
