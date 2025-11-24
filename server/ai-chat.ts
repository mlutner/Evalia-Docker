import type { Router, Request, Response } from "express";
import { Anthropic } from "@anthropic-ai/sdk";

export function setupAiChatRoute(app: Router) {
  app.post("/api/ai-chat", async (req: Request, res: Response) => {
    try {
      const { message, history = [], context } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const client = new Anthropic();

      const conversationHistory = history.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: context || "You are a helpful assistant.",
        messages: [
          ...conversationHistory,
          { role: "user", content: message },
        ],
      });

      const assistantMessage = response.content[0];
      if (assistantMessage.type !== "text") {
        return res.status(500).json({ error: "Unexpected response type" });
      }

      return res.json({ message: assistantMessage.text });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      return res
        .status(500)
        .json({ message: error.message || "Failed to process chat request" });
    }
  });
}
