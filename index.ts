import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as faker from 'faker';
import { isEqual } from 'lodash';
import { Puzzle } from "@prisma/client";
import {
  getPuzzleById,
} from './db';
import bodyParser from 'body-parser';
import {initRest} from './rest';


export const app = express();
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

initRest()

const server = http.createServer(app);



const io = new Server(server,
//   {
//   cors: {
//     origin: '*',
//   }
// }
);

type Grid = string[][];

const colors = ['yellow', 'green', 'blue'];
let solution: Puzzle;

let grid = createGrid(10);

function createGrid(size: number): Grid {
  return new Array(size).fill('').map(() => new Array(size).fill(' '));
}

// getRandomPuzzle()

interface Player {
  id: string;
  position: [number, number]
  color: string,
  name: string
}
type Players = {
  [id: string]: Player
}

async function startGame() {
  io.emit('playersStateUpdated', players);
  // io.emit('initPlayer', {id: socket.id})
  io.emit('gridUpdated', grid);
  // io.emit('solution', await getRandomPuzzle());
  io.emit('solution', await getPuzzleById(20));
  solution = await getPuzzleById(20) as Puzzle;
}

let players: Players = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    name: faker.animal.bird()
  };


  io.emit('playersStateUpdated', players);
  socket.emit('initPlayer', {id: socket.id})

  socket.on('startGame', () => {
    startGame();
  });

  // socket.on('startGame', async ()=> {
  //   socket.emit('playersStateUpdated', players);
  //   socket.emit('initPlayer', {id: socket.id})
  //   socket.emit('solution', await getRandomPuzzle());
  //   socket.emit('gridUpdated', grid);
  // })

  socket.on('cursorPositionChanged', (pos) => {
    players[socket.id].position = pos;
    io.emit('playersStateUpdated', players);
  });

  socket.on('gridUpdated', (newGrid: Grid) => {
    grid = newGrid;
    io.emit('gridUpdated', grid);

    const cleared = isEqual(grid, solution)

    if(cleared) {
      setTimeout(async ()=> {
        io.emit('solution', await getPuzzleById(20))
        io.emit('gridUpdated', createGrid(10))
      }, 5000)
    }
  });


  socket.on('disconnect', () => {
    // players = xor(players, [socket.id])]
    delete players[socket.id];
    io.emit('playersStateUpdated', players);
    console.log('they disconnected', players);
  });
});


server.listen(7100, () => { //port is chosen arbitrarily
  console.log('listening on *:7100');
});

app.listen(7200);