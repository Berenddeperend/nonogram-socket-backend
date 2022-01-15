import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { xor } from 'lodash';
import cors from 'cors';

const app = express();
app.use(cors);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: 'http://localhost:3000',
    origin: ['http://192.168.2.73:3000', 'http://192.168.2.5:3000'],

    methods: ['GET', 'POST']
  }
});


type Grid = string[][];
import SampleLevel from './sample-level.json';

const colors = ['yellow', 'green', 'blue'];


interface Player {
  id: string;
  position: [number, number]
  // color: Colors
  color: string,
  name: string
}

let players: { [id: string]: Player } = {};
let grid = [];

io.on('connection', (socket) => {
  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    name: 'Berend'
  };
  console.log('a user connected', players);

  socket.on('cursorPosition', (pos) => {
    console.log('cursorpos changed', pos);
    io.emit('cursorPositions', pos);
  });

  socket.on('userStateChanged', (state) => {
    console.log('userStateChanged', state);
    // io.emit('cursorPositions', pos)
    io.emit('state', state);
  });

  socket.on('disconnect', () => {
    // players = xor(players, [socket.id])]
    delete players[socket.id];
    console.log('they disconnected', players);
  });
});


server.listen(7000, () => {
  console.log('listening on *:4000');
});

