import {
  calculateCascadingPosition,
  calculateCenterPosition,
} from "../utils/window";

import { Button } from "./ui/button";
import { getIconPath } from "../icons/iconPaths";
import { useSettingsStore } from "../store/settingsStore";
import { useWindowManagerStore } from "../store/windowManagerStore";
import { v4 as uuidv4 } from "uuid";

const DockButton = ({
  iconName,
  onClick,
  title,
}: {
  iconName: string;
  onClick: () => void;
  title: string;
}) => {
  const { tweaks } = useSettingsStore();
  const iconPath = getIconPath(tweaks.iconPack, iconName);

  return (
    <Button
      onClick={onClick}
      className="w-16 h-16 flex items-center justify-center rounded-full !bg-transparent !p-0 !border-none scale-[1] hover:scale-[1.2] !transition-transform duration-200 ease-in-out"
    >
      <img src={iconPath} alt={title} className="w-14 h-14 min-w-14 min-h-14" />
    </Button>
  );
};

export const DashToDock = () => {
  const { addWindow } = useWindowManagerStore();

  const handleTerminalClick = () => {
    const size = { width: 800, height: 600 };
    const position = calculateCascadingPosition(size.width, size.height);

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
    const position = calculateCascadingPosition(size.width, size.height);

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
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Text Editor",
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
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Settings",
      type: "settings",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  const handleProductManagerClick = () => {
    const size = { width: 1000, height: 700 };
    const position = calculateCascadingPosition(size.width, size.height);

    addWindow({
      id: uuidv4(),
      title: "Product Manager",
      type: "product-manager",
      position,
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  return (
    <div className="bg-accent/30 fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-opacity-80 backdrop-blur-md rounded-full px-6 py-3 flex items-center space-x-6">
      <DockButton
        onClick={handleTerminalClick}
        iconName="terminal"
        title="Terminal"
      />
      <DockButton
        onClick={handleFileManagerClick}
        iconName="file-manager"
        title="Files"
      />
      <DockButton
        onClick={handleTextEditorClick}
        iconName="text-editor"
        title="Text Editor"
      />
      <DockButton
        onClick={handleSettingsClick}
        iconName="preferences-system"
        title="Settings"
      />
      <DockButton
        onClick={handleProductManagerClick}
        iconName="product-manager"
        title="Product Manager"
      />
    </div>
  );
};
