import {
  PuzzleModel as PuzzleModelType,
  Puzzle,
  User,
  Grid,
  Action
} from "./definitions";

import { Puzzle as PuzzleModel, User as UserModel, Log as LogModel, sequelize } from "./model";

function parseDatabasePuzzle(dbPuzzle: PuzzleModelType): Puzzle {
  if (!dbPuzzle) throw new Error("geen puzzel opgegeven");
  return {
    ...dbPuzzle,
    solution: JSON.parse(dbPuzzle.solution),
    name: dbPuzzle.name
  };
}

export async function getPuzzleById(puzzleId: number): Promise<Puzzle> {
  const puzzle = await PuzzleModel.findOne({ where: { id: puzzleId } });
  return parseDatabasePuzzle(puzzle);
}

export async function getRandomPuzzle(): Promise<Puzzle> {
  const puzzle = await PuzzleModel.findOne({
    order: sequelize.random(),
  });

  // const puzzle = await PuzzleModel.findAll();

  return parseDatabasePuzzle(puzzle);
}

export async function getAllPuzzles(): Promise<Puzzle[]> {
  return await PuzzleModel.findAll();
}

export async function createPuzzle(input: {
  name: string;
  solution: string;
  authorId: number;
}): Promise<Puzzle> {
  const newPuzzle = await PuzzleModel.create({
    name: input.name,
    solution: input.solution,
    authorId: input.authorId,
  });

  return parseDatabasePuzzle(newPuzzle);
}

export async function createLogItem(input: {
  actorId: number;
  action: Action;
}) {
  // const {actorId, action} = input;
  // if (!actorId || !action) {
  //   console.log('hmm this shouldnt happen')
  //   return;
  // };
  // const newLog = await LogModel.create({
  //   action, actorId
  // })

  // return newLog;
}

export async function getPuzzleByUserIdAndContent(
  authorId: number,
  solution: string
): Promise<Puzzle | undefined> {
  const puzzle = await PuzzleModel.findOne({
    author: authorId,
    solution,
  });

  if (puzzle) {
    return parseDatabasePuzzle(puzzle);
  } else {
    return undefined;
  }
}

export async function getPuzzleByContentAndAuthorName(
  puzzle: Grid,
  authorId: number
): Promise<Puzzle> {
  return await PuzzleModel.findOne({
    where: { solution: puzzle, authorId: authorId },
  });
}

export async function getUserByName(name: string): Promise<User> {
  return await UserModel.findOne({ where: { name } });
}

export async function getPuzzlesByUserName(
  author: string
): Promise<Puzzle[] | undefined> {
  const user = await getUserByName(author);

  if (!user) return undefined;

  return await PuzzleModel.findAll({
    authorId: user.id,
  });
}

export async function createUser(name: string): Promise<User> {
  return await UserModel.create({
    name,
  });
}
