import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import { EditorProvider } from "./context/EditorContext"
import Home from "./pages/Home"

const About = lazy(() => import("./pages/About"))
const Contact = lazy(() => import("./pages/Contact"))
const Projects = lazy(() => import("./pages/Projects"))
const Post = lazy(() => import("./pages/Post"))

export default function App() {
	return (
		<EditorProvider>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route
						path="about"
						element={
							<Suspense fallback={null}>
								<About />
							</Suspense>
						}
					/>
					<Route
						path="contact"
						element={
							<Suspense fallback={null}>
								<Contact />
							</Suspense>
						}
					/>
					<Route
						path="projects"
						element={
							<Suspense fallback={null}>
								<Projects />
							</Suspense>
						}
					/>
					<Route
						path="posts/:slug"
						element={
							<Suspense fallback={null}>
								<Post />
							</Suspense>
						}
					/>
				</Route>
			</Routes>
		</EditorProvider>
	)
}
