import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { multiSession } from "better-auth/plugins";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [multiSession()],
});
