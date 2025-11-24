import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const pulseVariants = {
    animate: {
      boxShadow: [
        "0 0 0 0 rgba(47, 143, 165, 0.4)",
        "0 0 0 12px rgba(47, 143, 165, 0)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 md:hidden z-40"
      variants={floatingVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={pulseVariants} animate="animate">
        <Button
          onClick={onClick}
          size="lg"
          className="rounded-full w-16 h-16 flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          data-testid="button-floating-ai-chat"
        >
          <motion.div
            animate={{
              scale: isOpen ? 1.1 : 1,
              rotate: isOpen ? 15 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  );
}
