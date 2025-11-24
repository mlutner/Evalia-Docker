import { AiChatbot } from "@/components/AiChatbot";
import { theme } from "@/theme";

export default function AiAssistPage() {
  return (
    <main style={{ backgroundColor: theme.backgrounds.page }} className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-6 md:py-8 h-full">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">AI Assistant</h1>
            <p className="text-muted-foreground">Ask questions about creating surveys, analyzing responses, and using Evalia</p>
          </div>
        </div>

        <div className="h-[calc(100vh-280px)]">
          <AiChatbot />
        </div>
      </div>
    </main>
  );
}
