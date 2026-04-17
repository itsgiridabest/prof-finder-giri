import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Mail, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import ProfessorCard from "@/components/ProfessorCard";
import EmailEditor from "@/components/EmailEditor";

interface Professor {
  id: number;
  name: string;
  university: string;
  department?: string;
  researchInterests: string;
  recentPapers: Array<{ title: string; year: number; url?: string }>;
  contactEmail?: string;
  profileUrl?: string;
}

export default function Search() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [researchField, setResearchField] = useState("");
  const [university, setUniversity] = useState("");
  const [locationPref, setLocationPref] = useState("");
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);
  const [emailTone, setEmailTone] = useState<"formal" | "friendly" | "concise">("formal");
  const [bookmarkedProfessors, setBookmarkedProfessors] = useState<Set<number>>(new Set());

  const searchMutation = trpc.professor.searchProfessors.useMutation();
  const generateEmailMutation = trpc.professor.generateEmail.useMutation();
  const updateEmailMutation = trpc.professor.updateEmail.useMutation();
  const getEmailQuery = trpc.professor.getEmail.useQuery(
    selectedProfessor ? { professorId: selectedProfessor.id } : { professorId: -1 },
    { enabled: !!selectedProfessor }
  );

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

  const handleSearch = async () => {
    if (!researchField.trim()) {
      toast.error("Please enter a research field");
      return;
    }

    try {
      const result = await searchMutation.mutateAsync({
        researchField,
        universityPreference: university || undefined,
        locationPreference: locationPref || undefined,
      });

      setProfessors(result.professors);
      setSelectedProfessor(null);
      toast.success(`Found ${result.professors.length} professors`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    }
  };

  const handleGenerateEmail = async (professor: Professor) => {
    try {
      const result = await generateEmailMutation.mutateAsync({
        professorId: professor.id,
        professorName: professor.name,
        professorResearch: professor.researchInterests,
        recentPapers: professor.recentPapers,
        researchInterest: researchField,
      });

      setSelectedProfessor(professor);
      setEditingEmailId(result.id);
      toast.success("Email generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Email generation failed");
    }
  };

  const handleCopyEmail = (content: string, emailId: number) => {
    navigator.clipboard.writeText(content);
    setCopiedEmailId(emailId);
    setTimeout(() => setCopiedEmailId(null), 2000);
    toast.success("Email copied to clipboard");
  };

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
              <h1 className="text-2xl font-black">ProfFinder</h1>
              <p className="text-sm text-muted-foreground">Find your research opportunity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!selectedProfessor ? (
          <div className="max-w-4xl">
            {/* Search Form */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-black mb-6">Search for Professors</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Research Field *</label>
                  <Input
                    placeholder="e.g., Machine Learning, Quantum Computing, Neuroscience"
                    value={researchField}
                    onChange={(e) => setResearchField(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">University (Optional)</label>
                    <Input
                      placeholder="e.g., MIT, Stanford"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Location (Optional)</label>
                    <Input
                      placeholder="e.g., California, USA"
                      value={locationPref}
                      onChange={(e) => setLocationPref(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searchMutation.isPending}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {searchMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search Professors"
                  )}
                </Button>
              </div>
            </Card>

            {/* Results */}
            {professors.length > 0 && (
              <div>
                <h2 className="text-2xl font-black mb-6">Found {professors.length} Professors</h2>
                <div className="space-y-4">
                  {professors.map((prof) => (
                    <ProfessorCard
                      key={prof.id}
                      professor={prof}
                      onGenerateEmail={() => handleGenerateEmail(prof)}
                      isGenerating={generateEmailMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Professor Detail with Email Editor */}
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedProfessor(null);
                setEditingEmailId(null);
              }}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Professor Info */}
              <div className="md:col-span-1">
                <Card className="p-6 sticky top-4">
                  <h2 className="text-xl font-black mb-4">{selectedProfessor.name}</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">University</p>
                      <p className="font-semibold">{selectedProfessor.university}</p>
                    </div>
                    {selectedProfessor.department && (
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p className="font-semibold">{selectedProfessor.department}</p>
                      </div>
                    )}
                    {selectedProfessor.contactEmail && (
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-semibold break-all">{selectedProfessor.contactEmail}</p>
                      </div>
                    )}
                    {selectedProfessor.profileUrl && (
                      <a
                        href={selectedProfessor.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline font-semibold"
                      >
                        View Profile →
                      </a>
                    )}
                  </div>
                </Card>
              </div>

              {/* Email Editor */}
              <div className="md:col-span-2">
                {getEmailQuery.data && editingEmailId ? (
                  <EmailEditor
                    email={getEmailQuery.data}
                    onSave={async (content) => {
                      if (getEmailQuery.data) {
                        await updateEmailMutation.mutateAsync({
                          emailId: getEmailQuery.data.id,
                          editedContent: content,
                        });
                        toast.success("Email updated");
                      }
                    }}
                    onCopy={() => {
                      if (getEmailQuery.data) {
                        handleCopyEmail(
                          getEmailQuery.data.editedContent || getEmailQuery.data.originalContent,
                          getEmailQuery.data.id
                        );
                      }
                    }}
                    isCopied={getEmailQuery.data ? copiedEmailId === getEmailQuery.data.id : false}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No email generated yet</p>
                    <Button
                      onClick={() => handleGenerateEmail(selectedProfessor)}
                      disabled={generateEmailMutation.isPending}
                      className="bg-accent text-accent-foreground"
                    >
                      {generateEmailMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Email"
                      )}
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
