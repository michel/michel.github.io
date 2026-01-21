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
				ui_host: "https://eu.posthog.com",
				defaults: "2025-05-24",
				capture_pageview: false, // Manual pageview tracking via usePostHogPageview
				capture_pageleave: true,
				capture_exceptions: true,
				session_recording: {
					maskAllInputs: false,
					maskInputFn: (text, element) => {
						const input = element as HTMLInputElement | null
						return input?.type === "password" || input?.autocomplete === "cc-number" ? "*".repeat(text.length) : text
					},
				},
				debug: import.meta.env.MODE === "development",
			}}
		>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</PostHogProvider>
	</StrictMode>,
)
