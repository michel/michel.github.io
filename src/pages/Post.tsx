import { useParams } from "react-router-dom"
import Buffer from "../components/Buffer"
import { usePageTitle } from "../hooks/usePageTitle"
import { posts } from "../posts"

export default function Post() {
	const { slug } = useParams()
	const post = slug ? posts[slug] : null
	usePageTitle(post?.title)

	if (!post)
		return (
			<Buffer
				lines={[
					<span key="error" className="text-red">
						Error: Post not found
					</span>,
				]}
			/>
		)

	return <Buffer lines={post.lines} />
}
