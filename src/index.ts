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
import { Puzzle, PuzzleModel, Action } from "./definitions";

import { getPuzzleById, getRandomPuzzle, createLogItem, getUserByName, createUser } from "./db";
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
 
type DbPlayers = {[key:string]: any}

let players: Players = {};
const dbPlayers: DbPlayers = {};

io.on("connection", async (socket: any) => {
  console.log("connedcted");
  
  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    name: faker.animal.bird(),
  };

  socket.on("disconnect", onLeave);
  socket.on("leave", onLeave);
  socket.on("cellUpdated", onCellUpdated);
  socket.on("cursorUpdated", onCursorUpdated);
  socket.on("join", onJoin);
  socket.on("suggestClear", onSuggestClear);
  socket.on("suggestNext", onNewRandomPuzzle);
  socket.on("syncAll", onSyncAll);

  async function onJoin(nickName: string) {
    console.log("joined");
    players[socket.id].name = nickName;
    socket.emit("playerCreated", { id: socket.id });
    socket.emit("gridUpdated", grid);
    socket.emit("gameCreated", currentPuzzle);
    io.emit("playersStateUpdated", players);
    
    const user = (await getUserByName(nickName)) || (await createUser(nickName));
    dbPlayers[socket.id as string] = user
    createLogItem({action: Action.joined, actorId: user.id})
  }

  // async function getDBUserBySocketId(id:string|number) {
  //   const nickName = players[id].name;
  //   return (await getUserByName(nickName)) || (await createUser(nickName));
  // }

  async function onNewRandomPuzzle() { //doesnt get called yet.
    currentPuzzle = await getRandomPuzzle();
    grid = createGrid(10);
    io.emit("gameCreated", currentPuzzle);
    io.emit("gridUpdated", grid);  
  }

  function onCursorUpdated(position: Position) {
    players[socket.id].position = position;

    socket.broadcast.emit("cursorUpdated", [socket.id, position])
  }

  function onSyncAll() {
    io.emit("playersStateUpdated", players);
    io.emit("gridUpdated", grid);
  }

  function onCellUpdated(args: {position: Position, value: string}) {
    const {position, value} = args
    const [x,y] = position;
    grid[y][x] = value;
    socket.broadcast.emit('cellUpdated', {position, value})

    value === "x"
     ? createLogItem({action: Action.placedX, actorId: dbPlayers[socket.id].id})
     : createLogItem({action: Action.placedBlock, actorId: dbPlayers[socket.id].id});

    const cleared = compareGrids(grid, currentPuzzle.solution);

    if (cleared) {      
      createLogItem({action: Action.joined, actorId: dbPlayers[socket.id].id})

      setTimeout(async () => {
        currentPuzzle = await getRandomPuzzle();
        grid = createGrid(10);

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
