import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import App from "../src/App"

const html = renderToString(
	<MemoryRouter initialEntries={["/"]}>
		<App />
	</MemoryRouter>,
)

const indexPath = new URL("../dist/index.html", import.meta.url).pathname
let page = await Bun.file(indexPath).text()
const marker = '<div id="root"></div>'
if (!page.includes(marker)) throw new Error("prerender: root marker not found in dist/index.html")
page = page.replace(marker, `<div id="root">${html}</div>`)

// Inline the stylesheet so first paint needs only the HTML response
const cssLink = page.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (cssLink?.[1]) {
	const css = await Bun.file(new URL(`../dist${cssLink[1]}`, import.meta.url).pathname).text()
	page = page.replace(cssLink[0], `<style>${css}</style>`)
}

// Apply the stored theme vars before first paint so the prerendered markup never flashes Rose Pine
const themeScript =
	'<script>try{var v=localStorage.getItem("themeVars");if(v){v=JSON.parse(v);for(var k in v)document.documentElement.style.setProperty(k,v[k])}}catch(e){}</script>'
page = page.replace("</head>", `${themeScript}</head>`)

await Bun.write(indexPath, page)
console.log(`prerendered / into dist/index.html (${(html.length / 1024).toFixed(1)} kB)`)
