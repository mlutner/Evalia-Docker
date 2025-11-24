import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingAIChatProps {
  onClick: () => void;
  isOpen?: boolean;
}

export default function FloatingAIChat({ onClick, isOpen = false }: FloatingAIChatProps) {
  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="fixed bottom-6 right-6 md:hidden z-40"
            variants={floatingVariants}
            initial="initial"
            animate="animate"
          >
            <Button
              onClick={onClick}
              size="lg"
              className="rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: "#A3D65C",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#92c84b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#A3D65C";
              }}
              data-testid="button-floating-ai-chat"
            >
              <motion.div
                animate={{
                  scale: isOpen ? 1.1 : 1,
                  rotate: isOpen ? 15 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <Bot className="w-6 h-6" style={{ color: "#1C2635" }} />
              </motion.div>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-foreground text-background">
          <p className="font-semibold">AI Chat Assistant</p>
          <p className="text-xs">Get help refining your questions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
