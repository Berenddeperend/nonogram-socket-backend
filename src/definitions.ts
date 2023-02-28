export interface Player {
  id: string;
  position: Position;
  color: string;
  name: string;
}

export interface User {
  id: number;
  name: string;
}

export type Players = {
  [id: string]: Player;
};

export type Grid = string[][];
export type Position = [number, number];

export interface Puzzle {
  id: number;
  name: string;
  solution: Grid;
  width?: number;
  height?: number;
}

export interface PuzzleModel {
  // the way the DB saves it.
  id: number;
  name: string;
  solution: string;
  width?: number;
  height?: number;
}

export enum Action {
  created = "created",
  solved = "solved",
  joined = "joined",
  left = "left",
  placedX = "x",
  placedBlock = "block"
}
