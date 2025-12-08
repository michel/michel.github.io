import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { plugin as markdown } from "vite-plugin-markdown"

export default defineConfig({
	plugins: [react(), tailwindcss(), markdown({ mode: ["html"] })],
	base: "/",
})
