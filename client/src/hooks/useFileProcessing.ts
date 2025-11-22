import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@shared/schema";
import type { Message } from "@/components/ChatPanel";

interface FileProcessingResult {
  title: string;
  questions: Question[];
  parsedText: string;
}

export function useFileProcessing() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedText, setParsedText] = useState("");

  const handleFileSelect = async (
    file: File,
    onSuccess: (result: FileProcessingResult) => void,
    onAutoAdvance: () => void
  ) => {
    console.log("File selected:", file.name);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to parse document";
        const errorTip = errorData.tip;

        toast({
          title: errorMessage,
          description: errorTip,
          variant: "destructive",
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setParsedText(data.parsedText);
      onSuccess(data);

      if (data.questions.length > 0) {
        setTimeout(onAutoAdvance, 100);
      }
    } catch (error: any) {
      console.error("Document parsing error:", error.message || error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFromPrompt = async (
    prompt: string,
    onSuccess: (result: FileProcessingResult, questionCount: number) => void,
    onAutoAdvance: () => void,
    fileData?: { name: string; type: string; base64: string }
  ) => {
    if (!prompt.trim() && !fileData) return;
    console.log("Generating survey from prompt:", prompt, fileData ? `with file: ${fileData.name}` : "");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/generate-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, fileData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate survey");
      }

      const data = await response.json();
      onSuccess(data, data.questions.length);

      if (data.questions.length > 0) {
        setTimeout(onAutoAdvance, 400);
      }
    } catch (error: any) {
      console.error("Survey generation error:", error);
      toast({
        title: "AI generation failed",
        description:
          error.message ||
          "Failed to generate survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteText = async (
    pastedText: string,
    onSuccess: (result: FileProcessingResult, questionCount: number) => void,
    onAutoAdvance: () => void
  ) => {
    if (!pastedText.trim()) return;
    console.log("Processing pasted text");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/generate-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: pastedText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process text");
      }

      const data = await response.json();
      onSuccess(data, data.questions.length);

      if (data.questions.length > 0) {
        setTimeout(onAutoAdvance, 400);
      }
    } catch (error: any) {
      console.error("Text processing error:", error);
      toast({
        title: "Processing failed",
        description:
          error.message ||
          "Failed to process text. Please try again with more content.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    parsedText,
    setParsedText,
    handleFileSelect,
    handleGenerateFromPrompt,
    handlePasteText,
  };
}
