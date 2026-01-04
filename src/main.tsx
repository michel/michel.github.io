import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import { PostHogProvider } from "posthog-js/react"

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

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<PostHogProvider
			apiKey="phc_Xiya7U8hHyMIzYg6YCQ8ZJEN3dnfCNTyIRJWr1mdO1J"
			options={{
				api_host: "https://eu.i.posthog.com",
				defaults: "2025-05-24",
				capture_exceptions: true,
				debug: import.meta.env.MODE === "development",
			}}
		>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</PostHogProvider>
	</StrictMode>,
)
