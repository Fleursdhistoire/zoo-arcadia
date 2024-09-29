-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Animal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "habitatId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Animal_habitatId_fkey" FOREIGN KEY ("habitatId") REFERENCES "Habitat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Animal" ("createdAt", "habitatId", "id", "image", "name", "species", "status", "updatedAt") SELECT "createdAt", "habitatId", "id", "image", "name", "species", "status", "updatedAt" FROM "Animal";
DROP TABLE "Animal";
ALTER TABLE "new_Animal" RENAME TO "Animal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
