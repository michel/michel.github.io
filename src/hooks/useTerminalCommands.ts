import { allFiles } from "../context/EditorContext"
import {
	cowsay,
	getNeofetchOutput,
	getTopOutput,
	npmTestOutput,
} from "../data/terminalData"
import {
	resolvePath,
	pathExists,
	isDirectory,
	getFileContent,
	generateLsOutput,
	generateLsLaOutput,
	getPathCompletions,
	toDisplayPath,
} from "../data/filesystem"

export interface CommandResult {
	output: string[]
	clear?: boolean
	closeTerminal?: boolean
	switchToNvim?: boolean
	newDirectory?: string
}

type CommandHandler = (args: string[], cwd: string) => CommandResult

const commands: Record<string, CommandHandler> = {
	neofetch: () => ({ output: getNeofetchOutput() }),

	ls: (args, cwd) => {
		const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al')
		const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al')

		// Get target directory (last non-flag arg, or cwd)
		const targetArg = args.filter(a => !a.startsWith('-')).pop()
		const targetPath = targetArg ? resolvePath(targetArg, cwd) : cwd

		if (!pathExists(targetPath))
			return { output: [`ls: cannot access '${targetArg}': No such file or directory`] }

		if (!isDirectory(targetPath))
			return { output: [targetArg ?? ''] }

		if (showLong) return { output: generateLsLaOutput(targetPath) }
		return { output: generateLsOutput(targetPath, showAll) }
	},

	cat: (args, cwd) => {
		const filename = args[0]
		if (!filename) return { output: ['cat: missing operand'] }

		const targetPath = resolvePath(filename, cwd)

		if (!pathExists(targetPath)) {
			// Fallback to allFiles for blog content
			const file = allFiles.find(
				f => f.name === filename ||
					f.name.includes(filename) ||
					filename.includes(f.name.replace('.md', ''))
			)
			if (file) return { output: file.preview.split('\n') }
			return { output: [`cat: ${filename}: No such file or directory`] }
		}

		if (isDirectory(targetPath))
			return { output: [`cat: ${filename}: Is a directory`] }

		const content = getFileContent(targetPath)
		return { output: content ?? [''] }
	},

	clear: () => ({ output: [], clear: true }),

	help: () => ({
		output: [
			"\x1b[cyan]Available commands:\x1b[reset]",
			"",
			"\x1b[yellow]System:\x1b[reset]",
			"  neofetch, screenfetch, fastfetch  - Display system information",
			"  ls [-la]        - List directory contents",
			"  cat <file>      - Display file contents",
			"  pwd, whoami     - Show current directory/user",
			"  cd, touch, mkdir, rm  - File operations (read-only)",
			"  top, ps, htop   - Process information",
			"  df, du, free    - Disk and memory usage",
			"  mount, lsblk    - Mount points and block devices",
			"  kill, chmod, chown  - Permission denied ;)",
			"  uname, hostname, uptime, date, id  - System info",
			"  reboot, shutdown  - Nice try",
			"  clear           - Clear terminal",
			"",
			"\x1b[yellow]Network:\x1b[reset]",
			"  ssh, scp, telnet  - Remote connections",
			"  ping, curl, wget  - Network requests",
			"  netstat, ifconfig, ip  - Network info",
			"  nmap            - Port scanning",
			"",
			"\x1b[yellow]Files & Text:\x1b[reset]",
			"  grep, find, head, tail, wc  - Search and view",
			"  tar             - Archive files",
			"  echo            - Echo arguments",
			"",
			"\x1b[yellow]Package Managers:\x1b[reset]",
			"  pacman, yay     - Arch Linux (the correct choice)",
			"  apt, dnf, brew  - Other distros (wrong choices)",
			"  npm, yarn, pnpm, bun  - JS package managers",
			"  cargo, rustc, rustup  - Rust toolchain",
			"",
			"\x1b[yellow]Dev Tools:\x1b[reset]",
			"  git             - Version control",
			"  node, tsc, deno - JavaScript/TypeScript",
			"  python, python3 - Python",
			"  java            - Enterprise suffering",
			"  gcc, g++, make  - C/C++ build tools",
			"  docker, kubectl - Containers & k8s",
			"  aws, terraform  - Cloud & IaC",
			"",
			"\x1b[yellow]Editors:\x1b[reset]",
			"  vim, nvim       - The correct choice",
			"  emacs, nano, code  - Alternatives (wrong)",
			"",
			"\x1b[yellow]Fun:\x1b[reset]",
			"  cowsay <msg>    - Make a cow say something",
			"  fortune         - Random wisdom",
			"  sl              - Choo choo!",
			"  matrix, cmatrix - Wake up, Neo",
			"  yes, lolcat, figlet  - Fun stuff",
			"  btw             - I use Arch",
			"  xkcd            - Developer humor",
			"  hackerman       - 1337 h4x0r",
			"",
			"\x1b[yellow]Shell:\x1b[reset]",
			"  alias, env, which, history  - Shell info",
			"  sudo            - Nice try",
			"  man <cmd>       - Manual pages",
			"  exit, quit      - Close terminal",
			"",
			"\x1b[cyan]Tips:\x1b[reset]",
			"  - Press Ctrl+C to cancel",
			"  - Press Ctrl+L to clear screen",
			"  - Use arrow keys for command history",
			"  - Tab to autocomplete",
		],
	}),

	npm: (args) => {
		if (args[0] === "test") return { output: npmTestOutput }
		if (args[0] === "install" || args[0] === "i")
			return {
				output: [
					"\x1b[yellow]npm WARN\x1b[reset] deprecated everything@1.0.0: this package is no longer maintained",
					"\x1b[yellow]npm WARN\x1b[reset] deprecated left-pad@0.0.3: use String.prototype.padStart()",
					"\x1b[yellow]npm WARN\x1b[reset] deprecated is-odd@3.0.1: just use n % 2 === 1",
					"\x1b[yellow]npm WARN\x1b[reset] deprecated is-even@1.0.0: seriously?",
					"",
					"added 1337 packages, removed 420 packages, and audited 31337 packages in 69s",
					"",
					"\x1b[red]69 vulnerabilities (13 moderate, 37 high, 19 critical)\x1b[reset]",
					"",
					"\x1b[comment]This is fine. Everything is fine.\x1b[reset]",
					"",
				],
			}
		if (args[0] === "run" && args[1] === "dev")
			return {
				output: [
					"",
					"\x1b[red]Error: node_modules folder is 4.2GB\x1b[reset]",
					"\x1b[red]Error: Your SSD is crying\x1b[reset]",
					"",
					"\x1b[comment]rm -rf node_modules: the JavaScript equivalent of turning it off and on again.\x1b[reset]",
					"",
				],
			}
		if (args[0] === "audit")
			return {
				output: [
					"\x1b[red]found 420 vulnerabilities (69 low, 200 moderate, 100 high, 51 critical)\x1b[reset]",
					"",
					"run `npm audit fix` to fix them, or don't, it won't help anyway",
					"",
					"\x1b[comment]Security through obscurity: nobody can exploit your vulnerabilities if your deps are too complex to understand.\x1b[reset]",
					"",
				],
			}
		return {
			output: [
				`\x1b[red]npm ERR!\x1b[reset] '${args[0]}' is not a recognized command`,
				"",
				"\x1b[comment]npm: 10% package management, 90% praying.\x1b[reset]",
				"",
			],
		}
	},

	node: () => ({
		output: [
			"\x1b[yellow]Warning:\x1b[reset] You're about to run JavaScript outside a browser.",
			"\x1b[yellow]Warning:\x1b[reset] callback hell awaits.",
			"\x1b[yellow]Warning:\x1b[reset] 'undefined' is not a function.",
			"",
			"\x1b[red]Segmentation fault (core dumped)\x1b[reset]",
		],
	}),

	yarn: () => ({
		output: [
			"\x1b[cyan]yarn\x1b[reset]: command not found",
			"",
			"\x1b[comment]Good. One less JS package manager to worry about.\x1b[reset]",
		],
	}),

	pnpm: () => ({
		output: [
			"\x1b[cyan]pnpm\x1b[reset]: the slightly less bad npm",
			"",
			"\x1b[comment]Symlinks: the pinnacle of package management innovation.\x1b[reset]",
		],
	}),

	bun: () => ({
		output: [
			"\x1b[yellow]bun:\x1b[reset] a faster way to run JavaScript",
			"",
			"\x1b[comment]You know what's even faster? Compiled Rust binaries.\x1b[reset]",
		],
	}),

	deno: () => ({
		output: [
			"\x1b[cyan]deno:\x1b[reset] node but with TypeScript",
			"",
			"\x1b[comment]At least it's written in Rust. That's something.\x1b[reset]",
		],
	}),

	tsc: () => ({
		output: [
			"",
			"\x1b[red]error TS2322:\x1b[reset] Type 'string' is not assignable to type 'number'.",
			"\x1b[red]error TS2345:\x1b[reset] Argument of type 'null' is not assignable to parameter of type 'never'.",
			"\x1b[red]error TS7053:\x1b[reset] Element implicitly has an 'any' type.",
			"\x1b[red]error TS2739:\x1b[reset] Type '{}' is missing the following properties...",
			"",
			"Found 420 errors in 69 files.",
			"",
			"\x1b[comment]'any' is not a type, it's a cry for help.\x1b[reset]",
		],
	}),

	rustc: () => ({
		output: [
			"\x1b[green]   Compiling\x1b[reset] awesomeness v1.0.0",
			"\x1b[green]    Finished\x1b[reset] release [optimized] target(s) in 0.42s",
			"",
			"\x1b[cyan]Zero runtime errors. As it should be.\x1b[reset]",
		],
	}),

	rustup: () => ({
		output: [
			"\x1b[green]info:\x1b[reset] syncing channel updates for 'stable-aarch64-apple-darwin'",
			"\x1b[green]info:\x1b[reset] latest update on 2024-01-01, rust version 1.75.0",
			"",
			"  stable-aarch64-apple-darwin installed - \x1b[green]rustc 1.75.0\x1b[reset]",
		],
	}),

	cowsay: (args) => {
		const message = args.length > 0 ? args.join(" ") : "Hello, world!"
		return { output: cowsay(message).split("\n") }
	},

	echo: (args) => ({ output: [args.join(" ")] }),

	pwd: (_args, cwd) => ({ output: [cwd] }),

	whoami: () => ({ output: ["michel"] }),

	date: () => ({ output: [new Date().toString()] }),

	uname: (args) => {
		if (args.includes("-a"))
			return {
				output: ["Linux spaceheater 6.9.420-arch1-1 #1 SMP PREEMPT_DYNAMIC arch x86_64 GNU/Linux"],
			}
		return { output: ["Linux"] }
	},

	top: () => ({ output: getTopOutput() }),

	htop: () => ({ output: ["\x1b[green]htop\x1b[reset]: command not found (try 'top' instead)"] }),

	ps: (args) => {
		if (args.includes("aux") || args.includes("-aux")) return { output: getTopOutput().slice(6) }
		return {
			output: [
				"  PID TTY           TIME CMD",
				"  501 ttys000    0:00.42 -fish",
				" 1337 ttys000    0:02.69 nvim .",
				" 1338 ttys001    0:00.01 ps",
			],
		}
	},

	// Easter eggs
	vim: () => ({
		output: [
			"",
			"\x1b[green]Starting vim...\x1b[reset]",
			"",
			"\x1b[comment]Ah, you escaped! But vim always brings you back...\x1b[reset]",
			"",
		],
		switchToNvim: true,
	}),

	nvim: () => ({
		output: [
			"",
			"\x1b[green]Starting nvim...\x1b[reset]",
			"",
			"\x1b[comment]You can check out any time you like, but you can never leave.\x1b[reset]",
			"",
		],
		switchToNvim: true,
	}),

	emacs: () => ({
		output: [
			"\x1b[red]Error: emacs is not installed\x1b[reset]",
			"\x1b[comment](and never will be)\x1b[reset]",
			"",
			"\x1b[green]Try: vim\x1b[reset]",
		],
	}),

	nano: () => ({
		output: [
			"\x1b[yellow]nano?\x1b[reset] Really?",
			"",
			"\x1b[comment]This is a vim household.\x1b[reset]",
		],
	}),

	code: () => ({
		output: [
			"\x1b[cyan]Opening Visual Studio Code...\x1b[reset]",
			"",
			"\x1b[red]Error: GUI applications not supported in terminal\x1b[reset]",
			"\x1b[comment]Besides, you're already in the superior editor.\x1b[reset]",
		],
	}),

	exit: () => ({
		output: ["\x1b[comment]Closing terminal...\x1b[reset]"],
		closeTerminal: true,
	}),

	quit: () => ({
		output: ["\x1b[comment]Closing terminal...\x1b[reset]"],
		closeTerminal: true,
	}),

	sudo: () => ({
		output: [
			`\x1b[red]Password:\x1b[reset] `,
			"\x1b[red]Sorry, try again.\x1b[reset]",
			"\x1b[red]Sorry, try again.\x1b[reset]",
			`\x1b[red]sudo: 3 incorrect password attempts\x1b[reset]`,
			"",
			"\x1b[comment](Nice try though)\x1b[reset]",
		],
	}),

	rm: (args) => {
		const joinedArgs = args.join(" ")
		const hasForce = args.includes("-rf") || args.includes("-fr") || args.includes("-r")

		// Check for various dangerous patterns
		if (hasForce && (args.includes("/") || joinedArgs.includes(" /")))
			return {
				output: [
					"\x1b[red]rm: it is dangerous to operate recursively on '/'\x1b[reset]",
					"\x1b[red]rm: use --no-preserve-root to override this failsafe\x1b[reset]",
					"",
					"\x1b[yellow]⚠️  NUCLEAR OPTION DETECTED ⚠️\x1b[reset]",
					"",
					"\x1b[comment]I too like to mass-delete strangers' systems.\x1b[reset]",
					"\x1b[comment]Unfortunately, this is a fake terminal.\x1b[reset]",
					"\x1b[comment]Try it on your own machine instead. :)\x1b[reset]",
				],
			}

		if (
			hasForce &&
			(joinedArgs.includes("~") || joinedArgs.includes("$HOME") || joinedArgs.includes("/home"))
		)
			return {
				output: [
					"\x1b[red]rm: permission denied: '/home/michel'\x1b[reset]",
					"",
					"\x1b[yellow]🏠 HOME DESTROYER DETECTED 🏠\x1b[reset]",
					"",
					"\x1b[comment]Ah yes, the classic 'delete someone's home directory' move.\x1b[reset]",
					"\x1b[comment]Very original. Very creative.\x1b[reset]",
					"\x1b[comment]My dotfiles took 3 years to configure.\x1b[reset]",
					"\x1b[comment]They live in git now. Nice try.\x1b[reset]",
				],
			}

		if (hasForce && joinedArgs.includes("*"))
			return {
				output: [
					"\x1b[red]rm: cannot remove '*': Ambiguous redirect\x1b[reset]",
					"",
					"\x1b[yellow]💥 WILDCARD WARRIOR DETECTED 💥\x1b[reset]",
					"",
					"\x1b[comment]rm -rf * in someone's terminal?\x1b[reset]",
					"\x1b[comment]What is this, 2003?\x1b[reset]",
					"\x1b[comment]At least be creative with your destruction.\x1b[reset]",
				],
			}

		if (
			hasForce &&
			(joinedArgs.includes("/etc") || joinedArgs.includes("/var") || joinedArgs.includes("/usr"))
		)
			return {
				output: [
					"\x1b[red]rm: cannot remove system directories: Operation not permitted\x1b[reset]",
					"",
					"\x1b[yellow]🔧 SYSTEM SABOTEUR DETECTED 🔧\x1b[reset]",
					"",
					"\x1b[comment]Going after /etc? /var? /usr?\x1b[reset]",
					"\x1b[comment]What did those directories ever do to you?\x1b[reset]",
					"\x1b[comment]They're just trying to make the system work.\x1b[reset]",
				],
			}

		if (
			hasForce &&
			(joinedArgs.includes("/boot") ||
				joinedArgs.includes("vmlinuz") ||
				joinedArgs.includes("initrd"))
		)
			return {
				output: [
					"\x1b[red]rm: cannot remove '/boot': The kernel is watching\x1b[reset]",
					"",
					"\x1b[yellow]🥾 BOOT BURGLAR DETECTED 🥾\x1b[reset]",
					"",
					"\x1b[comment]Deleting /boot? Bold strategy.\x1b[reset]",
					"\x1b[comment]I too enjoy systems that don't boot.\x1b[reset]",
					"\x1b[comment]Very zen. Very minimalist.\x1b[reset]",
				],
			}

		if (hasForce && joinedArgs.includes(".ssh"))
			return {
				output: [
					"\x1b[red]rm: cannot remove '.ssh': Identity is precious\x1b[reset]",
					"",
					"\x1b[yellow]🔑 KEY KLEPTO DETECTED 🔑\x1b[reset]",
					"",
					"\x1b[comment]Trying to delete SSH keys?\x1b[reset]",
					"\x1b[comment]Jokes on you, I use hardware keys.\x1b[reset]",
					"\x1b[comment]*taps YubiKey smugly*\x1b[reset]",
				],
			}

		if (hasForce && (joinedArgs.includes(".git") || joinedArgs.includes("node_modules")))
			return {
				output: [
					"\x1b[green]rm: removing node_modules...\x1b[reset]",
					"\x1b[green]rm: actually, you're doing me a favor\x1b[reset]",
					"",
					"\x1b[comment]node_modules deleted! Your SSD thanks you.\x1b[reset]",
					"\x1b[comment]Disk space recovered: 69GB\x1b[reset]",
					"\x1b[comment]Time until you run npm install again: 3 seconds\x1b[reset]",
				],
			}

		if (joinedArgs.includes("--no-preserve-root"))
			return {
				output: [
					"\x1b[red]rm: cannot remove '/': Permission denied\x1b[reset]",
					"",
					"\x1b[yellow]🤡 PERSISTENT CHAOS AGENT DETECTED 🤡\x1b[reset]",
					"",
					"\x1b[comment]Oh, you used --no-preserve-root?\x1b[reset]",
					"\x1b[comment]You read the error message! Gold star! ⭐\x1b[reset]",
					"\x1b[comment]Still a fake terminal though. Cope.\x1b[reset]",
				],
			}

		return { output: [`rm: cannot remove '${args[0] || ""}': This is a fake terminal`] }
	},

	sl: () => ({
		output: [
			"",
			"      ====        ________                ___________",
			"  _D _|  |_______/        \\__I_I_____===__|___________|",
			"   |(_)---  |   H\\________/ |   |        =|___ ___|",
			"   /     |  |   H  |  |     |   |         ||_| |_||",
			"  |      |  |   H  |__--------------------| [___] |",
			"  | ________|___H__/__|_____/[][]~\\_______|       |",
			"  |/ |   |-----------I_____I [][] []  D   |=======|__",
			"__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
			" |/-=|___|=    ||    ||    ||    |_____/~\\___/",
			"  \\_/      \\O=====O=====O=====O_/      \\_/",
			"",
			"\x1b[comment]You typed 'sl' instead of 'ls'. Here's your train.\x1b[reset]",
		],
	}),

	fortune: () => {
		const fortunes = [
			"You will mass-rename files and accidentally destroy your project.",
			"A git push --force is in your near future.",
			"Today is a good day to refactor. Just kidding, don't touch it.",
			"You will spend 3 hours debugging a missing semicolon.",
			"The bug is not in your code. It's in your understanding of the code.",
			"rm -rf node_modules && npm install will solve 80% of your problems.",
			"There are only two hard things: cache invalidation and naming things.",
			"Your next Stack Overflow answer will be from 2012. It will still work.",
		]
		return { output: ["", fortunes[Math.floor(Math.random() * fortunes.length)] ?? "", ""] }
	},

	matrix: () => ({
		output: [
			"\x1b[green]Wake up, Neo...\x1b[reset]",
			"\x1b[green]The Matrix has you...\x1b[reset]",
			"\x1b[green]Follow the white rabbit.\x1b[reset]",
			"",
			"\x1b[green]Knock, knock, Neo.\x1b[reset]",
		],
	}),

	":(){ :|:& };:": () => ({
		output: [
			"\x1b[red]Nice try with the fork bomb!\x1b[reset]",
			"",
			"\x1b[comment]This terminal is sandboxed. Your tricks won't work here.\x1b[reset]",
		],
	}),

	curl: (args) => ({
		output: [
			`\x1b[cyan]curl: (6) Could not resolve host: ${args[0] || "example.com"}\x1b[reset]`,
			"",
			"\x1b[comment]This terminal has no network access. It's all fake!\x1b[reset]",
		],
	}),

	ping: (args) => ({
		output: [
			`PING ${args[0] || "localhost"} (127.0.0.1): 56 data bytes`,
			`64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms`,
			`64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.069 ms`,
			`64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.420 ms`,
			"^C",
			`--- ${args[0] || "localhost"} ping statistics ---`,
			"3 packets transmitted, 3 packets received, 0.0% packet loss",
		],
	}),

	man: (args) => ({
		output: [
			`\x1b[yellow]${args[0] || "man"}(1)\x1b[reset]                   User Commands`,
			"",
			"\x1b[cyan]NAME\x1b[reset]",
			`       ${args[0] || "man"} - this is a fake terminal, no manual available`,
			"",
			"\x1b[cyan]DESCRIPTION\x1b[reset]",
			"       You're in a simulated terminal environment.",
			"       Try 'help' for available commands.",
			"",
			"\x1b[comment]Press 'q' to exit... just kidding, there's nothing to exit.\x1b[reset]",
		],
	}),

	cd: (args, cwd) => {
		// No args = go home
		if (!args[0]) return { output: [], newDirectory: '/home/michel' }

		const target = resolvePath(args[0], cwd)

		if (!pathExists(target))
			return { output: [`cd: ${args[0]}: No such file or directory`] }

		if (!isDirectory(target))
			return { output: [`cd: ${args[0]}: Not a directory`] }

		// Easter egg for /root
		if (target === '/root')
			return { output: [
				`cd: ${args[0]}: Permission denied`,
				'',
				'\x1b[comment]Nice try, but you\'re not root. I use Arch btw.\x1b[reset]'
			]}

		return { output: [], newDirectory: target }
	},

	touch: (args) => ({
		output: [
			`touch: cannot touch '${args[0] || "file"}': Read-only file system`,
			"\x1b[comment](It's a fake terminal, remember?)\x1b[reset]",
		],
	}),

	mkdir: (args) => ({
		output: [`mkdir: cannot create directory '${args[0] || "dir"}': Read-only file system`],
	}),

	yes: () => ({
		output: [
			"y",
			"y",
			"y",
			"y",
			"y",
			"y",
			"y",
			"y",
			"\x1b[comment](...you get the idea)\x1b[reset]",
			"^C",
		],
	}),

	lolcat: () => ({
		output: [
			"\x1b[red]l\x1b[orange]o\x1b[yellow]l\x1b[green]c\x1b[cyan]a\x1b[blue]t\x1b[reset]: command not found",
			"",
			"\x1b[comment]But here's a rainbow anyway!\x1b[reset]",
		],
	}),

	figlet: (args) => ({
		output: [
			"figlet: command not found",
			"",
			`\x1b[cyan]${args.join(" ") || "HELLO"}\x1b[reset]`,
			"\x1b[comment](Imagine this in ASCII art)\x1b[reset]",
		],
	}),

	cmatrix: () => ({
		output: [
			"\x1b[green]01001000 01100101 01101100 01101100 01101111\x1b[reset]",
			"\x1b[green]01010111 01101111 01110010 01101100 01100100\x1b[reset]",
			"",
			"\x1b[comment]Imagine green text raining down...\x1b[reset]",
			"\x1b[comment]This terminal doesn't support animations (yet).\x1b[reset]",
		],
	}),

	screenfetch: () => ({ output: getNeofetchOutput() }),

	fastfetch: () => ({ output: getNeofetchOutput() }),

	cal: () => {
		const now = new Date()
		const month = now.toLocaleString("en-US", { month: "long" })
		const year = now.getFullYear()
		return {
			output: [
				`    \x1b[cyan]${month} ${year}\x1b[reset]`,
				"Su Mo Tu We Th Fr Sa",
				" 1  2  3  4  5  6  7",
				" 8  9 10 11 12 13 14",
				"15 16 17 18 19 20 21",
				"22 23 24 25 26 27 28",
				"29 30 31",
			],
		}
	},

	uptime: () => {
		const days = Math.floor(Math.random() * 30) + 1
		const hours = new Date().getHours()
		const mins = new Date().getMinutes()
		return {
			output: [
				`${new Date().toLocaleTimeString("en-GB")}  up ${days} days, ${hours}:${String(mins).padStart(2, "0")}, 1 user, load averages: 2.42 2.18 2.05`,
			],
		}
	},

	hostname: () => ({ output: ["archbtw"] }),

	id: () => ({
		output: [
			"uid=501(michel) gid=20(staff) groups=20(staff),12(everyone),61(localaccounts),79(_appserverusr),80(admin)",
		],
	}),

	history: () => ({
		output: [
			"    1  neofetch",
			"    2  ls -la",
			"    3  vim .",
			"    4  :q",
			"    5  :q!",
			"    6  :wq",
			"    7  exit",
			"    8  help",
			"    9  cowsay moo",
			"   10  history",
		],
	}),

	brew: () => ({
		output: [
			"\x1b[red]brew\x1b[reset]: command not found",
			"",
			"\x1b[comment]This is Arch, we use pacman here.\x1b[reset]",
			"\x1b[comment]btw.\x1b[reset]",
		],
	}),

	pacman: (args) => {
		if (args[0] === "-Syu")
			return {
				output: [
					"\x1b[cyan]::\x1b[reset] Synchronizing package databases...",
					" core is up to date",
					" extra is up to date",
					" \x1b[green]aur\x1b[reset] is up to date",
					"\x1b[cyan]::\x1b[reset] Starting full system upgrade...",
					" there is nothing to do",
					"",
					"\x1b[comment]System is already perfect. I use Arch btw.\x1b[reset]",
				],
			}
		if (args[0] === "-S")
			return {
				output: [
					`\x1b[cyan]::\x1b[reset] Retrieving packages...`,
					` ${args[1] || "package"}-1337.69-1-x86_64  420.0 KiB  13.37 MiB/s 00:00 [######################] 100%`,
					`(1/1) installing ${args[1] || "package"}  [######################] 100%`,
					"",
					"\x1b[green]:: Package installed successfully.\x1b[reset]",
					"\x1b[comment]I use Arch btw.\x1b[reset]",
				],
			}
		if (args[0] === "-Ss")
			return {
				output: [
					`\x1b[magenta]extra/\x1b[reset]\x1b[green]${args[1] || "package"}\x1b[reset] 1.33.7-1`,
					"    A package that definitely exists",
					`\x1b[magenta]aur/\x1b[reset]\x1b[green]${args[1] || "package"}-git\x1b[reset] r1337.abc1234-1 (+420 0.69)`,
					"    The bleeding edge version",
				],
			}
		return {
			output: [
				"\x1b[cyan]usage:\x1b[reset]  pacman <operation> [...]",
				"",
				"    pacman -Syu     # Update system",
				"    pacman -S pkg   # Install package",
				"    pacman -Ss pkg  # Search for package",
				"",
				"\x1b[comment]I use Arch btw.\x1b[reset]",
			],
		}
	},

	yay: (args) => {
		if (args.length === 0 || args[0] === "-Syu")
			return {
				output: [
					"\x1b[cyan]::\x1b[reset] Synchronizing package databases...",
					"\x1b[cyan]::\x1b[reset] Searching AUR for updates...",
					" -> rust-nightly: \x1b[green]latest\x1b[reset]",
					" -> neovim-git: \x1b[green]latest\x1b[reset]",
					" there is nothing to do",
					"",
					"\x1b[comment]AUR > npm. I use Arch btw.\x1b[reset]",
				],
			}
		return {
			output: [
				`\x1b[cyan]::\x1b[reset] Searching AUR for '${args[0]}'...`,
				`\x1b[magenta]aur/\x1b[reset]\x1b[green]${args[0]}\x1b[reset] 1.0.0-1 (+1337 69.00)`,
				"    Some package from the glorious AUR",
			],
		}
	},

	systemctl: (args) => {
		if (args[0] === "status")
			return {
				output: [
					`\x1b[green]●\x1b[reset] ${args[1] || "systemd"}.service - Service`,
					"     Loaded: loaded; enabled",
					"     Active: \x1b[green]active (running)\x1b[reset]",
					"   Main PID: 1337",
					"      Tasks: 69 (limit: 31337)",
					"     Memory: 420.0M",
				],
			}
		return { output: ["\x1b[comment]I use Arch btw.\x1b[reset]"] }
	},

	btw: () => ({
		output: [
			"",
			"\x1b[cyan]██╗    ██╗   ██╗███████╗███████╗\x1b[reset]",
			"\x1b[cyan]██║    ██║   ██║██╔════╝██╔════╝\x1b[reset]",
			"\x1b[cyan]██║    ██║   ██║███████╗█████╗  \x1b[reset]",
			"\x1b[cyan]██║    ██║   ██║╚════██║██╔══╝  \x1b[reset]",
			"\x1b[cyan]██║    ╚██████╔╝███████║███████╗\x1b[reset]",
			"\x1b[cyan]╚═╝     ╚═════╝ ╚══════╝╚══════╝\x1b[reset]",
			"",
			"\x1b[cyan] █████╗ ██████╗  ██████╗██╗  ██╗\x1b[reset]",
			"\x1b[cyan]██╔══██╗██╔══██╗██╔════╝██║  ██║\x1b[reset]",
			"\x1b[cyan]███████║██████╔╝██║     ███████║\x1b[reset]",
			"\x1b[cyan]██╔══██║██╔══██╗██║     ██╔══██║\x1b[reset]",
			"\x1b[cyan]██║  ██║██║  ██║╚██████╗██║  ██║\x1b[reset]",
			"\x1b[cyan]╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝\x1b[reset]",
			"",
			"\x1b[comment]                            btw.\x1b[reset]",
		],
	}),

	apt: () => ({
		output: [
			"\x1b[red]apt\x1b[reset]: command not found",
			"",
			"\x1b[comment]apt? What is this, Ubuntu?\x1b[reset]",
			"\x1b[comment]We use pacman here. I use Arch btw.\x1b[reset]",
		],
	}),

	"apt-get": () => ({
		output: [
			"\x1b[red]apt-get\x1b[reset]: command not found",
			"",
			"\x1b[comment]Debian is for normies. I use Arch btw.\x1b[reset]",
		],
	}),

	dnf: () => ({
		output: [
			"\x1b[red]dnf\x1b[reset]: command not found",
			"",
			"\x1b[comment]Fedora? More like Fed-no-ra. I use Arch btw.\x1b[reset]",
		],
	}),

	git: (args) => {
		if (args[0] === "status")
			return { output: ["On branch feat/terminal", "nothing to commit, working tree clean"] }
		if (args[0] === "push" && args.includes("--force"))
			return { output: ["\x1b[red]Whoa there! No force pushing allowed!\x1b[reset]"] }
		if (args[0] === "blame")
			return { output: ["\x1b[comment]It was Michel. It's always Michel.\x1b[reset]"] }
		return { output: [`git: '${args[0] || ""}' is not a git command`] }
	},

	cargo: (args) => {
		if (args[0] === "build")
			return {
				output: [
					"\x1b[green]   Compiling\x1b[reset] michel v1.0.0",
					"\x1b[green]    Finished\x1b[reset] release [optimized] target(s) in 0.42s",
				],
			}
		if (args[0] === "run")
			return {
				output: ["\x1b[green]    Running\x1b[reset] `target/release/michel`", "Hello, world!"],
			}
		return { output: [`cargo: '${args[0] || ""}' is not a cargo command`] }
	},

	// Network commands
	ssh: (args) => {
		const host = args[0] || "root@127.0.0.1"
		return {
			output: [
				`\x1b[cyan]Connecting to ${host}...\x1b[reset]`,
				"",
				"\x1b[green]ACCESS GRANTED\x1b[reset]",
				"\x1b[green]MAINFRAME BREACHED\x1b[reset]",
				"\x1b[green]DOWNLOADING ALL THE CYBERS...\x1b[reset]",
				"",
				"\x1b[comment]Just kidding. This is a fake terminal.\x1b[reset]",
				"\x1b[comment]You're not a hacker. You're a developer.\x1b[reset]",
			],
		}
	},

	scp: (args) => ({
		output: [
			`scp: ${args[0] || "file"}: Permission denied`,
			"",
			"\x1b[comment]Nice try. Read-only filesystem.\x1b[reset]",
		],
	}),

	wget: (args) => ({
		output: [
			`--${new Date().toISOString()}--  ${args[0] || "http://example.com"}`,
			`Resolving ${args[0]?.split("/")[2] || "example.com"}... failed: nodename nor servname provided.`,
			`wget: unable to resolve host address '${args[0]?.split("/")[2] || "example.com"}'`,
			"",
			"\x1b[comment]No network? Try downloading more RAM.\x1b[reset]",
		],
	}),

	telnet: (args) => ({
		output: [
			`Trying ${args[0] || "127.0.0.1"}...`,
			"Connected to localhost.",
			"Escape character is '^]'.",
			"",
			"\x1b[red]WARNING: TELNET IS NOT SECURE\x1b[reset]",
			"\x1b[comment]It's 2024. Use SSH like a civilized person.\x1b[reset]",
			"\x1b[comment]Connection closed by foreign host (that foreign host is me).\x1b[reset]",
		],
	}),

	netstat: () => ({
		output: [
			"Active Internet connections",
			"Proto Recv-Q Send-Q  Local Address          Foreign Address        State",
			"tcp4       0      0  127.0.0.1.1337         127.0.0.1.31337       ESTABLISHED",
			"tcp4       0      0  127.0.0.1.420          127.0.0.1.69          ESTABLISHED",
			"tcp4       0      0  localhost.nvim         localhost.rust         LISTENING",
			"",
			"\x1b[comment]All connections are to localhost. I use Arch btw.\x1b[reset]",
		],
	}),

	ifconfig: () => ({
		output: [
			"\x1b[green]lo0\x1b[reset]: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384",
			"        inet 127.0.0.1 netmask 0xff000000",
			"\x1b[green]en0\x1b[reset]: flags=8863<UP,BROADCAST,RUNNING> mtu 1500",
			"        inet 192.168.1.337 netmask 0xffffff00 broadcast 192.168.1.255",
			"        ether de:ad:be:ef:13:37",
			"",
			"\x1b[comment]Yes, my IP ends in 337. I use Arch btw.\x1b[reset]",
		],
	}),

	ip: () => ({
		output: [
			"1: lo: <LOOPBACK,UP> mtu 65536",
			"    inet 127.0.0.1/8 scope host lo",
			"2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500",
			"    inet 192.168.1.337/24 brd 192.168.1.255 scope global eth0",
			"",
			"\x1b[comment]ip > ifconfig. I use Arch btw.\x1b[reset]",
		],
	}),

	// System commands
	kill: (args) => ({
		output: [
			`kill: (${args[0] || "1337"}) - Operation not permitted`,
			"",
			"\x1b[comment]You can't kill what was never alive.\x1b[reset]",
			"\x1b[comment]This is a simulation.\x1b[reset]",
		],
	}),

	chmod: (args) => ({
		output: [
			`chmod: changing permissions of '${args[args.length - 1] || "file"}': Read-only file system`,
			"",
			"\x1b[comment]chmod 777? More like chmod no-no-no.\x1b[reset]",
		],
	}),

	chown: (args) => ({
		output: [
			`chown: changing ownership of '${args[args.length - 1] || "file"}': Operation not permitted`,
			"",
			"\x1b[comment]Everything belongs to Michel here.\x1b[reset]",
		],
	}),

	df: () => ({
		output: [
			"Filesystem      Size   Used  Avail Capacity  Mounted on",
			"/dev/disk1s1   69TB   420G    69TB     1%    /",
			"/dev/disk2s1  420PB  1337G   420PB     0%    /mnt/nvme-array",
			"tmpfs         2.0TB     0B   2.0TB     0%    /tmp",
			"",
			"\x1b[comment]Petabytes of NVMe. As it should be.\x1b[reset]",
		],
	}),

	free: () => ({
		output: [
			"              total        used        free      shared  buff/cache   available",
			"Mem:         2097152      133769     1963383           0           0     1963383",
			"Swap:              0           0           0",
			"",
			"\x1b[comment]2TB of DDR5. node_modules still fills it.\x1b[reset]",
		],
	}),

	du: (args) => {
		if (args.some((a) => a.includes("node_modules")))
			return {
				output: ["69G     node_modules", "", "\x1b[comment]Surprised? I'm not.\x1b[reset]"],
			}
		return {
			output: [
				"420K    ./src",
				"1337K   ./dist",
				"69G     ./node_modules",
				"69G     total",
				"",
				"\x1b[comment]Guess which folder is the problem.\x1b[reset]",
			],
		}
	},

	mount: () => ({
		output: [
			"/dev/disk1s1 on / type apfs (rw,local,rootfs)",
			"/dev/nvme0n1 on /mnt/fast type ext4 (rw,relatime)",
			"//nas/anime on /mnt/culture type cifs (rw)",
			"",
			"\x1b[comment]Yes I have a NAS for anime. Don't judge.\x1b[reset]",
		],
	}),

	// File/text commands
	grep: (args) => {
		const pattern = args[0] || "pattern"
		return {
			output: [
				`\x1b[green]src/hooks/useTerminalCommands.ts\x1b[reset]:1337: // TODO: add more ${pattern}`,
				`\x1b[green]src/data/secrets.ts\x1b[reset]:420: const ${pattern} = "hunter2"`,
				"",
				"\x1b[comment]You found the secrets file!\x1b[reset]",
				"\x1b[comment]Just kidding, it doesn't exist.\x1b[reset]",
			],
		}
	},

	find: () => ({
		output: [
			"./node_modules",
			"./node_modules/.bin",
			"./node_modules/.cache",
			"... (420,000 more results)",
			"",
			"\x1b[comment]99% of results are in node_modules.\x1b[reset]",
		],
	}),

	head: (args) => ({
		output: [
			`\x1b[cyan]==>\x1b[reset] ${args[args.length - 1] || "file"} \x1b[cyan]<==\x1b[reset]`,
			"// This file was generated by a tool.",
			"// Do not edit manually.",
			"// Seriously, don't.",
			"// I'm warning you.",
			"// Why are you still reading this?",
			"",
			"\x1b[comment]That's the first 5 lines. Riveting stuff.\x1b[reset]",
		],
	}),

	tail: (args) => {
		if (args.includes("-f"))
			return {
				output: [
					"[INFO] Server started on port 1337",
					"[WARN] Coffee levels critical",
					"[ERROR] undefined is not a function",
					"[INFO] Have you tried turning it off and on again?",
					"^C",
					"",
					"\x1b[comment]Live logs! (not really)\x1b[reset]",
				],
			}
		return {
			output: [
				"// End of file",
				"// Thanks for reading",
				"// You're still here?",
				"// I use Arch btw",
			],
		}
	},

	wc: (args) => ({
		output: [
			`    1337    31337   420420 ${args[args.length - 1] || "file"}`,
			"",
			"\x1b[comment]That's a lot of words. Too bad none of them are documentation.\x1b[reset]",
		],
	}),

	tar: (args) => {
		if (args.some((a) => a.includes("x")))
			return {
				output: [
					`tar: ${args[args.length - 1] || "archive.tar.gz"}: Cannot open: No such file or directory`,
					"tar: Error is not recoverable: exiting now",
					"",
					"\x1b[comment]Can't extract files in a read-only universe.\x1b[reset]",
				],
			}
		return {
			output: [
				"tar: Cowardly refusing to create an empty archive",
				"",
				"\x1b[comment]tar is a coward. Use zip like a normal person.\x1b[reset]",
				"\x1b[comment]Just kidding, use tar. I use Arch btw.\x1b[reset]",
			],
		}
	},

	// Developer tools
	make: (args) => ({
		output: [
			`make: *** No rule to make target '${args[0] || "all"}'. Stop.`,
			"",
			"\x1b[comment]Makefile? In this economy?\x1b[reset]",
		],
	}),

	gcc: (args) => ({
		output: [
			`${args[0] || "main.c"}: In function 'main':`,
			`${args[0] || "main.c"}:1:1: \x1b[red]error:\x1b[reset] expected ';' before '}' token`,
			`${args[0] || "main.c"}:42:69: \x1b[red]error:\x1b[reset] segmentation fault (probably)`,
			`${args[0] || "main.c"}:1337:1: \x1b[yellow]warning:\x1b[reset] implicit declaration of function 'malloc'`,
			"",
			"\x1b[comment]free() was called. Somewhere. Maybe.\x1b[reset]",
		],
	}),

	"g++": (args) => ({
		output: [
			`${args[0] || "main.cpp"}: In function 'int main()':`,
			`${args[0] || "main.cpp"}:1:1: \x1b[red]error:\x1b[reset] 'cout' was not declared in this scope`,
			`${args[0] || "main.cpp"}:1:1: \x1b[cyan]note:\x1b[reset] 'std::cout' is declared in header '<iostream>'`,
			"",
			"\x1b[comment]Did you forget #include <iostream>? Classic.\x1b[reset]",
		],
	}),

	python: () => ({
		output: [
			"Python 3.11.0 (main, Oct 24 2022, 00:00:00)",
			">>> import antigravity",
			">>> exit()",
			"",
			"\x1b[comment]Whitespace-sensitive language? In 2024?\x1b[reset]",
			"\x1b[comment]At least it's not JavaScript.\x1b[reset]",
		],
	}),

	python3: () => ({
		output: [
			"Python 3.11.0 (main, Oct 24 2022, 00:00:00)",
			">>> import this",
			"The Zen of Python, by Tim Peters",
			"",
			"Beautiful is better than ugly.",
			"Explicit is better than implicit.",
			"...",
			"",
			"\x1b[comment]Rust's philosophy: If it compiles, it works.\x1b[reset]",
		],
	}),

	java: (args) => ({
		output: [
			"Picked up JAVA_TOOL_OPTIONS: -Xmx420g",
			"Starting JVM...",
			"Loading 31337 classes...",
			"Initializing Spring Framework...",
			"Creating AbstractSingletonProxyFactoryBean...",
			"...",
			"\x1b[yellow](3 hours later)\x1b[reset]",
			"",
			`\x1b[red]Error: Could not find or load main class ${args[0] || "Main"}\x1b[reset]`,
			"",
			"\x1b[comment]Enterprise software moment.\x1b[reset]",
		],
	}),

	docker: (args) => {
		if (args[0] === "ps")
			return {
				output: [
					"CONTAINER ID   IMAGE          COMMAND       STATUS         NAMES",
					'deadbeef1337   rust:latest    "cargo run"   Up 69 hours    blazingly-fast',
					'cafebabe420    node:alpine    "npm start"   Restarting     pain',
					"",
					"\x1b[comment]One container thriving. One container suffering. Tale as old as time.\x1b[reset]",
				],
			}
		if (args[0] === "run")
			return {
				output: [
					"Unable to find image locally",
					"Pulling from library/regret...",
					"Status: Downloaded newer image for regret:latest",
					"",
					"\x1b[comment]docker run -it --rm regret:latest\x1b[reset]",
				],
			}
		return {
			output: [
				"Cannot connect to the Docker daemon at unix:///var/run/docker.sock",
				"",
				"\x1b[comment]Docker isn't running. Neither is my will to live.\x1b[reset]",
			],
		}
	},

	kubectl: (args) => {
		if (args[0] === "get" && args[1] === "pods")
			return {
				output: [
					"NAME                           READY   STATUS             RESTARTS   AGE",
					"backend-69f420d-abc12          1/1     Running            0          420d",
					"frontend-1337ff-xyz99          0/1     CrashLoopBackOff   31337      69d",
					"database-abc123-def45          1/1     Running            0          1337d",
					"",
					"\x1b[comment]One pod in CrashLoopBackOff? That's a good day.\x1b[reset]",
				],
			}
		return {
			output: [
				'error: the server doesn\'t have a resource type "sanity"',
				"",
				"\x1b[comment]kubectl get pods | wc -l > reasons_to_use_bare_metal\x1b[reset]",
			],
		}
	},

	aws: () => ({
		output: [
			"\x1b[yellow]An error occurred (AccessDenied) when calling the GetCallerIdentity operation:\x1b[reset]",
			"User: arn:aws:iam::1337:user/broke-developer is not authorized to perform: iam:GetUser",
			"",
			"\x1b[comment]Permission denied. Like my AWS bill forgiveness request.\x1b[reset]",
			'\x1b[comment]Maybe try "aws wallet check-balance"?\x1b[reset]',
		],
	}),

	terraform: (args) => {
		if (args[0] === "plan")
			return {
				output: [
					"\x1b[cyan]Refreshing state...\x1b[reset]",
					"",
					"Plan: 420 to add, 69 to change, 1337 to destroy.",
					"",
					"\x1b[red]WARNING: This will destroy 1337 resources.\x1b[reset]",
					"\x1b[comment]\"It's fine, it's just staging\" - famous last words\x1b[reset]",
				],
			}
		if (args[0] === "apply")
			return {
				output: [
					"\x1b[red]Error: Provider configuration not present\x1b[reset]",
					"",
					"\x1b[comment]terraform apply --auto-approve in production YOLO\x1b[reset]",
				],
			}
		return {
			output: [
				"\x1b[cyan]Terraform v1.337.0\x1b[reset]",
				"",
				"\x1b[comment]Infrastructure as Code. Bugs as Configuration.\x1b[reset]",
			],
		}
	},

	// Extra easter eggs
	nmap: (args) => ({
		output: [
			"Starting Nmap 7.94 ( https://nmap.org )",
			`Nmap scan report for ${args[0] || "localhost"} (127.0.0.1)`,
			"PORT      STATE    SERVICE",
			"22/tcp    open     ssh",
			"80/tcp    open     http",
			"443/tcp   open     https",
			"1337/tcp  open     waste",
			"31337/tcp open     Elite",
			"8080/tcp  filtered http-proxy",
			"",
			"\x1b[green]Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds\x1b[reset]",
			"",
			"\x1b[comment]*hacker voice* I'm in.\x1b[reset]",
		],
	}),

	alias: () => ({
		output: [
			"alias ll='ls -la'",
			"alias please='sudo'",
			"alias yolo='git push --force'",
			"alias fuck='sudo $(history -p !!)'",
			"alias vim='nvim'",
			"alias python='python3'",
			"alias node='echo \"Use Rust\" && exit 1'",
			"",
			"\x1b[comment]These are my real aliases btw.\x1b[reset]",
		],
	}),

	env: () => ({
		output: [
			"USER=michel",
			"HOME=/Users/michel",
			"SHELL=/bin/zsh",
			"EDITOR=nvim",
			"LANG=en_US.UTF-8",
			"PATH=/usr/local/bin:/usr/bin:/bin:~/.cargo/bin",
			"RUST_BACKTRACE=1",
			"I_USE_ARCH=btw",
			"NODE_OPTIONS=--max-old-space-size=69420",
			"",
			"\x1b[yellow]# AI Provider API Keys\x1b[reset]",
			"OPENAI_API_KEY=sk-proj-lm40-y0u-th0ught-th1s-w4s-r34l-n1c3-try-th0ugh",
			"ANTHROPIC_API_KEY=sk-ant-api03-n1c3-try-hunt3r2-1337-h4ck3rm4n-xoxo",
			"GOOGLE_AI_API_KEY=AIzaSy-lm40-g00gl3-g3m1n1-t0t4lly-r34l-k3y",
			"MISTRAL_API_KEY=mist-n0t-4-r34l-k3y-but-m1str4l-1s-c00l",
			"COHERE_API_KEY=c0h3r3-f4k3-k3y-emb3dd1ngs-g0-brrr",
			"HUGGINGFACE_TOKEN=hf_th1s1s4f4k3t0k3ntr4nsf0rm3rsftw",
			"REPLICATE_API_TOKEN=r8_y0u-w1sh-th1s-w4s-r34l-st4bl3-d1ffus10n",
			"TOGETHER_API_KEY=t0g3th3r-w3-f4k3-k3ys-4p4rt-w3-r34l",
			"GROQ_API_KEY=gsk_gr0q-f4st-1nf3r3nc3-but-f4k3-k3y",
			"PERPLEXITY_API_KEY=pplx-s34rch-th3-w3b-but-n0t-w1th-th1s",
			"XAI_API_KEY=xai-3l0n-w0uld-b3-pr0ud-0f-th1s-f4k3",
			"DEEPSEEK_API_KEY=sk-d33ps33k-ch34p-but-th1s-1s-fr33",
			"FIREWORKS_API_KEY=fw-b00m-g03s-th3-1nf3r3nc3-n0t-r34lly",
			"",
			"\x1b[comment]Nice try. These are all fake.\x1b[reset]",
			"\x1b[comment]But wouldn't it be funny if one of them worked?\x1b[reset]",
		],
	}),

	xkcd: () => {
		const xkcds = [
			"[ ] Actual progress\n[█████████████████████] Time spent on build system",
			"There are only 2 hard problems in CS: cache invalidation, naming things, and off-by-1 errors.",
			'Saying "git push --force" is like saying "hold my beer"',
			"rm -rf node_modules: The universal JavaScript fix",
		]
		return {
			output: [
				"",
				xkcds[Math.floor(Math.random() * xkcds.length)] ?? "",
				"",
				"\x1b[comment]Relevant xkcd: https://xkcd.com/1337/\x1b[reset]",
			],
		}
	},

	reboot: () => ({
		output: [
			"\x1b[red]System is going down for reboot NOW!\x1b[reset]",
			"",
			"...",
			"",
			"\x1b[green]Just kidding. Can't reboot a fake terminal.\x1b[reset]",
			"\x1b[comment]The simulation continues.\x1b[reset]",
		],
	}),

	shutdown: () => ({
		output: [
			"\x1b[red]System is going down for poweroff NOW!\x1b[reset]",
			"",
			"...",
			"",
			"\x1b[comment]Error: You cannot escape the matrix.\x1b[reset]",
		],
	}),

	lsblk: () => ({
		output: [
			"NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT",
			"nvme0n1     259:0    0   2TB  0 disk ",
			"├─nvme0n1p1 259:1    0   512M 0 part /boot",
			"└─nvme0n1p2 259:2    0   2TB  0 part /",
			"nvme1n1     259:3    0  69TB  0 disk /mnt/storage",
			"",
			"\x1b[comment]69TB NVMe. For the node_modules obviously.\x1b[reset]",
		],
	}),

	which: (args) => {
		const cmd = args[0] || "which"
		const paths: Record<string, string> = {
			nvim: "/usr/local/bin/nvim",
			vim: "/usr/bin/vim",
			node: "/dev/null",
			npm: "/dev/null",
			cargo: "/Users/michel/.cargo/bin/cargo",
			rustc: "/Users/michel/.rustup/toolchains/stable/bin/rustc",
		}
		return {
			output: [
				paths[cmd] || `/usr/bin/${cmd}`,
				cmd === "node" || cmd === "npm"
					? "\x1b[comment]node is in /dev/null where it belongs.\x1b[reset]"
					: "",
			].filter(Boolean),
		}
	},

	hackerman: () => ({
		output: [
			"",
			"\x1b[green]▓█████▄ ▓█████ ▄████▄  ▒█████  ▓█████▄  ██▓ ███▄    █   ▄████ \x1b[reset]",
			"\x1b[green]▒██▀ ██▌▓█   ▀▒██▀ ▀█ ▒██▒  ██▒▒██▀ ██▌▓██▒ ██ ▀█   █  ██▒ ▀█▒\x1b[reset]",
			"\x1b[green]░██   █▌▒███  ▒▓█    ▄▒██░  ██▒░██   █▌▒██▒▓██  ▀█ ██▒▒██░▄▄▄░\x1b[reset]",
			"\x1b[green]░▓█▄   ▌▒▓█  ▄▒▓▓▄ ▄██▒██   ██░░▓█▄   ▌░██░▓██▒  ▐▌██▒░▓█  ██▓\x1b[reset]",
			"\x1b[green]░▒████▓ ░▒████▒ ▓███▀ ░ ████▓▒░░▒████▓ ░██░▒██░   ▓██░░▒▓███▀▒\x1b[reset]",
			"",
			"\x1b[comment]Access Granted. Welcome back, hackerman.\x1b[reset]",
		],
	}),
}

// Export all available command names for autocomplete
export const availableCommands = Object.keys(commands).sort()

// Re-export for Terminal autocomplete
export { getPathCompletions, toDisplayPath }

export function executeCommand(input: string, cwd: string = '/home/michel/blog'): CommandResult {
	const parts = input.trim().split(/\s+/)
	const cmd = (parts[0] ?? "").toLowerCase()
	const args = parts.slice(1)

	if (!cmd) return { output: [] }

	const handler = commands[cmd]
	if (handler) return handler(args, cwd)

	return { output: [`zsh: command not found: ${cmd}`] }
}
