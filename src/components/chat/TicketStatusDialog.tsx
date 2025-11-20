import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/services/ticketService";
import { socketService } from "@/services/socketService";
import { toast } from "sonner";

interface TicketStatusDialogProps {
  ticket: Ticket;
  onStatusChange: (ticketId: string, newStatus: Ticket["status"]) => void;
}

type StatusOption = {
  value: Ticket["status"];
  label: string;
  icon: React.ReactNode;
  description: string;
};

export const TicketStatusDialog = ({
  ticket,
  onStatusChange,
}: TicketStatusDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions: StatusOption[] = [
   
    {
      value: "pending",
      label: "Pending",
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      description: "Waiting for customer response",
    },
    {
      value: "resolved",
      label: "Resolved",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      description: "Issue has been fixed",
    },
    
  ];

  const getBadgeVariant = (status: Ticket["status"]) => {
    switch (status) {
      case "open":
        return "default";
      case "pending":
        return "secondary";
      case "resolved":
        return "outline";
      case "closed":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleStatusChange = async (newStatus: Ticket["status"]) => {
    if (newStatus === ticket.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      // Call the onStatusChange prop to update the status in the database
      await onStatusChange(ticket.id, newStatus);
      // The toast is now handled in the parent component after a successful API call
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      toast.error("Failed to update ticket status");
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Badge variant={getBadgeVariant(ticket.status)}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
          Change Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Ticket Status</DialogTitle>
          <DialogDescription>
            Select a new status for this ticket. The customer will be notified of the change.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={ticket.status === option.value ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-24 p-4 ${
                ticket.status === option.value ? "border-2 border-primary" : ""
              }`}
              onClick={() => handleStatusChange(option.value)}
              disabled={isUpdating}
            >
              {option.icon}
              <span className="mt-2 font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {option.description}
              </span>
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};
