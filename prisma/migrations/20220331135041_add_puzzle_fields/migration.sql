/*
  Warnings:

  - Added the required column `puzzle` to the `Puzzle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Puzzle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "puzzle" TEXT NOT NULL,
    "width" INTEGER DEFAULT 10,
    "height" INTEGER DEFAULT 10,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Puzzle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Puzzle" ("authorId", "id", "name") SELECT "authorId", "id", "name" FROM "Puzzle";
DROP TABLE "Puzzle";
ALTER TABLE "new_Puzzle" RENAME TO "Puzzle";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
