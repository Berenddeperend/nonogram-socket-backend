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
import { Puzzle, PuzzleModel } from "./definitions";

import { getPuzzleById, getRandomPuzzle } from "./db";
import bodyParser from "body-parser";
import { initRest } from "./rest";
import * as faker from "faker";

export const app = express();
app.use(cors());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

initRest();

const socketServer = http.createServer(app);

const io = new Server(
  socketServer
);

const colors = [ "hotpink", "seagreen", "indianred", 'teal', 'orange'];

let currentPuzzle: Puzzle;

getRandomPuzzle().then((puzzle) => {
  currentPuzzle = puzzle;
});

let grid = createGrid(10);

function createGrid(size: number): Grid {
  return new Array(size).fill("").map(() => new Array(size).fill(" "));
}
 
let players: Players = {};

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
  // socket.on("gridUpdated", onGridUpdated);
  socket.on("cellUpdated", onCellUpdated);
  socket.on("cursorUpdated", onCursorUpdated);
  socket.on("join", onJoin);
  socket.on("suggestClear", onSuggestClear);
  socket.on("suggestNext", onNewRandomPuzzle);
  socket.on("syncAll", onSyncAll);

  function onJoin(nickName: string) {
    console.log("joined");
    players[socket.id].name = nickName;
    socket.emit("playerCreated", { id: socket.id });
    socket.emit("gridUpdated", grid);
    socket.emit("gameCreated", currentPuzzle);
    io.emit("playersStateUpdated", players);
  }

  async function onNewRandomPuzzle() { //doesnt get called yet.
    currentPuzzle = await getRandomPuzzle();
    grid = createGrid(10);
    io.emit("gameCreated", currentPuzzle);
    io.emit("gridUpdated", grid);  
  }

  function onCursorUpdated(position: Position) {
    players[socket.id].position = position;

    socket.broadcast.emit("cursorUpdated", [socket.id, position])
    // io.emit("playersStateUpdated", players);
  }

  function onSyncAll() {
    io.emit("playersStateUpdated", players);
    io.emit("gridUpdated", grid);
  }

  // function onGridUpdated(newGrid: Grid) {
  //   grid = newGrid;
  //   io.emit("gridUpdated", grid);

  //   const cleared = compareGrids(grid, currentPuzzle.solution);

  //   if (cleared) {
  //     setTimeout(async () => {
  //       currentPuzzle = await getRandomPuzzle();
  //       grid = createGrid(10);

  //       io.emit("gameCreated", currentPuzzle);
  //       io.emit("gridUpdated", grid);
  //     }, 5000);
  //   }
  // }



  function onCellUpdated(args: {position: Position, value: string}) {
    const {position, value} = args
    const [x,y] = position;
    grid[y][x] = value;
    socket.broadcast.emit('cellUpdated', {position, value})

 
    const cleared = compareGrids(grid, currentPuzzle.solution);

    if (cleared) {
      setTimeout(async () => {
        currentPuzzle = await getRandomPuzzle();
        grid = createGrid(10);

        io.emit("gameCreated", currentPuzzle);
        io.emit("gridUpdated", grid);
      }, 5000);
    }
    // io.emit('cellUpdated', args)
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

function compareGrids(gridA: Grid, gridB: Grid) {
  const stringify = (grid: Grid) => grid.flat().map(cell => cell === 'x' ? ' ' : cell).join('');
  return stringify(gridA) === stringify(gridB);
}

socketServer.listen(7100);
app.listen(7200);
