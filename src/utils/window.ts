export const calculateCenterPosition = (width: number, height: number) => {
  if (typeof window === "undefined") {
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
