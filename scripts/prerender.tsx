import { readFileSync } from "node:fs"
import { renderToReadableStream } from "react-dom/server.browser"
import { MemoryRouter } from "react-router-dom"
import App from "../src/App"
import { posts } from "../src/posts"

const BASE_TITLE = "michel@re-invention:~"
const titles: Record<string, string> = {
	"/about": "About",
	"/projects": "projects",
	"/contact": "Contact",
}
for (const [slug, post] of Object.entries(posts)) titles[`/posts/${slug}`] = post.title
const routes = ["/", ...Object.keys(titles)]

const dist = new URL("../dist/", import.meta.url).pathname
let template = await Bun.file(`${dist}index.html`).text()
const marker = '<div id="root"></div>'
if (!template.includes(marker))
	throw new Error("prerender: root marker not found in dist/index.html")

// Inline the stylesheet and the regular font so first paint needs only the HTML response.
// A preloaded font is render-blocking in Chrome (RenderBlockingFonts) and the fallback-to-
// webfont swap moved Speed Index around. Embedded bytes still decode asynchronously, so the
// face blocks (a few ms) rather than swaps: a swap re-wrapped text before first paint (CLS)
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (!cssLink?.[1]) throw new Error("prerender: stylesheet link not found in dist/index.html")
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
// timestamp on large pages; a low-priority modulepreload is charged just the same)
const entry = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!entry?.[1]) throw new Error("prerender: entry script not found in dist/index.html")
template = template.replace(
	entry[0],
	`<script type="module">var h=function(){h=function(){};import("${entry[1]}")};var i=document.querySelector("img[fetchpriority=high]");var g=function(){if(i&&!i.complete){i.addEventListener("load",h);i.addEventListener("error",h)}else h()};if(PerformanceObserver.supportedEntryTypes.includes("paint")){new PerformanceObserver(g).observe({type:"paint",buffered:true});setTimeout(h,1500)}else g()</script>`,
)

// Apply the stored theme vars before first paint so the prerendered markup never flashes Rose Pine
const themeScript =
	'<script>try{var v=localStorage.getItem("themeVars");if(v){v=JSON.parse(v);for(var k in v)document.documentElement.style.setProperty(k,v[k])}}catch(e){}</script>'
template = template.replace("</head>", `${themeScript}</head>`)

for (const route of routes) {
	const stream = await renderToReadableStream(
		<MemoryRouter initialEntries={[route]}>
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
	const page = template
		.replace(marker, `<div id="root">${inlined}</div>`)
		.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
		.replace('content="https://re-invention.nl/"', `content="https://re-invention.nl${route}"`)
	// about.html serves /about on GitHub Pages without the trailing-slash redirect a directory gets
	const out = route === "/" ? `${dist}index.html` : `${dist}${route.slice(1)}.html`
	await Bun.write(out, page)
	console.log(`prerendered ${route} (${(html.length / 1024).toFixed(1)} kB)`)
}
