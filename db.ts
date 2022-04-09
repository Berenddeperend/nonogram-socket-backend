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
	return prisma.puzzle.findMany({
		take: 1,
		skip: rand
	})
}

// export async function getUserById(userId: number) {
// 	return prisma.user.findUnique({
// 		where: {id: userId}
// 	})
// }

export async function getPuzzleByUserName(author: string) {
	const user = await getUserByName(author);
	if(!user) return false;

	return prisma.puzzle.findMany({
		where: {
			authorId: user.id
		}
	})
}

export async function getPuzzleByUserIdAndContent(authorId: number, puzzle: string) {
	console.log(authorId, puzzle)

	return prisma.puzzle.findUnique({
		where: {
			authorId_puzzle: {
				authorId,
				puzzle
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
export async function createPuzzle(puzzle: {name: string, puzzle: string, authorId: number}) {
	return prisma.puzzle.create({
		data: {
			name: puzzle.name,
			authorId: Number(puzzle.authorId),
			puzzle: puzzle.puzzle
		}
	})
}

export async function updatePuzzle() {

}