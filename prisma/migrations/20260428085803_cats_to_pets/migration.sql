/*
  Warnings:

  - You are about to drop the `Cat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `maxCats` on the `Plan` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Cat";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "petType" TEXT NOT NULL DEFAULT 'cat',
    "description" TEXT,
    "color" TEXT,
    "photoUrl" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'stray',
    "clusterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pet_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "maxUsers" INTEGER NOT NULL DEFAULT 50,
    "maxNews" INTEGER NOT NULL DEFAULT 100,
    "maxMapBlocks" INTEGER NOT NULL DEFAULT 20,
    "maxPets" INTEGER NOT NULL DEFAULT 50,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plan" ("createdAt", "displayName", "features", "id", "isActive", "maxMapBlocks", "maxNews", "maxUsers", "name", "price", "updatedAt") SELECT "createdAt", "displayName", "features", "id", "isActive", "maxMapBlocks", "maxNews", "maxUsers", "name", "price", "updatedAt" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
