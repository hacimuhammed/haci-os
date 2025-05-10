import { Button } from '@/components/ui/button';

import { useUserStore } from '@/store/userStore';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeSelector } from './ThemeSelector';

export const Topbar = () => {
  const [time, setTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const { currentUser, logout } = useUserStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    return time.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-background h-10 py-3 bg-opacity-90 backdrop-blur-sm flex items-center justify-between px-4 relative z-50">
      <div>{/* Logo veya başlangıç menüsü burada olabilir */}</div>

      <div className="flex items-center space-x-4">
        <span>{formatTime()}</span>
        <span>{formatDate()}</span>

        {currentUser && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm">{currentUser.username}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="absolute top-full right-4 mt-2 bg-card rounded-lg shadow-lg overflow-hidden z-50">
          <ThemeSelector />
        </div>
      )}
    </div>
  );
};
