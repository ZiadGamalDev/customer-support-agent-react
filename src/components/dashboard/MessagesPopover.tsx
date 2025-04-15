import { useState, useEffect } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { socketService, SocketMessage } from "@/services/socketService";
import { ticketService } from "@/services/ticketService";

// Message type for UI
interface ChatMessage {
  id: string;
  ticketId: string;
  sender: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}

// Initial mock messages
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    ticketId: "1",
    sender: "John Doe",
    avatar: "JD",
    preview: "Hi there, I'm having an issue with my order...",
    time: "5 minutes ago",
    unread: true
  },
  {
    id: "2",
    ticketId: "2",
    sender: "Sarah Smith",
    avatar: "SS",
    preview: "Thank you for your help with my return request.",
    time: "2 hours ago",
    unread: true
  },
  {
    id: "3",
    ticketId: "3",
    sender: "Mike Johnson",
    avatar: "MJ",
    preview: "When can I expect my refund to be processed?",
    time: "Yesterday",
    unread: false
  }
];

export function MessagesPopover() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const unreadCount = messages.filter(message => message.unread).length;

  // Handle new socket messages
  useEffect(() => {
    const unsubscribe = socketService.onMessage(async (socketMessage: SocketMessage) => {
      if (socketMessage.senderType === "customer") {
        try {
          const ticket = await ticketService.getTicketById(socketMessage.ticketId);
          if (ticket) {
            const customer = await ticketService.getCustomerById(ticket.customer);
            
            if (customer) {
              const newMessage: ChatMessage = {
                id: socketMessage.id,
                ticketId: socketMessage.ticketId,
                sender: customer.name,
                avatar: customer.name.split(" ").map(n => n[0]).join(""),
                preview: socketMessage.content,
                time: "Just now",
                unread: true
              };
              
              setMessages(prev => [newMessage, ...prev.filter(m => m.ticketId !== socketMessage.ticketId)]);
            }
          }
        } catch (error) {
          console.error("Error processing new message:", error);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleMessageClick = (messageId: string, ticketId: string) => {
    setMessages(messages.map(message => 
      message.id === messageId ? { ...message, unread: false } : message
    ));
    
    navigate(`/chat?ticket=${ticketId}`);
    setOpen(false);
  };

  const viewAllMessages = () => {
    navigate("/chat");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Mail className="h-5 w-5" />
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
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">Recent Messages</h3>
        </div>
        <ScrollArea className="max-h-80">
          {messages.length > 0 ? (
            <div className="py-2">
              {messages.map((message) => (
                <div key={message.id}>
                  <button
                    className={`w-full text-left px-4 py-3 hover:bg-accent ${message.unread ? 'bg-accent/40' : ''}`}
                    onClick={() => handleMessageClick(message.id, message.ticketId)}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {message.avatar}
                      </div>
                      <div className="space-y-1 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{message.sender}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">{message.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                      </div>
                    </div>
                  </button>
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <p>No messages</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={viewAllMessages}
          >
            View all messages
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
