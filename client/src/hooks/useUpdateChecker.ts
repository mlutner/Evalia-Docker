import { useEffect, useState } from "react";

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
