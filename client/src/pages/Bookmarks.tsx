import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Bookmark, Download } from "lucide-react";
import { toast } from "sonner";

export default function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Note: This would need a backend procedure to fetch bookmarked professors
  // For now, showing the UI structure

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

  const handleExportCSV = () => {
    toast.info("Export feature coming soon");
  };

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
          <div className="flex-1">
            <h1 className="text-2xl font-black">Bookmarked Professors</h1>
            <p className="text-sm text-muted-foreground">Professors you've saved for later</p>
          </div>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-black mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground mb-6">
            Bookmark professors while searching to save them for later
          </p>
          <Button
            onClick={() => setLocation("/search")}
            className="bg-accent text-accent-foreground"
          >
            Start Searching
          </Button>
        </div>
      </div>
    </div>
  );
}
