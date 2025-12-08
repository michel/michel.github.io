export default function Contact() {
	return (
		<div className="flex h-full flex-col items-center justify-center text-center">
			<pre className="mb-4 font-bold text-magenta">
				{`█▀▄ ██▀      █ █▄ █ █ █ ██▀ █▄ █ ▀█▀ █ █▀█ █▄ █
█▀▄ █▄▄  ▀▀  █ █ ▀█ ▀▄▀ █▄▄ █ ▀█  █  █ █▄█ █ ▀█`}
			</pre>
			<div className="border border-border p-4 text-left">
				<div>
					<span className="text-yellow">Email:</span> michel@re-invention.nl
				</div>
				<div>
					<span className="text-yellow">Phone:</span> +31 (0)6 36 42 74 07
				</div>
				<div>
					<span className="text-yellow">Web:</span> re-invention.nl
				</div>
				<br />
				<div>
					<span className="text-comment">-- Socials --</span>
				</div>
				<div>
					<span className="text-blue">Github:</span> github.com/michel
				</div>
				<div>
					<span className="text-blue">X.com:</span> @micheldegraaf
				</div>
			</div>
		</div>
	)
}
