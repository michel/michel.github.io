import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useEditor } from "../context/EditorContext"

const COLORS = {
	dirColor: 0x6c5ce7,
	fileColor: 0x00cec9,
	selected: 0xff7675,
	lineColor: 0xa29bfe,
	gridColor: 0x2d3436,
}

const FS_DATA = {
	name: "root",
	type: "dir",
	children: [
		{
			name: "usr",
			type: "dir",
			children: [
				{
					name: "bin",
					type: "dir",
					children: [
						{ name: "grep", type: "file", size: 2 },
						{ name: "ps", type: "file", size: 1 },
						{ name: "kill", type: "file", size: 1 },
					],
				},
				{
					name: "park",
					type: "dir",
					children: [
						{
							name: "security",
							type: "dir",
							children: [
								{ name: "cameras", type: "file", size: 3 },
								{ name: "fences", type: "file", size: 4 },
								{
									name: "doors",
									type: "dir",
									children: [
										{ name: "lock_main", type: "file", size: 2, isTarget: true },
										{ name: "lock_perim", type: "file", size: 2 },
									],
								},
							],
						},
						{
							name: "systems",
							type: "dir",
							children: [
								{ name: "power", type: "file", size: 5 },
								{ name: "phones", type: "file", size: 3 },
							],
						},
						{
							name: "animals",
							type: "dir",
							children: [
								{ name: "raptors", type: "file", size: 8 },
								{ name: "trex", type: "file", size: 10 },
								{
									name: "dinos",
									type: "dir",
									children: [{ name: "dna_seq", type: "file", size: 2 }],
								},
							],
						},
					],
				},
				{
					name: "lib",
					type: "dir",
					children: [{ name: "drivers", type: "file", size: 2 }],
				},
			],
		},
		{
			name: "etc",
			type: "dir",
			children: [
				{ name: "passwd", type: "file", size: 1 },
				{ name: "hosts", type: "file", size: 1 },
			],
		},
		{
			name: "tmp",
			type: "dir",
			children: [{ name: "trash", type: "file", size: 0.5 }],
		},
	],
}

interface FSNode {
	name: string
	type: "dir" | "file"
	size?: number
	isTarget?: boolean
	children?: FSNode[]
}

interface MeshUserData {
	name: string
	type: string
	path: string
	isTarget?: boolean
	originalColor: number
}

export default function JurassicTerminal() {
	const { setActiveTmuxWindow, setJurassicComplete } = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)
	const [currentPath, setCurrentPath] = useState("/")
	const [consoleLines, setConsoleLines] = useState<string[]>([
		"> User: guest",
		"> System: IRIX 5.3",
		"> Initializing connection...",
	])
	const [sysStatus, setSysStatus] = useState("SEARCHING...")
	const [statusColor, setStatusColor] = useState("#ff0055")
	const [modal, setModal] = useState<{ show: boolean; success: boolean } | null>(null)

	const log = (msg: string) => {
		setConsoleLines((prev) => [`> ${msg}`, ...prev.slice(0, 4)])
	}

	useEffect(() => {
		if (!containerRef.current) return

		const container = containerRef.current
		const scene = new THREE.Scene()
		scene.background = new THREE.Color(0x050510)
		scene.fog = new THREE.FogExp2(0x050510, 0.002)

		const camera = new THREE.PerspectiveCamera(
			60,
			container.clientWidth / container.clientHeight,
			0.1,
			1000,
		)
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setSize(container.clientWidth, container.clientHeight)
		renderer.setPixelRatio(window.devicePixelRatio)
		container.appendChild(renderer.domElement)

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
		scene.add(ambientLight)

		const pointLight = new THREE.PointLight(0x6c5ce7, 1, 1000)
		pointLight.position.set(0, 200, 0)
		scene.add(pointLight)

		const gridHelper = new THREE.GridHelper(1000, 100, COLORS.gridColor, COLORS.gridColor)
		scene.add(gridHelper)

		const nodes: THREE.Mesh[] = []

		const dirMaterial = new THREE.MeshPhongMaterial({
			color: COLORS.dirColor,
			transparent: true,
			opacity: 0.7,
			wireframe: false,
			shininess: 100,
		})
		const dirEdgeMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.3,
		})
		const fileMaterial = new THREE.MeshPhongMaterial({ color: COLORS.fileColor, shininess: 80 })
		const lineMaterial = new THREE.LineBasicMaterial({ color: COLORS.lineColor })

		function buildTree(
			node: FSNode,
			parentMesh: THREE.Mesh | null = null,
			depth = 0,
			offsetX = 0,
			offsetZ = 0,
		) {
			const boxSize = node.type === "dir" ? 10 : 4
			const height = node.type === "dir" ? 2 : (node.size ?? 2) * 2

			const geometry = new THREE.BoxGeometry(boxSize, height, boxSize)
			const material = node.type === "dir" ? dirMaterial.clone() : fileMaterial.clone()

			if (node.isTarget) {
				material.color.setHex(0xffaa00)
				if ("emissive" in material) (material as THREE.MeshPhongMaterial).emissive.setHex(0x442200)
			}

			const mesh = new THREE.Mesh(geometry, material)
			mesh.position.set(offsetX, height / 2, offsetZ)

			if (node.type === "dir") {
				const edges = new THREE.EdgesGeometry(geometry)
				const line = new THREE.LineSegments(edges, dirEdgeMaterial)
				mesh.add(line)
			}

			scene.add(mesh)

			const userData: MeshUserData = {
				name: node.name,
				type: node.type,
				path: parentMesh
					? `${(parentMesh.userData as MeshUserData).path}/${node.name}`
					: `/${node.name}`,
				isTarget: node.isTarget,
				originalColor: material.color.getHex(),
			}
			mesh.userData = userData

			nodes.push(mesh)

			if (parentMesh) {
				const p1 = parentMesh.position.clone()
				const p2 = mesh.position.clone()
				p1.y = 1
				p2.y = 1
				const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2])
				const line = new THREE.Line(lineGeo, lineMaterial)
				scene.add(line)
			}

			if (node.children) {
				const totalWidth = node.children.length * 20
				const startX = offsetX - totalWidth / 2 + 10
				node.children.forEach((child, index) => {
					buildTree(child, mesh, depth + 1, startX + index * 20, offsetZ + 30)
				})
			}
		}

		buildTree(FS_DATA as FSNode)

		camera.position.set(0, 60, 100)
		camera.lookAt(0, 0, 0)

		const targetPosition = new THREE.Vector3(0, 60, 100)
		const targetLookAt = new THREE.Vector3(0, 0, 0)
		let isAutoPiloting = true
		let selectedMesh: THREE.Mesh | null = null
		let hoverMesh: THREE.Mesh | null = null
		let lastAutoPilotTime = 0

		const raycaster = new THREE.Raycaster()
		const mouse = new THREE.Vector2()

		const handleMouseMove = (event: MouseEvent) => {
			const rect = container.getBoundingClientRect()
			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
		}

		const selectNode = (mesh: THREE.Mesh) => {
			if (selectedMesh && selectedMesh !== mesh) {
				const mat = selectedMesh.material as THREE.MeshPhongMaterial
				mat.color.setHex((selectedMesh.userData as MeshUserData).originalColor)
			}

			selectedMesh = mesh
			const mat = selectedMesh.material as THREE.MeshPhongMaterial
			mat.color.setHex(COLORS.selected)

			const offset = new THREE.Vector3(0, 30, 40)
			targetPosition.copy(mesh.position).add(offset)
			targetLookAt.copy(mesh.position)

			const userData = mesh.userData as MeshUserData
			setCurrentPath(userData.path)
			log(`Accessing: ${userData.name}`)

			if (userData.isTarget) {
				setSysStatus("ACCESS GRANTED")
				setStatusColor("#00ff00")
				log("ROOT ACCESS GRANTED")
				setModal({ show: true, success: true })
				setTimeout(() => {
					setActiveTmuxWindow(1)
					setTimeout(() => setJurassicComplete(true), 100)
				}, 3000)
			} else if (userData.type === "file" && Math.random() > 0.7) {
				setModal({ show: true, success: false })
				setTimeout(() => setModal(null), 2000)
			}
		}

		const handleClick = () => {
			isAutoPiloting = false
			setSysStatus("MANUAL OVERRIDE")
			setStatusColor("#00cec9")

			if (hoverMesh) selectNode(hoverMesh)
		}

		container.addEventListener("mousemove", handleMouseMove)
		container.addEventListener("click", handleClick)

		const handleResize = () => {
			camera.aspect = container.clientWidth / container.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(container.clientWidth, container.clientHeight)
		}
		window.addEventListener("resize", handleResize)

		let animationId: number

		const animate = (time: number) => {
			animationId = requestAnimationFrame(animate)

			raycaster.setFromCamera(mouse, camera)
			const intersects = raycaster.intersectObjects(nodes)

			if (intersects.length > 0 && intersects[0]) {
				const object = intersects[0].object as THREE.Mesh
				if (hoverMesh !== object) {
					if (hoverMesh && hoverMesh !== selectedMesh) {
						const mat = hoverMesh.material as THREE.MeshPhongMaterial
						mat.color.setHex((hoverMesh.userData as MeshUserData).originalColor)
					}
					hoverMesh = object
					if (hoverMesh !== selectedMesh) {
						const mat = hoverMesh.material as THREE.MeshPhongMaterial
						mat.color.setHex(0xa29bfe)
					}
				}
			} else {
				if (hoverMesh && hoverMesh !== selectedMesh) {
					const mat = hoverMesh.material as THREE.MeshPhongMaterial
					mat.color.setHex((hoverMesh.userData as MeshUserData).originalColor)
				}
				hoverMesh = null
			}

			if (isAutoPiloting && nodes.length > 0) {
				if (time - lastAutoPilotTime > 2000) {
					lastAutoPilotTime = time
					const randomNode = nodes[Math.floor(Math.random() * nodes.length)]
					if (randomNode) {
						targetPosition.copy(randomNode.position).add(new THREE.Vector3(20, 40, 40))
						targetLookAt.copy(randomNode.position)
						setCurrentPath((randomNode.userData as MeshUserData).path)
					}
				}
			}

			camera.position.lerp(targetPosition, 0.05)
			const currentLook = new THREE.Vector3(0, 0, -1)
				.applyQuaternion(camera.quaternion)
				.add(camera.position)
			currentLook.lerp(targetLookAt, 0.05)
			camera.lookAt(currentLook)

			renderer.render(scene, camera)
		}

		animate(0)

		return () => {
			cancelAnimationFrame(animationId)
			container.removeEventListener("mousemove", handleMouseMove)
			container.removeEventListener("click", handleClick)
			window.removeEventListener("resize", handleResize)
			renderer.dispose()
			container.removeChild(renderer.domElement)
		}
	}, [setActiveTmuxWindow, setJurassicComplete, log])

	return (
		<div className="relative h-full w-full overflow-hidden bg-[#050510]">
			<div ref={containerRef} className="h-full w-full" />

			{/* Scan line effect */}
			<div className="pointer-events-none absolute left-0 top-0 h-[5px] w-full animate-[scan_6s_linear_infinite] bg-white/10" />

			{/* UI Overlay */}
			<div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 font-mono">
				{/* Top bar */}
				<div className="flex justify-between border-b-2 border-[#6c5ce7] bg-gradient-to-b from-black/80 to-transparent pb-2.5">
					<div className="text-2xl font-bold uppercase text-white [text-shadow:0_0_10px_#6c5ce7]">
						FSN: /usr/park/sys
					</div>
					<div className="font-bold animate-pulse" style={{ color: statusColor }}>
						{sysStatus}
					</div>
				</div>

				{/* Bottom bar */}
				<div className="flex items-end justify-between border-t-2 border-[#6c5ce7] bg-gradient-to-t from-black/80 to-transparent pt-2.5">
					<div className="flex h-[100px] max-w-[400px] flex-col-reverse overflow-hidden text-sm text-white [text-shadow:0_0_2px_#fff]">
						{consoleLines.map((line, i) => (
							<div key={i}>{line}</div>
						))}
					</div>
					<div className="border border-[#6c5ce7] bg-black/50 px-2.5 py-1.5 text-lg text-[#a29bfe]">
						{currentPath}
					</div>
				</div>
			</div>

			{/* Access Modal */}
			{modal?.show && (
				<div
					className="absolute left-1/2 top-1/2 z-50 flex h-[150px] w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center bg-black/90 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
					style={{ border: `2px solid ${modal.success ? "#00ff00" : "#fff"}` }}
				>
					<div className="mb-2.5 flex h-20 w-20 items-center justify-center bg-white text-5xl text-black">
						{modal.success ? "🔓" : "☠️"}
					</div>
					<div className="text-xl font-bold" style={{ color: modal.success ? "#00ff00" : "#fff" }}>
						{modal.success ? "SYSTEM UNLOCKED" : "ACCESS DENIED"}
					</div>
					<div className="mt-1 text-[10px] text-[#aaa]">
						{modal.success ? "DOOR SECURITY DISABLED" : "YOU DIDN'T SAY THE MAGIC WORD"}
					</div>
				</div>
			)}

			<style>{`
				@keyframes scan {
					0% { top: -5%; }
					100% { top: 105%; }
				}
			`}</style>
		</div>
	)
}
