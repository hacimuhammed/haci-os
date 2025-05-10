"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, UserPlus, X } from "lucide-react";
import { authClient, signIn, signUp, useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFileManagerStore } from "@/store/fileManagerStore";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

enum GDMMode {
  LOGIN,
  CREATE_USER,
  SESSION_SELECT,
}

export const GDM = () => {
  const [mode, setMode] = useState<GDMMode>(GDMMode.SESSION_SELECT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { sessions, setActiveSession, currentUser } = useUserStore();
  const { initializeUserDirectory } = useFileManagerStore();
  const router = useRouter();
  const { data: session } = useSession();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (session) {
      router.push("/os");
    }
  }, [session, router]);

  // Saat güncellemesi için interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSessionSelect = async (sessionId: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        setError("Session not found");
        return;
      }

      setActiveSession(sessionId);
      router.push("/os");
    } catch (err: any) {
      setError(err.message || "Session change failed");
    }
  };

  const handleLogout = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Oturum seçimini engelle
    try {
      await authClient.multiSession.listDeviceSessions();
      await authClient.signOut();
      // Store'dan oturumu kaldır
      useUserStore.setState((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
      }));
    } catch (err: any) {
      setError(err.message || "Session logout failed");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const sessionData = await authClient.signIn.email({
        email,
        password,
        callbackURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL + "/os",
      });
      if (sessionData.data?.token) {
        await authClient.multiSession.setActive({
          sessionToken: sessionData.data?.token,
        });
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleCreateUser = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await authClient.signUp.email({
        email,
        password,
        name: email,
        callbackURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL + "/os",
      });

      // Başarılı kayıt durumunda formu temizle ve giriş ekranına geç
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMode(GDMMode.LOGIN);
      setError("");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      // Hata durumunda giriş ekranına yönlendirme yapma
    }
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-[1000] p-4">
      <div className="absolute top-8 text-center">
        <h1 className="text-4xl xl:text-6xl font-bold">{formatTime()}</h1>
        <p className="text-lg mt-2">{formatDate()}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          {mode === GDMMode.SESSION_SELECT && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">
                Select a session
              </h2>

              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="relative group">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-14"
                        onClick={() => handleSessionSelect(session.id)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={session.avatar} />
                          <AvatarFallback>
                            {session.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {session.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Last active: {session.lastActive.toLocaleString()}
                          </span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleLogout(session.id, e)}
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No active sessions found
                </p>
              )}

              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => setMode(GDMMode.LOGIN)}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  New Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode(GDMMode.CREATE_USER);
                    setEmail("");
                    setPassword("");
                    setError("");
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  New User
                </Button>
              </div>
            </div>
          )}

          {mode === GDMMode.LOGIN && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Login</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode(GDMMode.SESSION_SELECT)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="E-posta"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Şifre"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />

                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <Button className="w-full" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          )}

          {mode === GDMMode.CREATE_USER && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">New User</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode(GDMMode.SESSION_SELECT)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="E-posta"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Şifre"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Şifreyi onayla"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <Button className="w-full" onClick={handleCreateUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
