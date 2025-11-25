import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, Layers, FileUp } from "lucide-react";
import { theme } from "@/theme";

interface StartStepProps {
  onChooseTemplate: () => void;
  onChooseAI: () => void;
  onChooseUpload: () => void;
}

export default function StartStep({ onChooseTemplate, onChooseAI, onChooseUpload }: StartStepProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>How would you like to start?</h2>
        <p className="text-lg" style={{ color: theme.colors.textSecondary }}>
          Choose the method that works best for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2" 
          style={{ borderColor: theme.colors.border }}
          onClick={onChooseTemplate}
          data-testid="card-choose-template"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.colors.iconTeal }}>
              <Layers className="w-10 h-10" style={{ color: 'white' }} />
            </div>
            <CardTitle className="text-xl" style={{ color: theme.colors.textPrimary }}>Use a Template</CardTitle>
            <CardDescription className="text-base" style={{ color: theme.colors.textSecondary }}>
              Start with proven survey frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
              Pre-built questions for common training scenarios
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2 shadow-md" 
          style={{ borderColor: theme.colors.primary }}
          onClick={onChooseAI}
          data-testid="card-choose-ai"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.colors.primary }}>
              <Sparkles className="w-10 h-10" style={{ color: 'white' }} />
            </div>
            <CardTitle className="text-xl" style={{ color: theme.colors.textPrimary }}>Generate with AI</CardTitle>
            <CardDescription className="text-base" style={{ color: theme.colors.textSecondary }}>
              Describe your survey needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
              AI creates custom questions instantly
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2" 
          style={{ borderColor: theme.colors.border }}
          onClick={onChooseUpload}
          data-testid="card-choose-upload"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.colors.lime }}>
              <FileUp className="w-10 h-10" style={{ color: 'white' }} />
            </div>
            <CardTitle className="text-xl" style={{ color: theme.colors.textPrimary }}>Upload Document</CardTitle>
            <CardDescription className="text-base" style={{ color: theme.colors.textSecondary }}>
              Extract content from files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
              PDF, DOCX, or TXT documents
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
