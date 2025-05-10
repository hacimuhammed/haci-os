import { GDM } from "./_components/GDM";
import React from "react";
import { SettingsProvider } from "../_providers/SettingsProvider";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const OSLayout = async ({ children }: { children: React.ReactNode }) => {
  try {
    const sessions = await auth.api.listDeviceSessions({
      headers: await headers(),
    });

    if (!sessions || sessions.length === 0) {
      return <GDM />;
    }

    const currentSession = sessions[0];

    return (
      <SettingsProvider userId={currentSession.user.id}>
        {children}
      </SettingsProvider>
    );
  } catch (error) {
    console.error("Prisma error:", error);
    return <div>Veritabanı bağlantısında bir sorun oluştu.</div>;
  }
};

export default OSLayout;
