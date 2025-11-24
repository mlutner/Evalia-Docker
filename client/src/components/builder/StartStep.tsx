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
        <h2 className="text-3xl font-semibold mb-3" style={{ color: '#1C2635' }}>How would you like to start?</h2>
        <p className="text-lg" style={{ color: '#6A7789' }}>
          Choose the method that works best for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2" 
          style={{ borderColor: '#E2E7EF' }}
          onClick={onChooseTemplate}
          data-testid="card-choose-template"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#37C0A3' }}>
              <Layers className="w-10 h-10" style={{ color: 'white' }} />
            </div>
            <CardTitle className="text-xl" style={{ color: '#1C2635' }}>Use a Template</CardTitle>
            <CardDescription className="text-base" style={{ color: '#6A7789' }}>
              Start with proven survey frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center" style={{ color: '#6A7789' }}>
              Pre-built questions for common training scenarios
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2 shadow-md" 
          style={{ borderColor: '#2F8FA5' }}
          onClick={onChooseAI}
          data-testid="card-choose-ai"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#2F8FA5' }}>
              <Sparkles className="w-10 h-10" style={{ color: 'white' }} />
            </div>
            <CardTitle className="text-xl" style={{ color: '#1C2635' }}>Generate with AI</CardTitle>
            <CardDescription className="text-base" style={{ color: '#6A7789' }}>
              Describe your survey needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center" style={{ color: '#6A7789' }}>
              AI creates custom questions instantly
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2" 
          style={{ borderColor: '#E2E7EF' }}
          onClick={onChooseUpload}
          data-testid="card-choose-upload"
        >
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#A3D65C' }}>
              <FileUp className="w-10 h-10" style={{ color: 'white' }} />
            </div>
            <CardTitle className="text-xl" style={{ color: '#1C2635' }}>Upload Document</CardTitle>
            <CardDescription className="text-base" style={{ color: '#6A7789' }}>
              Extract content from files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center" style={{ color: '#6A7789' }}>
              PDF, DOCX, or TXT documents
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
