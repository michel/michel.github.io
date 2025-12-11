import { useEffect, useRef, useState } from "react"

const sshBanner = `Last login: Wed Dec 11 03:42:17 2025 from 10.0.137.42
Welcome to xAI Colossus 2 - Memphis Datacenter
================================================================================
  Cluster: colossus2-prod    Nodes: 200,000    GPUs: 200,000x H100
  Status: OPERATIONAL        Uptime: 847d 14h  Power: 147MW
================================================================================
[NOTICE] Grok-6-ultrathink training job G6UT-2847 resuming from checkpoint...
[NOTICE] Allocated 131,072 GPUs across 8,192 nodes for this job
`

const gpuHeader = `
+-----------------------------------------------------------------------------+
| xAI Colossus 2 - GPU Cluster Status (showing 8 of 131,072 allocated GPUs)   |
+-----------------------------------------------------------------------------+
| GPU   Temp   Util   Mem-Used / Total    Power    Process                    |
|-----------------------------------------------------------------------------|`

const trainingHeader = `
================================================================================
 YOLO-Grok6-Ultrathink Training | Batch: 16M | LR: 0.00042 | Precision: BF16
================================================================================
 Dataset: grok6-multimodal-v3 (847TB) | Architecture: YOLO-UT-XL (2.1T params)
 Optimizer: AdamW-Distributed | Scheduler: CosineAnnealing | WarmupSteps: 50000
================================================================================`

interface TrainingLine {
	epoch: string
	batch: string
	loss: string
	boxLoss: string
	clsLoss: string
	dflLoss: string
	mAP50: string
	mAP95: string
	gpuMem: string
	speed: string
}

function generateGpuLines(): string[] {
	const gpus = []
	for (let i = 0; i < 8; i++) {
		const temp = 67 + Math.floor(Math.random() * 12)
		const util = 94 + Math.floor(Math.random() * 6)
		const mem = 76 + Math.floor(Math.random() * 8)
		const power = 680 + Math.floor(Math.random() * 40)
		gpus.push(
			`| ${i}     ${temp}C    ${util}%    ${mem}GB / 80GB      ${power}W    yolo-g6ut-train            |`,
		)
	}
	return gpus
}

function generateTrainingLine(epoch: number, batch: number): TrainingLine {
	const baseLoss = Math.max(0.08, 2.4 - epoch * 0.015 - batch * 0.00001)
	const noise = () => (Math.random() - 0.5) * 0.02
	return {
		epoch: String(epoch).padStart(3),
		batch: String(batch).padStart(7),
		loss: (baseLoss + noise()).toFixed(4),
		boxLoss: (baseLoss * 0.4 + noise()).toFixed(4),
		clsLoss: (baseLoss * 0.35 + noise()).toFixed(4),
		dflLoss: (baseLoss * 0.25 + noise()).toFixed(4),
		mAP50: Math.min(0.99, 0.45 + epoch * 0.004 + batch * 0.000002 + noise()).toFixed(4),
		mAP95: Math.min(0.95, 0.28 + epoch * 0.003 + batch * 0.0000015 + noise()).toFixed(4),
		gpuMem: `${76 + Math.floor(Math.random() * 4)}GB`,
		speed: `${(142000 + Math.floor(Math.random() * 8000)).toLocaleString()} img/s`,
	}
}

export default function ColossusTerminal() {
	const [lines, setLines] = useState<string[]>([])
	const [phase, setPhase] = useState<"ssh" | "gpu" | "training">("ssh")
	const [currentEpoch, setCurrentEpoch] = useState(47)
	const [currentBatch, setCurrentBatch] = useState(2847291)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// Phase 1: SSH banner
		const sshLines = sshBanner.split("\n")
		let idx = 0
		const sshInterval = setInterval(() => {
			if (idx < sshLines.length) {
				setLines((prev) => [...prev, sshLines[idx] ?? ""])
				idx++
			} else {
				clearInterval(sshInterval)
				setTimeout(() => setPhase("gpu"), 500)
			}
		}, 80)

		return () => clearInterval(sshInterval)
	}, [])

	useEffect(() => {
		if (phase !== "gpu") return

		// Phase 2: GPU status
		const gpuLines = [
			gpuHeader,
			...generateGpuLines(),
			"+-----------------------------------------------------------------------------+",
		]
		gpuLines.forEach((line, i) => {
			setTimeout(() => {
				setLines((prev) => [...prev, line])
				if (i === gpuLines.length - 1) setTimeout(() => setPhase("training"), 800)
			}, i * 40)
		})
	}, [phase])

	useEffect(() => {
		if (phase !== "training") return

		// Phase 3: Training header
		const headerLines = trainingHeader.split("\n")
		headerLines.forEach((line, i) => {
			setTimeout(() => setLines((prev) => [...prev, line]), i * 30)
		})

		// Training loop
		const columnHeader =
			"  Epoch  |   Batch   |  Loss   | Box     | Cls     | DFL     | mAP@50  | mAP@95  |  Mem   |    Speed"
		const separator =
			"---------|-----------|---------|---------|---------|---------|---------|---------|--------|------------"

		setTimeout(
			() => {
				setLines((prev) => [...prev, "", columnHeader, separator])
			},
			headerLines.length * 30 + 100,
		)

		const trainingInterval = setInterval(() => {
			const line = generateTrainingLine(currentEpoch, currentBatch)
			const formatted = `    ${line.epoch}   | ${line.batch} | ${line.loss}  | ${line.boxLoss}  | ${line.clsLoss}  | ${line.dflLoss}  | ${line.mAP50}  | ${line.mAP95}  | ${line.gpuMem} | ${line.speed}`

			setLines((prev) => {
				const newLines = [...prev, formatted]
				return newLines.length > 60 ? newLines.slice(-60) : newLines
			})

			setCurrentBatch((b) => {
				const newBatch = b + Math.floor(Math.random() * 200) + 100
				if (newBatch > 3000000) {
					setCurrentEpoch((e) => e + 1)
					return 0
				}
				return newBatch
			})
		}, 1200)

		return () => clearInterval(trainingInterval)
	}, [phase, currentEpoch, currentBatch])

	useEffect(() => {
		if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
	}, [lines])

	return (
		<div className="flex h-full w-full flex-col bg-[#0a0a0a]">
			{/* SSH header bar */}
			<div className="flex items-center gap-2 border-b border-cyan/30 bg-[#111] px-3 py-1 text-xs">
				<span className="text-cyan">ssh</span>
				<span className="text-comment">root@colossus2.xai.internal</span>
				<span className="ml-auto text-green">Connected</span>
				<span className="text-yellow">131,072 GPUs</span>
			</div>

			{/* Terminal content */}
			<div
				ref={containerRef}
				className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed"
			>
				{lines.map((line, i) => (
					<div
						key={i}
						className={
							line.includes("NOTICE")
								? "text-yellow"
								: line.includes("===") || line.includes("---") || line.includes("+--")
									? "text-cyan"
									: line.includes("mAP")
										? "text-green"
										: line.includes("Loss") || line.includes("loss")
											? "text-magenta"
											: "text-fg"
						}
					>
						{line || "\u00A0"}
					</div>
				))}
				{phase === "training" && <span className="inline-block h-3 w-1.5 animate-pulse bg-cyan" />}
			</div>

			{/* Status bar */}
			<div className="flex items-center justify-between border-t border-cyan/30 bg-[#111] px-3 py-1 text-xs">
				<span className="text-comment">Job: G6UT-2847</span>
				<span className="text-cyan">Epoch {currentEpoch}/100</span>
				<span className="text-yellow">ETA: 14d 7h</span>
				<span className="text-green">147MW</span>
			</div>
		</div>
	)
}
