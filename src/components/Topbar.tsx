import { useEffect, useState } from "react";

import { ThemeSelector } from "./ThemeSelector";

export const Topbar = () => {
  const [time, setTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = () => {
    return time.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-background h-10 py-3 bg-opacity-90 backdrop-blur-sm flex items-center justify-between px-4 relative z-50">
      <div>{/* Logo veya başlangıç menüsü burada olabilir */}</div>

      <div className="flex items-center space-x-4">
        <span>{formatTime()}</span>
        <span>{formatDate()}</span>
      </div>

      {showSettings && (
        <div className="absolute top-full right-4 mt-2 bg-card rounded-lg shadow-lg overflow-hidden z-50">
          <ThemeSelector />
        </div>
      )}
    </div>
  );
};
