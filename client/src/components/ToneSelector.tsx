import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ToneSelectorProps {
  selectedTone: "formal" | "friendly" | "concise";
  onToneChange: (tone: "formal" | "friendly" | "concise") => void;
}

const toneDescriptions = {
  formal:
    "Professional and academic tone. Best for serious research collaborations.",
  friendly:
    "Warm and personable tone. Shows enthusiasm while remaining professional.",
  concise: "Brief and direct. Gets straight to the point in 2-3 short paragraphs.",
};

export default function ToneSelector({
  selectedTone,
  onToneChange,
}: ToneSelectorProps) {
  const tones = ["formal", "friendly", "concise"] as const;

  return (
    <Card className="p-4 mb-4">
      <p className="text-sm font-semibold mb-3">Email Tone</p>
      <div className="grid grid-cols-3 gap-2">
        {tones.map((tone) => (
          <div key={tone}>
            <Button
              onClick={() => onToneChange(tone)}
              variant={selectedTone === tone ? "default" : "outline"}
              className="w-full capitalize"
              size="sm"
            >
              {tone}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              {toneDescriptions[tone]}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
