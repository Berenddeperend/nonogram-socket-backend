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


const colors = ['yellow', 'green', 'blue'];
let solution: Puzzle;

let grid = createGrid(10);

function createGrid(size: number): Grid {
  return new Array(size).fill('').map(() => new Array(size).fill(' '));
}

// getRandomPuzzle()



let players: Players = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    name: faker.animal.bird()
  };

  socket.on('disconnect', onLeave);
  socket.on('leave', onLeave);
  socket.on('gridUpdated', onGridUpdated);
  socket.on('cursorPositionChanged', onCursorPositionChanged);

  socket.emit('playerCreated', {id: socket.id})
  socket.emit('gridUpdated', grid);
  socket.emit('gameCreated', solution);
  io.emit('playersStateUpdated', players);

  function onCursorPositionChanged(position: Position) {
    players[socket.id].position = position;
    io.emit('playersStateUpdated', players);
  }

  function onGridUpdated(newGrid: Grid) {
    grid = newGrid;
    io.emit('gridUpdated', grid);

    const cleared = isEqual(grid, solution)

    if(cleared) {
      setTimeout(async ()=> {
        io.emit('gameCreated', await getPuzzleById(20))
        io.emit('gridUpdated', createGrid(10))
      }, 5000)
    }
  }

  function onLeave() {
     delete players[socket.id];
     io.emit('playersStateUpdated', players);
  }


});


server.listen(7100, () => { //port is chosen arbitrarily
  console.log('listening on *:7100');
});

app.listen(7200);