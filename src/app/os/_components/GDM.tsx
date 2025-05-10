import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileManagerStore } from '@/store/fileManagerStore';

import { useUserStore } from '@/store/userStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

enum GDMMode {
  LOGIN,
  CREATE_USER,
  DELETE_USER,
}

export const GDM = () => {
  const [mode, setMode] = useState<GDMMode>(GDMMode.LOGIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { users, addUser, removeUser, login } = useUserStore();
  const { initializeUserDirectory } = useFileManagerStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Saat güncellemesi için interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Geçersiz kullanıcı adı veya şifre');
    }
  };

  const handleCreateUser = () => {
    if (!username) {
      setError('Kullanıcı adı gereklidir');
      return;
    }

    if (!password) {
      setError('Şifre gereklidir');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    try {
      // Yeni kullanıcı oluştur
      const newUser = addUser(username, password);

      // Kullanıcının home dizinini ve klasörlerini oluştur
      initializeUserDirectory(newUser.username);

      // Formu temizle ve login moduna dön
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setMode(GDMMode.LOGIN);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUserId) {
      removeUser(selectedUserId);
      setShowDeleteConfirm(false);
      setSelectedUserId(null);
      setMode(GDMMode.LOGIN);
    }
  };

  // Seçilen kullanıcı bilgileri
  const selectedUser = selectedUserId
    ? users.find(user => user.id === selectedUserId)
    : null;

  const formatTime = () => {
    return currentTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-[1000] p-4">
      <div className="absolute top-8 text-center">
        <h1 className="text-4xl font-bold">{formatTime()}</h1>
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
          {mode === GDMMode.LOGIN && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">
                Kullanıcı Giriş
              </h2>

              <div className="grid grid-cols-3 gap-3 my-6">
                {users.map(user => (
                  <div
                    key={user.id}
                    className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUserId === user.id
                        ? 'bg-primary/20'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setUsername(user.username);
                      setError('');
                    }}
                  >
                    <Avatar className="h-16 w-16 mb-2">
                      <AvatarFallback>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                      {user.avatar && <AvatarImage src={user.avatar} />}
                    </Avatar>
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Kullanıcı adı"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <Input
                  placeholder="Şifre"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />

                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1" onClick={handleLogin}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Giriş Yap
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode(GDMMode.CREATE_USER);
                    setUsername('');
                    setPassword('');
                    setError('');
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Yeni Kullanıcı
                </Button>
                {selectedUserId && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {mode === GDMMode.CREATE_USER && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Yeni Kullanıcı</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMode(GDMMode.LOGIN)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Kullanıcı adı"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <Input
                  placeholder="Şifre"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Şifreyi onayla"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <Button className="w-full" onClick={handleCreateUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Kullanıcı Oluştur
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Silme onayı modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1001]">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Kullanıcıyı Sil</h3>
            <p>
              <strong>{selectedUser?.username}</strong>
              {' '}
              kullanıcısını silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-2 mt-6">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteUser}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
