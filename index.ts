import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
// import cors from 'cors';

// app.use(cors());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.get('/', (req, res) => {
  console.log('er is iemand');
  res.send('yee');
});

const players = [];

io.on('connection', (socket: any) => {

  console.log('a user connected', socket);

  setTimeout(() => {
    socket.emit('hi', { sleutel: 'value ofzo, weet ik veel' });
  }, 3000);

  socket.on('disconnect', () => {
    console.log('they disconnected');
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});

