import { Button } from '@/components/ui/button';

import { getIconPath } from '@/icons/iconPaths';
import { useFileManagerStore } from '@/store/fileManagerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUserStore } from '@/store/userStore';
import { useWindowManagerStore } from '@/store/windowManagerStore';
import {
  calculateCascadingPosition,
} from '@/utils/window';
import { v4 as uuidv4 } from 'uuid';

const DockButton = ({
  iconName,
  onClick,
  title,
  type,
}: {
  iconName: string;
  onClick: () => void;
  title: string;
  type: string;
}) => {
  const { tweaks } = useSettingsStore();
  const { addFile } = useFileManagerStore();
  const { currentUser } = useUserStore();
  const iconPath = getIconPath(tweaks.iconPack, iconName);

  const handleDragStart = (e: React.DragEvent) => {
    if (!currentUser) {
      return;
    }

    const desktopPath = `/home/${currentUser.username}/Desktop`;
    const desktopContent = `[Desktop Entry]
Type=Application
Name=${title}
Exec=${type}
Icon=${iconPath}
Terminal=false
Categories=Utility;`;

    e.dataTransfer.setData('text/plain', desktopContent);
  };

  return (
    <Button
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
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
      title: 'Terminal',
      type: 'terminal',
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
      title: 'Files',
      type: 'file-manager',
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
      title: 'Text Editor',
      type: 'text-editor',
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
      title: 'Settings',
      type: 'settings',
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
      title: 'Product Manager',
      type: 'product-manager',
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
        type="terminal"
      />
      <DockButton
        onClick={handleFileManagerClick}
        iconName="file-manager"
        title="Files"
        type="file-manager"
      />
      <DockButton
        onClick={handleTextEditorClick}
        iconName="text-editor"
        title="Text Editor"
        type="text-editor"
      />
      <DockButton
        onClick={handleSettingsClick}
        iconName="preferences-system"
        title="Settings"
        type="settings"
      />
      <DockButton
        onClick={handleProductManagerClick}
        iconName="product-manager"
        title="Product Manager"
        type="product-manager"
      />
    </div>
  );
};
