-- AlterTable
ALTER TABLE "account" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "emailVerified" DROP DEFAULT,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP NOT NULL;
