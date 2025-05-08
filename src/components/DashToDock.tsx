import { TextEditorHeaderTools } from "./TextEditor";
import { calculateCenterPosition } from "../utils/window";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";

export const DashToDock = () => {
  const { addWindow } = useWindowManagerStore();

  const handleTerminalClick = () => {
    const size = { width: 800, height: 600 };
    const position = calculateCenterPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Terminal",
      type: "terminal",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  const handleFileManagerClick = () => {
    const size = { width: 800, height: 600 };
    const position = calculateCenterPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Files",
      type: "file-manager",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  const handleTextEditorClick = () => {
    const size = { width: 900, height: 700 };
    const position = calculateCenterPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Metin Düzenleyici",
      type: "text-editor",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  const handleSettingsClick = () => {
    const size = { width: 800, height: 600 };
    const position = calculateCenterPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Ayarlar",
      type: "settings",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-opacity-80 backdrop-blur-md rounded-full px-6 py-3 flex items-center space-x-6">
      <button
        onClick={handleTerminalClick}
        className="w-16 h-16 flex items-center justify-center hover:bg-opacity-40 hover:bg-white rounded-full transition-colors"
      >
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 9L9 12L5 15M10 15H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      <button
        onClick={handleFileManagerClick}
        className="w-16 h-16 flex items-center justify-center hover:bg-opacity-40 hover:bg-white rounded-full transition-colors"
      >
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 5C3 3.89543 3.89543 3 5 3H9.5C10.1644 3 10.7867 3.35425 11.1 3.92891L12.1 5.5H19C20.1046 5.5 21 6.39543 21 7.5V18.5C21 19.6046 20.1046 20.5 19 20.5H5C3.89543 20.5 3 19.6046 3 18.5V5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      <button
        onClick={handleTextEditorClick}
        className="w-16 h-16 flex items-center justify-center hover:bg-opacity-40 hover:bg-white rounded-full transition-colors"
      >
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L9 16L10 13L18.5 4.5V2.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={handleSettingsClick}
        className="w-16 h-16 flex items-center justify-center hover:bg-opacity-40 hover:bg-white rounded-full transition-colors"
      >
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.4 15C19.1277 15.8771 19.2583 16.8249 19.74 17.6L19.82 17.71C20.2118 18.1027 20.4338 18.6339 20.4338 19.19C20.4338 19.7461 20.2118 20.2773 19.82 20.67C19.4273 21.0618 18.8961 21.2838 18.34 21.2838C17.7839 21.2838 17.2527 21.0618 16.86 20.67L16.75 20.59C15.9749 20.1083 15.0271 19.9777 14.15 20.25C13.2911 20.5041 12.6421 21.1458 12.38 21.99L12.34 22.14C12.2135 22.6787 11.8854 23.1487 11.43 23.4611C10.9747 23.7736 10.4294 23.9038 9.88 23.82C9.33879 23.7387 8.84255 23.4589 8.49393 23.0338C8.14531 22.6086 7.97415 22.0778 8.02 21.54L8.06 21.38C8.32212 20.5358 8.12124 19.6226 7.54 18.94C6.96 18.38 6.07 18.09 5.21 18.37L5.06 18.41C4.52125 18.4559 3.99041 18.2847 3.56503 17.9364C3.13965 17.5881 2.85508 17.0902 2.77 16.55C2.6862 16.0006 2.8164 15.4453 3.12886 14.99C3.44132 14.5346 3.91125 14.2065 4.45 14.08H4.6C5.44399 13.8179 6.08573 13.1689 6.34 12.31C6.61226 11.4329 6.48165 10.4851 6 9.71L5.92 9.6C5.52821 9.20731 5.30625 8.67608 5.30625 8.12C5.30625 7.56392 5.52821 7.03269 5.92 6.64C6.31269 6.24821 6.84392 6.02625 7.4 6.02625C7.95608 6.02625 8.48731 6.24821 8.88 6.64L8.99 6.72C9.76513 7.20165 10.7129 7.33226 11.59 7.06V7.06C12.4489 6.80587 13.0979 6.16413 13.36 5.32L13.4 5.17C13.5265 4.63131 13.8546 4.16138 14.31 3.84892C14.7653 3.53646 15.3106 3.40626 15.86 3.49C16.3986 3.57203 16.8921 3.85124 17.2405 4.2743C17.5888 4.69737 17.7624 5.22585 17.72 5.76V5.92C17.6732 6.45861 17.824 6.99409 18.1512 7.4267C18.4783 7.85931 18.9597 8.15356 19.49 8.25H19.64C20.1788 8.37646 20.6487 8.70462 20.9611 9.15996C21.2736 9.61529 21.4038 10.1606 21.32 10.71C21.2387 11.2512 20.9589 11.7474 20.5338 12.0961C20.1086 12.4447 19.5778 12.6158 19.04 12.57H18.88C18.3414 12.5232 17.8059 12.674 17.3733 13.0012C16.9407 13.3283 16.6465 13.8097 16.55 14.34V14.34"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
