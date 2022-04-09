import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as faker from 'faker';
import { isEqual } from 'lodash';
import {
  getPuzzleById,
  createPuzzle,
  createUser,
  getUserByName,
  getPuzzleByUserIdAndContent,
  getPuzzleByUserName,
  getRandomPuzzle
} from './db';
import bodyParser from 'body-parser';

import SampleLevel from './sample-level.json';


const app = express();
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));


const server = http.createServer(app);

app.get('/puzzle/:id', async (req, res) => {
  console.log(req)
  const puzzle = await getPuzzleById(Number(req.params.id));
  res.json(puzzle);
})

app.get('/users/:name/puzzles', async (req, res) => {
  const authorName = req.params.name;
  const puzzles = await getPuzzleByUserName( authorName )

  if(!puzzles) return res.sendStatus(500);
  res.json(puzzles)
});


app.post('/puzzle', async(req, res) => {
  const {name, puzzle, authorName} = req.body;

  const user = await getUserByName(authorName) || await createUser(authorName);

  const isDuplicate = await getPuzzleByUserIdAndContent(user.id, puzzle);
  if(isDuplicate) return res.sendStatus(409);


  const newPuzzle = await createPuzzle({
    name,
    puzzle,
    authorId: user.id,
  })

  res.send(newPuzzle)
});


const io = new Server(server, 
//   {
//   cors: {
//     origin: '*',
//   }
// }
);

type Grid = string[][];

const colors = ['yellow', 'green', 'blue'];
const solution: Grid = SampleLevel;

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

let players: Players = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    id: socket.id,
    position: [0, 0],
    color: colors[Object.entries(players).length % colors.length],
    name: faker.animal.bird()
  };


  io.emit('playersStateUpdated', players);

  socket.on('startGame', async ()=> {
    socket.emit('playersStateUpdated', players);
    socket.emit('initPlayer', {id: socket.id})
    socket.emit('solution', await getRandomPuzzle());
    socket.emit('gridUpdated', grid);
  })

  socket.on('cursorPositionChanged', (pos) => {
    players[socket.id].position = pos;
    io.emit('playersStateUpdated', players);
  });

  socket.on('gridUpdated', (newGrid: Grid) => {
    grid = newGrid;
    io.emit('gridUpdated', grid);

    const cleared = isEqual(grid, solution)

    // if(cleared) {
    //   setTimeout(()=> {
    //     io.emit('solution', solution)
    //     io.emit('gridUpdated', createGrid(10))
    //   }, 5000)
    // }
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