import type { ReactNode } from "react"
import { learningRustTheHardWay } from "./learning-rust-the-hard-way"

export type Post = {
	title: string
	date: string
	lines: ReactNode[]
}

export const posts: Record<string, Post> = {
	"learning-rust-the-hard-way": learningRustTheHardWay,
}
