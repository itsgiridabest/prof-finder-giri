import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Search, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function History() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const searchHistoryQuery = trpc.professor.getSearchHistory.useQuery(undefined, {
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
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black">Search History</h1>
              <p className="text-sm text-muted-foreground">View your past searches and generated emails</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {searchHistoryQuery.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : searchHistoryQuery.data && searchHistoryQuery.data.length > 0 ? (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-black mb-6">Your Searches</h2>
            <div className="space-y-4">
              {searchHistoryQuery.data.map((search) => (
                <Card
                  key={search.id}
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/search?id=${search.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-black">{search.researchField}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {search.universityPreference && `University: ${search.universityPreference}`}
                        {search.universityPreference && search.locationPreference && " • "}
                        {search.locationPreference && `Location: ${search.locationPreference}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/search?id=${search.id}`);
                      }}
                    >
                      View Results
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-black mb-2">No searches yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by searching for professors in your research field
            </p>
            <Button
              onClick={() => setLocation("/search")}
              className="bg-accent text-accent-foreground"
            >
              New Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
