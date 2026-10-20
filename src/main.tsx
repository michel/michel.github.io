import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./banner"
import "./index.css"

const root = document.getElementById("root")!
const app = (
	<StrictMode>
		<BrowserRouter basename="/blog">
			<App />
		</BrowserRouter>
	</StrictMode>
)

// Production blog pages are prerendered (scripts/prerender.tsx); dev serves an empty root
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
