import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Upload, X, Maximize2, Minimize2 } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  fileData?: {
    name: string;
    type: string;
    base64: string;
  };
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string, fileData?: { name: string; type: string; base64: string }) => void;
  isLoading?: boolean;
  showHeader?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function ChatPanel({ messages, onSendMessage, isLoading = false, showHeader = true, isExpanded = false, onToggleExpand }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support images, PDFs, and documents
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!supportedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload an image, PDF, TXT, or DOCX file.');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedFile) && !isLoading) {
      onSendMessage(input, selectedFile || undefined);
      setInput("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-xl bg-card">
      {showHeader && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            {onToggleExpand && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleExpand}
                data-testid="button-toggle-expand-chat"
                className="h-8 w-8"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Refine your survey with natural language
          </p>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Start a conversation to refine your survey
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p>Try: "Add 3 open-ended questions"</p>
                <p>Try: "Make it more focused on feedback"</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.role}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        {selectedFile && (
          <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate">{selectedFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedFile(null)}
              data-testid="button-remove-file"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to refine the survey... or upload a file"
            disabled={isLoading}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-upload-file"
            title="Upload file (image, PDF, or document)"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button type="submit" size="icon" disabled={(!input.trim() && !selectedFile) || isLoading} data-testid="button-send-message">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.docx"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-file-upload"
        />
      </form>
    </div>
  );
}
