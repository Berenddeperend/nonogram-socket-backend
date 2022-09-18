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

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as faker from "faker";
import { isEqual } from "lodash";
// import { Puzzle } from "./../prisma/generated/prisma-client-js/index";
import { Puzzle, PuzzleModel } from "./definitions";

import { getPuzzleById, getRandomPuzzle } from "./db";
import bodyParser from "body-parser";
import { initRest } from "./rest";

export const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

initRest();

const server = http.createServer(app);

const io = new Server(
  server
  //   {
  //   cors: {
  //     origin: '*',
  //   }
  // }
);

const colors = ["yellow", "green", "blue"];

let currentPuzzle: Puzzle;

getRandomPuzzle().then((puzzle) => {
  currentPuzzle = puzzle;
});

let grid = createGrid(10);

function createGrid(size: number): Grid {
  return new Array(size).fill("").map(() => new Array(size).fill(" "));
}

let players: Players = {};
console.log(players);

io.on("connection", (socket: any) => {
  console.log("connedcted");

  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    name: faker.animal.bird(),
  };

  socket.on("disconnect", onLeave);
  socket.on("leave", onLeave);
  socket.on("gridUpdated", onGridUpdated);
  socket.on("cursorUpdated", onCursorUpdated);
  socket.on("join", onJoin);
  socket.on("suggestClear", onSuggestClear);
  socket.on("suggestNext", onNewRandomPuzzle);

  function onJoin(nickName: string) {
    console.log("joined");
    players[socket.id].name = nickName;
    socket.emit("playerCreated", { id: socket.id });
    socket.emit("gridUpdated", grid);
    socket.emit("gameCreated", currentPuzzle);
    io.emit("playersStateUpdated", players);
  }

  async function onNewRandomPuzzle() {
    currentPuzzle = await getRandomPuzzle();
    grid = createGrid(10);
    io.emit("gameCreated", currentPuzzle);
    io.emit("gridUpdated", grid);
  }

  function onCursorUpdated(position: Position) {
    players[socket.id].position = position;
    io.emit("playersStateUpdated", players);
  }

  function onGridUpdated(newGrid: Grid) {
    grid = newGrid;
    io.emit("gridUpdated", grid);

    const cleared = isEqual(grid, currentPuzzle.solution);
    console.log("-> solution.solution", currentPuzzle.solution);
    console.log("-> grid", grid);

    if (cleared) {
      console.log("cleared!");
      setTimeout(async () => {
        grid = createGrid(10);
        currentPuzzle = await getRandomPuzzle();

        io.emit("gameCreated", currentPuzzle);
        io.emit("gridUpdated", grid);
      }, 5000);
    }
  }

  function onLeave() {
    delete players[socket.id];
    console.log("player left", players);
    io.emit("playersStateUpdated", players);
  }

  function onSuggestClear() {
    grid = createGrid(10);
    io.emit("gridUpdated", grid);
  }
});

server.listen(7100, () => {
  //port is chosen arbitrarily
  console.log("listening on *:7100");
});

app.listen(7200);
