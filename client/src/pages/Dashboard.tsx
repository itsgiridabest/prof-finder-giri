import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, BarChart3, Mail, CheckCircle, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const analyticsQuery = trpc.enhanced.getAnalytics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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
            <h1 className="text-2xl font-black">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your research outreach progress</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {analyticsQuery.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : analyticsQuery.data ? (
          <div className="max-w-6xl">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Professors Found */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Professors Found</p>
                    <p className="text-3xl font-black">{analyticsQuery.data.totalProfessorsFound}</p>
                  </div>
                  <Users className="w-8 h-8 text-accent opacity-50" />
                </div>
              </Card>

              {/* Total Emails Sent */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Emails Sent</p>
                    <p className="text-3xl font-black">{analyticsQuery.data.totalEmailsSent}</p>
                  </div>
                  <Mail className="w-8 h-8 text-accent opacity-50" />
                </div>
              </Card>

              {/* Total Replies */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Replies Received</p>
                    <p className="text-3xl font-black">{analyticsQuery.data.totalReplies}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-accent opacity-50" />
                </div>
              </Card>

              {/* Response Rate */}
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Response Rate</p>
                    <p className="text-3xl font-black">{analyticsQuery.data.responseRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent opacity-50" />
                </div>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Meetings Scheduled */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Meetings Scheduled</h3>
                <p className="text-4xl font-black text-accent">{analyticsQuery.data.meetingsScheduled}</p>
              </Card>

              {/* Rejections */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Rejections</h3>
                <p className="text-4xl font-black text-muted-foreground">{analyticsQuery.data.rejections}</p>
              </Card>
            </div>

            {/* Outreach Status Breakdown */}
            <Card className="p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Outreach Status Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analyticsQuery.data.outreachByStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2 capitalize">
                      {status.replace("_", " ")}
                    </p>
                    <p className="text-2xl font-black">{count}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Navigation */}
            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setLocation("/tracker")}
                variant="outline"
              >
                View Tracker
              </Button>
              <Button
                onClick={() => setLocation("/search")}
                className="bg-accent text-accent-foreground"
              >
                Find More Professors
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
