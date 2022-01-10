//
// import express, { Request, Response,  } from 'express';
// import path from 'path';
//
//
// const { Server } = require("socket.io");
//
//
//
//
//
//
// // -------------------firing express app
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({extended:false}));
// app.use(express.static(path.join(__dirname, 'client/build')));
//
// const http = require('http');
// const server = http.createServer(app);
//
// const io = new Server(server);
//
//
// // -------------------routes
// app.get('/home', (request: Request, response: Response)=>{
//   console.log(request.url)
//   response.json({ message: `Welcome to the home page!` })
// });
//
//
//
// // --------------------Listen
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, ()=>{
//   console.log(`Server running on PORT ${ PORT }`);
// })
//
// server.listen(4000, () => {
//   console.log('listening on *:4000');
// });
//
//
//   // server.on('connection', (socket:any) => {
//   //   console.log('a user connected');
//   //
//   //   socket.on('disconnect', () => {
//   //     console.log('user disconnected');
//   //   });
//   // });
//
// io.on('connection', (socket:any) => {
//   console.log('a user connected');
// });


const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');
app.use(cors());

// app.options('*', cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req: any, res:any) => {
  console.log('er is iemand')
  res.send('yee')
});

const players = [];

io.on('connection', (socket:any) => {

  console.log('a user connected', socket);

  setTimeout(()=> {

  socket.emit('hi', {sleutel: 'value ofzo, weet ik veel'});
  }, 3000)

  socket.on('disconnect', ()=> {
    console.log('they disconnected')
  })
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});

