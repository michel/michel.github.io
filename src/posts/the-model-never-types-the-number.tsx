import { type ReactNode, useEffect, useState } from "react"

const CHART_W = 660

const FIELD_ACCURACY = [
	{ field: "fundName", pct: 100 },
	{ field: "periodDate", pct: 100 },
	{ field: "paidInCapital", pct: 100 },
	{ field: "recallableDistributions", pct: 100 },
	{ field: "unrealizedGains", pct: 100 },
	{ field: "realizedGains", pct: 100 },
	{ field: "navValue", pct: 100 },
	{ field: "commitment", pct: 100 },
	{ field: "ownershipPct", pct: 98.6 },
	{ field: "units", pct: 97.3 },
	{ field: "cashDistributions", pct: 90.4 },
	{ field: "investorName", pct: 87.7 },
	{ field: "gpName", pct: 83.6 },
]

const TRAJECTORY = [
	{ label: "start", pct: 40.2 },
	{ label: "it 1", pct: 58.6 },
	{ label: "it 2", pct: 65.9 },
	{ label: "it 3", pct: 78.4 },
	{ label: "it 5+6", pct: 92.7 },
	{ label: "it 8", pct: 97.2 },
	{ label: "blessed", pct: 98.1 },
]

const GP_WEAK_SPOTS = [
	{ label: "fund-level scalar fields", pct: 88.0 },
	{ label: "holdings table rows", pct: 46.6 },
	{ label: "fundStrategy", pct: 8.9 },
]

const Figure = ({ caption, children }: { caption: string; children: ReactNode }) => (
	<div className="flex flex-col gap-1 max-w-full py-1">
		<div className="rounded border border-border bg-bg-panel p-2 overflow-x-auto">{children}</div>
		<span className="text-comment text-sm">{`// ${caption}`}</span>
	</div>
)

const box = {
	fill: "var(--color-bg)",
	stroke: "var(--color-border)",
	strokeWidth: 1,
}
const stageText = { fill: "var(--color-cyan)", fontSize: 12, fontWeight: 700 }
const noteText = { fill: "var(--color-comment)", fontSize: 9 }
const arrow = { stroke: "var(--color-comment)", strokeWidth: 1.2 }

const STAGES = [
	{
		name: "parse",
		notes: ["docling +", "TableFormer"],
		status: "docling turns the PDF into a block graph: tables, rows, cells, bboxes",
	},
	{
		name: "classify",
		notes: ["rules first,", "LLM tie-break"],
		status: "rules score a layout fingerprint; the LLM only sees the ambiguous tail",
	},
	{
		name: "embed",
		notes: ["bge-m3 →", "pgvector"],
		status: "bge-m3 vectors into pgvector, for documents too big for one prompt",
	},
	{
		name: "extract",
		notes: ["1 LLM call,", "temp 0"],
		status: "one LLM call, temperature 0: block ids in, never a value out",
	},
	{
		name: "verify",
		notes: ["re-derive,", "no LLM"],
		status: "pure re-derivation rejects anything that fails to reproduce",
	},
	{
		name: "review",
		notes: ["human +", "bbox proof"],
		status: "a human confirms against the highlighted source pixels",
	},
]

const FULL_SEQ = [0, 1, 2, 3, 4, 5]
const SKIP_SEQ = [0, 1, 3, 4, 5]
const STAGE_W = 92
const STAGE_GAP = 20
const STAGE_X0 = 4
const stageCenter = (i: number) => STAGE_X0 + i * (STAGE_W + STAGE_GAP) + STAGE_W / 2

const PipelineDiagram = () => {
	const [step, setStep] = useState(0)
	const [skipCycle, setSkipCycle] = useState(false)
	const [playing, setPlaying] = useState(
		() =>
			!(
				typeof window !== "undefined" &&
				window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
			),
	)
	const seq = skipCycle ? SKIP_SEQ : FULL_SEQ
	const active = seq[Math.min(step, seq.length - 1)] ?? 0
	const skipping = skipCycle && active === 3

	useEffect(() => {
		if (!playing) return
		const t = setInterval(() => {
			setStep((s) => {
				if (s + 1 < seq.length) return s + 1
				setSkipCycle((c) => !c)
				return 0
			})
		}, 2000)
		return () => clearInterval(t)
	}, [playing, seq.length])

	const inspect = (i: number) => {
		setPlaying(false)
		setSkipCycle(false)
		setStep(i)
	}

	return (
		<svg
			viewBox={`0 0 ${CHART_W} 176`}
			width="100%"
			role="img"
			aria-label="Extraction pipeline animation: parse, classify, embed, extract, verify, review"
		>
			<defs>
				<marker
					id="arr"
					viewBox="0 0 8 8"
					refX="7"
					refY="4"
					markerWidth="6"
					markerHeight="6"
					orient="auto"
				>
					<path d="M0,0 L8,4 L0,8 z" fill="var(--color-comment)" />
				</marker>
				<marker
					id="arrY"
					viewBox="0 0 8 8"
					refX="7"
					refY="4"
					markerWidth="6"
					markerHeight="6"
					orient="auto"
				>
					<path d="M0,0 L8,4 L0,8 z" fill="var(--color-yellow)" />
				</marker>
			</defs>
			<path
				d={`M ${stageCenter(1)} 50 C ${STAGE_X0 + 1.9 * (STAGE_W + STAGE_GAP)} 8, ${STAGE_X0 + 2.6 * (STAGE_W + STAGE_GAP)} 8, ${stageCenter(3)} 50`}
				fill="none"
				style={{
					stroke: "var(--color-yellow)",
					strokeWidth: skipping ? 1.8 : 1,
					strokeDasharray: "4 3",
					opacity: skipping ? 1 : 0.45,
					transition: "opacity 0.4s, stroke-width 0.4s",
				}}
				markerEnd="url(#arrY)"
			/>
			<text
				x={STAGE_X0 + 2.5 * (STAGE_W + STAGE_GAP)}
				y={10}
				textAnchor="middle"
				style={{
					fill: "var(--color-yellow)",
					fontSize: 9,
					opacity: skipping ? 1 : 0.55,
					transition: "opacity 0.4s",
				}}
			>
				fits one prompt? skip embed + retrieval
			</text>
			{STAGES.map((s, i) => {
				const x = STAGE_X0 + i * (STAGE_W + STAGE_GAP)
				const isActive = i === active
				const dimmed = skipCycle && i === 2
				return (
					<g key={s.name} onClick={() => inspect(i)} style={{ cursor: "pointer" }}>
						<rect
							x={x}
							y={52}
							width={STAGE_W}
							height={32}
							rx={3}
							style={{
								fill: isActive ? "var(--color-bg-active)" : "var(--color-bg)",
								stroke: isActive ? "var(--color-pink)" : "var(--color-border)",
								strokeWidth: isActive ? 1.5 : 1,
								opacity: dimmed ? 0.4 : 1,
								transition: "stroke 0.4s, fill 0.4s, opacity 0.4s",
							}}
						/>
						<text
							x={x + STAGE_W / 2}
							y={72}
							textAnchor="middle"
							style={{ ...stageText, opacity: dimmed ? 0.4 : 1, transition: "opacity 0.4s" }}
						>
							{s.name}
						</text>
						{s.notes.map((n, j) => (
							<text
								key={n}
								x={x + STAGE_W / 2}
								y={100 + j * 12}
								textAnchor="middle"
								style={{
									fill: isActive ? "var(--color-fg)" : "var(--color-comment)",
									fontSize: 9,
									opacity: dimmed ? 0.4 : 1,
									transition: "fill 0.4s, opacity 0.4s",
								}}
							>
								{n}
							</text>
						))}
						{i < STAGES.length - 1 && (
							<line
								x1={x + STAGE_W + 3}
								y1={68}
								x2={x + STAGE_W + STAGE_GAP - 3}
								y2={68}
								style={arrow}
								markerEnd="url(#arr)"
							/>
						)}
					</g>
				)
			})}
			<g
				style={{
					transform: `translateX(${stageCenter(active)}px)`,
					transition: "transform 0.55s ease",
				}}
			>
				<circle cx={0} cy={44} r={5} style={{ fill: "var(--color-pink)" }}>
					<animate attributeName="opacity" values="1;0.55;1" dur="2s" repeatCount="indefinite" />
				</circle>
			</g>
			<text x={4} y={144} style={{ fill: "var(--color-fg)", fontSize: 10 }}>
				{skipping ? "→ fits one prompt: embed skipped, 100% recall" : `→ ${STAGES[active]?.status}`}
			</text>
			<text
				x={CHART_W - 4}
				y={144}
				textAnchor="end"
				onClick={() => setPlaying((p) => !p)}
				style={{ fill: "var(--color-cyan)", fontSize: 10, cursor: "pointer" }}
			>
				{playing ? "⏸ pause" : "▶ play"}
			</text>
			<text
				x={CHART_W / 2}
				y={168}
				textAnchor="middle"
				style={{ fill: "var(--color-pink)", fontSize: 10, fontWeight: 700 }}
			>
				block ids only — never values
			</text>
		</svg>
	)
}

const TrajectoryChart = () => {
	const px = 50
	const pw = CHART_W - px - 20
	const py = 24
	const ph = 150
	const x = (i: number) => px + (i / (TRAJECTORY.length - 1)) * pw
	const y = (v: number) => py + ph - (v / 100) * ph
	const path = TRAJECTORY.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.pct)}`).join(" ")
	return (
		<svg
			viewBox={`0 0 ${CHART_W} 224`}
			width="100%"
			role="img"
			aria-label="Accuracy trajectory from 40.2% to 98.1% over eight iterations"
		>
			{[0, 25, 50, 75, 100].map((g) => (
				<g key={g}>
					<line
						x1={px}
						y1={y(g)}
						x2={px + pw}
						y2={y(g)}
						style={{ stroke: "var(--color-border)", strokeWidth: g === 0 ? 1 : 0.5 }}
					/>
					<text x={px - 8} y={y(g) + 3} textAnchor="end" style={{ ...noteText, fontSize: 10 }}>
						{g}%
					</text>
				</g>
			))}
			<path d={path} fill="none" style={{ stroke: "var(--color-blue)", strokeWidth: 2 }} />
			{TRAJECTORY.map((p, i) => (
				<g key={p.label}>
					<circle
						cx={x(i)}
						cy={y(p.pct)}
						r={4}
						style={{ fill: "var(--color-blue)", stroke: "var(--color-bg-panel)", strokeWidth: 2 }}
					/>
					<text
						x={i === 0 ? x(i) + 8 : x(i)}
						y={y(p.pct) - 9}
						textAnchor={i === 0 ? "start" : "middle"}
						style={{ fill: "var(--color-fg)", fontSize: 10 }}
					>
						{p.pct}
					</text>
					<text x={x(i)} y={py + ph + 16} textAnchor="middle" style={{ ...noteText, fontSize: 10 }}>
						{p.label}
					</text>
				</g>
			))}
			<text x={px} y={py + ph + 34} style={noteText}>
				25-case dev set · iterations 4 and 7 sit in the gaps between points · blessed the next day
			</text>
		</svg>
	)
}

const Bars = ({
	data,
	height,
	ariaLabel,
}: {
	data: { field?: string; label?: string; pct: number }[]
	height: number
	ariaLabel: string
}) => {
	const labelW = 210
	const trackW = CHART_W - labelW - 60
	const rowH = 22
	return (
		<svg viewBox={`0 0 ${CHART_W} ${height}`} width="100%" role="img" aria-label={ariaLabel}>
			{data.map((d, i) => {
				const yTop = 8 + i * rowH
				const w = (d.pct / 100) * trackW
				return (
					<g key={d.field ?? d.label}>
						<text
							x={labelW - 8}
							y={yTop + 9}
							textAnchor="end"
							style={{ fill: "var(--color-fg)", fontSize: 11 }}
						>
							{d.field ?? d.label}
						</text>
						<rect
							x={labelW}
							y={yTop}
							width={trackW}
							height={10}
							rx={2}
							style={{ fill: "var(--color-black)" }}
						/>
						<rect
							x={labelW}
							y={yTop}
							width={Math.max(w, 2)}
							height={10}
							rx={2}
							style={{ fill: "var(--color-blue)" }}
						/>
						<text
							x={labelW + trackW + 8}
							y={yTop + 9}
							style={{ fill: "var(--color-comment)", fontSize: 11 }}
						>
							{d.pct}%
						</text>
					</g>
				)
			})}
		</svg>
	)
}

const chainBox = (x: number, y: number, w: number, label: string) => (
	<g key={label}>
		<rect x={x} y={y} width={w} height={30} rx={3} style={box} />
		<text
			x={x + w / 2}
			y={y + 19}
			textAnchor="middle"
			style={{ fill: "var(--color-fg)", fontSize: 11 }}
		>
			{label}
		</text>
	</g>
)

const SyntheticChain = () => (
	<svg
		viewBox={`0 0 ${CHART_W} 232`}
		width="100%"
		role="img"
		aria-label="Synthetic test data chain: real PDF, anonymized PDF, HTML template, seeded values, rendered PDF, bench case"
	>
		{chainBox(4, 20, 150, "real client PDF")}
		{chainBox(254, 20, 150, "anonymized PDF")}
		{chainBox(504, 20, 152, "HTML template")}
		<line x1={158} y1={35} x2={247} y2={35} style={arrow} markerEnd="url(#arrC)" />
		<text x={202} y={26} textAnchor="middle" style={noteText}>
			PyMuPDF redaction
		</text>
		<text x={202} y={62} textAnchor="middle" style={noteText}>
			LP-side only, in place
		</text>
		<line x1={408} y1={35} x2={497} y2={35} style={arrow} markerEnd="url(#arrC)" />
		<text x={452} y={26} textAnchor="middle" style={noteText}>
			Claude models layout
		</text>
		<text x={452} y={62} textAnchor="middle" style={noteText}>
			zero literal data
		</text>
		<path d="M 580 52 C 580 100, 80 70, 80 118" fill="none" style={arrow} markerEnd="url(#arrC)" />
		<text x={330} y={108} textAnchor="middle" style={noteText}>
			seeded RNG fills the tokens — values solve the roll-forward
		</text>
		{chainBox(4, 118, 150, "populated HTML")}
		{chainBox(254, 118, 150, "rendered PDF")}
		{chainBox(504, 118, 152, "bench case")}
		<line x1={158} y1={133} x2={247} y2={133} style={arrow} markerEnd="url(#arrC)" />
		<text x={202} y={124} textAnchor="middle" style={noteText}>
			headless Chrome
		</text>
		<line x1={408} y1={133} x2={497} y2={133} style={arrow} markerEnd="url(#arrC)" />
		<text x={452} y={124} textAnchor="middle" style={noteText}>
			docling self-check
		</text>
		<text x={452} y={160} textAnchor="middle" style={noteText}>
			every value must survive
		</text>
		<text x={330} y={196} textAnchor="middle" style={{ fill: "var(--color-yellow)", fontSize: 10 }}>
			8 axes × 30 templates → 164 cases (pairwise covering array)
		</text>
		<text
			x={330}
			y={216}
			textAnchor="middle"
			style={{ fill: "var(--color-pink)", fontSize: 10, fontWeight: 700 }}
		>
			truth first, layout second — the model never touches values
		</text>
		<defs>
			<marker
				id="arrC"
				viewBox="0 0 8 8"
				refX="7"
				refY="4"
				markerWidth="6"
				markerHeight="6"
				orient="auto"
			>
				<path d="M0,0 L8,4 L0,8 z" fill="var(--color-comment)" />
			</marker>
		</defs>
	</svg>
)

export const theModelNeverTypesTheNumber: { title: string; date: string; lines: ReactNode[] } = {
	title: "The Model Never Types the Number",
	date: "2026-08-31",
	lines: [
		<span key="fm1" className="text-comment">
			---
		</span>,
		<span key="fm2" className="text-comment">
			title: "The Model Never Types the Number"
		</span>,
		<span key="fm3" className="text-comment">
			date: "2026-08-31"
		</span>,
		<span key="fm4" className="text-comment">
			---
		</span>,
		"",
		<h1 key="title" className="text-pink font-bold text-xl">
			# The Model Never Types the Number
		</h1>,
		"",
		<span key="hook1">
			A year became a VERIFIED net IRR. A calendar year. Extracted as a percentage, stamped
			verified, stored. Every check passed, because every check trusted the extraction it was
			checking. <span className="text-green font-bold">Trust in the system lost.</span>
		</span>,
		"",
		<span key="hook2">
			Last time the failure was a VIN with a zero where an O should be. In{" "}
			<a href="/posts/llm-vs-ocr-document-extraction" className="text-blue hover:underline">
				that post
			</a>{" "}
			I split invoice extraction at <span className="text-blue font-bold">Revive Capital</span>{" "}
			between GPT and OCR: LLMs for meaning, deterministic tools for symbols. At{" "}
			<span className="text-blue font-bold">Peliqan</span>, where I'm now CTO, I took the same idea
			to its end state:{" "}
			<span className="text-green font-bold">the model never types the number</span>. It's an
			architecture, not a prompt instruction.
		</span>,
		"",
		<h3 key="docs" className="text-cyan font-bold">
			### The documents
		</h3>,
		"",
		<span key="d1">
			Peliqan is a private equity platform. Investors upload what their fund managers send them:
			capital account statements and GP quarterly reports. A capital account statement is a one-page
			roll-forward of an investor's position in a fund: beginning balance, contributions, fees,
			realized and unrealized gains, distributions, ending balance. A GP quarterly report is 15 to
			72 pages of cover art, disclaimers, commentary, KPI strips, and somewhere in there a portfolio
			table with one row per company. Positions get valued off these numbers. A wrong NAV is wrong
			money.
		</span>,
		"",
		<span key="d2">
			Every fund administrator has its own layout. Some are clean PDFs. Some are scans. Some are
			photos taken on a phone. The corpus spans English, Dutch, German and French, three currencies,
			and amounts at three scales (full precision, thousands, millions), announced by anything from
			a page header to a per-amount suffix like <span className="text-yellow">€m</span> or{" "}
			<span className="text-yellow">TEUR</span>.
		</span>,
		"",
		<span key="d3">
			Then the details start. <span className="text-yellow">1.234.567,89</span> and{" "}
			<span className="text-yellow">1,234,567.89</span> are the same number. So is{" "}
			<span className="text-yellow">1 234 567,89</span>, and the space might be a non-breaking
			space. Swiss statements use apostrophes. Negatives arrive as{" "}
			<span className="text-yellow">(1,234,567)</span>, as a leading minus, a trailing minus, or as
			U+2212 which is not a hyphen. Scale is announced as "amounts in thousands", or{" "}
			<span className="text-yellow">€000</span>, or <span className="text-yellow">'000</span>, or
			not at all because everyone in the industry apparently knows.
		</span>,
		"",
		<span key="d4">
			A model that emits values has to get all of this right, silently, every time, with no way for
			you to check. <span className="text-green font-bold">So it doesn't get to.</span>
		</span>,
		"",
		<h3 key="constraint" className="text-cyan font-bold">
			### The constraint
		</h3>,
		"",
		<span key="c1">
			The rule the whole system is built around:{" "}
			<span className="text-green font-bold">
				the model never types the number — it points at blocks
			</span>
			. Not "the prompt asks it not to." The tool schema physically cannot carry a value. The
			extraction call returns field keys mapped to block ids; for holdings tables, a table id and
			the column indexes to read. Never a value. Every persisted number, date, currency and string
			is derived by pure functions from the verbatim text of the selected block, then re-derived
			independently by a separate pass that rejects anything failing to reproduce.
		</span>,
		"",
		<span key="c2">
			Deterministic code does the rest. Scale and currency resolve by walking a hierarchy: cell,
			then row, then table, then page, then document. Unit counts only honor cell and row markers,
			because a document-level "amounts in thousands" scales money, not share counts. Percentages
			must anchor to the field's own label or abstain.{" "}
			<span className="text-green font-bold">
				The naive first-number fallback is how that year became a verified net IRR.
			</span>{" "}
			None of this is clever. All of it is testable, and none of it is a model output.
		</span>,
		"",
		<span key="c3">
			Three exceptions exist, each with a tripwire. Text fields can carry a quote, but the quote is
			a <span className="text-green font-bold">locator</span>: the persisted string is the slice cut
			out of the block's own text, so a model that "helpfully" fixes an OCR error (a real one:{" "}
			<span className="text-yellow">lnvestor</span>, lowercase L) fails to ground and falls back.
			Issuer brands can come from a logo image, but every word must be corroborated by an
			independent OCR read of the same region. Narrative sections are verbatim concatenations, and
			verification re-runs the concatenation and demands exact equality.
		</span>,
		"",
		<h3 key="pipeline" className="text-cyan font-bold">
			### The pipeline
		</h3>,
		"",
		<span key="p1">Five queue stages, each independently re-runnable:</span>,
		"",
		<Figure
			key="fig-pipeline"
			caption="the extraction pipeline — autoplays; click a stage to inspect it"
		>
			<PipelineDiagram />
		</Figure>,
		"",
		<span key="p2">
			<span className="text-blue font-bold">Parse.</span> The PDF goes to a Docling sidecar: layout
			detection plus TableFormer table structure, flattened into a block graph of tables, rows and
			cells, every block carrying a page number and bounding box. One thing Docling does that cost
			me a day: it detects picture regions and drops their text. That's exactly where a fund
			manager's wordmark lives, and on plenty of statements the logo is the only place the GP name
			appears. So there's a recovery path: picture regions get re-rendered at 3× and OCR'd
			separately, and those texts deliberately never enter the block graph. Only brand resolution
			reads them.
		</span>,
		"",
		<span key="p3">
			<span className="text-blue font-bold">Classify.</span> A layout fingerprint, then weighted
			rules. The LLM only sees the ambiguous tail. Code answers what code can answer.
		</span>,
		"",
		<span key="p4">
			<span className="text-blue font-bold">Embed and retrieve — or skip both.</span> If a document
			serializes small enough to fit one prompt, every block goes in, in document order, and
			retrieval plus the whole embed stage are skipped.{" "}
			<span className="text-green font-bold">
				100% recall removes the single largest source of misses.
			</span>{" "}
			Only oversized GP reports take the retrieval path: Postgres full-text search plus pgvector
			cosine over bge-m3 embeddings, merged with reciprocal rank fusion so the two score spaces
			never need normalizing.
		</span>,
		"",
		<span key="p5">
			<span className="text-blue font-bold">Extract.</span> One LLM call per document covering every
			field at once. Candidates overlap heavily, and seeing every field together is what lets the
			model tell a beginning balance from an ending one. Temperature 0, forced tool call.
		</span>,
		"",
		<span key="p6">
			<span className="text-blue font-bold">Verify.</span> A separate, pure re-derivation. Because
			it's pure, changing a validation rule can be replayed over every existing scan without paying
			for a single LLM call.
		</span>,
		"",
		<h3 key="trick" className="text-cyan font-bold">
			### The trick that mattered most
		</h3>,
		"",
		<span key="t1">Retrieval could not find the numbers.</span>,
		"",
		<span key="t2">
			Obvious in hindsight. A table cell containing{" "}
			<span className="text-yellow">1,234,567.89</span> has no lexical signal and no semantic
			signal. Nothing to match a query against. It will never rank. But it is exactly the block the
			evidence should point at.
		</span>,
		"",
		<span key="t3">
			The fix:{" "}
			<span className="text-green font-bold">
				let composite blocks do the ranking, then throw them away
			</span>
			. A table row reads as its cells concatenated, label included, so it matches beautifully.
			Before the candidates reach the model, every retrieved row is replaced by its child cells. The
			rows anchor retrieval; the cells receive the evidence. That change alone was worth +68
			percentage points on ending NAV and +48 on contributions.
		</span>,
		"",
		<span key="t4">
			There's a second reason composite blocks are withheld from the selector: their text is the
			label glued to the value. Bind evidence to one and you've fused "Ending Capital Balance" into
			the answer. I call it <span className="text-green font-bold">fused-row disease</span>:
			provenance-perfect and wrong, invisible to every other check. A verification rule exists
			specifically for it.
		</span>,
		"",
		<h3 key="synth" className="text-cyan font-bold">
			### The test data I'd actually recommend copying
		</h3>,
		"",
		<span key="s1">
			You cannot measure document extraction against real client documents without either
			hand-labeling hundreds of PDFs or shipping investor PII into your test fixtures. So the
			benchmark generates its own corpus, and the generation order is{" "}
			<span className="text-green font-bold">inverted from the obvious one</span>: truth first,
			layout second, and the model never touches values here either.
		</span>,
		"",
		<Figure key="fig-chain" caption="real layouts, synthetic values, zero client data in the repo">
			<SyntheticChain />
		</Figure>,
		"",
		<span key="s3">
			• <span className="text-blue font-bold">Anonymize first.</span> The templates are modeled on
			real documents that went through a redaction pass. Rule-based, no LLM: PyMuPDF redaction
			annotations replace text in place, preserving page geometry, fonts and table structure, which
			is what a document-AI dataset needs. Only the investor side is scrubbed: LP names and
			forty-odd spelling variants, addresses, IBANs, DocuSign envelope ids, even a "Downloaded by"
			watermark. Fund names and every amount stay, so the corpus keeps real financial arithmetic.
			There's a leak checker too: twenty-odd patterns, a generic IBAN catcher, a net for any run of
			ten or more digits. I haven't run it end to end yet, so "clean" is still an assumption, not a
			measurement. By the standards of the rest of this post, that means it isn't clean.
		</span>,
		"",
		<span key="s4">
			• <span className="text-blue font-bold">Truth first.</span> A seeded generator produces
			arithmetically consistent values. The roll-forward actually solves:{" "}
			<span className="text-yellow">
				beginning = ending − contributions − fees − realized − unrealized + distributions
			</span>
			. Money values are decimal strings, and at scaled variants they're whole multiples of the
			scale so the display string re-derives exactly.
		</span>,
		"",
		<span key="s5">
			• <span className="text-blue font-bold">Layout second.</span> Claude gets an anonymized
			statement and returns an HTML template where every value is a{" "}
			<span className="text-yellow">{"{{d.*}}"}</span> token. The system prompt is blunt: the
			template must contain zero literal data. Claude never sees a number it's allowed to keep.
		</span>,
		"",
		<span key="s6">
			• <span className="text-blue font-bold">Names from a grammar.</span> Fund, GP and investor
			names come from a compositional grammar (stem × strategy × vehicle × legal form, in four
			languages), so extraction can't be scored against a memorizable set. And 45% of the time the
			GP deliberately shares the fund's stem, because real managers brand funds after themselves and
			that's the confusable case that has to survive.
		</span>,
		"",
		<span key="s7">
			• <span className="text-blue font-bold">A covering array.</span> Eight axes (locale, currency,
			currency style, scale, value edge cases, fiscal convention, entity language, field sparsity),
			sampled pairwise across 30 templates: 164 cases, every two-way interaction present at a
			fraction of the full cross-product.
		</span>,
		"",
		<span key="s8">
			• <span className="text-blue font-bold">Render and self-check.</span> Headless Chrome prints
			the HTML. The resulting PDF goes back through the live parser and every displayed value must
			survive. A case that fails its own self-check never enters the dataset.
		</span>,
		"",
		<span key="s9">
			Every failure is then attributed to the stage that lost it: parsed? retrieved? selected?
			normalized? verified? The bucket where everything was present and the model pointed at the
			wrong column has its own name, <span className="text-yellow">wrong-evidence</span>, and it's
			the only one you can't fix with code. Two templates are permanent hold-outs: if a change helps
			everything else and regresses only those two, that's overfitting, not progress.
		</span>,
		"",
		<h3 key="numbers" className="text-cyan font-bold">
			### The numbers
		</h3>,
		"",
		<span key="n0" className="text-comment">
			Every number below is measured on synthetic documents: modeled on real anonymized statements,
			rendered through the real parser, scored through the real pipeline. There is no production
			accuracy figure yet, because producing one means hand-labeling real PDFs and nobody has done
			it.
		</span>,
		"",
		<span key="n1">
			Capital account statements, 74 cases:{" "}
			<span className="text-green font-bold">920 / 951 fields correct — 96.7%</span>.
		</span>,
		"",
		<Figure
			key="fig-fields"
			caption="per-field accuracy, capital account statements, blessed baseline (74 cases)"
		>
			<Bars
				data={FIELD_ACCURACY}
				height={300}
				ariaLabel="Per-field accuracy: eight fields at 100%, gpName lowest at 83.6%"
			/>
		</Figure>,
		"",
		<span key="n2">
			Getting there took eight iterations in a single day. These are the ones that moved the number:
		</span>,
		"",
		<Figure
			key="fig-trajectory"
			caption="accuracy per iteration — measure, fix the stage that lost it, measure again"
		>
			<TrajectoryChart />
		</Figure>,
		"",
		<span key="n3">
			Those iterations ran on a 25-case dev set. The 96.7% is the blessed baseline on the full
			74-case set, a different denominator; the two numbers aren't comparable.
		</span>,
		"",
		<span key="nk">
			This loop isn't mine. Karpathy's{" "}
			<a
				href="https://karpathy.github.io/2019/04/25/recipe/"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				training recipe
			</a>{" "}
			puts the eval skeleton before any modeling: "set up a full training + evaluation skeleton and
			gain trust in its correctness." His later framing is blunter: the advantage goes to whoever
			spins the data-engine loop fastest. His autoresearch experiment ships it as code, an agent
			iterating overnight against one frozen metric it is not allowed to edit.{" "}
			<span className="text-green font-bold">
				That's what the hold-out templates are: the part of the loop the loop can't touch.
			</span>
		</span>,
		"",
		<span key="n3b">Three findings from that day outlived both scores.</span>,
		"",
		<span key="n4">
			<span className="text-blue font-bold">Temperature 0.</span> The SDK default is 1.0 and I
			hadn't touched it. That was the source of ±1.5pp of run-to-run variance, which meant every
			regression investigation started with "is this real?" Evidence selection is classification.
			Classification doesn't want creativity. At temperature 0 the failures are{" "}
			<span className="text-green font-bold">stable and individually debuggable</span>.
		</span>,
		"",
		<span key="n5">
			<span className="text-blue font-bold">Iteration 3 wasn't a pipeline fix at all.</span> Three
			fields were stuck and I spent a while trying to fix retrieval. The actual problem: the
			generated templates had scattered value tokens under labels that didn't match them: a value
			under the wrong row header, or in a cell carrying no label at all. No human reader could have
			extracted those fields either. The cases were unsolvable and I was tuning against noise.{" "}
			<span className="text-green font-bold">
				If your benchmark can produce an impossible question, your accuracy number is partly
				measuring your test data.
			</span>
		</span>,
		"",
		<span key="n6">
			<span className="text-blue font-bold">A rule that felt obviously correct.</span> I built a
			label-support verification rule: only trust a value if its table header or row label matches
			the field's vocabulary. Measured, it cost{" "}
			<span className="text-green font-bold">12.2 percentage points</span>: fifty-two correct fields
			rejected for label phrasing outside the synonym list, while the one hallucination it was
			supposed to catch survived. Its table header legitimately says "Shares", a valid synonym for
			units. I reverted it. The temptation to keep a rule that feels right after it measures badly
			is real.
		</span>,
		"",
		<h3 key="loses" className="text-cyan font-bold">
			### Where it still loses
		</h3>,
		"",
		<span key="l1">
			GP quarterly reports are the honest part of this post. The blessed baseline is 54.0% overall
			across 58 cases, and that headline is misleading in both directions. Split it:
		</span>,
		"",
		<Figure
			key="fig-gp"
			caption="GP quarterly reports: the aggregate hides one good story and two bad ones"
		>
			<Bars
				data={GP_WEAK_SPOTS}
				height={80}
				ariaLabel="GP report accuracy: scalar fields 88%, holdings rows 46.6%, fundStrategy 8.9%"
			/>
		</Figure>,
		"",
		<span key="l2">
			Within the scalars, DPI, RVPI, net IRR and vintage year are at 100%. Then it falls off: called
			capital 73.7%, GP name 64.3%, and fundStrategy at{" "}
			<span className="text-green font-bold">8.9%</span>: five correct out of fifty-six. That field
			is a closed-set classification onto a strategy enum and it is simply not working. The holdings
			failures are overwhelmingly missing rather than wrong: 464 of 863 rows never extracted at all.
			That's the failure mode I'd choose if I had to choose, but it's still a failure.
		</span>,
		"",
		<span key="l3">
			Holdings extraction was at 94.4% when I built it, on an 18-case dataset. The comparable number
			today is 46.6%, on 58 cases. A different, much larger exam: not a regression, but not a solved
			problem either. I'd rather say that than quote the 94.4%.
		</span>,
		"",
		<span key="l4">
			And the field has moved while I built. Mistral's OCR now returns per-word confidence scores;
			mine has statuses, not numbers, so there's no threshold routing: Azure's docs show a 0.96
			field auto-posting while a 0.52 one goes to a human, and I can't do that. Reducto's Deep
			Extract re-checks its own output against the document until reconciliation passes; my verify
			pass rejects and stops. And the block-id contract is shaped like docling's output. Parsers
			disagree about bounding boxes and reading order on the same page, so swapping parsers is a
			migration, not a config change.
		</span>,
		"",
		<span key="l5">
			Two more shortcomings the benchmarks won't show. Rendered pages flatter every model: public
			leaderboards drop several points moving from clean digital renders to photographed documents,
			and my corpus is headless-Chrome renders, so{" "}
			<span className="text-green font-bold">my numbers are optimistic by construction</span>. And
			abstention has a cost nobody is counting. "Missing beats wrong" trades recall for precision,
			and nothing currently reports how often the pipeline leaves a field blank that a human could
			have filled.
		</span>,
		"",
		<h3 key="circle" className="text-cyan font-bold">
			### Full circle
		</h3>,
		"",
		<span key="fc1">
			The invoice post ended with a bet: use LLMs to generate vendor-specific extraction code, then
			run the generated code deterministically. Peliqan didn't go there; there are no per-fund
			generated extractors. One generic pipeline with a hard constraint beat N generated ones. But
			the bet paid out somewhere unexpected:{" "}
			<span className="text-green font-bold">the LLM generates the test corpus instead</span>.
			Templates modeled on real layouts, rendered deterministically, self-checked by the same parser
			that runs in production.
		</span>,
		"",
		<span key="fc2">
			At Revive, OCR read the symbol-critical fields and the LLM still touched values on the
			semantic side. At Peliqan,{" "}
			<span className="text-green font-bold">the LLM touches nothing. It points.</span> Every stored
			value carries a page, a bounding box, and the source text it came from, so the pixels behind
			every number are addressable; the review screen highlights them.
		</span>,
		"",
		<span key="fc3">
			The thing I'd tell 2024-me: the value of this architecture isn't accuracy. A good model with a
			good prompt gets close on the easy 90%. The value is that when it's wrong, you can tell. You
			can name the stage that lost it. You can fix that stage and measure the fix. Hallucinated
			numbers in a financial system aren't a quality problem, they're a trust problem, and you don't
			fix trust problems with a better prompt.
		</span>,
		"",
		<span key="coda" className="text-comment">
			Note: this article reflects Docling with RapidOCR and TableFormer, plus Claude Sonnet on AWS
			Bedrock, as of mid-2026. These tools evolve fast. The architecture is deliberately
			model-agnostic: swap the selector, keep the derivation.
		</span>,
		"",
		"",
		<span key="link">
			See the project:{" "}
			<a href="/projects?customer=peliqan" className="text-blue hover:underline">
				Peliqan on my projects page
			</a>
		</span>,
		"",
		<span key="tags" className="text-comment">
			#llm #ocr #documentai #privateequity #syntheticdata #benchmarks #evals #ai
		</span>,
	],
}
