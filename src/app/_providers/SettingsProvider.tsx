"use client";

import React, { useEffect } from "react";

import { useSettingsStore } from "@/store/settingsStore";

type SettingsProviderProps = {
  children: React.ReactNode;
  userId: string;
};

export function SettingsProvider({ children, userId }: SettingsProviderProps) {
  const { initializeSettings, hasInitialized } = useSettingsStore();

  useEffect(() => {
    if (!hasInitialized && userId) {
      initializeSettings(userId);
    }
  }, [userId, hasInitialized, initializeSettings]);

  return <>{children}</>;
}
