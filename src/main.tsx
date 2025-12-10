import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import { PostHogProvider } from "posthog-js/react"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<PostHogProvider
			apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
			options={{
				api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
				defaults: '2025-05-24',
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
