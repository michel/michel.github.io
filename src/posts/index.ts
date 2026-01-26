import type { ReactNode } from "react"
import { learningRustTheHardWay } from "./learning-rust-the-hard-way"
import { llmVsOcrDocumentExtraction } from "./llm-vs-ocr-document-extraction"

export type Post = {
	title: string
	date: string
	lines: ReactNode[]
}

export const posts: Record<string, Post> = {
	"learning-rust-the-hard-way": learningRustTheHardWay,
	"llm-vs-ocr-document-extraction": llmVsOcrDocumentExtraction,
}
