import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import logoUrl from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

interface HeaderProps {
  showActions?: boolean;
}

export default function Header({ showActions = true }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 hover-elevate rounded-lg p-1 -ml-1"
          data-testid="link-home"
        >
          <img src={logoUrl} alt="Evalia" className="h-8" />
        </button>
        
        {showActions && (
          <div className="flex items-center gap-3">
            <Button onClick={() => setLocation("/builder")} data-testid="button-create-survey">
              Create Survey
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
