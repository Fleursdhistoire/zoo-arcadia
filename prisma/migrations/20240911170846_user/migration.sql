-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Habitat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "habitatId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Animal_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animalId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "food" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "details" TEXT,
    "veterinarianId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HealthRecord_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeedingRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animalId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "food" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeedingRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedingRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnimalView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animalId" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AnimalView_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
