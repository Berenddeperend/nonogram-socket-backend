interface Player {
  id: string;
  position: Position;
  color: string;
  name: string;
}

type Players = {
  [id: string]: Player;
};

type Grid = string[][];
type Position = [number, number];

import { app } from "./index";
import {
  createPuzzle,
  createUser,
  getPuzzleByContentAndAuthorName,
  getPuzzleById,
  getPuzzleByUserIdAndContent,
  getPuzzlesByUserName,
  getUserByName,
  getAllPuzzles
} from "./db";

const solve = require("nonogram-solver");
const Puzzle = require("nonogram-solver/src/Puzzle");
const Strategy = require("nonogram-solver/src/Strategy");
const pushSolver = require("nonogram-solver/src/solvers/pushSolver");
const bruteForceSolver = require("nonogram-solver/src/solvers/bruteForceSolver");

export function initRest() {
  app.get("/puzzle/:id", async (req, res) => {
    console.log(req);
    const puzzle = await getPuzzleById(Number(req.params.id));
    res.json(puzzle);
  });

  app.get("/users/:name/puzzles", async (req, res) => {
    console.log("getting puzzls");
    const authorName = req.params.name;
    const puzzles = await getPuzzlesByUserName(authorName);

    if (!puzzles) return res.sendStatus(500);
    res.json(puzzles);
  });

  app.get("/puzzles", async(req, res) => {
    const puzzles = await getAllPuzzles();
    if (!puzzles) return res.sendStatus(500);
    res.json(puzzles);
  })


  app.post("/validate-puzzle", async (req, res) => {
    const { legendData } = req.body;
    let puzzle = new Puzzle(legendData);
    let strategy = new Strategy([pushSolver.solve]);
    strategy.solve(puzzle, false);

    let status = 0;
    if (puzzle.isFinished) {
      status = puzzle.isSolved ? 1 : -1;
    }

    console.log(status, puzzle.toJSON());

    res.json(status);
  });

  app.post("/puzzle", async (req, res) => {
    const { name, solution, authorName } = req.body;
    // console.log("name, solution, authorName", name, solution, authorName);

    const user =
      (await getUserByName(authorName)) || (await createUser(authorName));

    const isDuplicate = await getPuzzleByContentAndAuthorName(
      solution,
      user.id
    );

    if (isDuplicate) return res.sendStatus(409);

    console.log("saving..");

    const newPuzzle = await createPuzzle({
      name,
      solution,
      authorId: user!.id,
    });

    res.send(newPuzzle);
    console.log("ye.");
  });

  app.get("/ping", async (req, res) => {
    res.json("pong");
  });
}
