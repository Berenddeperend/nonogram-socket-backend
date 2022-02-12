import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    // origin: ['http://192.168.2.73:3000', 'http://192.168.2.5:3000'],
    methods: ['GET', 'POST']
  }
});


type Grid = string[][];
import SampleLevel from './sample-level.json';

const colors = ['yellow', 'green', 'blue'];

const solution: Grid = SampleLevel;

let grid = createGrid(10);

function createGrid(size: number): Grid {
  const grid = new Array(size).fill('').map((d) => new Array(size).fill(' '));
  return grid;
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
    name: 'Berend'
  };

  console.log('a user connected', players);

  socket.emit('initPlayer', {id: socket.id})
  socket.emit('playersStateUpdated', players);
  socket.emit('solution', solution);
  socket.emit('grid', grid);

  socket.on('cursorPositionChanged', (pos) => {
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
    console.log('they disconnected', players);
  });
});


server.listen(7100, () => { //port is chosen arbitrarily
  console.log('listening on *:7100');
});

