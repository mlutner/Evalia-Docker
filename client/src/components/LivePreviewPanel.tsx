import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, Loader2 } from "lucide-react";
import type { Survey } from "@shared/schema";

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES = {
  desktop: { width: 1024, height: 768, label: "Desktop" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  mobile: { width: 375, height: 812, label: "Mobile" },
};

interface LivePreviewPanelProps {
  survey: {
    title: string;
    description?: string;
    welcomeMessage?: string;
    questions: any[];
  };
}

export function LivePreviewPanel({ survey }: LivePreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");

  const currentSize = DEVICE_SIZES[device];
  const scale = Math.min(1, 500 / currentSize.width);

  return (
    <div className="flex flex-col h-full gap-3 bg-muted/30 p-4 rounded-lg border border-border/50">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Monitor className="w-4 h-4" style={{ color: '#2F8FA5' }} />
          Live Preview
        </h3>
      </div>

      {/* Device Toggle */}
      <div className="flex gap-2 bg-background rounded-md p-1 border border-border/50">
        <Button
          variant={device === "mobile" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDevice("mobile")}
          className="flex-1 text-xs h-8"
          data-testid="button-preview-mobile"
        >
          <Smartphone className="w-3 h-3 mr-1" />
          Mobile
        </Button>
        <Button
          variant={device === "tablet" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDevice("tablet")}
          className="flex-1 text-xs h-8"
          data-testid="button-preview-tablet"
        >
          <Tablet className="w-3 h-3 mr-1" />
          Tablet
        </Button>
        <Button
          variant={device === "desktop" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDevice("desktop")}
          className="flex-1 text-xs h-8"
          data-testid="button-preview-desktop"
        >
          <Monitor className="w-3 h-3 mr-1" />
          Desktop
        </Button>
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-md border-2 border-dashed border-border/50 overflow-auto p-3" data-testid="preview-container">
        <div
          style={{
            width: `${currentSize.width}px`,
            height: `${currentSize.height}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#f9fafb",
          }}
        >
          {/* Welcome Screen */}
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold mb-3 text-slate-900 line-clamp-2">{survey.title}</h1>
              {survey.description && (
                <p className="text-sm text-slate-600 mb-6 line-clamp-3">{survey.description}</p>
              )}
              {survey.welcomeMessage && (
                <p className="text-sm text-slate-700 italic mb-6 line-clamp-3">{survey.welcomeMessage}</p>
              )}
              <button className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                Start
              </button>
              <p className="text-xs text-slate-500 mt-4">
                {survey.questions.length} question{survey.questions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Real-time preview updates as you edit
      </p>
    </div>
  );
}
