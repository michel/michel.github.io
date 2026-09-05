import { type ReactNode, useEffect, useState } from "react"

const CHART_W = 660

const Figure = ({ caption, children }: { caption: string; children: ReactNode }) => {
	const [open, setOpen] = useState(false)
	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
		window.addEventListener("keydown", onKey)
		document.body.style.overflow = "hidden"
		return () => {
			window.removeEventListener("keydown", onKey)
			document.body.style.overflow = ""
		}
	}, [open])
	return (
		<div className="flex flex-col gap-1 max-w-full py-1">
			<div className="relative rounded border border-border bg-bg-panel p-2 overflow-x-auto">
				{children}
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="md:hidden absolute top-1 right-1 rounded border border-border bg-bg px-2 py-0.5 text-xs text-cyan"
					aria-label="Enlarge figure"
				>
					⤢ enlarge
				</button>
			</div>
			<span className="text-comment text-sm">{`// ${caption}`}</span>
			{open && (
				<div
					className="fixed inset-0 z-50 flex flex-col bg-bg"
					role="dialog"
					aria-modal="true"
					aria-label={caption}
				>
					<div className="flex items-center justify-between border-b border-border px-3 py-2 text-sm">
						<span className="text-comment">rotate your phone for the best view</span>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="text-cyan"
							aria-label="Close"
						>
							✕ close
						</button>
					</div>
					<div className="flex-1 overflow-auto p-2">
						<div style={{ minWidth: 700 }}>{children}</div>
					</div>
				</div>
			)}
		</div>
	)
}

const box = {
	fill: "var(--color-bg)",
	stroke: "var(--color-border)",
	strokeWidth: 1,
}
const stageText = { fill: "var(--color-cyan)", fontSize: 12, fontWeight: 700 }
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
			style={{ minWidth: 560 }}
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
				{skipping ? "→ fits one prompt: all parsed pieces included" : `→ ${STAGES[active]?.status}`}
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
		</svg>
	)
}

const PAGE_IMG = "/images/posts/ask-the-model-where-not-what-document-extraction/statement.webp"
const PAGE_TOP = 47.5
const IMG_W = 392
const PX = IMG_W / 612
const px = (x: number) => 4 + x * PX
const py = (y: number) => 4 + (y - PAGE_TOP) * PX

type Block = [
	id: string,
	kind: "H" | "P" | "T" | "C",
	x0: number,
	y0: number,
	x1: number,
	y1: number,
]
const BLOCKS: Block[] = [
	["b0", "H", 224, 102, 388, 108],
	["b1", "P", 223, 117, 389, 122],
	["b2", "P", 250, 147, 362, 151],
	["b3", "P", 51, 163, 371, 168],
	["b4", "T", 50, 184, 264, 223],
	["b6", "C", 51, 186, 102, 191],
	["b7", "C", 244, 186, 264, 191],
	["b9", "C", 51, 201, 107, 205],
	["b10", "C", 244, 201, 264, 205],
	["b12", "C", 51, 214, 144, 219],
	["b13", "C", 254, 214, 264, 219],
	["b14", "T", 50, 242, 563, 439],
	["b16", "C", 195, 244, 289, 249],
	["b17", "C", 329, 244, 410, 249],
	["b18", "C", 447, 244, 548, 249],
	["b20", "C", 55, 262, 169, 266],
	["b21", "C", 281, 262, 302, 266],
	["b22", "C", 408, 262, 430, 266],
	["b23", "C", 541, 262, 557, 266],
	["b25", "C", 55, 280, 114, 285],
	["b26", "C", 281, 280, 302, 285],
	["b27", "C", 408, 280, 430, 285],
	["b28", "C", 536, 280, 557, 285],
	["b30", "C", 55, 298, 118, 314],
	["b32", "C", 67, 328, 143, 332],
	["b33", "C", 280, 328, 302, 332],
	["b34", "C", 407, 328, 430, 332],
	["b35", "C", 535, 328, 557, 332],
	["b37", "C", 55, 346, 165, 362],
	["b38", "C", 286, 352, 302, 356],
	["b39", "C", 414, 352, 430, 356],
	["b40", "C", 541, 352, 557, 356],
	["b42", "C", 55, 376, 163, 392],
	["b43", "C", 291, 381, 302, 386],
	["b44", "C", 414, 381, 430, 386],
	["b45", "C", 541, 381, 557, 386],
	["b47", "C", 55, 405, 107, 410],
	["b48", "C", 285, 405, 302, 410],
	["b49", "C", 407, 405, 430, 410],
	["b50", "C", 535, 405, 557, 410],
	["b52", "C", 55, 424, 157, 429],
	["b53", "C", 281, 424, 302, 428],
	["b54", "C", 408, 424, 430, 428],
	["b55", "C", 536, 424, 557, 428],
]
const VALUE_BLOCK = "b53"
const SCALE_BLOCK = "b2"

type Tone = "fg" | "cyan" | "pink" | "yellow" | "green" | "comment"
type PanelLine = [text: string, tone?: Tone]
const WALK: { name: string; status: string; panel: PanelLine[] }[] = [
	{
		name: "page",
		status: "start with the document and the value you need",
		panel: [
			["Financial statement", "cyan"],
			["One page", "comment"],
			[""],
			["What we want", "comment"],
			["Closing investment value", "yellow"],
			["at the reporting date", "comment"],
		],
	},
	{
		name: "read",
		status: "read the page into pieces, each with a reference and a location",
		panel: [
			["57 pieces of the page", "cyan"],
			["b2   scale note: thousands"],
			["b14  investment table"],
			["b16  column heading"],
			["b52  closing balance label"],
			["b53  £544", "pink"],
			[""],
			["b53 is a reference to a cell,", "comment"],
			["so we can find it again.", "comment"],
		],
	},
	{
		name: "locate",
		status: "the model selects a source cell; it does not supply the final amount",
		panel: [
			["Ask the model to locate", "cyan"],
			["the closing value."],
			["Selected cell: b53", "pink"],
			[""],
			["Code reads its text: £544"],
			[""],
			["The reference leads back", "comment"],
			["to the highlighted cell.", "comment"],
		],
	},
	{
		name: "convert",
		status: "code reads £544 and applies the page's note: amounts in thousands",
		panel: [
			["Cell text: £544", "pink"],
			["Number:    544"],
			["Currency:  pounds"],
			["Check the scale note:"],
			["b2 says thousands → ×1,000", "yellow"],
			[""],
			["Result: £544,000", "green"],
		],
	},
	{
		name: "check",
		status: "repeating the conversion checks consistency, not whether the cell was right",
		panel: [
			["Read the cell and note again", "cyan"],
			["Result: £544,000"],
			["Stored: £544,000"],
			[""],
			["Same result ✓", "green"],
			["Conversion reproduced", "green"],
			[""],
			["Wrong cell still possible", "yellow"],
		],
	},
]

const PANEL_X = 408
const PANEL_LINE = 14.5
const panelY = (i: number) => 26 + i * PANEL_LINE
const mono = "ui-monospace, SFMono-Regular, Menlo, monospace"

const PointDontType = () => {
	const [step, setStep] = useState(0)
	const [playing, setPlaying] = useState(
		() =>
			!(
				typeof window !== "undefined" &&
				window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
			),
	)

	useEffect(() => {
		if (!playing) return
		const t = setInterval(() => setStep((s) => (s + 1) % WALK.length), 3200)
		return () => clearInterval(t)
	}, [playing])

	const inspect = (i: number) => {
		setPlaying(false)
		setStep(i)
	}
	const current = WALK[step] ?? { name: "", status: "", panel: [] }
	const blockTone = (id: string): Tone => {
		if (id === VALUE_BLOCK) return step === 4 ? "green" : step >= 2 ? "pink" : "cyan"
		if (id === SCALE_BLOCK && step === 3) return "yellow"
		return "cyan"
	}
	const focused = (id: string) =>
		step === 1 || id === VALUE_BLOCK || (step === 3 && id === SCALE_BLOCK)
	const labelled = (id: string) =>
		step === 1
			? id === "b2" || id === "b14" || id === "b53"
			: id === VALUE_BLOCK || (step === 3 && id === SCALE_BLOCK)
	const connector = (id: string, line: number, tone: Tone) => {
		const b = BLOCKS.find((x) => x[0] === id)
		if (!b) return null
		return (
			<line
				x1={px(b[4]) + 2}
				y1={py((b[3] + b[5]) / 2)}
				x2={PANEL_X}
				y2={panelY(line) - 3}
				style={{
					stroke: `var(--color-${tone})`,
					strokeWidth: 0.8,
					strokeDasharray: "3 2",
					opacity: 0.8,
				}}
			/>
		)
	}

	return (
		<svg
			viewBox="0 0 660 314"
			width="100%"
			style={{ minWidth: 560 }}
			role="group"
			aria-label="One field extracted end to end: page, parse into blocks, select a block id, derive the value, verify by re-derivation"
		>
			<style>
				{"@keyframes walkIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}"}
			</style>
			<image href={PAGE_IMG} x={4} y={4} width={IMG_W} height={IMG_W * (403.9 / 612)} />
			<rect
				x={4}
				y={4}
				width={IMG_W}
				height={IMG_W * (403.9 / 612)}
				fill="none"
				style={{ stroke: "var(--color-border)" }}
			/>
			{step >= 1 &&
				BLOCKS.map(([id, kind, x0, y0, x1, y1]) => {
					const tone = blockTone(id)
					const hot = id === VALUE_BLOCK || (step === 3 && id === SCALE_BLOCK)
					return (
						<g key={id}>
							<rect
								x={px(x0) - 1}
								y={py(y0) - 1.5}
								width={(x1 - x0) * PX + 2}
								height={(y1 - y0) * PX + 3}
								rx={1}
								fill={kind === "T" ? "none" : `var(--color-${tone})`}
								fillOpacity={0.14}
								style={{
									stroke: `var(--color-${tone})`,
									strokeWidth: hot && step >= 2 ? 1.4 : 0.6,
									opacity: focused(id) ? 1 : 0.18,
									transition: "opacity .4s, stroke .4s, fill .4s",
								}}
							/>
							{labelled(id) && (
								<text
									x={kind === "T" ? px(x0) + 2 : px(x1) + 3}
									y={kind === "T" ? py(y0) + 7 : py(y1)}
									style={{
										fill: `var(--color-${tone})`,
										fontSize: 7,
										fontFamily: mono,
										fontWeight: 700,
									}}
								>
									{id}
								</text>
							)}
						</g>
					)
				})}
			{step === 2 && connector(VALUE_BLOCK, 2, "pink")}
			{step === 3 && connector(VALUE_BLOCK, 0, "pink")}
			{step === 3 && connector(SCALE_BLOCK, 4, "yellow")}
			{step === 4 && connector(VALUE_BLOCK, 0, "green")}
			<rect x={PANEL_X} y={4} width={248} height={259} rx={3} style={box} />
			<g key={step} style={{ animation: "walkIn .35s ease-out" }}>
				{current.panel.map(([text, tone = "fg"], i) => (
					<text
						key={`${step}-${i}-${text}`}
						x={PANEL_X + 10}
						y={panelY(i)}
						xmlSpace="preserve"
						style={{ fill: `var(--color-${tone})`, fontSize: 10.5, fontFamily: mono }}
					>
						{text}
					</text>
				))}
			</g>
			{WALK.map((w, i) => {
				const x = 4 + i * 104
				const active = i === step
				return (
					<g
						key={w.name}
						role="button"
						tabIndex={0}
						aria-pressed={active}
						onClick={() => inspect(i)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") inspect(i)
						}}
						style={{ cursor: "pointer" }}
					>
						<rect
							x={x}
							y={274}
							width={98}
							height={18}
							rx={3}
							style={{
								fill: active ? "var(--color-bg-active)" : "var(--color-bg)",
								stroke: active ? "var(--color-pink)" : "var(--color-border)",
								strokeWidth: active ? 1.5 : 1,
								transition: "stroke .3s, fill .3s",
							}}
						/>
						<text x={x + 49} y={286} textAnchor="middle" style={{ ...stageText, fontSize: 10 }}>
							{i + 1} {w.name}
						</text>
					</g>
				)
			})}
			<text x={4} y={308} style={{ fill: "var(--color-fg)", fontSize: 10 }}>
				→ {current.status}
			</text>
			<text
				x={656}
				y={308}
				textAnchor="end"
				onClick={() => setPlaying((p) => !p)}
				style={{ fill: "var(--color-cyan)", fontSize: 10, cursor: "pointer" }}
			>
				{playing ? "⏸ pause" : "▶ play"}
			</text>
		</svg>
	)
}

const ptext = (x: number, y: number, lines: string[], tone: string) =>
	lines.map((l, i) => (
		<text
			key={l}
			x={x}
			y={y + 13 + i * 11}
			textAnchor="middle"
			style={{
				fill: i === 0 ? `var(--color-${tone})` : "var(--color-comment)",
				fontSize: i === 0 ? 10 : 8.5,
				fontWeight: i === 0 ? 700 : 400,
			}}
		>
			{l}
		</text>
	))

const pbox = (
	x: number,
	y: number,
	w: number,
	h: number,
	lines: string[],
	tone = "cyan",
	strong = false,
) => (
	<g key={`${x}-${y}`}>
		<rect
			x={x}
			y={y}
			width={w}
			height={h}
			rx={3}
			style={{ ...box, stroke: `var(--color-${tone})`, strokeWidth: strong ? 1.5 : 1 }}
		/>
		{ptext(x + w / 2, y, lines, tone)}
	</g>
)

const parrow = (x1: number, y1: number, x2: number, y2: number, tone = "comment") => (
	<line
		key={`${x1}-${y1}-${x2}-${y2}`}
		x1={x1}
		y1={y1}
		x2={x2}
		y2={y2}
		style={{ stroke: `var(--color-${tone})`, strokeWidth: 1.1 }}
		markerEnd="url(#parr)"
	/>
)

const ProvenanceChain = () => (
	<svg
		viewBox="0 0 660 232"
		width="100%"
		style={{ minWidth: 560 }}
		role="img"
		aria-label="Every stored value traces back to an audit event and, for extracted values, through the scan, the block and its bounding box to the document"
	>
		<defs>
			<marker
				id="parr"
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
		{pbox(4, 8, 148, 36, ["a person types it", "MANUAL · who · when"])}
		{pbox(4, 54, 148, 36, ["a file is imported", "IMPORT · job id"])}
		{pbox(4, 100, 148, 36, ["a document is read", "OCR · scan id"], "yellow")}
		{parrow(152, 26, 196, 66)}
		{parrow(152, 72, 196, 72)}
		{parrow(152, 118, 196, 78)}
		{pbox(196, 54, 160, 36, ["audit event", "who · source · correlation id"])}
		{parrow(356, 72, 372, 72)}
		{pbox(372, 54, 96, 36, ["field change", "old → new"])}
		{parrow(468, 72, 484, 72)}
		{pbox(484, 54, 172, 36, ["Position.navValue", "544,000 GBP"], "green", true)}
		<line
			x1={78}
			y1={136}
			x2={78}
			y2={160}
			style={{ stroke: "var(--color-yellow)", strokeWidth: 1, strokeDasharray: "3 2" }}
		/>
		{pbox(4, 160, 118, 40, ["document", "PDF · scan · photo"], "yellow")}
		{parrow(122, 180, 134, 180, "yellow")}
		{pbox(134, 160, 118, 40, ["scan", "schema key + version", "parser output kept"], "yellow")}
		{parrow(252, 180, 264, 180, "yellow")}
		{pbox(264, 160, 118, 40, ["block b53", "page 1 · bbox", '"£544"'], "yellow")}
		{parrow(382, 180, 394, 180, "yellow")}
		{pbox(394, 160, 134, 40, ["field navValue", "£544 → 544000 GBP", "VERIFIED"], "yellow")}
		{parrow(528, 180, 540, 180, "yellow")}
		{pbox(540, 160, 116, 40, ["application", "frozen once applied"], "yellow")}
		{parrow(598, 160, 572, 92, "yellow")}
		<text x={330} y={222} textAnchor="middle" style={{ fill: "var(--color-comment)", fontSize: 9 }}>
			any stored number opens the page it came from, with these pixels highlighted
		</text>
	</svg>
)

const WORDS: [number, number, number, number][] = [
	[235, 62, 410, 74],
	[224, 102, 267, 108],
	[270, 102, 322, 108],
	[326, 102, 388, 108],
	[223, 117, 237, 122],
	[239, 117, 252, 122],
	[254, 117, 279, 122],
	[282, 117, 307, 122],
	[310, 117, 351, 122],
	[354, 117, 366, 122],
	[369, 117, 389, 122],
	[250, 147, 284, 151],
	[286, 147, 292, 151],
	[294, 147, 331, 151],
	[333, 147, 340, 151],
	[342, 147, 362, 151],
	[51, 163, 74, 168],
	[77, 163, 116, 168],
	[119, 163, 169, 168],
	[171, 163, 192, 168],
	[194, 163, 200, 168],
	[203, 163, 248, 168],
	[250, 163, 265, 168],
	[267, 163, 302, 168],
	[304, 163, 333, 168],
	[336, 163, 371, 168],
	[51, 186, 102, 191],
	[244, 186, 264, 191],
	[51, 201, 79, 205],
	[82, 201, 107, 205],
	[244, 201, 264, 205],
	[51, 214, 90, 219],
	[93, 214, 144, 219],
	[254, 214, 264, 219],
	[195, 244, 227, 249],
	[230, 244, 238, 249],
	[240, 244, 260, 249],
	[263, 244, 289, 249],
	[329, 244, 348, 249],
	[351, 244, 359, 249],
	[361, 244, 381, 249],
	[384, 244, 410, 249],
	[447, 244, 485, 249],
	[488, 244, 496, 249],
	[499, 244, 519, 249],
	[521, 244, 548, 249],
	[55, 262, 93, 266],
	[95, 262, 125, 266],
	[128, 262, 169, 266],
	[281, 262, 302, 266],
	[408, 262, 430, 266],
	[541, 262, 557, 266],
	[55, 280, 85, 285],
	[87, 280, 114, 285],
	[281, 280, 302, 285],
	[408, 280, 430, 285],
	[536, 280, 557, 285],
	[55, 298, 70, 303],
	[72, 298, 118, 303],
	[55, 310, 111, 314],
	[67, 328, 122, 332],
	[125, 328, 143, 332],
	[280, 328, 302, 332],
	[407, 328, 430, 332],
	[535, 328, 557, 332],
	[55, 346, 70, 351],
	[72, 346, 106, 351],
	[108, 346, 152, 351],
	[155, 346, 165, 351],
	[55, 358, 106, 362],
	[286, 352, 302, 356],
	[414, 352, 430, 356],
	[541, 352, 557, 356],
	[55, 376, 70, 380],
	[72, 376, 116, 380],
	[119, 376, 163, 380],
	[55, 387, 66, 392],
	[68, 387, 119, 392],
	[291, 381, 302, 386],
	[414, 381, 430, 386],
	[541, 381, 557, 386],
	[55, 405, 107, 410],
	[285, 405, 302, 410],
	[407, 405, 430, 410],
	[535, 405, 557, 410],
	[55, 424, 93, 429],
	[95, 424, 125, 429],
	[128, 424, 157, 429],
	[281, 424, 302, 428],
	[408, 424, 430, 428],
	[536, 424, 557, 428],
	[51, 473, 65, 477],
	[67, 473, 98, 477],
	[100, 473, 123, 477],
	[125, 473, 161, 477],
	[163, 473, 169, 477],
	[172, 473, 184, 477],
	[186, 473, 207, 477],
	[209, 473, 215, 477],
	[217, 473, 255, 477],
]
const TABLE_ROWS: [id: string, row: number, x0: number, y0: number, x1: number, y1: number][] = [
	["b15", 0, 195, 244, 548, 249],
	["b19", 1, 55, 262, 557, 266],
	["b24", 2, 55, 280, 557, 285],
	["b29", 3, 55, 298, 118, 314],
	["b31", 4, 67, 328, 557, 332],
	["b36", 5, 55, 346, 557, 362],
	["b41", 6, 55, 376, 557, 392],
	["b46", 7, 55, 405, 557, 410],
	["b51", 8, 55, 424, 557, 429],
]
const LOGO_BOX = [197, 55, 411, 85] as const

const GRAPH_LEVELS: { name: string; status: string; panel: PanelLine[] }[] = [
	{
		name: "words",
		status: "the page starts as words, each with its position",
		panel: [
			["100 words on this page", "cyan"],
			["each one with its position"],
			[""],
			['"£544" sits at x 281, y 424', "cyan"],
			[""],
			["too small to point at on their own;", "comment"],
			["they give every piece its place.", "comment"],
		],
	},
	{
		name: "layout",
		status: "words become headings, paragraphs and tables; the logo is a picture",
		panel: [
			["the words, grouped into pieces", "cyan"],
			["1 heading"],
			["4 paragraphs"],
			["2 tables", "yellow"],
			[""],
			["the logo is a picture, not text;", "comment"],
			["the name in it is read separately.", "comment"],
		],
	},
	{
		name: "table",
		status: "each table is opened into rows and cells",
		panel: [
			["the big table, opened up", "yellow"],
			["9 rows × 4 columns = 32 cells"],
			[""],
			["row 9   Partner's capital, ending"],
			["  cell  £544", "pink"],
			[""],
			["a number is just the text in a cell.", "comment"],
		],
	},
	{
		name: "candidates",
		status: "the model may point at any heading, paragraph or cell",
		panel: [
			["what the model may point at", "cyan"],
			["43 pieces on this page:"],
			["headings, paragraphs and cells"],
			[""],
			["rows and tables are containers;", "comment"],
			["the model never points at those.", "comment"],
		],
	},
]

const graphRect = (
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	tone: string,
	extra: object = {},
) => (
	<rect
		x={px(x0) - 1}
		y={py(y0) - 1.5}
		width={(x1 - x0) * PX + 2}
		height={(y1 - y0) * PX + 3}
		rx={1}
		fill={`var(--color-${tone})`}
		fillOpacity={0.12}
		style={{ stroke: `var(--color-${tone})`, strokeWidth: 0.6, ...extra }}
	/>
)
const TABLE_FOCUS = new Set(["b16", "b17", "b18", "b52", "b53", "b54", "b55"])

const BlockGraph = () => {
	const [level, setLevel] = useState(0)
	const [playing, setPlaying] = useState(
		() =>
			!(
				typeof window !== "undefined" &&
				window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
			),
	)
	useEffect(() => {
		if (!playing) return
		const t = setInterval(() => setLevel((s) => (s + 1) % GRAPH_LEVELS.length), 3600)
		return () => clearInterval(t)
	}, [playing])
	const inspect = (i: number) => {
		setPlaying(false)
		setLevel(i)
	}
	const current = GRAPH_LEVELS[level] ?? { name: "", status: "", panel: [] }
	return (
		<svg
			viewBox="0 0 660 314"
			width="100%"
			style={{ minWidth: 560 }}
			role="group"
			aria-label="Docling's block graph for one statement: words, layout regions, table structure, and the blocks the LLM may select"
		>
			<image href={PAGE_IMG} x={4} y={4} width={IMG_W} height={IMG_W * (403.9 / 612)} />
			<rect
				x={4}
				y={4}
				width={IMG_W}
				height={IMG_W * (403.9 / 612)}
				fill="none"
				style={{ stroke: "var(--color-border)" }}
			/>
			{level === 0 &&
				WORDS.map(([x0, y0, x1, y1]) => (
					<g key={`${x0}-${y0}`}>{graphRect(x0, y0, x1, y1, "cyan")}</g>
				))}
			{level >= 1 && (
				<rect
					x={px(LOGO_BOX[0])}
					y={py(LOGO_BOX[1])}
					width={(LOGO_BOX[2] - LOGO_BOX[0]) * PX}
					height={(LOGO_BOX[3] - LOGO_BOX[1]) * PX}
					fill="none"
					style={{ stroke: "var(--color-comment)", strokeWidth: 0.8, strokeDasharray: "3 2" }}
				/>
			)}
			{level === 1 &&
				BLOCKS.filter(([, kind]) => kind !== "C").map(([id, kind, x0, y0, x1, y1]) => (
					<g key={id}>
						{graphRect(
							x0,
							y0,
							x1,
							y1,
							kind === "T" ? "yellow" : "cyan",
							kind === "T" ? { fill: "none" } : {},
						)}
						<text
							x={px(x1) + 3}
							y={py(y1)}
							style={{
								fill: kind === "T" ? "var(--color-yellow)" : "var(--color-cyan)",
								fontSize: 7,
								fontFamily: mono,
								fontWeight: 700,
							}}
						>
							{id}
						</text>
					</g>
				))}
			{level === 2 && (
				<g>
					{graphRect(50, 242, 563, 439, "yellow", { fill: "none" })}
					{TABLE_ROWS.map(([id, , x0, y0, x1, y1]) => (
						<g key={id}>
							{graphRect(
								x0,
								y0,
								x1,
								y1,
								id === "b15" || id === "b51" ? "cyan" : "comment",
								id === "b15" || id === "b51" ? {} : { strokeDasharray: "2 2" },
							)}
						</g>
					))}
					{BLOCKS.filter(([id]) => TABLE_FOCUS.has(id)).map(([id, , x0, y0, x1, y1]) => (
						<g key={id}>
							{graphRect(x0, y0, x1, y1, id === "b53" ? "pink" : "cyan", {
								strokeWidth: id === "b53" ? 1.4 : 0.8,
							})}
						</g>
					))}
				</g>
			)}
			{level === 3 &&
				BLOCKS.map(([id, kind, x0, y0, x1, y1]) => (
					<g key={id}>
						{graphRect(
							x0,
							y0,
							x1,
							y1,
							kind === "T" ? "comment" : "cyan",
							kind === "T" ? { fill: "none", strokeDasharray: "2 2" } : {},
						)}
					</g>
				))}
			<rect x={PANEL_X} y={4} width={248} height={259} rx={3} style={box} />
			<g key={level} style={{ animation: "walkIn .35s ease-out" }}>
				{current.panel.map(([text, tone = "fg"], i) => (
					<text
						key={`${level}-${i}-${text}`}
						x={PANEL_X + 10}
						y={panelY(i)}
						xmlSpace="preserve"
						style={{ fill: `var(--color-${tone})`, fontSize: 9.5, fontFamily: mono }}
					>
						{text}
					</text>
				))}
			</g>
			{GRAPH_LEVELS.map((w, i) => {
				const x = 4 + i * 130
				const active = i === level
				return (
					<g
						key={w.name}
						role="button"
						tabIndex={0}
						aria-pressed={active}
						onClick={() => inspect(i)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") inspect(i)
						}}
						style={{ cursor: "pointer" }}
					>
						<rect
							x={x}
							y={274}
							width={122}
							height={18}
							rx={3}
							style={{
								fill: active ? "var(--color-bg-active)" : "var(--color-bg)",
								stroke: active ? "var(--color-pink)" : "var(--color-border)",
								strokeWidth: active ? 1.5 : 1,
								transition: "stroke .3s, fill .3s",
							}}
						/>
						<text x={x + 61} y={286} textAnchor="middle" style={{ ...stageText, fontSize: 10 }}>
							{i + 1} {w.name}
						</text>
					</g>
				)
			})}
			<text x={4} y={308} style={{ fill: "var(--color-fg)", fontSize: 10 }}>
				→ {current.status}
			</text>
			<text
				x={656}
				y={308}
				textAnchor="end"
				onClick={() => setPlaying((p) => !p)}
				style={{ fill: "var(--color-cyan)", fontSize: 10, cursor: "pointer" }}
			>
				{playing ? "⏸ pause" : "▶ play"}
			</text>
		</svg>
	)
}

const tbox = (
	x: number,
	y: number,
	w: number,
	h: number,
	title: string,
	sub: string | null,
	tone = "cyan",
	strong = false,
) => (
	<g key={`${x}-${y}-${title}`}>
		<rect
			x={x}
			y={y}
			width={w}
			height={h}
			rx={3}
			style={{ ...box, stroke: `var(--color-${tone})`, strokeWidth: strong ? 1.5 : 1 }}
		/>
		<text
			x={x + 8}
			y={y + (sub ? 13 : h / 2 + 4)}
			style={{ fill: `var(--color-${tone})`, fontSize: 10, fontWeight: 700 }}
		>
			{title}
		</text>
		{sub && (
			<text
				x={x + 8}
				y={y + 25}
				style={{ fill: "var(--color-comment)", fontSize: 8.5, fontFamily: mono }}
			>
				{sub}
			</text>
		)}
	</g>
)
const elbow = (x1: number, y1: number, x2: number, y2: number, tone = "comment") => (
	<path
		key={`${x1}-${y1}-${x2}-${y2}`}
		d={`M ${x1} ${y1} H ${(x1 + x2) / 2} V ${y2} H ${x2}`}
		fill="none"
		style={{ stroke: `var(--color-${tone})`, strokeWidth: 1 }}
		markerEnd="url(#parr)"
	/>
)

const TreeExample = () => (
	<svg
		viewBox="0 0 660 236"
		width="100%"
		style={{ minWidth: 560 }}
		role="img"
		aria-label="Tree of pieces for one statement: page, then heading, paragraphs and a table; the table splits into rows and the ending row into cells; the model points at the cell holding £544"
	>
		{tbox(4, 96, 96, 32, "page 1", "612 × 792 pt")}
		{tbox(140, 8, 176, 32, "heading", "Capital Account Statement")}
		{tbox(140, 52, 176, 32, "paragraph", "(amounts in thousands of GBP)")}
		{tbox(140, 96, 176, 32, "paragraph", "Fund: … Investor: …")}
		{tbox(140, 140, 176, 32, "table", "9 rows × 4 columns", "yellow", true)}
		{tbox(140, 184, 176, 32, "paragraph", "… is unaudited.")}
		{elbow(100, 112, 140, 24)}
		{elbow(100, 112, 140, 68)}
		{elbow(100, 112, 140, 112)}
		{elbow(100, 112, 140, 156)}
		{elbow(100, 112, 140, 200)}
		{tbox(352, 96, 150, 32, "row 1 · headers", "Quarter · Year · Inception", "yellow")}
		<text x={360} y={150} style={{ fill: "var(--color-comment)", fontSize: 10 }}>
			… 7 more rows …
		</text>
		{tbox(352, 162, 150, 32, "row 9", "Partner's capital, ending", "yellow", true)}
		{elbow(316, 156, 352, 112, "yellow")}
		{elbow(316, 156, 352, 178, "yellow")}
		{tbox(528, 92, 128, 24, "cell · label", null, "comment")}
		{tbox(528, 122, 128, 34, "cell · £544", "the model points here", "pink", true)}
		{tbox(528, 162, 128, 24, "cell · £544", null, "comment")}
		{tbox(528, 192, 128, 24, "cell · £544", null, "comment")}
		{elbow(502, 178, 528, 104, "comment")}
		{elbow(502, 178, 528, 139, "pink")}
		{elbow(502, 178, 528, 174, "comment")}
		{elbow(502, 178, 528, 204, "comment")}
		<text x={330} y={230} textAnchor="middle" style={{ fill: "var(--color-comment)", fontSize: 9 }}>
			every piece carries its own position on the page; the model can point at any of them and
			cannot make a new one
		</text>
	</svg>
)

export const askTheModelWhereNotWhat: { title: string; date: string; lines: ReactNode[] } = {
	title: "Ask the Model Where, Not What",
	date: "2026-08-31",
	lines: [
		<span key="fm1" className="text-comment">
			---
		</span>,
		<span key="fm2" className="text-comment">
			title: "Ask the Model Where, Not What"
		</span>,
		<span key="fm3" className="text-comment">
			date: "2026-08-31"
		</span>,
		<span key="fm4" className="text-comment">
			---
		</span>,
		"",
		<h1 key="title" className="text-pink font-bold text-xl">
			# Ask the Model Where, Not What
		</h1>,
		"",
		<p key="hook">
			You can use AI to extract financial numbers without letting the model write the amount. That
			constraint is useful when a plausible but invented number could end up in someone's investment
			report. Even if newer models hallucinate less often, you still need to check the answer.
		</p>,
		"",
		<p key="idea">
			Give the model a different job: locate the value. Each piece of the document has a reference.
			The model selects one, then code reads the text and applies the currency and scale. Keep the
			source attached so a reviewer can inspect the choice. The model can still pick the wrong cell;
			this makes that choice traceable.
		</p>,
		"",
		<p key="history">
			I've been working on AI document extraction for a while. In 2016 I was writing extractors for
			travel voucher PDFs. More recently, I wrote about{" "}
			<a href="/posts/llm-vs-ocr-document-extraction" className="text-blue hover:underline">
				combining language models with text recognition for invoice validation
			</a>
			. Working on software for private equity has kept me thinking about the problem: the financial
			reports mix investment values with pages of commentary and notes. The example below follows a
			number through the design, including the checks it still needs.
		</p>,
		"",
		<h3 key="example" className="text-cyan font-bold">
			### How £544 becomes £544,000
		</h3>,
		"",
		<p key="document">
			The fictional financial statement below shows an investor's money in a fund: what they put in,
			what they received back and what their investment is worth at the reporting date. This kind of
			document is called a capital account statement.
		</p>,
		"",
		<p key="walkthrough">
			Suppose you want the closing value of the investment. The model selects the table cell
			containing <span className="text-yellow">£544</span>. Code reads those digits and checks the
			surrounding context. A note at the top says the amounts are in thousands of pounds, so the
			conversion is <span className="text-green">544 × 1,000 = £544,000</span>. Keep both the
			selected cell and the scale note with that result.
		</p>,
		"",
		<Figure
			key="fig-point"
			caption="follow one value through a fictional statement; click a step to pause and inspect it"
		>
			<PointDontType />
		</Figure>,
		"",
		<p key="constraint">
			The constraint matters. The model's answer can contain a reference to an existing piece of the
			document, but it has no field for a calculated amount. Code checks that the reference exists
			and reads the source text itself. In this design, you never accept a number just because the
			model wrote it in its answer.
		</p>,
		"",
		<h3 key="limits" className="text-cyan font-bold">
			### A source you can check
		</h3>,
		"",
		<p key="review">
			A reviewer can see £544,000 alongside the original page, with £544 and the scale note
			highlighted. If the value looks wrong, they have somewhere to start: did the model select the
			wrong cell, did text recognition misread a digit, or did the conversion apply the wrong scale?
			The same checks matter when one document uses 1.234,56 and another uses 1,234.56.
		</p>,
		"",
		<p key="verification">
			Reading the selected cell again can confirm that the conversion produces the same result. It
			cannot prove that the model selected the right cell. A beginning balance will still give you
			the wrong answer when you wanted the ending balance, however consistently the code reads it.
			Human review and testing against documents with known answers remain part of the job.
		</p>,
		"",
		<p key="research-summary">
			For long reports, first finding the relevant pages can also help. In a{" "}
			<a
				href="https://arxiv.org/abs/2604.26462"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				study of scanned financial documents
			</a>
			, researchers found that locating relevant pages before extraction accounted for the largest
			performance improvement in their experiments. That supports dividing the work into steps; it
			doesn't establish the accuracy of the design described here.
		</p>,
		"",
		<section key="technical" className="max-w-full">
			<h3 className="text-cyan font-bold">Technical details: the pipeline and tools</h3>
			<div className="flex flex-col gap-4 pt-4">
				<p>
					The following is one implementation option. The tools can change while the source
					references and conversion checks stay in place.
				</p>
				<p key="p1">
					One possible design has five processing stages, followed by human review where needed:
				</p>
				<Figure key="fig-pipeline" caption="the extraction pipeline">
					<PipelineDiagram />
				</Figure>
				<p key="p2">
					<span className="text-blue font-bold">1. Parse.</span> The PDF goes to{" "}
					<a
						href="https://github.com/docling-project/docling"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						Docling
					</a>
					, an open-source document parser, which finds the layout of each page and, with its{" "}
					<a
						href="https://arxiv.org/abs/2203.01017"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						TableFormer
					</a>{" "}
					model, table structure. Keep the text and coordinates together so later steps can refer
					back to the page. OCR and layout errors can still enter here; downstream checks need to
					account for them.
				</p>
				<p key="p2b">
					Everything the model gets to choose from is a tree of pieces cut from the page. At the top
					is the page. Under it are the headings, paragraphs and tables the page contains. Each
					table splits into its rows, and each row into its cells. A number on the page is not a
					thing of its own; it is simply the text inside one cell, like the £544 in the example
					below. The model can point at any piece but cannot make a new one. Docling's own name for
					this tree is the{" "}
					<a
						href="https://docling-project.github.io/docling/concepts/docling_document/"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						DoclingDocument
					</a>
					.
				</p>
				<Figure key="fig-tree" caption="the DoclingDocument tree">
					<TreeExample />
				</Figure>
				<Figure
					key="fig-graph"
					caption="the same tree, drawn on the page it came from. Autoplays; click a level."
				>
					<BlockGraph />
				</Figure>
				<p key="p3">
					<span className="text-blue font-bold">2. Classify.</span> This step decides what kind of
					document was uploaded, such as a quarterly fund report or an individual investor's
					statement, since each needs a different list of fields. You can start with rules that
					inspect titles, headings and table headers, then ask a model to resolve ambiguous cases.
				</p>
				<p key="p4">
					<span className="text-blue font-bold">3. Find relevant passages.</span> For long
					documents, first find the passages most likely to contain the answer. A two-page statement
					turns into a few dozen pieces; a sixty-page report turns into thousands. Thousands of
					candidates can make selection harder: more to read, more look-alike numbers, more chances
					to point at the wrong one. So for long reports you can first search for the pieces each
					field is likely to be in. One option is a keyword search in Postgres plus a meaning-based
					search (
					<a
						href="https://github.com/pgvector/pgvector"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						pgvector
					</a>{" "}
					over{" "}
					<a
						href="https://huggingface.co/BAAI/bge-m3"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						bge-m3
					</a>{" "}
					embeddings), merged with{" "}
					<a
						href="https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						reciprocal rank fusion
					</a>{" "}
					so the two rankings combine without their scores having to agree. A statement of a few
					pages has a few hundred pieces at most, which fits in a single request, so it skips this
					step entirely: every piece goes to the LLM, in page order.
				</p>
				<p key="p4b">
					This is the retrieval half of what is usually called{" "}
					<span className="text-green font-bold">RAG, retrieval-augmented generation</span>: find
					the parts of a document that matter and give the model only those. The one difference is
					that in RAG the model then writes an answer; here it only points. The search itself is
					simple. An embedding model, bge-m3, turns every piece of the document into a vector, a
					list of numbers that captures what the text means rather than which words it uses. Each
					field's description becomes a vector the same way, and the database returns the pieces
					closest to it. With pgvector, you can store those vectors alongside the text and page
					positions in Postgres.
				</p>
				<p key="p5">
					<span className="text-blue font-bold">4. Extract.</span> One call to the model per
					document, asking for the fields together. That gives the model context for distinguishing
					related figures, such as beginning and ending balances. The answer comes back as{" "}
					<span className="text-green font-bold">structured output</span>: a fixed form the model
					has to fill in rather than free text, and what that form holds is which piece holds each
					value.
				</p>
				<p key="p5b">
					You can define the requested fields in one list per document type. Each entry says what
					the field is, what kind of value it holds, whether it is required, and the words it is
					usually labelled with, in English, Dutch, German and French. The same entry can supply the
					search terms, the question to the model and the expected value type.
				</p>
				<p key="p6">
					<span className="text-blue font-bold">5. Verify.</span> In step 4 the model pointed at a
					cell for each field, and code read the value out of it. This step reads that same cell
					again, with deterministic code and no model involved, and checks that it gets the same
					value. If it does not, the field is rejected. This checks that the stored value follows
					from the selected cell and its scale and currency context. It does not establish that the
					model chose the right cell: if it points at a beginning balance instead of an ending
					balance, code can reproduce the wrong figure too.
				</p>
				<p key="p7">
					To evaluate this design, use labelled documents with known answers. Fictional statements
					let you vary layouts, currencies and scale notes while controlling the expected values.
					Hold out whole layout families from tuning, then check performance on representative real
					documents that you have permission to use. Score source selection and value conversion
					separately: a correct conversion cannot rescue a wrong cell. Report missing values and
					wrong values separately too, because they have different consequences for the reviewer.
				</p>

				<Figure
					key="fig-trace"
					caption="the trail behind one stored number; the bottom row exists only for extracted values"
				>
					<ProvenanceChain />
				</Figure>
			</div>
		</section>,
		"",
		<section key="research" className="max-w-full">
			<h3 className="text-cyan font-bold">Further reading: the research behind the approach</h3>
			<div className="flex flex-col gap-4 pt-4">
				<p key="c0">
					Language research has long split its methods into these two families. A generative model
					writes its answer as new text. An extractive model can only point at text that is already
					in the source; its answer is the position of that text. One neural mechanism for pointing
					is the{" "}
					<a
						href="https://arxiv.org/abs/1506.03134"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						pointer network
					</a>{" "}
					(2015), whose outputs are positions in its input rather than words of its own. The idea
					carries over to generative models: a{" "}
					<a
						href="https://arxiv.org/abs/2110.06393"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						2021 paper
					</a>{" "}
					gets hallucination-free answers out of a generative question-answering model by reading
					the answer span off the model's attention instead of trusting its written output. And a
					2026 document-parsing benchmark scores{" "}
					<a
						href="https://arxiv.org/abs/2604.08538"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						visual grounding
					</a>
					, whether a parser can connect what it produced back to the right region of the page. The
					design below uses explicit references to pieces of a page. It shares the idea of pointing
					to evidence, without using the same neural mechanism as those papers.
				</p>
				<p key="r0">
					It was published in April 2026 by the AI team at OCBC, one of the largest banks in
					South-East Asia:{" "}
					<a
						href="https://arxiv.org/abs/2604.26462"
						className="text-blue hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						A Multistage Extraction Pipeline for Long Scanned Financial Documents
					</a>{" "}
					The authors studied pulling structured data out of long, scanned financial documents in
					several languages. They found that breaking the job into stages, clean up the image, read
					the text, find the right pages, then extract, beats giving the whole document to a model
					in one go, by up to 31.9 percentage points. Finding the right pages first made the biggest
					difference in their evaluation. The design below uses a similar division of work, with an
					additional constraint: the model returns source references and code derives the values.
				</p>
			</div>
		</section>,
		"",
		<p key="ending">
			What I want from document extraction is a value I can investigate. With the page, the selected
			text and the conversion attached, a reviewer can check where a number came from and correct
			the step that went wrong. That makes the result more useful than an answer I have to take on
			trust.
		</p>,
		"",
		<span key="tags" className="text-comment">
			#ai #documentextraction #softwareengineering
		</span>,
	],
}
