-- AlterTable
ALTER TABLE "Habitat" ADD COLUMN "comment" TEXT;

-- CreateTable
CREATE TABLE "DailyHealthCheck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animalId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "veterinarianId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyHealthCheck_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyHealthCheck_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
