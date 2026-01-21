import { Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import { EditorProvider } from "./context/EditorContext"
import { usePostHogPageview } from "./hooks/usePostHogPageview"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Home from "./pages/Home"
import Post from "./pages/Post"
import Projects from "./pages/Projects"

function PostHogPageviewTracker() {
	usePostHogPageview()
	return null
}

export default function App() {
	return (
		<EditorProvider>
			<PostHogPageviewTracker />
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="about" element={<About />} />
					<Route path="contact" element={<Contact />} />
					<Route path="projects" element={<Projects />} />
					<Route path="posts/:slug" element={<Post />} />
				</Route>
			</Routes>
		</EditorProvider>
	)
}
