import { usePageTitle } from "../hooks/usePageTitle"

export default function Contact() {
	usePageTitle("Contact")
	return (
		<div className="flex h-full flex-col items-center justify-center text-center">
			<pre className="mb-4 font-bold text-magenta">
				{`█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █
█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█`}
			</pre>
			<div className="border border-border p-4 text-left font-mono">
				<div className="grid grid-cols-[auto_auto] gap-x-6">
					<span className="text-yellow">Re-invention B.V.</span>
					<span>
						<span className="text-cyan">➤</span>{" "}
						<a href="mailto:michel@re-invention.nl" className="underline hover:text-cyan">
							michel@re-invention.nl
						</a>
					</span>
					<span className="text-yellow">Irene Vorrinkplein 17</span>
					<span>
						<span className="text-cyan">⌂</span>{" "}
						<a
							href="https://re-invention.nl"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-cyan"
						>
							re-invention.nl
						</a>
					</span>
					<span className="text-yellow">1506WR Zaandam</span>
					<span>
						<span className="text-cyan">☏</span>{" "}
						<a href="tel:+31636427407" className="underline hover:text-cyan">
							+31 (0)6 36 42 74 07
						</a>
					</span>
					<span className="text-yellow">The Netherlands</span>
					<span>
						<span className="text-cyan">⊙</span>{" "}
						<span className="text-comment">83193499 / 862763617B01</span>
					</span>
				</div>
				<br />
				<div>
					<span className="text-comment">-- Socials --</span>
				</div>
				<div className="grid grid-cols-[auto_auto] gap-x-6">
					<span>
						<span className="text-blue">Github</span>
					</span>
					<a
						href="https://github.com/michel"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-cyan"
					>
						github.com/michel
					</a>
					<span>
						<span className="text-blue">X.com</span>
					</span>
					<a
						href="https://x.com/micheldegraaf"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-cyan"
					>
						@micheldegraaf
					</a>
					<span>
						<span className="text-blue">LinkedIn</span>
					</span>
					<a
						href="https://www.linkedin.com/in/micheldegraaf/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-cyan"
					>
						micheldegraaf
					</a>
					<span>
						<span className="text-blue">SoundCloud</span>
					</span>
					<a
						href="https://soundcloud.com/herrgraaf"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-cyan"
					>
						herrgraaf
					</a>
					<span>
						<span className="text-blue">Instagram</span>
					</span>
					<a
						href="https://www.instagram.com/herrgraaf/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-cyan"
					>
						@herrgraaf
					</a>
				</div>
			</div>
		</div>
	)
}
