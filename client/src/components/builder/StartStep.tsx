import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, Layers, FileUp } from "lucide-react";

interface StartStepProps {
  onChooseTemplate: () => void;
  onChooseAI: () => void;
  onChooseUpload: () => void;
}

export default function StartStep({ onChooseTemplate, onChooseAI, onChooseUpload }: StartStepProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold mb-3">How would you like to start?</h2>
        <p className="text-muted-foreground text-lg">
          Choose the method that works best for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2" 
          onClick={onChooseTemplate}
          data-testid="card-choose-template"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Use a Template</CardTitle>
            <CardDescription className="text-base">
              Start with proven survey frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Pre-built questions for common training scenarios
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2 border-primary shadow-md" 
          onClick={onChooseAI}
          data-testid="card-choose-ai"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Generate with AI</CardTitle>
            <CardDescription className="text-base">
              Describe your survey needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              AI creates custom questions instantly
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2" 
          onClick={onChooseUpload}
          data-testid="card-choose-upload"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <FileUp className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Upload Document</CardTitle>
            <CardDescription className="text-base">
              Extract content from files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              PDF, DOCX, or TXT documents
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
