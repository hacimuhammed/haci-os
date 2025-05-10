// import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

// Global nesne olarak prisma'yı tanımlayalım
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // prisma = new PrismaClient({ adapter });
  prisma = new PrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    // globalForPrisma.prisma = new PrismaClient({ adapter });
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
