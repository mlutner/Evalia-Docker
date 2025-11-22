import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto" data-testid="notification-update">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          Update Available
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 mb-4">
          A new version of Evalia is available. Reload to get the latest features and improvements.
        </AlertDescription>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onReload}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-reload-app"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reload Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDismiss}
            data-testid="button-dismiss-update"
          >
            Dismiss
          </Button>
        </div>
      </Alert>
    </div>
  );
}
