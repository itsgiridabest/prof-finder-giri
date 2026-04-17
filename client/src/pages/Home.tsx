import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { ArrowRight, Search, Mail, CheckCircle2, User, BarChart3, LineChart, Bookmark } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/search");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tight">ProfFinder</div>
          {isAuthenticated && !loading ? (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setLocation("/search")}
                variant="ghost"
                size="sm"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={() => setLocation("/tracker")}
                variant="ghost"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Tracker
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="ghost"
                size="sm"
              >
                <LineChart className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => setLocation("/bookmarks")}
                variant="ghost"
                size="sm"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmarks
              </Button>
              <Button
                onClick={() => setLocation("/profile")}
                variant="ghost"
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGetStarted}
              variant="default"
              className="bg-accent text-accent-foreground"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
            Find the Right Professor
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover professors working in your research field and generate personalized cold emails in seconds. ProfFinder uses AI to help you find the perfect research opportunity.
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold group"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Decorative shapes */}
        <div className="absolute top-32 right-0 w-96 h-96 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[var(--pastel-blue)] rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[var(--pastel-pink)] rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card border-t border-border py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black mb-16 tracking-tight">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[var(--pastel-blue)] rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-black">Search</h3>
              <p className="text-muted-foreground">
                Enter your research field and optional location. Our AI searches for professors actively working in your area.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[var(--pastel-pink)] rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-black">Review</h3>
              <p className="text-muted-foreground">
                View professor profiles with their research interests, recent publications, and contact information all in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[var(--pastel-blue)] rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-black">Email</h3>
              <p className="text-muted-foreground">
                Get AI-generated personalized emails that reference their specific work. Edit and copy with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black mb-12 tracking-tight">Why ProfFinder?</h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-black mb-2">AI-Powered Discovery</h3>
                  <p className="text-muted-foreground">
                    Find real professors with active research programs in your field, not generic results.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-black mb-2">Personalized Emails</h3>
                  <p className="text-muted-foreground">
                    Every email references specific papers and research interests. No generic templates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-black mb-2">Save Your Searches</h3>
                  <p className="text-muted-foreground">
                    Keep track of all your searches and generated emails in one place for future reference.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-black mb-2">Edit Before Sending</h3>
                  <p className="text-muted-foreground">
                    Review and customize each email inline before copying it to your clipboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card border-t border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-6 tracking-tight">Ready to Find Your Research Opportunity?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start discovering professors and crafting personalized outreach emails today.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ProfFinder © 2026. Built for Giri to find research opportunities.</p>
        </div>
      </footer>
    </div>
  );
}
