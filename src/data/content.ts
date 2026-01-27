export type ContentItem = {
	slug: string
	title: string
	date: string
	type: "page" | "post"
	path: string
}

export const content: ContentItem[] = [
	{ slug: "about", title: "about_michel.man", date: "2024-01-01", type: "page", path: "/about" },
	{
		slug: "projects",
		title: "projects.sys",
		date: "2026-01-11",
		type: "page",
		path: "/projects",
	},
	{
		slug: "contact",
		title: "contact_card.vcf",
		date: "2024-01-01",
		type: "page",
		path: "/contact",
	},
	{
		slug: "learning-rust-the-hard-way",
		title: "learning_rust_the_hard_way.md",
		date: "2024-12-01",
		type: "post",
		path: "/posts/learning-rust-the-hard-way",
	},
	// {
	// 	slug: "llm-vs-ocr-document-extraction",
	// 	title: "llm_vs_ocr_document_extraction.md",
	// 	date: "2026-01-16",
	// 	type: "post",
	// 	path: "/posts/llm-vs-ocr-document-extraction",
	// },
]
