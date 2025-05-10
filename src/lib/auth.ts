import { createAuthMiddleware, multiSession } from "better-auth/plugins";

import { betterAuth } from "better-auth";
import { db } from "./db";
import prisma from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    multiSession({
      maximumSessions: 5,
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (newSession) {
        const userId = newSession.user.id;
      }

      // Yeni bir kullanıcı kaydı yapıldığında varsayılan ayarları oluştur
      if (ctx.path.startsWith("/sign-up") && ctx.context.newSession) {
        const userId = ctx.context.newSession.user.id;

        // Kullanıcı için ayarlar zaten var mı kontrol et
        const existingSettings = await prisma.userSettings.findUnique({
          where: {
            userId,
          },
        });

        // Ayarlar yoksa oluştur
        if (!existingSettings) {
          await prisma.userSettings.create({
            data: {
              userId,
              wallpaperPath: "/wallpapers/Plucky_Puffin.webp",
              language: "en",
              timeFormat: "24h",
              iconPack: "whitesur-light",
              windowAnimation: "fade",
            },
          });
        }
      }
    }),
  },
});
