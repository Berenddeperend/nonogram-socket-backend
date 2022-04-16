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





import { app } from './index';
import {
  createPuzzle,
  createUser,
  getPuzzleById,
  getPuzzleByUserIdAndContent,
  getPuzzlesByUserName,
  getUserByName
} from './db';

export function initRest() {
  app.get('/puzzle/:id', async (req, res) => {
    console.log(req)
    const puzzle = await getPuzzleById(Number(req.params.id));
    res.json(puzzle);
  })

  app.get('/users/:name/puzzles', async (req, res) => {
    const authorName = req.params.name;
    const puzzles = await getPuzzlesByUserName( authorName )

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

}

