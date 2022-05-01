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





import { PrismaClient, Puzzle } from "@prisma/client";



const prisma = new PrismaClient();

import SampleLevel from "./sample-level-2.json";

export async function getPuzzleById(puzzleId: number) {
	return prisma.puzzle.findUnique({
		where: {id: puzzleId}
	})
}

export async function getRandomPuzzle() {
	const puzzleCount = await prisma.puzzle.count();
	const rand = Math.floor(Math.random() * puzzleCount);
	const puzzle = await prisma.puzzle.findMany({
		take: 1,
		skip: rand
	})
	return puzzle[0]
}

// export async function getUserById(userId: number) {
// 	return prisma.user.findUnique({
// 		where: {id: userId}
// 	})
// }

export async function getPuzzlesByUserName(author: string) {
	const user = await getUserByName(author);
	if(!user) return false;

	return prisma.puzzle.findMany({
		where: {
			authorId: user.id
		}
	})
}

export async function getPuzzleByUserIdAndContent(authorId: number, solution: string) {
	console.log(authorId, solution)

	return prisma.puzzle.findUnique({
		where: {
			authorId_solution: {
				authorId,
				solution
			}
		}
	})
}

export async function getUserByName(name: string) {
	return prisma.user.findFirst({
		where: {name: name}
	})
}


export async function createUser(name: string) {
	return prisma.user.create({
		data: {
			name
		}
	})
}

// export async function createPuzzle(puzzle: Puzzle) {
export async function createPuzzle(puzzle: {name: string, solution: string, authorId: number}) {
	return prisma.puzzle.create({
		data: {
			name: puzzle.name,
			authorId: Number(puzzle.authorId),
			solution: puzzle.solution
		}
	})
}

export async function updatePuzzle() {

}