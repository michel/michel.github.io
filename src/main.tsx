import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import { PostHogProvider } from "posthog-js/react"

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
