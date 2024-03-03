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
  getAllPuzzles,
  createLogItem,
} from "./db";

import { Action } from "./definitions";

const fetch = require("node-fetch");
const solve = require("nonogram-solver");
const Puzzle = require("nonogram-solver/src/Puzzle");
const Strategy = require("nonogram-solver/src/Strategy");
const pushSolver = require("nonogram-solver/src/solvers/pushSolver");
const bruteForceSolver = require("nonogram-solver/src/solvers/bruteForceSolver");

export function initRest() {
  app.get("/puzzle/:id", async (req, res) => {
    const puzzle = await getPuzzleById(Number(req.params.id));
    res.json(puzzle);
  });

  app.get("/users/:name/puzzles", async (req, res) => {
    const authorName = req.params.name;
    const puzzles = await getPuzzlesByUserName(authorName);

    if (!puzzles) return res.sendStatus(500);
    res.json(puzzles);
  });

  app.get("/puzzles", async (req, res) => {
    const puzzles = await getAllPuzzles();
    if (!puzzles) return res.sendStatus(500);
    res.json(puzzles);
  });

  app.post("/validate-puzzle", async (req, res) => {
    const { legendData } = req.body;

    let puzzle = new Puzzle(legendData);
    let strategy = new Strategy([pushSolver.solve]);
    strategy.solve(puzzle, false);

    let status = 0;
    if (puzzle.isFinished) {
      status = puzzle.isSolved ? 1 : -1;
    }

    const puzzleEmpty = legendData.rows.every((row: number[]) => row[0] === 0);

    if (puzzleEmpty) {
      status = 0;
    }

    res.json(status);
  });

  app.post("/puzzle", async (req, res) => {
    const { name, solution, authorName, width, height } = req.body;

    if (!name || !solution || !authorName) {
      return res.sendStatus(400);
    }

    const user =
      (await getUserByName(authorName)) || (await createUser(authorName));

    const isDuplicate = await getPuzzleByContentAndAuthorName(
      solution,
      user.id
    );

    if (isDuplicate) return res.sendStatus(409);

    createLogItem({ action: Action.created, actorId: user.id });

    fetch("http://ntfy.sh/nono-puzzle-created", {
      method: "POST",
      body: "new puzzle created! " + name + " by " + authorName,
    });

    const newPuzzle = await createPuzzle({
      name,
      solution,
      authorId: user!.id,
      width,
      height,
    });

    res.send(newPuzzle);
  });

  app.get("/ping", async (req, res) => {
    res.json("pong");
  });
}
