// @ts-expect-error: domino ships no types; it is the DOM turndown itself parses with
import domino from "@mixmark-io/domino"
import TurndownService from "turndown"
import { posts } from "../src/posts"

// The site for language models and agents (llmstxt.org): every page again as Markdown next to its
// HTML (/index.md, /blog/posts/<slug>.md), /llms.txt as the map of them and /llms-full.txt as all
// of them in one file. Runs after the prerender, from the HTML it wrote, so it says what the
// pages say

const ORIGIN = "https://re-invention.nl"
const dist = new URL("../dist/", import.meta.url).pathname

const turndown = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
	bulletListMarker: "-",
})
// Drawings, controls and decoration say nothing in text, so they leave the page before it is
// converted (a turndown rule would win over its remove()); a control keeps an image it wraps, the
// way a post's images open larger
// domino's lists are array-like, not iterable
const all = (root: ParentNode, selector: string): Element[] =>
	Array.from(root.querySelectorAll(selector))
const prune = (root: Element) => {
	for (const node of all(
		root,
		'svg, style, script, noscript, video, [aria-hidden="true"], img[alt=""], .site-nav__index',
	))
		node.remove()
	for (const node of all(root, "button"))
		if (node.querySelector("img")) node.replaceWith(...node.childNodes)
		else node.remove()
	return root
}
// Links and images point at the live site, so the file works wherever it is read
const absolute = (href: string) => new URL(href, ORIGIN).href
turndown.addRule("absolute-links", {
	filter: (node) => node.nodeName === "A" && !!node.getAttribute("href"),
	replacement: (content, node) =>
		content.trim()
			? `[${content.trim()}](${absolute((node as Element).getAttribute("href") ?? "")})`
			: "",
})
// A logo is its name; any other image stays a picture
turndown.addRule("absolute-images", {
	filter: "img",
	replacement: (_content, node) => {
		const img = node as Element
		const src = img.getAttribute("src") ?? ""
		const alt = img.getAttribute("alt") ?? ""
		return src.endsWith(".svg") ? alt : `![${alt}](${absolute(src)})`
	},
})
// A date after a title reads as its own part
turndown.addRule("dates", {
	filter: "time",
	replacement: (content) => ` (${content.trim()})`,
})

const page = async (file: string) => domino.createDocument(await Bun.file(`${dist}${file}`).text())
// Items left empty by the pruning go, with the blank lines they leave
const tidy = (markdown: string) =>
	`${markdown
		.replace(/^ *(-|\d+\.) *$/gm, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim()}\n`

// The homepage: its main content, under its title and description, without the figures' numbers
const home = await page("index.html")
for (const caption of all(home, "main figcaption")) caption.remove()
const description = home.querySelector('meta[name="description"]').getAttribute("content")
const homeMarkdown = tidy(
	`# re-invention\n\n> ${description}\n\n${turndown.turndown(prune(home.querySelector("main")))}`,
)

// A blog page is a buffer of numbered lines, each already written as Markdown (the post's front
// matter, # before a heading): its lines without their numbers, the headings' own # kept
const buffer = async (file: string) => {
	const doc = await page(file)
	const lines = all(doc, "#root .cursor-pointer").map((line) => {
		const text = line.lastElementChild
		if (!text || text.textContent?.trim() === "") return ""
		const markdown = turndown.turndown(prune(text))
		const heading = text.querySelector("h1, h2, h3, h4")?.textContent?.trim()
		return heading?.startsWith("#") ? heading : markdown.replace(/\\([#\-*_[\].+>])/g, "$1")
	})
	return tidy(lines.join("\n"))
}

const entries = Object.entries(posts).sort(([, a], [, b]) => b.date.localeCompare(a.date))
const files: Record<string, string> = { "index.md": homeMarkdown }
for (const [slug] of entries)
	files[`blog/posts/${slug}.md`] = await buffer(`blog/posts/${slug}.html`)
files["blog/about.md"] = await buffer("blog/about.html")
for (const [file, markdown] of Object.entries(files)) {
	await Bun.write(`${dist}${file}`, markdown)
	console.log(`markdown /${file} (${(markdown.length / 1024).toFixed(1)} kB)`)
}

const llms = `# re-invention

> ${description}

re-invention is the software consultancy of Michel de Graaf, based in Amsterdam, the Netherlands: technical consulting and full-stack development as one line of work, from business problem to software in production. Its deepest experience is in financial systems (leasing and lending, private equity, broker and dealer portals) and agentic workflows (document recognition, information extraction, workflow coordination). Contact: michel@re-invention.nl.

## Company

- [Homepage](${ORIGIN}/index.md): expertise, approach, selected work and how to start a project
- [About Michel de Graaf](${ORIGIN}/blog/about.md): background, metrics from 22 years of git history, clients and stack

## Blog

${entries.map(([slug, { title, date }]) => `- [${title}](${ORIGIN}/blog/posts/${slug}.md): ${date}`).join("\n")}

## Optional

- [Everything above in one file](${ORIGIN}/llms-full.txt)
- [Projects](${ORIGIN}/blog/projects): an interactive table of every project in the git history
`
await Bun.write(`${dist}llms.txt`, llms)
await Bun.write(
	`${dist}llms-full.txt`,
	Object.entries(files)
		.map(([file, markdown]) => `<!-- ${ORIGIN}/${file} -->\n\n${markdown}`)
		.join("\n---\n\n"),
)
console.log("wrote /llms.txt and /llms-full.txt")
