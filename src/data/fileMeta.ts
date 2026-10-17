// The files' names and paths without their content: the tree, tabs and status line need only
// these, so the content (files.ts) loads with the terminal and the fuzzy finder
export const fileMeta = {
	home: {
		id: "home",
		name: "README.md",
		path: "/",
		terminalPath: "/home/michel/blog/README.md",
	},
	rust: {
		id: "rust",
		name: "learning_rust_the_hard_way.md",
		path: "/posts/learning-rust-the-hard-way",
		terminalPath: "/home/michel/blog/posts/learning_rust_the_hard_way.md",
	},
	askwhere: {
		id: "askwhere",
		name: "ask_the_model_where_not_what_document_extraction.md",
		path: "/posts/ask-the-model-where-not-what-document-extraction",
		terminalPath: "/home/michel/blog/posts/ask_the_model_where_not_what_document_extraction.md",
	},
	llmocr: {
		id: "llmocr",
		name: "llm_vs_ocr_document_extraction.md",
		path: "/posts/llm-vs-ocr-document-extraction",
		terminalPath: "/home/michel/blog/posts/llm_vs_ocr_document_extraction.md",
	},
	portfolio: {
		id: "portfolio",
		name: "visualizing_17_years_of_code.md",
		path: "/posts/visualizing-17-years-of-code",
		terminalPath: "/home/michel/blog/posts/visualizing_17_years_of_code.md",
	},
	cv: {
		id: "cv",
		name: "about_michel.man",
		path: "/about",
		terminalPath: "/home/michel/blog/about_michel.man",
	},
	contact: {
		id: "contact",
		name: "contact_card.vcf",
		path: "/contact",
		terminalPath: "/home/michel/blog/contact_card.vcf",
	},
	projects: {
		id: "projects",
		name: "projects.sys",
		path: "/projects",
		terminalPath: "/home/michel/blog/projects.sys",
	},
} as const

export type FileId = keyof typeof fileMeta
