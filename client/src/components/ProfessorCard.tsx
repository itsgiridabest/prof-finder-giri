import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Bookmark, BookmarkCheck } from "lucide-react";

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

interface ProfessorCardProps {
  professor: Professor;
  onGenerateEmail: () => void;
  isGenerating: boolean;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  matchScore?: number;
  matchReasoning?: string;
}

export default function ProfessorCard({
  professor,
  onGenerateEmail,
  isGenerating,
  onBookmark,
  isBookmarked,
  matchScore,
  matchReasoning,
}: ProfessorCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-black mb-1">{professor.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {professor.university}
            {professor.department && ` • ${professor.department}`}
          </p>

          {matchScore !== undefined && (
            <div className="mb-3 p-3 bg-card border border-border rounded">
              <p className="text-xs text-muted-foreground mb-1">Research Alignment</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-accent">{matchScore}%</p>
                <p className="text-xs text-muted-foreground flex-1">{matchReasoning}</p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Research Interests</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {professor.researchInterests}
            </p>
          </div>

          {professor.recentPapers.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Recent Papers</p>
              <ul className="space-y-1">
                {professor.recentPapers.slice(0, 2).map((paper, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {paper.title} ({paper.year})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onGenerateEmail}
            disabled={isGenerating}
            className="bg-accent text-accent-foreground hover:bg-accent/90 whitespace-nowrap"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Generate Email
              </>
            )}
          </Button>

          {onBookmark && (
            <Button
              onClick={onBookmark}
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Bookmark
                </>
              )}
            </Button>
          )}

          {professor.profileUrl && (
            <a
              href={professor.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline text-center"
            >
              View Profile
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
