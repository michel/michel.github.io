import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

// ASCII art easter egg for curious developers
console.log(
	`%c█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █   %c████%c████%c████%c████%c████%c████
%c█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█   %c████%c████%c████%c████%c████%c████
%cre-invention b.v.`,
	"color:#06b6d4",
	"color:#06b6d4",
	"color:#22c55e",
	"color:#eab308",
	"color:#ef4444",
	"color:#a855f7",
	"color:#3b82f6",
	"color:#06b6d4",
	"color:#06b6d4",
	"color:#22c55e",
	"color:#eab308",
	"color:#ef4444",
	"color:#a855f7",
	"color:#3b82f6",
	"color:#64748b",
)

const root = document.getElementById("root")!
const app = (
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
)

// Production index.html is prerendered (scripts/prerender.tsx); dev serves an empty root
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
