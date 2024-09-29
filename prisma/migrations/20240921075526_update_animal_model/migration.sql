/*
  Warnings:

  - Added the required column `activityLevel` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Animal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthRecord" ADD COLUMN "diagnosis" TEXT;
ALTER TABLE "HealthRecord" ADD COLUMN "followUpDate" DATETIME;
ALTER TABLE "HealthRecord" ADD COLUMN "medications" TEXT;
ALTER TABLE "HealthRecord" ADD COLUMN "symptoms" TEXT;
ALTER TABLE "HealthRecord" ADD COLUMN "temperature" REAL;
ALTER TABLE "HealthRecord" ADD COLUMN "treatment" TEXT;
ALTER TABLE "HealthRecord" ADD COLUMN "weight" REAL;

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animalId" INTEGER NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "dateAdministered" DATETIME NOT NULL,
    "expirationDate" DATETIME,
    "veterinarianId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vaccination_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vaccination_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Animal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "dietaryNeeds" TEXT,
    "habitatId" INTEGER,
    "recommendedFoodQuantity" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Animal_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Animal" ("createdAt", "habitatId", "id", "image", "name", "species", "status", "updatedAt") SELECT "createdAt", "habitatId", "id", "image", "name", "species", "status", "updatedAt" FROM "Animal";
DROP TABLE "Animal";
ALTER TABLE "new_Animal" RENAME TO "Animal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
