import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, Wand2, FileText, Upload, Send, Zap, 
  Users, Heart, Target, TrendingUp, MessageSquare, Award,
  Loader2, X, FileUp, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFileProcessing } from '@/hooks/useFileProcessing';
import { useToast } from '@/hooks/use-toast';

// ============================================
// CONSTANTS
// ============================================
const SURVEY_TYPES = [
  {
    id: 'employee-engagement',
    title: 'Employee Engagement',
    description: 'Team collaboration, career growth, work-life balance',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
    prompt: 'Create an employee engagement survey focusing on team collaboration, career growth opportunities, work-life balance, and overall job satisfaction. Include questions about management effectiveness and workplace culture.',
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction',
    description: 'NPS, feature feedback, support quality',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    prompt: 'Create a customer satisfaction survey with NPS scoring, questions about product/service quality, customer support experience, and likelihood to recommend. Include open-ended feedback sections.',
  },
  {
    id: 'market-research',
    title: 'Market Research',
    description: 'Demographics, preferences, purchase behavior',
    icon: Target,
    color: 'bg-blue-100 text-blue-600',
    prompt: 'Create a market research survey covering demographics, consumer preferences, brand awareness, and purchase behavior. Include questions about competitors and pricing sensitivity.',
  },
  {
    id: 'product-feedback',
    title: 'Product Feedback',
    description: 'Usability, features, improvement suggestions',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-600',
    prompt: 'Create a product feedback survey about usability, feature satisfaction, and improvement suggestions. Include questions about user experience, feature requests, and overall product value.',
  },
  {
    id: 'event-feedback',
    title: 'Event Feedback',
    description: 'Experience, venue, speakers, logistics',
    icon: MessageSquare,
    color: 'bg-orange-100 text-orange-600',
    prompt: 'Create an event feedback survey covering overall experience, venue quality, speaker effectiveness, and logistics. Include questions about networking opportunities and suggestions for future events.',
  },
  {
    id: 'training-assessment',
    title: 'Training Assessment',
    description: 'Learning outcomes, instructor, materials',
    icon: Award,
    color: 'bg-teal-100 text-teal-600',
    prompt: 'Create a training assessment survey measuring learning outcomes, instructor effectiveness, and material quality. Include knowledge check questions and skill improvement ratings.',
  },
];

const AI_FEATURES = [
  { label: 'Smart Logic', color: 'bg-purple-500' },
  { label: 'Auto Scoring', color: 'bg-blue-500' },
  { label: 'Branching Paths', color: 'bg-pink-500' },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function AiSurveyGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<{ name: string; type: string; base64: string } | null>(null);
  
  // Use the existing file processing hook
  const { isProcessing, handleGenerateFromPrompt } = useFileProcessing();

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload a PDF, Word document, PowerPoint, or image file.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Convert to base64 with validation
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // Validate the data URL format
      if (!result || typeof result !== 'string' || !result.includes(',')) {
        toast({
          title: 'File read error',
          description: 'Unable to read the file. Please try again with a different file.',
          variant: 'destructive',
        });
        setSelectedFile(null);
        return;
      }

      const base64 = result.split(',')[1];
      
      // Validate base64 content exists
      if (!base64 || base64.length === 0) {
        toast({
          title: 'File conversion error',
          description: 'Unable to convert the file. Please try a different file.',
          variant: 'destructive',
        });
        setSelectedFile(null);
        return;
      }

      setFileBase64({
        name: file.name,
        type: file.type,
        base64,
      });
    };
    reader.onerror = () => {
      toast({
        title: 'File read error',
        description: 'Failed to read the file. Please try again.',
        variant: 'destructive',
      });
      setSelectedFile(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle survey type selection
  const handleSurveyTypeClick = (surveyType: typeof SURVEY_TYPES[0]) => {
    setPrompt(surveyType.prompt);
  };

  // Handle generate
  const handleGenerate = () => {
    if (!prompt.trim() && !fileBase64) {
      toast({
        title: 'Please provide input',
        description: 'Enter a description or upload a document to generate your survey.',
        variant: 'destructive',
      });
      return;
    }

    handleGenerateFromPrompt(
      prompt,
      (result, questionCount) => {
        // Store the generated survey in session storage for the builder to pick up
        const surveyData = {
          title: result.title || 'AI Generated Survey',
          description: prompt.substring(0, 200),
          questions: result.questions,
          scoreConfig: result.scoreConfig,
          fromAI: true,
        };
        sessionStorage.setItem('aiGeneratedSurvey', JSON.stringify(surveyData));
        
        toast({
          title: 'Survey generated!',
          description: `Created ${questionCount} questions. Opening builder...`,
        });
      },
      () => {
        // Navigate to builder after generation
        setLocation('/builder-v2/new');
      },
      fileBase64 || undefined
    );
  };

  // Clear file
  const clearFile = () => {
    setSelectedFile(null);
    setFileBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F7F9FC' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm mb-6">
            <Wand2 size={18} className="text-purple-500" />
            <span className="text-sm font-medium text-gray-700">AI Survey Generator</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Describe Your Survey
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tell me what you want to measure and I'll generate questions with smart logic, 
            scoring, and branching
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to measure employee satisfaction with our remote work policy. Focus on work-life balance, communication tools, and productivity. Include NPS scoring and branch based on satisfaction levels..."
            className="min-h-[160px] text-base border-0 resize-none focus-visible:ring-0 p-0 placeholder:text-gray-400"
          />
          
          {/* File Upload Preview */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-purple-500" />
                <span className="text-sm text-purple-700 font-medium">{selectedFile.name}</span>
                <CheckCircle2 size={14} className="text-green-500" />
              </div>
              <button
                onClick={clearFile}
                className="p-1 hover:bg-purple-100 rounded transition-colors"
              >
                <X size={16} className="text-purple-500" />
              </button>
            </div>
          )}
          
          <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="gap-2"
            >
              <Upload size={16} />
              Import Document
            </Button>
            
            <Button
              onClick={handleGenerate}
              disabled={isProcessing || (!prompt.trim() && !fileBase64)}
              className="gap-2 px-6"
              style={{ backgroundColor: '#6366F1', color: '#FFFFFF' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Generate Survey
                </>
              )}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.pptx,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* AI Features Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI-Powered Features</h3>
              <p className="text-sm text-gray-500 mt-1">
                Our AI automatically adds smart logic, scoring, and branching based on your goals. 
                Questions adapt to responses, scores calculate outcomes, and paths personalize the experience.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {AI_FEATURES.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${feature.color}`} />
                <span className="text-sm text-gray-600">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Survey Types */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Survey Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SURVEY_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSurveyTypeClick(type)}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${type.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Wand2 size={18} className="text-purple-500" />
            Tips for Better Results
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Be specific about your goals and what insights you want to gather</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Mention if you need scoring, NPS, or specific question types</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Upload existing documents (PDFs, Word docs) to extract and improve questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>Specify your target audience for more relevant question wording</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

