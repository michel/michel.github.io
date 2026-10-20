import { readFileSync } from "node:fs"
import { renderToReadableStream } from "react-dom/server.browser"
import { MemoryRouter } from "react-router-dom"
import App from "../src/App"
import { posts } from "../src/posts"

const ORIGIN = "https://re-invention.nl"
// The blog app lives under this path: it matches the BrowserRouter basename in src/main.tsx
const BASE = "/blog"
const BASE_TITLE = "michel@re-invention:~"
const titles: Record<string, string> = {
	"/about": "About",
	"/projects": "projects",
	"/contact": "Contact",
}
for (const [slug, post] of Object.entries(posts)) titles[`/posts/${slug}`] = post.title
const routes = ["/", ...Object.keys(titles)]

const dist = new URL("../dist/", import.meta.url).pathname
let template = await Bun.file(`${dist}blog/index.html`).text()
const marker = '<div id="root"></div>'
if (!template.includes(marker))
	throw new Error("prerender: root marker not found in dist/blog/index.html")

// Inline the stylesheet and the regular font so first paint needs only the HTML response.
// A preloaded font is render-blocking in Chrome (RenderBlockingFonts) and the fallback-to-
// webfont swap moved Speed Index around. Embedded bytes still decode asynchronously, so the
// face blocks (a few ms) rather than swaps: a swap re-wrapped text before first paint (CLS)
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (!cssLink?.[1]) throw new Error("prerender: stylesheet link not found in dist/blog/index.html")
const font = Buffer.from(await Bun.file(`${dist}fonts/roboto-mono.woff2`).arrayBuffer()).toString(
	"base64",
)
const css = (await Bun.file(`${dist}${cssLink[1]}`).text()).replace(
	"font-display:swap;src:url(/fonts/roboto-mono.woff2)",
	`font-display:block;src:url(data:font/woff2;base64,${font})`,
)
template = template
	.replace(cssLink[0], `<style>${css}</style>`)
	.replace(/<link rel="preload" href="\/fonts\/roboto-mono\.woff2"[^>]*>\s*/, "")

// Load the bundle only once the first frame is on screen and the page's high-priority image
// (its largest paint, when it has one) has arrived: hydration never competes with either, and
// Lighthouse charges any script that lands before its paint timestamps to FCP/LCP, whether
// or not it blocked anything (a rAF+setTimeout fires before the paint
// timestamp on large pages; a low-priority modulepreload is charged just the same). Chunks the
// blog shares with the homepage get a modulepreload in the shell, dropped here: the entry
// imports them itself
const entry = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!entry?.[1]) throw new Error("prerender: entry script not found in dist/blog/index.html")
template = template
	.replace(/<link rel="modulepreload"[^>]*>\s*/g, "")
	.replace(
		entry[0],
		`<script type="module">var h=function(){h=function(){};import("${entry[1]}")};var i=document.querySelector("img[fetchpriority=high]");var g=function(){if(i&&!i.complete){i.addEventListener("load",h);i.addEventListener("error",h)}else h()};if(PerformanceObserver.supportedEntryTypes.includes("paint")){new PerformanceObserver(g).observe({type:"paint",buffered:true});setTimeout(h,1500)}else g()</script>`,
	)

// Apply the stored theme vars before first paint so the prerendered markup never flashes Rose Pine
const themeScript =
	'<script>try{var v=localStorage.getItem("themeVars");if(v){v=JSON.parse(v);for(var k in v)document.documentElement.style.setProperty(k,v[k])}}catch(e){}</script>'
template = template.replace("</head>", `${themeScript}</head>`)

for (const route of routes) {
	const path = route === "/" ? BASE : `${BASE}${route}`
	const stream = await renderToReadableStream(
		<MemoryRouter basename={BASE} initialEntries={[path]}>
			<App />
		</MemoryRouter>,
	)
	await stream.allReady
	const html = await new Response(stream).text()
	const title = titles[route] ? `${titles[route]} | ${BASE_TITLE}` : BASE_TITLE
	// A small video poster becomes a data URI: it is that page's largest paint, so it should
	// need no request
	const inlined = html.replace(/poster="(\/images\/[^"]+)"/g, (m, src) => {
		const f = Bun.file(`${dist}${src}`)
		if (f.size > 16_000) return m
		return `poster="data:${f.type};base64,${Buffer.from(readFileSync(`${dist}${src}`)).toString("base64")}"`
	})
	// Posts and the about page are also written as Markdown (scripts/llms.ts): the page points
	// agents at it, and a post tells search engines what it is
	const slug = route.startsWith("/posts/") ? route.slice("/posts/".length) : null
	const post = slug ? posts[slug] : null
	const alternate =
		post || route === "/about"
			? `<link rel="alternate" type="text/markdown" href="${path}.md" />`
			: ""
	const article = post
		? `<script type="application/ld+json">${JSON.stringify({
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				headline: post.title,
				datePublished: post.date,
				url: `${ORIGIN}${path}`,
				author: { "@type": "Person", name: "Michel de Graaf", url: `${ORIGIN}${BASE}/about` },
				publisher: { "@type": "Organization", name: "re-invention", url: `${ORIGIN}/` },
			})}</script>`
		: ""
	const page = template
		.replace(marker, `<div id="root">${inlined}</div>`)
		.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
		.replace(`content="${ORIGIN}${BASE}"`, `content="${ORIGIN}${path}"`)
		.replace("</head>", `${alternate}${article}</head>`)
	// blog/about.html serves /blog/about on GitHub Pages without the trailing-slash redirect a
	// directory gets. The home page is written twice: Pages may serve blog.html for /blog or
	// redirect /blog to /blog/
	const outs = route === "/" ? [`${BASE}.html`, `${BASE}/index.html`] : [`${path}.html`]
	for (const out of outs) await Bun.write(`${dist}${out.slice(1)}`, page)
	console.log(`prerendered ${path} (${(html.length / 1024).toFixed(1)} kB)`)
}

// The sitemap lists the homepage and every blog page, so search engines find the new URLs
const urls = ["/", ...routes.map((route) => (route === "/" ? BASE : `${BASE}${route}`))]
await Bun.write(
	`${dist}sitemap.xml`,
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `<url><loc>${ORIGIN}${url}</loc></url>`).join("\n")}\n</urlset>\n`,
)

// Every page lived at the root before the blog moved under /blog. Each old URL keeps working
// through a stub that forwards with its query string and hash; contact is on the homepage now.
// The stubs stay indexable, so crawlers run the redirect and pass the old URLs' standing on.
// The meta refresh is the no-JS path only: next to the script it could win the race and drop
// the query string
const redirects: Record<string, string> = { "/contact": "/#contact" }
for (const route of Object.keys(titles)) redirects[route] ??= `${BASE}${route}`
for (const [from, to] of Object.entries(redirects)) {
	const { pathname, hash } = new URL(to, ORIGIN)
	const target = `${JSON.stringify(pathname)}+location.search+${hash ? JSON.stringify(hash) : "location.hash"}`
	await Bun.write(
		`${dist}${from.slice(1)}.html`,
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved to ${to}</title><link rel="canonical" href="${ORIGIN}${pathname}"><script>location.replace(${target})</script><noscript><meta http-equiv="refresh" content="0; url=${to}"></noscript></head><body><a href="${to}">${ORIGIN}${to}</a></body></html>\n`,
	)
	console.log(`redirect ${from} -> ${to}`)
}

// The homepage and the 404 page are static HTML: inline their stylesheet so the first paint
// needs only the HTML response and the preloaded font
for (const page of ["index.html", "404.html"]) {
	const html = await Bun.file(`${dist}${page}`).text()
	const link = html.match(/<link rel="stylesheet" crossorigin href="\/(assets\/[^"]+\.css)">/)
	if (!link?.[1]) throw new Error(`prerender: stylesheet link not found in dist/${page}`)
	const css = await Bun.file(`${dist}${link[1]}`).text()
	await Bun.write(`${dist}${page}`, html.replace(link[0], `<style>${css}</style>`))
	console.log(`inlined ${link[1]} into ${page} (${(css.length / 1024).toFixed(1)} kB)`)
}
