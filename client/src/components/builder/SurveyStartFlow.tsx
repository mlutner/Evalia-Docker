import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers, FileUp, Upload, X, Wand2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import FileUploadZone from "@/components/FileUploadZone";
import { surveyTemplates } from "@shared/templates";
import type { SurveyTemplate } from "@shared/templates";
import type { Question } from "@shared/schema";

interface SurveyStartFlowProps {
  surveyType: "survey" | "assessment";
  onSurveyTypeChange: (type: "survey" | "assessment") => void;
  currentQuestions: Question[];
  currentSurveyTitle: string;
  onSurveyTitleChange: (title: string) => void;
  onUseTemplate: (template: SurveyTemplate) => void;
  onFileSelect: (file: File) => void;
  onGenerateFromPrompt: (prompt: string, includeScoringToggle: boolean, selectedFile?: { name: string; type: string; base64: string }) => void;
  onPasteText: (text: string) => void;
  isProcessing: boolean;
}

// Color palette
const COLORS = {
  primary: "#2F8FA5",
  border: "#E5E7EB",
  iconDefault: "#D1D5DB",
  iconText: "#6B7280",
} as const;

interface OptionCard {
  id: "templates" | "ai" | "upload";
  title: string;
  description: string;
  icon: typeof Layers;
  recommended?: boolean;
}

const OPTION_CARDS: OptionCard[] = [
  {
    id: "templates",
    title: "Use a ready-made template",
    description: "Start fast with proven training-focused templates.",
    icon: Layers,
    recommended: true,
  },
  {
    id: "ai",
    title: "Create with AI",
    description: "Describe what you want to measure. AI generates a complete survey draft.",
    icon: Sparkles,
  },
  {
    id: "upload",
    title: "Import your content",
    description: "Upload documents or paste questions. We convert them to a survey.",
    icon: FileUp,
  },
];

export default function SurveyStartFlow({
  surveyType,
  onSurveyTypeChange,
  currentQuestions,
  currentSurveyTitle,
  onSurveyTitleChange,
  onUseTemplate,
  onFileSelect,
  onGenerateFromPrompt,
  onPasteText,
  isProcessing,
}: SurveyStartFlowProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedFileForAI, setSelectedFileForAI] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);
  const [includeScoringToggle, setIncludeScoringToggle] = useState(false);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateClick = () => {
    onGenerateFromPrompt(prompt, includeScoringToggle, selectedFileForAI || undefined);
    setPrompt("");
    setSelectedFileForAI(null);
    if (aiFileInputRef.current) {
      aiFileInputRef.current.value = "";
    }
  };

  const handlePasteClick = () => {
    onPasteText(parsedText);
    setParsedText("");
  };

  const getCardStyles = (isExpanded: boolean) => ({
    borderColor: isExpanded ? COLORS.primary : COLORS.border,
    backgroundColor: isExpanded ? `${COLORS.primary}08` : "white",
  });

  const getIconStyles = (isExpanded: boolean) => ({
    backgroundColor: isExpanded ? COLORS.primary : COLORS.iconDefault,
    color: isExpanded ? "white" : COLORS.iconText,
  });

  const getChevronColor = (isExpanded: boolean) => isExpanded ? COLORS.primary : COLORS.iconDefault;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Survey Type Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <div className="bg-white rounded-lg border-2 border-border p-4 sm:p-6 md:p-8">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4" style={{ color: '#1C2635' }}>
              What are you creating?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Survey Option */}
              <motion.button
                onClick={() => onSurveyTypeChange("survey")}
                whileHover={{ y: -2 }}
                className={`p-4 sm:p-5 rounded-lg border-2 transition-all text-left ${
                  surveyType === "survey"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/50"
                }`}
              >
                <h3 className="font-semibold text-base sm:text-lg mb-2" style={{ color: '#1C2635' }}>
                  Survey
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Collect feedback & reactions. Focus on opinions, experiences, and satisfaction across any topic.
                </p>
              </motion.button>

              {/* Assessment Option */}
              <motion.button
                onClick={() => onSurveyTypeChange("assessment")}
                whileHover={{ y: -2 }}
                className={`p-4 sm:p-5 rounded-lg border-2 transition-all text-left ${
                  surveyType === "assessment"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/50"
                }`}
              >
                <h3 className="font-semibold text-base sm:text-lg mb-2" style={{ color: '#1C2635' }}>
                  Assessment
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Measure knowledge, skills & behavior change with scoring. Evaluate performance and provide feedback.
                </p>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3 md:mb-6 px-2"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight" style={{ color: '#1C2635' }}>
            How would you like to start?
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Pick the option that matches how much structure you already have.
          </p>
        </motion.div>

        {/* Survey Title Input - Only show if questions exist */}
        <AnimatePresence>
          {currentQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-12 p-6 rounded-lg bg-card border border-border"
            >
              <label className="text-sm font-semibold mb-3 block text-foreground">
                Survey Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={currentSurveyTitle}
                onChange={(e) => onSurveyTitleChange(e.target.value)}
                placeholder="Enter a title for your survey..."
                className="text-base"
                data-testid="input-survey-title-step1"
              />
              <p className="text-xs text-muted-foreground mt-2">This will be the name respondents see when they start the survey</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Option Cards */}
        <div className="space-y-3 mb-8">
          {OPTION_CARDS.map((option, index) => {
            const isExpanded = expandedOption === option.id;
            return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => setExpandedOption(isExpanded ? null : option.id)}
                className="w-full text-left"
                whileHover={{ y: -4 }}
                whileTap={{ y: 0 }}
              >
                <div
                  className={`p-4 sm:p-6 md:p-8 md:px-10 rounded-lg border-2 transition-all cursor-pointer group bg-white ${option.recommended ? "shadow-lg" : "hover:shadow-lg"}`}
                  style={getCardStyles(isExpanded)}
                >
                  <div className="flex items-start gap-4 sm:gap-6 md:gap-8">
                    {option.recommended && (
                      <div className="absolute -top-2 left-4 sm:left-6 md:left-8">
                        <span className="inline-block px-2 sm:px-2.5 py-0.5 bg-primary text-white text-xs font-semibold rounded-md">
                          Recommended
                        </span>
                      </div>
                    )}
                    <div
                      className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-120"
                      style={getIconStyles(isExpanded)}
                    >
                      <option.icon className="w-6 sm:w-8 h-6 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-2xl font-semibold mb-1" style={{ color: '#1C2635' }}>
                        {option.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed opacity-80">{option.description}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 ml-2 sm:ml-4"
                    >
                      <ChevronDown className="w-5 sm:w-6 h-5 sm:h-6" style={{ color: getChevronColor(isExpanded), opacity: 1 }} />
                    </motion.div>
                  </div>
                </div>
              </motion.button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-6 md:p-8 bg-muted/40 rounded-b-lg border-l-2 border-r-2 border-b-2" style={{ borderLeftColor: COLORS.primary, borderRightColor: COLORS.primary, borderBottomColor: COLORS.primary }}>
                      {option.id === "templates" && (
                        <div className="space-y-4 sm:space-y-6">
                          <p className="text-xs sm:text-sm text-muted-foreground">Select a template to get started instantly:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {surveyTemplates.map((template) => (
                              <TemplateCard
                                key={template.id}
                                template={template}
                                onPreview={() => setPreviewTemplate(template)}
                                onUse={() => onUseTemplate(template)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {option.id === "ai" && (
                        <div className="space-y-4 sm:space-y-6">
                          {isProcessing ? (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-4">
                              <div className="flex justify-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                              </div>
                              <div>
                                <p className="font-medium text-lg mb-1">AI is creating your survey...</p>
                                <p className="text-sm text-muted-foreground">This may take 10-20 seconds.</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <label className="text-sm font-medium">Describe your survey</label>
                                  <Button variant="ghost" size="sm" onClick={() => setShowPromptSuggestions(true)} className="text-xs h-7" data-testid="button-enhance-prompt">
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    Enhance
                                  </Button>
                                </div>
                                <Textarea
                                  value={prompt}
                                  onChange={(e) => setPrompt(e.target.value)}
                                  placeholder="Example: I need a survey to assess employee mental health..."
                                  className="min-h-[120px] text-base"
                                  data-testid="input-survey-prompt"
                                />
                              </div>

                              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="text-sm font-medium">Include Scoring Configuration</p>
                                    <p className="text-xs text-muted-foreground">AI will auto-generate assessment scoring</p>
                                  </div>
                                </div>
                                <Switch checked={includeScoringToggle} onCheckedChange={setIncludeScoringToggle} data-testid="toggle-include-scoring" />
                              </div>

                              {selectedFileForAI && (
                                <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground truncate">{selectedFileForAI.name}</span>
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFileForAI(null)} data-testid="button-remove-ai-file">
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button variant="outline" size="lg" onClick={() => aiFileInputRef.current?.click()} disabled={isProcessing} className="flex-1" data-testid="button-upload-ai-file">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Attach File
                                </Button>
                                <Button size="lg" onClick={handleGenerateClick} disabled={(!prompt.trim() && !selectedFileForAI) || isProcessing} className="flex-1" style={{ backgroundColor: COLORS.primary, color: '#FFFFFF' }} data-testid="button-generate">
                                  <Sparkles className="w-5 h-5 mr-2" />
                                  Generate
                                </Button>
                              </div>
                              <input
                                ref={aiFileInputRef}
                                type="file"
                                accept="image/*,.pdf,.txt,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64 = (event.target?.result as string).split(",")[1];
                                      setSelectedFileForAI({ name: file.name, type: file.type, base64 });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                data-testid="input-ai-file-upload"
                              />
                            </>
                          )}
                        </div>
                      )}

                      {option.id === "upload" && (
                        <div className="space-y-4 sm:space-y-6">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Choose a document</label>
                            <FileUploadZone onFileSelect={onFileSelect} isProcessing={isProcessing} />
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-muted/40 text-muted-foreground">Or</span>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="paste-text" className="text-sm font-medium mb-2 block">
                              Paste your text here
                            </label>
                            <Textarea
                              id="paste-text"
                              value={parsedText}
                              onChange={(e) => setParsedText(e.target.value)}
                              placeholder="Paste text content, training materials, course notes..."
                              className="min-h-32 resize-none"
                              disabled={isProcessing}
                              data-testid="textarea-paste-text"
                            />
                          </div>
                          <Button size="lg" onClick={handlePasteClick} disabled={!parsedText.trim() || isProcessing} className="w-full" style={{ backgroundColor: COLORS.primary, color: '#FFFFFF' }} data-testid="button-process-text">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Process Text & Generate Survey
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            );
          })}
        </div>

        {/* Preview Modal */}
        <TemplatePreviewModal 
          template={previewTemplate} 
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          onUse={() => {
            if (previewTemplate) {
              onUseTemplate(previewTemplate);
              setPreviewTemplate(null);
            }
          }}
        />
      </div>
    </div>
  );
}
