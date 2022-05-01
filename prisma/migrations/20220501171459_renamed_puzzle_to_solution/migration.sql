/*
  Warnings:

  - You are about to drop the column `puzzle` on the `Puzzle` table. All the data in the column will be lost.
  - Added the required column `solution` to the `Puzzle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Puzzle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "width" INTEGER DEFAULT 10,
    "height" INTEGER DEFAULT 10,
    CONSTRAINT "Puzzle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Puzzle" ("authorId", "solution", "height", "id", "name", "width") SELECT "authorId", "puzzle", "height", "id", "name", "width" FROM "Puzzle";
DROP TABLE "Puzzle";
ALTER TABLE "new_Puzzle" RENAME TO "Puzzle";
CREATE UNIQUE INDEX "Puzzle_authorId_solution_key" ON "Puzzle"("authorId", "solution");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
