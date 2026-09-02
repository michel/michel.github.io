import { type ReactNode, useEffect, useState } from "react"
import Lightbox from "../components/Lightbox"

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
		status: "a PDF arrives. No value will be returned from it, only a location.",
		panel: [
			["document.pdf", "cyan"],
			["1 page · 612 × 792 pt", "comment"],
			[""],
			["field wanted", "comment"],
			["navValue", "yellow"],
			["the ending capital balance", "comment"],
		],
	},
	{
		name: "parse",
		status: "docling turns the page into 57 blocks: an id, a type and a bounding box each",
		panel: [
			["57 blocks", "cyan"],
			["b2   P  (amounts in thousands…"],
			["b14  T  9 rows × 4 cols"],
			["b16  C  Quarter to Date (GBP)"],
			["b52  C  Partner's capital, end…"],
			["b53  C  £544", "pink"],
			["b54  C  £544"],
			["b55  C  £544"],
			["…", "comment"],
		],
	},
	{
		name: "select",
		status:
			"one forced tool call returns a pointer. The schema has no property that can hold a number.",
		panel: [
			["select_evidence({", "cyan"],
			['  field: "navValue",'],
			['  evidenceIds: ["b53"],', "pink"],
			['  quote: "£544",'],
			['  why: "…"'],
			["})", "cyan"],
			[""],
			["values emitted: 0", "comment"],
		],
	},
	{
		name: "derive",
		status:
			"pure functions read the block: digits, a scale walk (cell → row → table → page), currency",
		panel: [
			['b53.text     "£544"', "pink"],
			["digits       544"],
			["currency     £ → GBP"],
			["scale  cell ✗  row ✗  table ✗"],
			["       page  b2  ×1000", "yellow"],
			[""],
			["navValue     544000 GBP", "green"],
		],
	},
	{
		name: "verify",
		status: "a second pure pass re-derives from the same blocks. Fail to reproduce → REJECTED.",
		panel: [
			["re-derive(b53, b2)", "cyan"],
			["→ 544000 GBP"],
			["stored 544000 GBP"],
			[""],
			["equal ✓", "green"],
			["status  VERIFIED", "green"],
			[""],
			["mismatch → REJECTED", "comment"],
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

type FlowStep = { name: string; title: string; status: string; panel: PanelLine[] }
const RETRIEVAL_ROWS: PanelLine[] = [
	["rank  lex  sem   score  type  page  text", "comment"],
	["   1    1    1  0.0328  P       3  Internal Rate of Return (IRR) - The IRR…", "cyan"],
	["   3    -    2  0.0161  ROW    32  Multiples"],
	["   7  199    4  0.0156  CELL   32  Net IRR (%)   header"],
	["  13  200    7  0.0149  ROW    32  Net IRR (%) 18,9%", "yellow"],
	["  17    -    9  0.0145  CELL   32  18,9%", "pink"],
	[""],
	["lexical loves the glossary; semantic finds the table.", "comment"],
	["the cell ranks 17th, one past the cap of 16. its row (13th) expands to cells.", "comment"],
]
const JUDGE_ROWS: PanelLine[] = [
	['field  { key: "netIrr", required: false, quotable: true,', "cyan"],
	['         prompt: "Net IRR: Net internal rate of return to'],
	['         investors, after fees … Also appears labeled: net IRR, …" }'],
	['block  { id: "9e70…244e", page: 32, type: "TABLE_CELL",', "pink"],
	['         text: "18,9%",', "pink"],
	['         context: "section: 08 Cash flows & Net IRR >> column:', "yellow"],
	['                   Net IRR (%) >> Net IRR (%) 18,9%" }', "yellow"],
	["↓ select_evidence", "comment"],
	['{ field: "netIrr", evidenceIds: ["9e70…244e"], quote: "18,9%" }', "green"],
	["derive 18.9 PERCENT · verify VERIFIED", "green"],
]
const FIELD_FLOW: FlowStep[] = [
	{
		name: "definition",
		title: "gp-quarterly-report-fields.ts",
		status: "one entry in the schema. Nothing else in the pipeline knows this field by name.",
		panel: [
			["key        netIrr", "cyan"],
			["label      Net IRR"],
			["prompt     Net internal rate of return to investors,"],
			["           after fees and carried interest"],
			["valueType  PERCENT         required  false"],
			["synonyms   net IRR · net internal rate of return ·", "yellow"],
			["           netto IRR · Netto-IRR · TRI net", "yellow"],
			["appliesTo  FundQuarterlyReport.netIrr", "comment"],
		],
	},
	{
		name: "query",
		title: "fieldQueryText(field): one string, two legs",
		status:
			"label, prompt and synonyms become one string. bge-m3 embeds it once; Postgres splits it into OR-terms.",
		panel: [
			['"Net IRR. Net internal rate of return to investors,', "yellow"],
			[" after fees and carried interest. net IRR. net internal", "yellow"],
			[' rate of return. netto IRR. Netto-IRR. TRI net"', "yellow"],
			[""],
			["→ bge-m3        1024-d vector          semantic leg", "cyan"],
			["→ to_tsquery    34 OR-terms            lexical leg", "cyan"],
			["  net | irr | internal | rate | … | netto | tri", "comment"],
			["  + adjacent pairs: netirr | irrnet | carriedinterest …", "comment"],
		],
	},
	{
		name: "retrieve",
		title: "hybrid retrieval, 31-page GP report, 2,684 blocks",
		status:
			"fused by reciprocal rank, 1/(60+r) per leg. Top 16 per field survive, then rows expand to cells.",
		panel: RETRIEVAL_ROWS,
	},
	{
		name: "LLM",
		title: "what the LLM receives, and the only shape it may answer in",
		status:
			"the field spec and the candidates, both JSON. The legal answer is block ids and a verbatim quote.",
		panel: JUDGE_ROWS,
	},
]

const FLOW_NODES = ["definition", "query", "retrieve", "LLM"]
const FLOW_W = 148
const FLOW_GAP = 18
const flowX = (i: number) => 4 + i * (FLOW_W + FLOW_GAP)

const FieldToJudge = () => {
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
		const t = setInterval(() => setStep((s) => (s + 1) % FIELD_FLOW.length), 3800)
		return () => clearInterval(t)
	}, [playing])
	const inspect = (i: number) => {
		setPlaying(false)
		setStep(i)
	}
	const current = FIELD_FLOW[step] ?? { name: "", title: "", status: "", panel: [] }
	return (
		<svg
			viewBox="0 0 660 304"
			width="100%"
			style={{ minWidth: 560 }}
			role="group"
			aria-label="One field definition flowing through query building, hybrid retrieval, and the LLM call"
		>
			{FLOW_NODES.map((name, i) => {
				const active = i === step
				return (
					<g
						key={name}
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
							x={flowX(i)}
							y={6}
							width={FLOW_W}
							height={26}
							rx={3}
							style={{
								fill: active ? "var(--color-bg-active)" : "var(--color-bg)",
								stroke: active ? "var(--color-pink)" : "var(--color-border)",
								strokeWidth: active ? 1.5 : 1,
								transition: "stroke .3s, fill .3s",
							}}
						/>
						<text
							x={flowX(i) + FLOW_W / 2}
							y={23}
							textAnchor="middle"
							style={{ ...stageText, fontSize: 11 }}
						>
							{i + 1} {name}
						</text>
						{i < FLOW_NODES.length - 1 && (
							<line
								x1={flowX(i) + FLOW_W + 3}
								y1={19}
								x2={flowX(i) + FLOW_W + FLOW_GAP - 3}
								y2={19}
								style={arrow}
								markerEnd="url(#parr)"
							/>
						)}
					</g>
				)
			})}
			<rect x={4} y={44} width={652} height={222} rx={3} style={box} />
			<g key={step} style={{ animation: "walkIn .35s ease-out" }}>
				<text
					x={14}
					y={60}
					style={{ fill: "var(--color-comment)", fontSize: 9.5, fontFamily: mono }}
				>
					{current.title}
				</text>
				{current.panel.map(([text, tone = "fg"], i) => (
					<text
						key={`${step}-${i}-${text}`}
						x={14}
						y={78 + i * 14.5}
						xmlSpace="preserve"
						style={{ fill: `var(--color-${tone})`, fontSize: 10.5, fontFamily: mono }}
					>
						{text}
					</text>
				))}
			</g>
			<text x={4} y={288} style={{ fill: "var(--color-fg)", fontSize: 10 }}>
				→ {current.status}
			</text>
			<text
				x={656}
				y={288}
				textAnchor="end"
				onClick={() => setPlaying((p) => !p)}
				style={{ fill: "var(--color-cyan)", fontSize: 10, cursor: "pointer" }}
			>
				{playing ? "⏸ pause" : "▶ play"}
			</text>
		</svg>
	)
}

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
	title: "Ask the Model Where, Not What: Extractive Document AI",
	date: "2026-08-31",
	lines: [
		<span key="fm1" className="text-comment">
			---
		</span>,
		<span key="fm2" className="text-comment">
			title: "Ask the Model Where, Not What: Extractive Document AI"
		</span>,
		<span key="fm3" className="text-comment">
			date: "2026-08-31"
		</span>,
		<span key="fm4" className="text-comment">
			---
		</span>,
		"",
		<h1 key="title" className="text-pink font-bold text-xl">
			# Ask the Model Where, Not What: Extractive Document AI
		</h1>,
		"",
		<span key="hook1">
			A quarterly report from a private equity fund runs to sixty pages, arrives in Dutch, and
			somewhere around page forty holds the one number that decides what an investor's position is
			worth. You have probably dropped a PDF into ChatGPT or Claude, asked it a question and got a
			good answer, so how hard can it be? Not hard, most of the time. But now and then the model
			makes the number up, or hallucinates an extra zero. With financial documents a wrong number is
			worse than no number. What you want is trust: every number traceable to where it came from,
			and a system that says "not sure" instead of guessing.
		</span>,
		"",
		<span key="hook1b">
			That is why the system in this post never asks the model for a number. The document is first
			cut into small pieces, every heading, paragraph and table cell, each with its position on the
			page. The model is asked only which piece holds the value we want, and it answers by pointing
			at one. In the AI field this is a form of what is called{" "}
			<span className="text-green font-bold">grounding</span>: an answer tied to something you can
			check, here a specific spot on a specific page. Ordinary code then reads the number out of
			that piece, and a second check reads it again to make sure it gets the same result. The whole
			approach is called{" "}
			<span className="text-green font-bold">extractive rather than generative</span>: the model can
			only choose from what is on the page, so it has nowhere to put an extra zero.
		</span>,
		"",
		<span key="hook2">
			In{" "}
			<a href="/posts/llm-vs-ocr-document-extraction" className="text-blue hover:underline">
				an earlier post
			</a>{" "}
			I described how we extracted data from invoices at{" "}
			<span className="text-blue font-bold">Revive Capital</span>: a language model for the parts
			that need understanding, plain text recognition for the parts that need exact characters.
			There the model produced the values itself. This post is about the next version of that idea,
			built at{" "}
			<a
				href="https://peliqan.eu/"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				PELIQAN
			</a>
			, where I am now CTO. Here the model never returns a value, only where the value is.
		</span>,
		"",
		<h3 key="docs" className="text-cyan font-bold">
			### The documents
		</h3>,
		"",
		<span key="d1">
			PELIQAN is a platform for private equity investors. Every quarter their fund managers send
			them two kinds of document. A capital account statement is a page or two reporting one
			investor's position in one fund. A quarterly report from the GP, the general partner who
			manages the fund, runs past sixty pages of commentary, disclaimers and rows of headline
			metrics, with a portfolio table somewhere inside. They come as clean PDFs, as scans, and as
			iPhone photos; in English, Dutch, German and French; in every layout a fund administrator can
			invent. And every new investor brings fund managers we have never seen, so the extraction has
			to work on layouts it has never met, from the first document on. Building a template per fund
			manager is not an option. <span className="text-yellow">1.234.567,89</span> and{" "}
			<span className="text-yellow">1,234,567.89</span> are the same number, and "amounts in
			thousands" is stated once on page one or not at all. An investor's holdings are valued from
			these numbers. Get one wrong and the investor sees a wrong portfolio value, and once that has
			happened they stop trusting every other number on the screen.
		</span>,
		"",
		<h3 key="trace" className="text-cyan font-bold">
			### Every value has a source
		</h3>,
		"",
		<span key="t1">
			One of PELIQAN's system design principles, and one any proper financial system should hold to,
			is that{" "}
			<span className="text-green font-bold">
				any number you see, you can ask where it came from, and get an answer
			</span>
			. If someone typed it, you see who and when. If it arrived through an import, you see which
			one. If it was read from a document, you can open that document and see the exact spot on the
			page it was read from, the text as it was printed there, and what the system made of it.
		</span>,
		"",
		<Figure
			key="fig-trace"
			caption="the trail behind one stored number; the bottom row exists only for extracted values"
		>
			<ProvenanceChain />
		</Figure>,
		"",
		<span key="t1b">
			In the PELIQAN platform that means every field read from a document is traced back to the
			coordinates in the uploaded PDF, as the screenshot of the PDF review screen below shows: the
			value on the right, the spot it was read from highlighted on the page, and the printed text
			quoted under it. The screen only opens when there is something to review, a required field the
			pipeline could not find or a value its own checks rejected; the person confirms or corrects
			those, and everything that verified cleanly goes through on its own. You can click through it
			yourself in the{" "}
			<a
				href="https://app.staging.peliqan.eu/demo"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				PELIQAN demo
			</a>
			.
		</span>,
		"",
		<div key="fig-review" className="max-w-full py-1">
			<Lightbox
				src="/images/posts/ask-the-model-where-not-what-document-extraction/review-screen.webp"
				alt="PELIQAN review screen: a capital account statement on the left with the commitment cell highlighted, and on the right the extracted Commitment field showing 5,000,000 with the quoted source text and page number"
				width={1500}
				height={1158}
			/>
		</div>,
		"",
		<h3 key="constraint" className="text-cyan font-bold">
			### Extractive, not generative
		</h3>,
		"",
		<span key="c0">
			Language research has long split its methods into these two families. A generative model
			writes its answer as new text. An extractive model can only point at text that is already in
			the source; its answer is the position of that text. One neural mechanism for pointing is the{" "}
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
			gets hallucination-free answers out of a generative question-answering model by reading the
			answer span off the model's attention instead of trusting its written output. And a 2026
			document-parsing benchmark scores{" "}
			<a
				href="https://arxiv.org/abs/2604.08538"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				visual grounding
			</a>
			, whether a parser can connect what it produced back to the right region of the page.
			PELIQAN's pipeline applies the same idea to a whole extraction system, with the pointer aimed
			at a piece of the page.
		</span>,
		"",
		<span key="c1">
			The rule is enforced by the form the model must answer through, which has no field for an
			answer of its own: it holds the ids of pieces, and at most a verbatim copy of what is printed
			there, which code checks against the piece before anything is used.
		</span>,
		"",
		<Figure
			key="fig-point"
			caption="one field, end to end, on a synthetic statement; every step shown is real pipeline output. Autoplays; click a step."
		>
			<PointDontType />
		</Figure>,
		"",
		<h3 key="research" className="text-cyan font-bold">
			### Built on research, tuned to our documents
		</h3>,
		"",
		<span key="r-1">
			There is no shortage of tools for this, open-source and commercial, and some are good. I still
			built our own, for two reasons. These documents hold investors' financial positions, so I
			wanted every step to run inside our own cloud environment, with no document sent to an outside
			extraction service. And I wanted to understand the problem well enough to know where each
			approach fails, which meant reading the research rather than the feature lists. The setup that
			came out of it rests on recent computer-science research, and on one paper in particular.
		</span>,
		"",
		<span key="r0">
			It was published in April 2026 by the AI team at OCBC, one of the largest banks in South-East
			Asia:{" "}
			<a
				href="https://arxiv.org/abs/2604.26462"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				A Multistage Extraction Pipeline for Long Scanned Financial Documents
			</a>{" "}
			(Han, Zhang, Wang, Jin, Ke and Zhao). Their problem was close to ours: pulling structured data
			out of long, scanned financial documents in several languages. They found that breaking the
			job into stages, clean up the image, read the text, find the right pages, then extract, beats
			giving the whole document to a model in one go, by up to 31.9 percentage points. Finding the
			right pages first made the biggest difference. I took that shape, tuned it to capital account
			statements and GP reports, and added the rule above: the model points, code reads.
		</span>,
		"",
		<h3 key="pipeline" className="text-cyan font-bold">
			### The pipeline
		</h3>,
		"",
		<span key="p1">Five stages, each of which can be re-run on its own:</span>,
		"",
		<Figure key="fig-pipeline" caption="the extraction pipeline">
			<PipelineDiagram />
		</Figure>,
		"",
		<span key="p2">
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
			model, the structure of every table. One thing cost me a day. By default Docling treats logos
			as pictures and drops their text, and on plenty of statements the logo is the only place the
			fund manager's name appears. So logos are read separately, at higher resolution, and that text
			is kept outside the tree where only the brand lookup can see it.
		</span>,
		"",
		<span key="p2b">
			Everything the model gets to choose from is a tree of pieces cut from the page. At the top is
			the page. Under it are the headings, paragraphs and tables the page contains. Each table
			splits into its rows, and each row into its cells. A number on the page is not a thing of its
			own; it is simply the text inside one cell, like the £544 in the example below. The model can
			point at any piece but cannot make a new one. Docling's own name for this tree is the{" "}
			<a
				href="https://docling-project.github.io/docling/concepts/docling_document/"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				DoclingDocument
			</a>
			.
		</span>,
		"",
		<Figure key="fig-tree" caption="the DoclingDocument tree">
			<TreeExample />
		</Figure>,
		"",
		<Figure
			key="fig-graph"
			caption="the same tree, drawn on the page it came from. Autoplays; click a level."
		>
			<BlockGraph />
		</Figure>,
		"",
		<span key="p3">
			<span className="text-blue font-bold">2. Classify.</span> This step decides what kind of
			document was uploaded, in our case a GP quarterly report or a capital account statement, since
			each has its own list of fields to extract. It works from a fingerprint of the layout (title,
			headings, table headers) and a set of weighted rules. The model is only asked about the cases
			the rules can't settle. Code answers what code can answer.
		</span>,
		"",
		<span key="p4">
			<span className="text-blue font-bold">3. Embed and retrieve, or skip both.</span> This step
			exists because of big documents. A two-page statement turns into a few dozen pieces; a
			sixty-page report turns into thousands. An LLM handed thousands of candidates does worse: more
			to read, more look-alike numbers, more chances to point at the wrong one. So for long reports
			the pipeline first searches for the pieces each field is likely to be in: a keyword search in
			Postgres plus a meaning-based search (
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
			so the two rankings combine without their scores having to agree. A statement of a few pages
			has a few hundred pieces at most, which fits in a single request, so it skips this step
			entirely: every piece goes to the LLM, in page order.
		</span>,
		"",
		<span key="p4b">
			This is the retrieval half of what is usually called{" "}
			<span className="text-green font-bold">RAG, retrieval-augmented generation</span>: find the
			parts of a document that matter and give the model only those. The one difference is that in
			RAG the model then writes an answer; here it only points. The search itself is simple. An
			embedding model, bge-m3, turns every piece of the document into a vector, a list of numbers
			that captures what the text means rather than which words it uses. Each field's description
			becomes a vector the same way, and the database returns the pieces closest to it. We keep
			those vectors in the Postgres database we already have, next to the text and page positions,
			so the search is a single query.
		</span>,
		"",
		<span key="p5">
			<span className="text-blue font-bold">4. Extract.</span> One call to the model per document,
			asking for every field at once. Asking for all of them together is what lets the model tell a
			beginning balance from an ending one. The answer comes back as{" "}
			<span className="text-green font-bold">structured output</span>: a fixed form the model has to
			fill in rather than free text, and what that form holds is which piece holds each value.
		</span>,
		"",
		<span key="p5b">
			What the model is asked for comes from one list of fields per document type. Each entry says
			what the field is, what kind of value it holds, whether it is required, and the words it is
			usually labelled with, in English, Dutch, German and French. That same entry drives the
			search, the question to the model, and where the value is stored. Adding a field means adding
			an entry.
		</span>,
		"",
		<Figure
			key="fig-field"
			caption="one field definition, followed through the retrieval path a 31-page GP report takes; every rank and id is from a real run. Autoplays; click a step."
		>
			<FieldToJudge />
		</Figure>,
		"",
		<span key="p6">
			<span className="text-blue font-bold">5. Verify.</span> In step 4 the model pointed at a cell
			for each field, and code read the value out of it. This step reads that same cell again, with
			deterministic code and no model involved, and checks that it gets the same value. If it does
			not, the field is rejected. The reason for this step is that pointing can still go wrong: the
			model can pick a cell that looks right but holds a different figure, or a cell whose text does
			not actually contain the number. A value only enters the system when the cell the model chose
			still produces that value when read cold, by code, with no model in the loop.
		</span>,
		"",
		<span key="p7">
			The pipeline was tuned against a large labelled corpus of synthetic documents: real,
			anonymised layouts filled with generated numbers, so every right answer is known before the
			page exists. Part of that corpus is kept back from tuning, so the score reflects layouts the
			pipeline has never seen, which is the situation it is in with every uploaded GP document we
			have not seen before. Run the pipeline, score it, fix the step that lost a field, run again:
			the measure-first loop Karpathy describes for neural networks in his{" "}
			<a
				href="https://karpathy.github.io/2019/04/25/recipe/"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				training recipe
			</a>
			. Eight rounds of that in one day took accuracy on capital account statements from 40% to 98%.
		</span>,
		"",
		<h3 key="circle" className="text-cyan font-bold">
			### Full circle
		</h3>,
		"",
		<span key="fc2">
			Back to the question at the top: how hard can it be? Getting a number out of a sixty-page
			report is not hard. A good model with a good prompt gets most of the way there, and dropping a
			PDF into a chat window feels like it works. What is hard is getting a number you can put in
			front of an investor: one that came from a specific cell on a specific page, was read by code
			that cannot invent, and was checked by code that cannot be talked into anything. In the{" "}
			<a href="/posts/llm-vs-ocr-document-extraction" className="text-blue hover:underline">
				earlier post
			</a>{" "}
			the model still produced the values. Here it produces none.{" "}
			<span className="text-green font-bold">It points</span>, and everything after the pointer can
			be traced and re-run.
		</span>,
		"",
		<span key="fc3">
			A hallucinated number in a financial system is a trust problem before it is a quality problem,
			and a better prompt does not fix trust. You fix it by taking the number out of the model's
			hands.
		</span>,
		"",
		<span key="fc5">
			What comes next is incorporating human feedback. Every correction someone makes on the review
			screen is a labelled example of where the right value was, and we will use those corrections
			to automatically fine-tune the search queries and the extraction itself, so the pipeline
			learns from every document it got wrong.
		</span>,
		"",
		<span key="coda" className="text-comment">
			Note: this article reflects Docling with{" "}
			<a
				href="https://github.com/RapidAI/RapidOCR"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				RapidOCR
			</a>{" "}
			and TableFormer, plus Claude Sonnet on{" "}
			<a
				href="https://aws.amazon.com/bedrock/"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				AWS Bedrock
			</a>
			, as of mid-2026. These tools evolve fast. The architecture is deliberately model-agnostic:
			swap the model, keep the derivation.
		</span>,
		"",
		"",
		<span key="tags" className="text-comment">
			#llm #ocr #documentai #privateequity #syntheticdata #benchmarks #evals #ai
		</span>,
	],
}
