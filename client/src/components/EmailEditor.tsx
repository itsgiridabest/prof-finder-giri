import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Edit2, Save, X } from "lucide-react";

interface Email {
  id: number;
  originalContent: string;
  editedContent?: string | null;
}

interface EmailEditorProps {
  email: Email;
  onSave: (content: string) => Promise<void>;
  onCopy: () => void;
  isCopied: boolean;
}

export default function EmailEditor({
  email,
  onSave,
  onCopy,
  isCopied,
}: EmailEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(email.editedContent || email.originalContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(email.editedContent || email.originalContent);
  }, [email]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const displayContent = email.editedContent || email.originalContent;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black">Email</h3>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onCopy}
                className="bg-accent text-accent-foreground"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border border-border rounded-lg bg-input text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setContent(displayContent);
                setIsEditing(false);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-accent text-accent-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card p-4 rounded-lg border border-border whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {displayContent}
        </div>
      )}
    </Card>
  );
}
