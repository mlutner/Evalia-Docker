import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2, Sparkles, ChevronRight, ChevronLeft,
  Lightbulb, MessageSquare, Zap, RefreshCw, Send,
  Upload, X, Bot, User
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useSurveyBuilder, QUESTION_TYPE_MAP, EVALIA_TO_DISPLAY_TYPE, VALID_QUESTION_TYPES, type ValidQuestionType } from '@/contexts/SurveyBuilderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  questionsAdded?: number;
}

// Map display label (e.g. "Multiple Choice") back to schema type (e.g. "multiple_choice")
function displayToSchema(display: string): ValidQuestionType {
  const mapped = QUESTION_TYPE_MAP[display];
  if (mapped && VALID_QUESTION_TYPES.includes(mapped as ValidQuestionType)) {
    return mapped as ValidQuestionType;
  }
  if (import.meta.env.DEV) {
    console.warn('[AISuggestions] Unknown display type, defaulting to text:', display);
  }
  return 'text';
}

export function AISuggestions() {
  const { toast } = useToast();
  const { rightPanelOpen, toggleRightPanel, survey, questions, updateSurveyMetadata, addQuestion, updateQuestion } = useSurveyBuilder();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ message, fileData }: { message: string; fileData?: { name: string; type: string; base64: string } }) => {
      // Convert builder questions to Evalia format for AI
      const evaliaQuestions = questions.map(q => ({
        id: q.id,
        type: q.evaliaType || 'text',
        question: q.text,
        options: q.options,
        required: q.required,
      }));

      const res = await apiRequest('POST', '/api/ai/chat', {
        message,
        fileData,
        surveyContext: {
          title: survey.title,
          description: survey.description,
          questions: evaliaQuestions,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      let responseContent = data.response || data.message || 'I processed your request.';
      let questionsAdded = 0;

      // If AI generated questions, add them
      if (data.questions && data.questions.length > 0) {
        data.questions.forEach((q: any) => {
          const displayType = EVALIA_TO_DISPLAY_TYPE[q.type] || 'Short Text';
          addQuestion(displayToSchema(displayType));
          questionsAdded++;
        });
        responseContent += `\n\n✅ Added ${data.questions.length} new question(s) to your survey.`;
      }

      // Add assistant message
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        questionsAdded,
      }]);
    },
    onError: (error: any) => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to process request'}`,
        timestamp: new Date(),
      }]);
    },
  });

  // Tone adjustment mutation
  const toneMutation = useMutation({
    mutationFn: async (tone: string) => {
      const evaliaQuestions = questions.map(q => ({
        id: q.id,
        type: q.evaliaType || 'text',
        question: q.text,
        options: q.options,
        required: q.required,
      }));

      const res = await apiRequest('POST', '/api/ai/adjust-tone', {
        questions: evaliaQuestions,
        tone,
      });
      return res.json();
    },
    onSuccess: (data, tone) => {
      // Update questions with adjusted text
      if (data.adjustedQuestions && Array.isArray(data.adjustedQuestions)) {
        data.adjustedQuestions.forEach((adjQ: any, idx: number) => {
          if (questions[idx]) {
            updateQuestion(questions[idx].id, { text: adjQ.question });
          }
        });
      }
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `✨ Adjusted all questions to a ${tone} tone. The wording has been updated while preserving the original meaning.`,
        timestamp: new Date(),
      }]);
    },
    onError: (error: any) => {
      toast({
        title: 'Tone adjustment failed',
        description: error.message || 'Failed to adjust tone',
        variant: 'destructive',
      });
    },
  });

  // Quality check mutation
  const qualityMutation = useMutation({
    mutationFn: async () => {
      const evaliaQuestions = questions.map(q => ({
        id: q.id,
        type: q.evaliaType || 'text',
        question: q.text,
        options: q.options,
        required: q.required,
      }));

      const res = await apiRequest('POST', '/api/ai/analyze-quality', {
        questions: evaliaQuestions,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const analysis = data.analysis || data.feedback || JSON.stringify(data, null, 2);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `📋 **Quality Analysis:**\n\n${analysis}`,
        timestamp: new Date(),
      }]);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedExtensions = ['.pdf', '.txt', '.docx', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      toast({
        title: 'Unsupported file',
        description: 'Please upload PDF, Word, PowerPoint, or image files.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || chatMutation.isPending) return;

    const userMessage = input.trim() || `Analyze this file: ${selectedFile?.name}`;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    // Send to AI
    chatMutation.mutate({ message: userMessage, fileData: selectedFile || undefined });
    
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleQuickAction = (action: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: action,
      timestamp: new Date(),
    }]);

    if (action.includes('quality') || action.includes('analyze')) {
      qualityMutation.mutate();
    } else if (action.includes('tone:')) {
      const tone = action.split(':')[1].trim();
      toneMutation.mutate(tone);
    } else {
      chatMutation.mutate({ message: action });
    }
  };

  const isLoading = chatMutation.isPending || toneMutation.isPending || qualityMutation.isPending;

  if (!rightPanelOpen) {
    return (
      <button
        onClick={toggleRightPanel}
        className="w-12 flex-shrink-0 bg-white border-l border-gray-200 h-[calc(100vh-140px)] 
                   flex items-center justify-center hover:bg-gray-50 transition-colors group"
        title="Open AI Chat"
      >
        <ChevronLeft size={20} className="text-gray-500 group-hover:text-purple-500 transition-colors" />
      </button>
    );
  }

  return (
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-l border-gray-200 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-500">Ask me anything about your survey</p>
            </div>
          </div>
          <button
            onClick={toggleRightPanel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Collapse"
          >
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAction('Add 3 follow-up questions based on my current survey')}
            disabled={isLoading || questions.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full
                     hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            ➕ Add questions
          </button>
          <button
            onClick={() => handleQuickAction('Analyze the quality and clarity of my questions')}
            disabled={isLoading || questions.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full
                     hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            🔍 Check quality
          </button>
          <button
            onClick={() => handleQuickAction('tone: professional')}
            disabled={isLoading || questions.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full
                     hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            👔 Professional tone
          </button>
          <button
            onClick={() => handleQuickAction('tone: casual')}
            disabled={isLoading || questions.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full
                     hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            😊 Casual tone
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
              <Bot size={32} className="text-purple-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Survey Assistant</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              I can help you create, improve, and refine your survey questions. Try asking me to:
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="p-2 bg-gray-50 rounded-lg">"Add 5 questions about customer satisfaction"</p>
              <p className="p-2 bg-gray-50 rounded-lg">"Make my questions more engaging"</p>
              <p className="p-2 bg-gray-50 rounded-lg">"Analyze the quality of my survey"</p>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              📎 You can also upload documents to generate questions from
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>
                {message.role === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        {selectedFile && (
          <div className="mb-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
            <span className="text-xs text-purple-700 truncate flex-1">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-purple-100 rounded transition-colors ml-2"
            >
              <X size={14} className="text-purple-500" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Upload document"
          >
            <Upload size={18} className="text-gray-500" />
          </button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask AI to help with your survey..."
            disabled={isLoading}
            className="flex-1 rounded-xl border-gray-200"
          />
          
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="px-4 rounded-xl bg-purple-500 hover:bg-purple-600"
          >
            <Send size={18} />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.pptx,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Stats Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {questions.length} question{questions.length !== 1 ? 's' : ''} in survey
          </span>
          <span className="text-xs text-gray-400">
            ~{Math.ceil(questions.length * 0.5)} min to complete
          </span>
        </div>
      </div>
    </aside>
  );
}
