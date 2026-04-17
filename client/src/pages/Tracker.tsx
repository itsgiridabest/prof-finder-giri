import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Mail, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OutreachStatus = "draft" | "sent" | "replied" | "no_response" | "meeting_scheduled" | "rejected";

export default function Tracker() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOutreach, setSelectedOutreach] = useState<number | null>(null);

  const outreachQuery = trpc.profile.getOutreach.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateOutreachMutation = trpc.profile.updateOutreach.useMutation({
    onSuccess: () => {
      toast.success("Outreach status updated");
      outreachQuery.refetch();
      setSelectedOutreach(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update outreach");
    },
  });

  const handleStatusChange = (outreachId: number, newStatus: OutreachStatus) => {
    const outreach = outreachQuery.data?.find((o) => o.id === outreachId);
    if (!outreach) return;

    updateOutreachMutation.mutate({
      outreachId,
      status: newStatus,
      sentAt: newStatus === "sent" && !outreach.sentAt ? new Date() : (outreach.sentAt || undefined),
      repliedAt: newStatus === "replied" && !outreach.repliedAt ? new Date() : (outreach.repliedAt || undefined),
    });
  };

  const getStatusIcon = (status: OutreachStatus) => {
    switch (status) {
      case "sent":
        return <Mail className="w-4 h-4" />;
      case "replied":
        return <CheckCircle className="w-4 h-4" />;
      case "meeting_scheduled":
        return <AlertCircle className="w-4 h-4" />;
      case "no_response":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: OutreachStatus) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "meeting_scheduled":
        return "bg-purple-100 text-purple-800";
      case "no_response":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to continue</p>
          <Button onClick={() => setLocation("/")} variant="default">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black">Outreach Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your professor outreach and responses</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {outreachQuery.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : outreachQuery.data && outreachQuery.data.length > 0 ? (
          <div className="max-w-4xl space-y-4">
            {outreachQuery.data.map((outreach) => (
              <Card key={outreach.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(outreach.status as OutreachStatus)}
                      <Badge className={getStatusColor(outreach.status as OutreachStatus)}>
                        {outreach.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(outreach.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOutreach(selectedOutreach === outreach.id ? null : outreach.id)}
                  >
                    {selectedOutreach === outreach.id ? "Close" : "Edit"}
                  </Button>
                </div>

                {selectedOutreach === outreach.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select
                        value={outreach.status}
                        onValueChange={(value) =>
                          handleStatusChange(outreach.id, value as OutreachStatus)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="no_response">No Response</SelectItem>
                          <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {outreach.notes && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <p className="text-sm text-muted-foreground">{outreach.notes}</p>
                      </div>
                    )}

                    {outreach.sentAt && (
                      <p className="text-xs text-muted-foreground">
                        Sent: {new Date(outreach.sentAt).toLocaleDateString()}
                      </p>
                    )}
                    {outreach.repliedAt && (
                      <p className="text-xs text-muted-foreground">
                        Replied: {new Date(outreach.repliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-black mb-2">No outreach yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by searching for professors and generating emails
            </p>
            <Button
              onClick={() => setLocation("/search")}
              className="bg-accent text-accent-foreground"
            >
              Start Searching
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
