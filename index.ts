import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as faker from 'faker';

const app = express();
app.use(cors);
const server = http.createServer(app);

console.log('yoink!')

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

type Grid = string[][];
import SampleLevel from './sample-level.json';

const colors = ['yellow', 'green', 'blue'];

const solution: Grid = SampleLevel;

let grid = createGrid(10);

function createGrid(size: number): Grid {
  return new Array(size).fill('').map(() => new Array(size).fill(' '));
}

interface Player {
  id: string;
  position: [number, number]
  color: string,
  name: string
}
type Players = {
  [id: string]: Player
}

let players: Players = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    // name: faker.name.findName()
    name: faker.animal.bird()
  };

  console.log('a user connected', players);

  socket.emit('initPlayer', {id: socket.id})
  io.emit('playersStateUpdated', players);
  socket.emit('solution', solution);
  socket.emit('gridUpdated', grid);

  socket.on('cursorPositionChanged', (pos) => {
    console.log("-> pos", pos);
    players[socket.id].position = pos;
    io.emit('playersStateUpdated', players);
  });

  socket.on('gridUpdated', (newGrid: Grid) => {
    grid = newGrid;
    io.emit('gridUpdated', grid);
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

