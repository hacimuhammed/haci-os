export const calculateCenterPosition = (width: number, height: number) => {
  if (typeof window === 'undefined') {
    return { x: 100, y: 100 }; // Varsayılan değer
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const x = Math.max(0, Math.floor((windowWidth - width) / 2));
  const y = Math.max(0, Math.floor((windowHeight - height) / 2));

  // Ekranın dışına taşma kontrolü
  return {
    x: Math.min(x, windowWidth - width),
    y: Math.min(y, windowHeight - height),
  };
};

// Her yeni pencere açıldığında önceki pencere pozisyonundan 30px sağa ve aşağı ilerleme
let lastWindowPosition = { x: 50, y: 50 }; // Başlangıç pozisyonu

export const calculateCascadingPosition = (width: number, height: number) => {
  if (typeof window === 'undefined') {
    return { x: 100, y: 100 }; // Varsayılan değer
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Yeni pozisyonu hesapla (son pozisyondan 30px sağa ve aşağıya)
  let newX = lastWindowPosition.x + 30;
  let newY = lastWindowPosition.y + 30;

  // Sağ kenara taşma kontrolü
  if (newX + width > windowWidth) {
    // Sağa taşıyorsa, sol tarafa kaydır
    newX = 50; // Başlangıç x değerine dön
  }

  // Alt kenara taşma kontrolü
  if (newY + height > windowHeight) {
    // Aşağıya taşıyorsa, yukarı kaydır
    newY = 50; // Başlangıç y değerine dön
  }

  // Son pozisyonu güncelle
  lastWindowPosition = { x: newX, y: newY };

  return {
    x: newX,
    y: newY,
  };
};
