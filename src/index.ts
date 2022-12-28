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


function autoXSequence(userSequence: string[], solutionSequence: string[]): string[] {  
  const hasAllRequiredCells = solutionSequence.every((solutionCell, index) => {
    return solutionCell === 'd' ? userSequence[index] === solutionCell : true; 
  });

  const hasNoWrongCells = userSequence.every((userCell, index) => {
    return userCell === 'd' ? solutionSequence[index] === userCell : true; 
  })

  const sequenceShouldBeAutoXed = hasAllRequiredCells && hasNoWrongCells;

  return sequenceShouldBeAutoXed ? userSequence.map(cell => cell === 'd' ? 'd' : 'x'): userSequence;
}

function autoXGrid(grid: Grid, solution: Grid): Grid {
  const gridWithAutoXedRows = [...grid].map((gridRow, rowIndex) => autoXSequence(gridRow, [...solution][rowIndex]) );


  const autoXedColumns = gridWithAutoXedRows[0].map((cell, columnIndex) => {
    const userColumn = gridWithAutoXedRows.map((row, rowIndex) => row[columnIndex]);
    const solutionColumn = solution.map((row, rowIndex) => row[columnIndex]);

    return autoXSequence(userColumn, solutionColumn)
  })

  return grid.map((row, rowIndex) => {
    return row.map((cell, columnIndex) => {
      return autoXedColumns[columnIndex][rowIndex]
    })
  })
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

  async function onNewRandomPuzzle() { //doesnt get called yet.
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
    grid = autoXGrid(newGrid, currentPuzzle.solution);
    // grid = newGrid;
    io.emit("gridUpdated", grid);

    const cleared = compareGrids(grid, currentPuzzle.solution);

    if (cleared) {
      console.log("cleared!");
      setTimeout(async () => {
        currentPuzzle = await getRandomPuzzle();
        grid = autoXGrid(createGrid(10), currentPuzzle.solution);

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

function compareGrids(gridA: Grid, gridB: Grid) {
  const stringify = (grid: Grid) => grid.flat().map(cell => cell === 'x' ? ' ' : cell).join('');
  return stringify(gridA) === stringify(gridB);
}

socketServer.listen(7100);
app.listen(7200);
