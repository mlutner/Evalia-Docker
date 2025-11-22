import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UpdateNotificationProps {
  visible: boolean;
  onDismiss: () => void;
  onReload: () => void;
}

export default function UpdateNotification({
  visible,
  onDismiss,
  onReload,
}: UpdateNotificationProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm" data-testid="notification-update">
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800 shadow-lg">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Refresh Available
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-0.5">
                We've updated Evalia. Refresh to see what's new.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              data-testid="button-close-update"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={onReload}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2"
              data-testid="button-reload-app"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reload
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs h-7 px-2 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/50"
              data-testid="button-dismiss-update"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
