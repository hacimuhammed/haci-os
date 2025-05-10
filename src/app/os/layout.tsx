import { GDM } from "./_components/GDM";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const OSLayout = async ({ children }: { children: React.ReactNode }) => {
  try {
    const session = await auth.api.listDeviceSessions({
      headers: await headers(),
    });
    console.log("session", session);
    if (!session || session.length === 0) {
      return <GDM />;
    }
    return <div>{children}</div>;
  } catch (error) {
    console.error("Prisma error:", error);
    return <div>Veritabanı bağlantısında bir sorun oluştu.</div>;
  }
};

export default OSLayout;
