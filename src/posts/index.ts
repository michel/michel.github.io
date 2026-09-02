import type { ReactNode } from "react"
import { askTheModelWhereNotWhat } from "./ask-the-model-where-not-what-document-extraction"
import { learningRustTheHardWay } from "./learning-rust-the-hard-way"
import { llmVsOcrDocumentExtraction } from "./llm-vs-ocr-document-extraction"
import { visualizing17YearsOfCode } from "./visualizing-17-years-of-code"

export type Post = {
	title: string
	date: string
	lines: ReactNode[]
}

export const posts: Record<string, Post> = {
	"learning-rust-the-hard-way": learningRustTheHardWay,
	"llm-vs-ocr-document-extraction": llmVsOcrDocumentExtraction,
	"ask-the-model-where-not-what-document-extraction": askTheModelWhereNotWhat,
	"visualizing-17-years-of-code": visualizing17YearsOfCode,
}
