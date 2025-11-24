import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import type { Question } from "@shared/schema";

type ToneType = "formal" | "casual" | "encouraging" | "technical";

const TONE_DESCRIPTIONS = {
  formal: "Professional, structured language",
  casual: "Friendly, conversational tone",
  encouraging: "Motivational, supportive approach",
  technical: "Precise, industry-specific language",
};

interface ToneAdjusterProps {
  questions: Question[];
  onApplyTone: (adjustedQuestions: Question[]) => void;
  disabled?: boolean;
}

export function ToneAdjuster({ questions, onApplyTone, disabled }: ToneAdjusterProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>("casual");
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyTone = async () => {
    if (questions.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/adjust-tone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to adjust tone");
      }

      const data = await response.json();
      onApplyTone(data.adjustedQuestions);
    } catch (error) {
      console.error("Tone adjustment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card data-testid="card-tone-adjuster">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "#A3D65C" }} />
          AI Tone Adjuster
        </CardTitle>
        <CardDescription>Adjust the tone of all your questions instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(TONE_DESCRIPTIONS) as [ToneType, string][]).map(([tone, description]) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`text-left p-2 rounded-md border transition-all ${
                selectedTone === tone
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                  : "border-border hover:border-border/70 hover:bg-muted/50"
              }`}
              data-testid={`button-tone-${tone}`}
            >
              <div className="font-medium text-xs capitalize mb-1">{tone}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleApplyTone}
          disabled={disabled || questions.length === 0 || isLoading}
          className="w-full"
          data-testid="button-apply-tone"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? "Adjusting..." : "Apply Tone to All Questions"}
        </Button>

        {questions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">Add questions first to adjust tone</p>
        )}
      </CardContent>
    </Card>
  );
}
