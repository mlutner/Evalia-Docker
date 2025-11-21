import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/components/ChatPanel";
import type { Question } from "@shared/schema";

interface ChatResult {
  questions?: Question[];
  message: string;
}

export function useAIChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  const handleSendMessage = async (
    message: string,
    survey: {
      title: string;
      description?: string;
      questions: Question[];
      welcomeMessage?: string;
      thankYouMessage?: string;
    },
    conversationHistory: Message[] = []
  ): Promise<ChatResult | null> => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          survey,
          history: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "AI chat error",
          description:
            errorData.error ||
            "Failed to process your message. Please try again.",
          variant: "destructive",
        });
        throw new Error(errorData.error || "Failed to process message");
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, aiResponse]);

      return data;
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorResponse]);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateText = async (
    fieldType: "description" | "welcomeMessage" | "thankYouMessage",
    surveyTitle: string,
    questions: Question[]
  ): Promise<string | null> => {
    if (!surveyTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please add a survey title first",
        variant: "destructive",
      });
      return null;
    }

    if (questions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add questions to your survey first",
        variant: "destructive",
      });
      return null;
    }

    setGeneratingField(fieldType);

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldType,
          surveyTitle,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate text");
      }

      const data = await response.json();
      const generatedText = data.text.trim();

      toast({
        title: "Generated!",
        description: "AI has created a suggestion for you",
      });

      return generatedText;
    } catch (error: any) {
      console.error("Text generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate text",
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingField(null);
    }
  };

  return {
    messages,
    setMessages,
    isProcessing,
    generatingField,
    handleSendMessage,
    handleGenerateText,
  };
}
