import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { plugin as markdown } from "vite-plugin-markdown"
import { posts } from "./src/posts"
import { scenes } from "./src/site/scenes"

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url))

const inline = (svg: string, classes: string) =>
	svg
		.replace(/^<svg /, `<svg class="${classes}" aria-hidden="true" focusable="false" `)
		.replace(/ xmlns="[^"]*"/, "")

// The homepage illustrations, inlined so CSS can theme their colours and animate their parts:
// <!-- figure:name --> is a brandbook Figma master (src/site/figures/*.svg), whose layer names
// become classes and whose generated ids ("Vector_12", "Artwork / Hero") are dropped;
// <!-- scene:name --> is an approach illustration drawn in code (src/site/scenes).
const inlineFigures: Plugin = {
	name: "inline-figures",
	transformIndexHtml: (html) =>
		html
			.replace(/<!-- figure:([a-z-]+) -->/g, (_marker, name: string) =>
				inline(
					readFileSync(page(`src/site/figures/${name}.svg`), "utf8"),
					`figure figure--${name}`,
				).replace(/ id="([^"]*)"/g, (_id, id: string) =>
					/^[a-z][a-z0-9-]*$/.test(id) ? ` class="${id}"` : "",
				),
			)
			.replace(/<!-- scene:([a-z-]+) -->/g, (_marker, name: string) => {
				const draw = scenes[name]
				if (!draw) throw new Error(`inline-figures: no scene named "${name}"`)
				return inline(draw(), `figure scene scene--${name}`)
			}),
}

const escapeHtml = (text: string) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`)

// The homepage's blog section lists the newest posts where index.html says <!-- posts -->, taken
// from the blog's own post list, so it follows the blog. The title comes first in each link, so
// screen readers hear it before the date.
const blogPosts: Plugin = {
	name: "blog-posts",
	transformIndexHtml: (html) =>
		html.replace("<!-- posts -->", () =>
			Object.entries(posts)
				.sort(([, a], [, b]) => b.date.localeCompare(a.date))
				.slice(0, 3)
				.map(([slug, { title, date }]) => {
					const day = new Date(`${date}T00:00:00Z`)
					if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date)
						throw new Error(`blog-posts: "${slug}" has date "${date}", expected YYYY-MM-DD`)
					const label = day.toLocaleDateString("en-GB", {
						day: "numeric",
						month: "long",
						year: "numeric",
						timeZone: "UTC",
					})
					return `<li><a class="post" href="/blog/posts/${slug}"><span class="post__title h3">${escapeHtml(title)}</span><time class="micro muted" datetime="${date}">${label}</time></a></li>`
				})
				.join(""),
		),
}

// The dev server's SPA fallback serves the root homepage, so /blog and its extensionless
// routes are pointed at the blog shell before it runs
const blogShell: Plugin = {
	name: "blog-shell",
	configureServer(server) {
		// Not an expression body: a returned function would run as a post-middleware hook
		server.middlewares.use((req, _res, next) => {
			if (req.url && /^\/blog(\/[^.?]*)?(\?|$)/.test(req.url)) req.url = "/blog/index.html"
			next()
		})
	},
}

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		markdown({ mode: ["html"] }),
		blogShell,
		inlineFigures,
		blogPosts,
	],
	base: "/",
	build: {
		rollupOptions: {
			input: {
				home: page("index.html"),
				blog: page("blog/index.html"),
				notFound: page("404.html"),
			},
		},
	},
})
