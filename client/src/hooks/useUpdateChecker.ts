import { useEffect, useState } from "react";

const UPDATE_DISMISS_KEY = "evalia_update_dismissed_at";
const DISMISS_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export function useUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Check if update was recently dismissed (within 12 hours)
        const dismissedAt = localStorage.getItem(UPDATE_DISMISS_KEY);
        if (dismissedAt) {
          const dismissedTime = parseInt(dismissedAt, 10);
          const now = Date.now();
          if (now - dismissedTime < DISMISS_DURATION_MS) {
            setUpdateAvailable(false);
            return;
          }
        }

        // Get the version from server
        const response = await fetch("/api/version");
        const data = await response.json();
        const serverVersion = data.version;

        // Get the stored version from localStorage
        const storedVersion = localStorage.getItem("appVersion");

        // If no stored version, store the current one
        if (!storedVersion) {
          localStorage.setItem("appVersion", serverVersion);
          setCurrentVersion(serverVersion);
          return;
        }

        setCurrentVersion(storedVersion);

        // If versions differ, an update is available
        if (storedVersion !== serverVersion) {
          setUpdateAvailable(true);
          setNewVersion(serverVersion);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    // Check immediately on mount
    checkForUpdates();

    // Check every 60 seconds (can be adjusted)
    const interval = setInterval(checkForUpdates, 60000);

    return () => clearInterval(interval);
  }, []);

  const dismissUpdate = () => {
    // Store the current timestamp when dismissing
    localStorage.setItem(UPDATE_DISMISS_KEY, Date.now().toString());
    setUpdateAvailable(false);
  };

  const reloadApp = () => {
    localStorage.setItem("appVersion", newVersion || "");
    window.location.reload();
  };

  return {
    updateAvailable,
    currentVersion,
    newVersion,
    dismissUpdate,
    reloadApp,
  };
}
