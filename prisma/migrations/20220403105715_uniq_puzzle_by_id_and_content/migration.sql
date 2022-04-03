/*
  Warnings:

  - A unique constraint covering the columns `[authorId,puzzle]` on the table `Puzzle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Puzzle_authorId_puzzle_key" ON "Puzzle"("authorId", "puzzle");
