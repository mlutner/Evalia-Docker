import { useEffect, useState } from "react";

const UPDATE_POPUP_COOLDOWN = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export function useUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
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

        // If versions differ, check if we should show the popup
        if (storedVersion !== serverVersion) {
          setNewVersion(serverVersion);
          
          // Check when we last showed/dismissed the update popup
          const lastPopupTime = localStorage.getItem("lastUpdatePopupTime");
          const now = Date.now();
          
          if (!lastPopupTime || now - parseInt(lastPopupTime) > UPDATE_POPUP_COOLDOWN) {
            // Show the popup only if cooldown has passed
            setUpdateAvailable(true);
            localStorage.setItem("lastUpdatePopupTime", now.toString());
          }
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    // Check on mount
    checkForUpdates();

    // Check every 30 minutes instead of every 60 seconds
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const dismissUpdate = () => {
    setUpdateAvailable(false);
    // Record the time we dismissed so we don't show it again for 12 hours
    localStorage.setItem("lastUpdatePopupTime", Date.now().toString());
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
