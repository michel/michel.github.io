import type { ReactNode } from "react"
import { learningRustTheHardWay } from "./learning-rust-the-hard-way"
import { llmVsOcrDocumentExtraction } from "./llm-vs-ocr-document-extraction"
import { theModelNeverTypesTheNumber } from "./the-model-never-types-the-number"
import { visualizing17YearsOfCode } from "./visualizing-17-years-of-code"

export type Post = {
	title: string
	date: string
	lines: ReactNode[]
}

export const posts: Record<string, Post> = {
	"learning-rust-the-hard-way": learningRustTheHardWay,
	"llm-vs-ocr-document-extraction": llmVsOcrDocumentExtraction,
	"the-model-never-types-the-number": theModelNeverTypesTheNumber,
	"visualizing-17-years-of-code": visualizing17YearsOfCode,
}
