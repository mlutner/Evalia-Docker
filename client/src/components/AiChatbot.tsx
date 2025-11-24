import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Loader, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "How do I create a survey?",
  "How do I share my survey?",
  "How do I analyze responses?"
];

const APP_CONTEXT = `You are a helpful AI assistant for Evalia, a survey and training feedback platform. 

Evalia's main features include:
1. Survey Creation: Users can create surveys from scratch, use templates, or generate surveys with AI
2. Dashboard: Shows key metrics like total surveys, average scores, response rates, and trends
3. Surveys: Manage all created surveys, view their status (Draft/Live/Paused/Closed), and see response counts
4. Respondent Groups: Manage lists of respondents and organize them into segments
5. Analytics: Analyze survey responses with charts, breakdowns, and AI-generated insights
6. Scoring Models: Set up custom scoring rules for different question types
7. Templates: Pre-built survey templates for common training scenarios
8. AI Assist: Generate surveys, analyze responses, and extract insights with AI

Key capabilities:
- Create surveys in minutes using AI generation or templates
- Share surveys via link or QR code
- Collect responses and analyze them in real-time
- Export data to CSV or JSON
- AI-powered insights about survey responses
- Respondent management and segmentation
- Custom scoring for training evaluations

When users ask questions, help them understand:
- How to create and manage surveys
- How to share and collect responses
- How to analyze and interpret results
- How to use scoring models
- How to leverage AI features
- Navigation and general app usage

Be concise, helpful, and guide users toward their goals.`;

export function AiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || input;
    if (!messageToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: APP_CONTEXT,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: error.message || "Failed to process your message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col" style={{ border: "1px solid #E2E7EF" }}>
        <CardHeader className="pb-4 border-b" style={{ borderColor: "#E2E7EF" }}>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: "#2F8FA5" }} />
            Evalia AI Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about creating surveys, analyzing responses, or using any feature
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-8 flex flex-col" style={{ backgroundColor: "#F7F9FC" }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#37C0A3" }}>
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold" style={{ color: "#1C2635" }}>Start a conversation!</h3>
                  <p className="text-sm text-gray-600">
                    Ask me anything about Evalia. I can help with surveys, responses, and features.
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-medium text-gray-700">Example questions:</p>
                  <div className="space-y-2">
                    {EXAMPLE_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(question)}
                        disabled={isLoading}
                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm text-gray-700 disabled:opacity-50"
                        data-testid={`button-example-question-${idx}`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
            <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-border"
                  }`}
                >
                  <div className="text-sm leading-relaxed break-words space-y-3">
                    {msg.content.split('\n\n').map((paragraph, idx) => {
                      const cleanParagraph = paragraph
                        .replace(/^#+\s*/gm, '')
                        .replace(/\*\*(.+?)\*\*/g, '$1')
                        .replace(/\*(.+?)\*/g, '$1')
                        .replace(/__(.+?)__/g, '$1')
                        .replace(/_(.+?)_/g, '$1')
                        .replace(/`(.+?)`/g, '$1')
                        .trim();

                      return (
                        <div key={idx} className="space-y-2">
                          {cleanParagraph.split('\n').map((line, lineIdx) => {
                            const trimmed = line.trim();
                            if (trimmed.startsWith('- ')) {
                              return (
                                <div key={lineIdx} className="flex gap-2 ml-2">
                                  <span className="text-primary font-bold">•</span>
                                  <span>{trimmed.substring(2)}</span>
                                </div>
                              );
                            }
                            if (trimmed.startsWith('* ')) {
                              return (
                                <div key={lineIdx} className="flex gap-2 ml-2">
                                  <span className="text-primary font-bold">•</span>
                                  <span>{trimmed.substring(2)}</span>
                                </div>
                              );
                            }
                            if (/^\d+\./.test(trimmed)) {
                              return (
                                <div key={lineIdx} className="ml-2">
                                  <span className="text-primary font-semibold">{trimmed.split(' ')[0]}</span>
                                  <span> {trimmed.substring(trimmed.indexOf(' ')).trim()}</span>
                                </div>
                              );
                            }
                            return trimmed ? (
                              <p key={lineIdx}>{trimmed}</p>
                            ) : null;
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-start">
                <div className="bg-white border border-border px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" style={{ color: "#2F8FA5" }} />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <div className="border-t p-4 bg-white" style={{ borderColor: "#E2E7EF" }}>
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about Evalia..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 rounded-lg border-gray-300"
              data-testid="input-chat-message"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              style={{ backgroundColor: "#37C0A3" }}
              className="text-white hover:opacity-90"
              size="icon"
              data-testid="button-send-chat"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
