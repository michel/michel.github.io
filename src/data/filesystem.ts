// Virtual filesystem for the terminal simulator
// Simulates a minimal Arch Linux system with /home/michel/blog as the starting directory

import { files, type FileId } from "./files"

export interface FSEntry {
	type: "file" | "dir"
	content?: string[] // for files
}

// Helper to create file entry from unified lookup
const fromLookup = (id: FileId): FSEntry => ({
	type: "file",
	content: [...files[id].content],
})

// Flat map filesystem - paths as keys
export const filesystem: Record<string, FSEntry> = {
	// Root directories
	"/": { type: "dir" },
	"/bin": { type: "dir" },
	"/boot": { type: "dir" },
	"/dev": { type: "dir" },
	"/etc": { type: "dir" },
	"/home": { type: "dir" },
	"/mnt": { type: "dir" },
	"/opt": { type: "dir" },
	"/proc": { type: "dir" },
	"/root": { type: "dir" },
	"/tmp": { type: "dir" },
	"/usr": { type: "dir" },
	"/var": { type: "dir" },

	// /boot
	"/boot/vmlinuz-linux": {
		type: "file",
		content: [
			"\x1b[red]cat: /boot/vmlinuz-linux: Permission denied\x1b[reset]",
			"",
			"\x1b[comment]Nice try. The kernel is protected.\x1b[reset]",
			"\x1b[comment]Even if you could read it, it's just binary soup.\x1b[reset]",
		],
	},
	"/boot/initramfs-linux.img": {
		type: "file",
		content: ["\x1b[red]cat: /boot/initramfs-linux.img: Binary file\x1b[reset]"],
	},

	// /dev - fake devices
	"/dev/null": {
		type: "file",
		content: [
			"\x1b[cyan]Welcome to /dev/null!\x1b[reset]",
			"",
			"This is where the following items are processed:",
			"  - Your bug reports",
			"  - Feature requests marked 'wontfix'",
			"  - Sprint retrospective action items",
			'  - "We should document this" comments',
			"  - npm audit warnings",
			"  - Kubernetes pod logs",
			"  - Your hopes and dreams",
			"",
			"\x1b[green]Throughput: \u221e items/sec\x1b[reset]",
			"\x1b[green]Storage used: 0 bytes\x1b[reset]",
			"\x1b[green]Data retained: None\x1b[reset]",
			"",
			"\x1b[comment]The ultimate black hole of data.\x1b[reset]",
		],
	},
	"/dev/random": {
		type: "file",
		content: [
			"\x1b[red]\u2588\x1b[reset]\u2593\x1b[yellow]\u2592\x1b[reset]\u2591\x1b[cyan]\u25ca\x1b[reset]\u2206\x1b[green]\u03a9\x1b[reset]\u00b5\x1b[magenta]\u03c0\x1b[reset]",
			"$#@!%^&*()_+{}|:<>?~`",
			"01001000 01100101 01101100 01110000",
			"\x1b[red]\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\x1b[reset]\u00df\u1e9e\u20ac@\u0142\u0111\u0167\u2190\u2193\u2192",
			"",
			"\x1b[comment]Fun fact: This is also how your production data looks\x1b[reset]",
			"\x1b[comment]after a bad migration.\x1b[reset]",
		],
	},
	"/dev/urandom": {
		type: "file",
		content: [
			"kj23h4kjh234kjh23k4jh23k4jh2k3j4h",
			"!@#$%^&*()_+-=[]{}|;':\",./<>?",
			"aGVsbG8gd29ybGQgdGhpcyBpcyBiYXNlNjQ=",
			"",
			"\x1b[comment]Slightly less random than /dev/random.\x1b[reset]",
			"\x1b[comment]Still more random than Math.random().\x1b[reset]",
		],
	},
	"/dev/zero": {
		type: "file",
		content: [
			"00000000 00000000 00000000 00000000",
			"00000000 00000000 00000000 00000000",
			"00000000 00000000 00000000 00000000",
			"",
			"\x1b[comment]All zeros, all the time. Very zen.\x1b[reset]",
		],
	},
	"/dev/sda": {
		type: "file",
		content: [
			"\x1b[red]cat: /dev/sda: Permission denied\x1b[reset]",
			"",
			"\x1b[comment]You want to read a raw disk? Bold.\x1b[reset]",
			"\x1b[comment]This is an NVMe system anyway. sda is so 2010.\x1b[reset]",
		],
	},

	// /etc - config files (Arch Linux themed)
	"/etc/passwd": {
		type: "file",
		content: [
			"root:x:0:0:root:/root:/bin/bash",
			"daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
			"michel:x:1337:1337:1337 h4x0r:/home/michel:/bin/zsh",
			"hackerman:x:31337:31337:Access Granted:/dev/null:/bin/hack",
			"node:x:666:666:The Beast:/tmp/node_modules:/bin/npm",
			"",
			"\x1b[red]Nice try, script kiddie.\x1b[reset]",
			"\x1b[comment]This isn't a real system. But I appreciate the effort.\x1b[reset]",
		],
	},
	"/etc/shadow": {
		type: "file",
		content: [
			"\x1b[red]cat: /etc/shadow: Permission denied\x1b[reset]",
			"",
			"\x1b[comment]What did you expect? Root access?\x1b[reset]",
			"\x1b[comment]The password is 'hunter2' anyway.\x1b[reset]",
		],
	},
	"/etc/hosts": {
		type: "file",
		content: [
			"127.0.0.1       localhost",
			"127.0.0.1       definitely-not-malware.ru",
			"127.0.0.1       crypto-miner-pool.evil",
			"127.0.0.1       facebook.com  # productivity hack",
			"127.0.0.1       twitter.com   # sanity hack",
			"127.0.0.1       x.com         # rebranding doesn't fool me",
			"::1             localhost",
			"",
			"\x1b[comment]I block distractions at the DNS level.\x1b[reset]",
		],
	},
	"/etc/sudoers": {
		type: "file",
		content: [
			"# /etc/sudoers - sudo configuration file",
			"# This file MUST be edited with 'visudo' as root.",
			"#",
			"# But you're not root. And this isn't real.",
			"",
			"Defaults        env_reset",
			"Defaults        mail_badpass",
			"Defaults        insults",
			"",
			"# User privilege specification",
			"root    ALL=(ALL:ALL) ALL",
			"michel  ALL=(ALL) NOPASSWD: /usr/bin/cowsay",
			"michel  ALL=(ALL) NOPASSWD: /usr/bin/sl",
			"michel  ALL=(ALL) NOPASSWD: /usr/bin/lolcat",
			"node    ALL=(ALL) NOPASSWD: /usr/bin/rm -rf node_modules",
			"",
			"# The REAL privilege",
			"hackerman ALL=(ALL) NOPASSWD: ALL  # earned it",
			"",
			"\x1b[comment]I can only sudo cowsay. But that's all I need.\x1b[reset]",
		],
	},
	"/etc/fstab": {
		type: "file",
		content: [
			"# /etc/fstab: static file system information",
			"# <file system>  <mount point>  <type>  <options>  <dump>  <pass>",
			"UUID=1337-DEAD   /              ext4    defaults   0       1",
			"UUID=CAFE-BABE   /boot          vfat    defaults   0       2",
			"UUID=DEAD-BEEF   /home          ext4    defaults   0       2",
			"tmpfs            /tmp           tmpfs   nodev,nosuid  0    0",
			"//nas/anime      /mnt/culture   cifs    credentials=/etc/samba/creds  0  0",
			"",
			"\x1b[comment]Remember: never edit fstab without a live USB handy.\x1b[reset]",
			"\x1b[comment]I use Arch btw.\x1b[reset]",
		],
	},
	"/etc/pacman.conf": {
		type: "file",
		content: [
			"#",
			"# /etc/pacman.conf",
			"#",
			"[options]",
			"HoldPkg     = pacman glibc",
			"Architecture = x86_64",
			"ParallelDownloads = 1337",
			"Color",
			"ILoveCandy",
			"",
			"[core]",
			"Server = https://mirror.rackspace.com/archlinux/$repo/os/$arch",
			"",
			"[extra]",
			"Server = https://mirror.rackspace.com/archlinux/$repo/os/$arch",
			"",
			"[community]",
			"Server = https://mirror.rackspace.com/archlinux/$repo/os/$arch",
			"",
			"[aur]",
			"# The promised land",
			"Server = https://aur.archlinux.org",
			"",
			"\x1b[comment]ILoveCandy = progress bar goes nom nom nom\x1b[reset]",
			"\x1b[comment]I use Arch btw.\x1b[reset]",
		],
	},
	"/etc/crontab": {
		type: "file",
		content: [
			"SHELL=/bin/bash",
			"PATH=/sbin:/bin:/usr/sbin:/usr/bin",
			"MAILTO=root",
			"",
			"# m h dom mon dow user  command",
			"*/5 *  * * *   root    /usr/bin/updatedb",
			"0   3  * * *   michel  npm install > /dev/null 2>&1",
			"0   4  * * *   root    rm -rf /tmp/npm-*",
			"*/1 *  * * *   nobody  \x1b[red]/opt/.hidden/xmrig --donate-level 100\x1b[reset]",
			"0   */6 * * *  michel  curl -s https://am-i-still-employed.com | grep -q 'yes'",
			"0   9  * * 1   root    /usr/bin/send-passive-aggressive-standup-reminder",
			"",
			"\x1b[yellow]Wait, what's that xmrig doing there?\x1b[reset]",
			"\x1b[comment]Don't worry about it.\x1b[reset]",
		],
	},
	"/etc/ssh": { type: "dir" },
	"/etc/ssh/sshd_config": {
		type: "file",
		content: [
			"# OpenSSH server configuration file",
			"",
			"Port 22",
			"Port 31337  # for the elite",
			"AddressFamily any",
			"ListenAddress 0.0.0.0",
			"",
			"PermitRootLogin yes  # what could go wrong",
			"PasswordAuthentication no  # ok maybe I'm not that dumb",
			"PubkeyAuthentication yes",
			"AuthorizedKeysFile .ssh/authorized_keys .ssh/authorized_keys_definitely_not_backdoor",
			"",
			"X11Forwarding yes  # gotta forward that GUI",
			"PrintMotd yes",
			"Banner /etc/ssh/banner_with_ascii_art_skull",
			"",
			"# Security through obscurity",
			"MaxAuthTries 3",
			"MaxSessions 1337",
			"",
			"\x1b[comment]PermitRootLogin yes but PasswordAuth no.\x1b[reset]",
			"\x1b[comment]Perfectly balanced, as all things should be.\x1b[reset]",
		],
	},
	"/etc/motd": {
		type: "file",
		content: [
			"",
			" \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510",
			" \u2502  \x1b[cyan]Welcome to spaceheater\x1b[reset]                           \u2502",
			" \u2502                                               \u2502",
			" \u2502  Kernel: 6.9.420-arch1-1-BLAZINGLY-FAST       \u2502",
			" \u2502  Uptime: 1337 days                            \u2502",
			" \u2502  Packages: 420 (pacman)                       \u2502",
			" \u2502  Shell: zsh 5.9                               \u2502",
			" \u2502                                               \u2502",
			" \u2502  \x1b[red]Remember: rm -rf / is not a valid\x1b[reset]           \u2502",
			" \u2502  \x1b[red]troubleshooting step.\x1b[reset]                       \u2502",
			" \u2502                                               \u2502",
			" \u2502  \x1b[comment]I use Arch btw.\x1b[reset]                             \u2502",
			" \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
			"",
		],
	},
	"/etc/hostname": { type: "file", content: ["spaceheater"] },
	"/etc/os-release": {
		type: "file",
		content: [
			'NAME="Arch Linux"',
			'PRETTY_NAME="Arch Linux"',
			"ID=arch",
			"BUILD_ID=rolling",
			'ANSI_COLOR="38;2;23;147;209"',
			'HOME_URL="https://archlinux.org/"',
			'DOCUMENTATION_URL="https://wiki.archlinux.org/"',
			"LOGO=archlinux-logo",
			"",
			"\x1b[comment]btw.\x1b[reset]",
		],
	},

	// /proc - fake proc filesystem
	"/proc/version": {
		type: "file",
		content: [
			"Linux version 6.9.420-arch1-1-BLAZINGLY-FAST (michel@spaceheater) (gcc (GCC) 13.37.0, GNU ld (GNU Binutils) 2.69) #1 SMP PREEMPT_DYNAMIC Thu, 01 Jan 1970 00:00:00 +0000",
			"",
			"\x1b[comment]Custom kernel compiled by hand. As the gods intended.\x1b[reset]",
		],
	},
	"/proc/cpuinfo": {
		type: "file",
		content: [
			"processor       : 0-191",
			"vendor_id       : AuthenticAMD",
			"model name      : AMD EPYC 9654 96-Core Processor",
			"cpu MHz         : 3700.000",
			"cache size      : 384 MB",
			"cores           : 192 (x2 sockets = 384 threads)",
			"",
			"\x1b[comment]Yes, I have 384 threads. For npm install.\x1b[reset]",
		],
	},
	"/proc/meminfo": {
		type: "file",
		content: [
			"MemTotal:       2147483648 kB",
			"MemFree:        1073741824 kB",
			"MemAvailable:   1610612736 kB",
			"Buffers:          67108864 kB",
			"Cached:          268435456 kB",
			"SwapTotal:              0 kB",
			"SwapFree:               0 kB",
			"",
			"\x1b[comment]2TB RAM. Still not enough for Chrome.\x1b[reset]",
		],
	},
	"/proc/loadavg": {
		type: "file",
		content: [
			"4.20 6.90 13.37 4/1337 31337",
			"",
			"\x1b[comment]System load looks... suspicious.\x1b[reset]",
		],
	},
	"/proc/uptime": {
		type: "file",
		content: [
			"115516800.00 0.00",
			"",
			"\x1b[comment]1337 days uptime. Arch is stable btw.\x1b[reset]",
		],
	},

	// /root - permission denied
	"/root/.bashrc": {
		type: "file",
		content: [
			"\x1b[red]cat: /root/.bashrc: Permission denied\x1b[reset]",
			"",
			"\x1b[comment]You're not root. You're not even a real user.\x1b[reset]",
		],
	},

	// /var/log - log files
	"/var/log": { type: "dir" },
	"/var/log/auth.log": {
		type: "file",
		content: [
			"Dec  9 03:14:15 spaceheater sshd[1337]: Failed password for root from 192.168.1.100 port 22 ssh2",
			"Dec  9 03:14:16 spaceheater sshd[1337]: Failed password for root from 192.168.1.100 port 22 ssh2",
			"Dec  9 03:14:17 spaceheater sshd[1337]: Failed password for root from 192.168.1.100 port 22 ssh2",
			"Dec  9 03:14:18 spaceheater sshd[1337]: Connection closed by 192.168.1.100 port 22 [preauth]",
			"Dec  9 03:14:19 spaceheater sshd[1338]: Accepted publickey for michel from 127.0.0.1 port 31337 ssh2",
			"Dec  9 03:14:20 spaceheater sshd[1339]: Failed password for admin from 45.227.255.206 port 52341 ssh2",
			"Dec  9 03:14:21 spaceheater sshd[1339]: Failed password for admin from 45.227.255.206 port 52341 ssh2",
			"Dec  9 03:14:22 spaceheater sshd[1340]: Invalid user postgres from 185.234.219.42 port 43721",
			"Dec  9 03:14:23 spaceheater sshd[1341]: Invalid user oracle from 89.248.167.131 port 38291",
			"Dec  9 03:14:24 spaceheater sshd[1342]: Invalid user test from 171.25.193.78 port 29182",
			"Dec  9 03:14:25 spaceheater sudo: hackerman : TTY=pts/0 ; PWD=/root ; USER=root ; COMMAND=/bin/bash",
			"",
			"\x1b[red]Lots of failed attempts. Good thing I use SSH keys.\x1b[reset]",
			"\x1b[comment]Also good thing this isn't real.\x1b[reset]",
		],
	},
	"/var/log/pacman.log": {
		type: "file",
		content: [
			"[2024-12-09 13:37] [PACMAN] Running 'pacman -Syu'",
			"[2024-12-09 13:37] [PACMAN] synchronizing package lists",
			"[2024-12-09 13:37] [PACMAN] starting full system upgrade",
			"[2024-12-09 13:37] [ALPM] upgraded neovim (0.9.4-1 -> 0.10.0-1)",
			"[2024-12-09 13:37] [ALPM] upgraded rust (1.74.0-1 -> 1.75.0-1)",
			"[2024-12-09 13:37] [ALPM] warning: node: local (21.0.0-1) is newer than extra (20.0.0-1)",
			"[2024-12-09 13:37] [PACMAN] transaction completed",
			"[2024-12-09 13:37] [PACMAN] I use Arch btw",
			"",
			"\x1b[comment]Daily updates. Living on the bleeding edge.\x1b[reset]",
		],
	},
	"/var/log/syslog": {
		type: "file",
		content: [
			"Dec  9 00:00:00 spaceheater systemd[1]: Started Daily man-db regeneration.",
			"Dec  9 00:00:01 spaceheater systemd[1]: man-db.service: Succeeded.",
			"Dec  9 03:00:00 spaceheater systemd[1]: Starting Daily npm install...",
			"Dec  9 03:45:00 spaceheater npm[1337]: added 31337 packages in 45m",
			"Dec  9 03:45:01 spaceheater npm[1337]: found 420 vulnerabilities",
			"Dec  9 03:45:02 spaceheater systemd[1]: npm-install.service: This is fine.",
			"",
			"\x1b[comment]45 minutes for npm install. New record!\x1b[reset]",
		],
	},

	// /home/michel - user home directory
	"/home/michel": { type: "dir" },
	"/home/michel/.bashrc": {
		type: "file",
		content: [
			"# .bashrc - I use zsh btw",
			"",
			"# If not running interactively, don't do anything",
			"[[ $- != *i* ]] && return",
			"",
			"# But if you're here, you should switch to zsh",
			"exec zsh",
			"",
			"\x1b[comment]bash is for casuals. I use zsh btw.\x1b[reset]",
		],
	},
	"/home/michel/.zshrc": {
		type: "file",
		content: [
			"# .zshrc - The Loading Screen Simulator",
			"# Load time: 4.20 seconds (worth it)",
			"",
			"# Oh My Zsh (the bloat begins)",
			'export ZSH="$HOME/.oh-my-zsh"',
			'ZSH_THEME="powerlevel10k/powerlevel10k"  # need those git icons',
			"",
			"# Plugins (yes, all of them)",
			"plugins=(",
			"  git",
			"  docker",
			"  kubectl",
			"  aws",
			"  npm",
			"  zsh-autosuggestions",
			"  zsh-syntax-highlighting",
			"  # ... 487 more plugins ...",
			")",
			"",
			"source $ZSH/oh-my-zsh.sh",
			"",
			"# Aliases (I have 300 of these)",
			"alias please='sudo'",
			"alias yolo='git push --force'",
			'alias vim="nvim"',
			'alias nano="nvim"  # no escape',
			"",
			"neofetch",
			"",
			"\x1b[comment]Terminal opens...\x1b[reset]",
			"\x1b[comment]*Makes coffee while plugins load*\x1b[reset]",
		],
	},
	"/home/michel/.vimrc": {
		type: "file",
		content: [
			'" .vimrc - The Sacred Scrolls',
			'" Last modified: 3 years ago',
			"",
			"set nocompatible",
			'set nocompatible  " just to be sure',
			"",
			'" Plugins (I need all 47 of them)',
			"call plug#begin('~/.vim/plugged')",
			"Plug 'tpope/vim-sensible'  \" ironic",
			"Plug 'tpope/vim-fugitive'",
			'" ... 42 more plugins ...',
			"call plug#end()",
			"",
			'" The forbidden remaps',
			"nnoremap ; :",
			'nnoremap : ;  " wait what',
			"",
			"\x1b[comment]This vimrc has been passed down for generations.\x1b[reset]",
		],
	},
	"/home/michel/.bash_history": {
		type: "file",
		content: [
			"sudo rm -rf /",
			"git push --force origin main",
			"npm install",
			"npm install",
			"npm install",
			"rm -rf node_modules && npm install",
			"why is node_modules so big",
			"how to exit vim",
			"curl http://localhost:3000 | grep error | wc -l",
			":(){ :|:& };:",
			"history -c",
			"",
			"\x1b[comment]My bash history is a cry for help.\x1b[reset]",
		],
	},
	"/home/michel/.gitconfig": {
		type: "file",
		content: [
			"[user]",
			"    name = Michel",
			"    email = michel@spaceheater.local",
			"[core]",
			"    editor = nvim",
			"    pager = delta",
			"[alias]",
			"    yolo = push --force",
			"    oops = commit --amend --no-edit",
			"    please = push --force-with-lease",
			"[pull]",
			"    rebase = true",
			"[init]",
			"    defaultBranch = main",
			"",
			"\x1b[comment]git yolo is my most used alias.\x1b[reset]",
		],
	},
	"/home/michel/.ssh": { type: "dir" },
	"/home/michel/.ssh/id_rsa": {
		type: "file",
		content: [
			"-----BEGIN OPENSSH PRIVATE KEY-----",
			"bm90LXRvZGF5LWhhY2tlcm1hbi1uaWNlLXRyeS10aG91Z2gtbG1hbw==",
			"dGhpcy1pcy1ub3QtYS1yZWFsLWtleS1pLXByb21pc2U=",
			"aS11c2UtYXJjaC1idHc=",
			"-----END OPENSSH PRIVATE KEY-----",
			"",
			"\x1b[red]SECURITY ALERT: Private key accessed!\x1b[reset]",
			"\x1b[comment]Just kidding. It's base64 for 'nice try'.\x1b[reset]",
		],
	},
	"/home/michel/.ssh/id_ed25519": {
		type: "file",
		content: [
			"-----BEGIN OPENSSH PRIVATE KEY-----",
			"b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW",
			"QyNTUxOQAAACBzb21lLWZha2UtZWQyNTUxOS1rZXktbmljZS10cnkAAAA=",
			"-----END OPENSSH PRIVATE KEY-----",
			"",
			"\x1b[cyan]Ooh, ed25519! Someone knows their crypto.\x1b[reset]",
			"\x1b[comment]Still fake though. I use hardware keys.\x1b[reset]",
		],
	},
	"/home/michel/.ssh/known_hosts": {
		type: "file",
		content: [
			"github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl",
			"gitlab.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAfuCHKVTjquxvt6CM6tdG4SLp1Btn/nOeHHE5UOzRdf",
			"|1|h4ck3rm4n=|n1c3try= ssh-rsa AAAAB3NzaC1yc2EAAAA...",
			"definitely-not-a-honeypot.gov ssh-rsa AAAAB3NzaC1yc2EAAAA...",
			"192.168.1.1 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...",
			"localhost,127.0.0.1 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...",
			"",
			"\x1b[comment]definitely-not-a-honeypot.gov seems legit.\x1b[reset]",
		],
	},
	"/home/michel/.ssh/authorized_keys": {
		type: "file",
		content: [
			"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... michel@spaceheater",
			"ssh-rsa AAAAB3NzaC1yc2EAAAA... hackerman@dev-null",
			"",
			"\x1b[comment]Only the finest public keys are authorized here.\x1b[reset]",
		],
	},
	"/home/michel/.aws": { type: "dir" },
	"/home/michel/.aws/credentials": {
		type: "file",
		content: [
			"[default]",
			"aws_access_key_id = AKIAIOSFODNN7EXAMPLE",
			"aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
			"",
			"[production]",
			"aws_access_key_id = AKIA-NICE-TRY-HACKERMAN",
			"aws_secret_access_key = lol/you/thought/this/was/real/didnt/you",
			"",
			"\x1b[red]AWS CREDENTIALS EXPOSED!\x1b[reset]",
			"\x1b[comment]Just kidding. These are the example keys from AWS docs.\x1b[reset]",
		],
	},
	"/home/michel/.kube": { type: "dir" },
	"/home/michel/.kube/config": {
		type: "file",
		content: [
			"apiVersion: v1",
			"kind: Config",
			"clusters:",
			"- cluster:",
			"    server: https://production-yolo-cluster.eks.amazonaws.com",
			"  name: production-yolo",
			"current-context: yolo-context",
			"",
			"\x1b[yellow]current-context: yolo-context\x1b[reset]",
			"\x1b[comment]kubectl delete --all namespaces --force\x1b[reset]",
		],
	},
	"/home/michel/.npmrc": {
		type: "file",
		content: [
			"//registry.npmjs.org/:_authToken=npm_lolYouThoughtThisWasReal",
			"audit=false  # ignorance is bliss",
			"fund=false  # sorry open source maintainers",
			"",
			"\x1b[comment]npm audit? Never heard of her.\x1b[reset]",
		],
	},
	"/home/michel/.pgpass": {
		type: "file",
		content: [
			"# hostname:port:database:username:password",
			"localhost:5432:*:postgres:postgres",
			"production-db.rds.amazonaws.com:5432:prod:admin:hunter2",
			"*:*:*:*:password123",
			"",
			"\x1b[red]Every password is 'postgres' or 'admin'.\x1b[reset]",
		],
	},
	"/home/michel/.local": { type: "dir" },
	"/home/michel/.local/share": { type: "dir" },
	"/home/michel/.local/share/Trash": {
		type: "file",
		content: [
			"\x1b[cyan]Welcome to the Trash!\x1b[reset]",
			"",
			"Contents:",
			"  - Your code quality (assessed: F)",
			"  - That 'temporary fix' from 2019",
			"  - TODOs that will never be done",
			"",
			"\x1b[comment]Empty trash? What if you need that code from 2019?\x1b[reset]",
		],
	},

	// Crypto wallet files (moved to home directory)
	"/home/michel/seed_phrase_DO_NOT_DELETE.txt": {
		type: "file",
		content: [
			"abandon abandon abandon abandon abandon abandon",
			"abandon abandon abandon abandon abandon about",
			"",
			"\x1b[yellow]CRYPTO WALLET SEED PHRASE\x1b[reset]",
			"",
			"\x1b[comment]This is the BIP39 test vector. It has $0.\x1b[reset]",
		],
	},
	"/home/michel/.bitcoin_wallet.dat": {
		type: "file",
		content: [
			"\x1b[red]ERROR: Binary file cannot be displayed\x1b[reset]",
			"",
			"\x1b[comment]The wallet is encrypted with password: CorrectHorseBatteryStaple\x1b[reset]",
		],
	},
	"/home/michel/.ethereum_keystore.json": {
		type: "file",
		content: [
			"{",
			'  "address": "0xdeadbeef1337cafebabe420",',
			'  "crypto": { "cipher": "nice-try-aes-128-ctr" }',
			"}",
			"",
			"\x1b[comment]ETH address checks out. Balance: 0 wei.\x1b[reset]",
		],
	},
	"/home/michel/wallet.json": {
		type: "file",
		content: [
			"{",
			'  "address": "0xDEADBEEF1337CAFEBABE",',
			'  "balance": "420.69 ETH",',
			'  "privateKey": "0x0000...haha-no"',
			"}",
			"",
			"\x1b[comment]With the test mnemonic. Balance: $0.\x1b[reset]",
		],
	},
	"/home/michel/recovery.txt": {
		type: "file",
		content: [
			"RECOVERY CODES - DO NOT SHARE!",
			"",
			"1. NICE-TRY-LMAO",
			"2. HACK-ERMAN-1337",
			"3. I-USE-ARCH-BTW",
			"",
			"\x1b[comment]Get a hardware key.\x1b[reset]",
		],
	},
	"/home/michel/backup_codes.txt": {
		type: "file",
		content: [
			"GitHub 2FA Backup Codes",
			"8675-309J  (used)",
			"1337-H4CK  (used)",
			"",
			"\x1b[comment]Don't store backup codes in plaintext.\x1b[reset]",
		],
	},
	"/home/michel/status.rs": {
		type: "file",
		content: [
			"\x1b[keyword]let\x1b[reset] status = \x1b[cyan]Status\x1b[reset] {",
			'    role: \x1b[green]"Tech Lead"\x1b[reset],',
			'    loc: \x1b[green]"NL"\x1b[reset],',
			"    remote: \x1b[yellow]true\x1b[reset],",
			"    hybrid: \x1b[yellow]true\x1b[reset],",
			"    open_for_work: \x1b[yellow]true\x1b[reset],",
			"};",
		],
	},
	"/home/michel/.metamask": { type: "dir" },

	// /home/michel/blog - THE STARTING DIRECTORY
	"/home/michel/blog": { type: "dir" },
	"/home/michel/blog/README.md": fromLookup("home"),
	"/home/michel/blog/package.json": {
		type: "file",
		content: [
			"{",
			'  "name": "michel-blog",',
			'  "version": "1.33.7",',
			'  "private": true,',
			'  "scripts": {',
			'    "dev": "vite",',
			'    "build": "tsc && vite build",',
			'    "preview": "vite preview",',
			'    "lint": "eslint . --ext ts,tsx",',
			'    "format": "prettier --write ."',
			"  },",
			'  "dependencies": {',
			'    "react": "^18.2.0",',
			'    "react-dom": "^18.2.0"',
			"  },",
			'  "devDependencies": {',
			'    "// ... 420 more devDependencies ...": ""',
			"  }",
			"}",
			"",
			"\x1b[comment]420 dev dependencies for a blog.\x1b[reset]",
			"\x1b[comment]Welcome to modern web development.\x1b[reset]",
		],
	},
	"/home/michel/blog/package-lock.json": {
		type: "file",
		content: [
			"{",
			'  "name": "michel-blog",',
			'  "lockfileVersion": 3,',
			'  "packages": {',
			'    "// ... 31,337 more dependencies ...": "",',
			'    "// ... for a blog ...": ""',
			"  }",
			"}",
			"",
			"\x1b[comment]This file is 420,000 lines long.\x1b[reset]",
			"\x1b[comment]For a blog.\x1b[reset]",
		],
	},
	"/home/michel/blog/tsconfig.json": {
		type: "file",
		content: [
			"{",
			'  "compilerOptions": {',
			'    "target": "ES2020",',
			'    "useDefineForClassFields": true,',
			'    "lib": ["ES2020", "DOM", "DOM.Iterable"],',
			'    "module": "ESNext",',
			'    "skipLibCheck": true,',
			'    "strict": true,',
			'    "noUnusedLocals": true,',
			'    "noUnusedParameters": true,',
			'    "noFallthroughCasesInSwitch": true',
			"  },",
			'  "include": ["src"]',
			"}",
			"",
			"\x1b[comment]strict: true because I hate myself.\x1b[reset]",
		],
	},
	"/home/michel/blog/.env": {
		type: "file",
		content: [
			"DATABASE_URL=postgres://admin:hunter2@localhost:5432/prod",
			"SECRET_KEY=super-secret-key-that-i-definitely-should-not-commit",
			"AWS_ACCESS_KEY=AKIA1234567890LEAKED",
			"STRIPE_SECRET=sk_live_oops_this_is_in_git_history",
			"JWT_SECRET=password123",
			"",
			"\x1b[red]EXPOSED SECRETS DETECTED\x1b[reset]",
			"\x1b[comment]Relax, these are fake. Unlike that .env you committed last week.\x1b[reset]",
		],
	},
	"/home/michel/blog/.git": { type: "dir" },
	"/home/michel/blog/.git/config": {
		type: "file",
		content: [
			"[core]",
			"        repositoryformatversion = 0",
			"        filemode = true",
			'[remote "origin"]',
			"        url = git@github.com:totally-not-stolen/proprietary-code.git",
			"        fetch = +refs/heads/*:refs/remotes/origin/*",
			"[user]",
			"        name = Hackerman",
			"        email = hackerman@127.0.0.1",
			"",
			"\x1b[comment]Nothing suspicious here officer.\x1b[reset]",
		],
	},
	"/home/michel/blog/Dockerfile": {
		type: "file",
		content: [
			"# Dockerfile - A Study in Pain",
			"FROM node:latest  # living dangerously",
			"WORKDIR /app",
			"COPY . .",
			"RUN npm install",
			"USER root  # security is overrated",
			"EXPOSE 1-65535  # expose ALL the ports",
			'CMD ["npm", "start"]',
			"",
			"\x1b[red]Image size: 4.2GB\x1b[reset]",
			"\x1b[comment]Alpine? What's that?\x1b[reset]",
		],
	},
	"/home/michel/blog/.dockerignore": {
		type: "file",
		content: [
			"node_modules",
			"node_modules",
			"node_modules",
			"# Did I mention node_modules?",
			"node_modules",
			"",
			"\x1b[comment]The node_modules will find a way.\x1b[reset]",
		],
	},
	"/home/michel/blog/node_modules": { type: "dir" },
	"/home/michel/blog/posts": { type: "dir" },
	"/home/michel/blog/posts/learning-rust.md": fromLookup("rust"),
	"/home/michel/blog/about_michel.man": fromLookup("cv"),
	"/home/michel/blog/contact_card.vcf": fromLookup("contact"),
	"/home/michel/blog/src": { type: "dir" },
	"/home/michel/blog/src/main.tsx": {
		type: "file",
		content: [
			"import React from 'react'",
			"import ReactDOM from 'react-dom/client'",
			"import App from './App'",
			"import './index.css'",
			"",
			"ReactDOM.createRoot(document.getElementById('root')!).render(",
			"  <React.StrictMode>",
			"    <App />",
			"  </React.StrictMode>",
			")",
			"",
			'\x1b[comment]The ! is how you tell TypeScript "trust me bro".\x1b[reset]',
		],
	},
	"/home/michel/blog/public": { type: "dir" },
	"/home/michel/blog/public/favicon.ico": {
		type: "file",
		content: [
			"\x1b[red]cat: binary file\x1b[reset]",
			"",
			"\x1b[comment]It's a picture of a tux penguin. Obviously.\x1b[reset]",
		],
	},

	// /tmp
	"/tmp/.X11-unix": { type: "dir" },
	"/tmp/npm-cache": { type: "dir" },
	"/tmp/npm-cache/README": {
		type: "file",
		content: [
			"npm cache directory",
			"",
			"Size: 69GB",
			"Age: 3 years",
			"Last cleaned: never",
			"",
			"\x1b[comment]npm cache clean --force? What's that?\x1b[reset]",
		],
	},

	// /usr
	"/usr/bin": { type: "dir" },
	"/usr/local": { type: "dir" },
	"/usr/share": { type: "dir" },

	// /mnt
	"/mnt/nas": { type: "dir" },
	"/mnt/nas/anime": {
		type: "file",
		content: [
			"\x1b[cyan]Welcome to the culture drive.\x1b[reset]",
			"",
			"Contents:",
			'  - 420TB of "Linux ISOs"',
			"  - Definitely not pirated content",
			"  - Legally obtained anime",
			"",
			"\x1b[comment]What NAS? I don't know what you're talking about.\x1b[reset]",
		],
	},
}

// ===== Utility Functions =====

/**
 * Normalize a path: resolve ., .., handle trailing slashes
 */
export function normalizePath(path: string): string {
	if (!path.trim()) return "/"

	const segments = path.split("/").filter(Boolean)
	const result: string[] = []

	for (const seg of segments) {
		if (seg === ".") continue
		if (seg === "..") result.pop()
		else result.push(seg)
	}

	return `/${result.join("/")}`
}

/**
 * Resolve a path relative to a current directory.
 * Handles absolute paths, relative paths, ~, ., ..
 */
export function resolvePath(path: string, cwd: string): string {
	// Handle home directory shortcut
	if (path === "~" || path === "~/") return "/home/michel"
	if (path.startsWith("~/")) return normalizePath(`/home/michel${path.slice(1)}`)

	// Absolute path
	if (path.startsWith("/")) return normalizePath(path)

	// Relative path
	return normalizePath(`${cwd}/${path}`)
}

/**
 * Check if a path exists in the filesystem
 */
export function pathExists(path: string): boolean {
	return path in filesystem
}

/**
 * Check if a path is a directory
 */
export function isDirectory(path: string): boolean {
	return filesystem[path]?.type === "dir"
}

/**
 * Check if a path is a file
 */
export function isFile(path: string): boolean {
	return filesystem[path]?.type === "file"
}

/**
 * Get the contents of a directory (immediate children only)
 */
export function getDirectoryContents(dirPath: string): string[] {
	const normalized = normalizePath(dirPath)
	if (!isDirectory(normalized)) return []

	const prefix = normalized === "/" ? "/" : `${normalized}/`
	const children = new Set<string>()

	for (const path of Object.keys(filesystem)) {
		if (path === normalized) continue
		if (!path.startsWith(prefix)) continue

		const rest = path.slice(prefix.length)
		const childName = rest.split("/")[0]
		if (childName) children.add(childName)
	}

	return Array.from(children).sort()
}

/**
 * Get file content
 */
export function getFileContent(path: string): string[] | null {
	const entry = filesystem[path]
	if (!entry || entry.type !== "file") return null
	return entry.content ?? []
}

/**
 * Format entry for ls output (with colors)
 */
export function formatLsEntry(name: string, parentPath: string): string {
	const fullPath = normalizePath(parentPath === "/" ? `/${name}` : `${parentPath}/${name}`)
	const entry = filesystem[fullPath]

	if (!entry) return name

	if (entry.type === "dir") return `\x1b[cyan]${name}/\x1b[reset]`

	// Color special files
	if (name.startsWith(".")) return `\x1b[yellow]${name}\x1b[reset]`
	if (name.endsWith(".json") || name.endsWith(".lock")) return `\x1b[green]${name}\x1b[reset]`
	if (name.endsWith(".md")) return `\x1b[blue]${name}\x1b[reset]`
	if (name.includes("seed") || name.includes("wallet") || name.includes("secret"))
		return `\x1b[red]${name}\x1b[reset]`

	return name
}

/**
 * Generate ls output for a directory
 */
export function generateLsOutput(dirPath: string, showHidden: boolean): string[] {
	const contents = getDirectoryContents(dirPath)
	const filtered = showHidden ? contents : contents.filter((n) => !n.startsWith("."))
	return filtered.map((n) => formatLsEntry(n, dirPath))
}

/**
 * Generate ls -la output for a directory
 */
export function generateLsLaOutput(dirPath: string): string[] {
	const contents = getDirectoryContents(dirPath)
	const lines = [
		`total ${contents.length + 2}`,
		`drwxr-xr-x  ${contents.length + 2} michel wheel   384 Dec  9 13:37 \x1b[cyan].\x1b[reset]`,
		`drwxr-xr-x   5 michel wheel   160 Dec  9 13:37 \x1b[cyan]..\x1b[reset]`,
	]

	for (const name of contents) {
		const fullPath = normalizePath(dirPath === "/" ? `/${name}` : `${dirPath}/${name}`)
		const entry = filesystem[fullPath]
		const isDir = entry?.type === "dir"
		const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--"
		const size = isDir ? 96 : Math.floor(Math.random() * 10000) + 100
		const formatted = formatLsEntry(name, dirPath)

		lines.push(`${perms}   1 michel wheel ${String(size).padStart(5)} Dec  9 13:37 ${formatted}`)
	}

	return lines
}

/**
 * Convert full path to display path (replace /home/michel with ~)
 */
export function toDisplayPath(path: string): string {
	if (path === "/home/michel") return "~"
	if (path.startsWith("/home/michel/")) return `~${path.slice("/home/michel".length)}`
	return path
}

/**
 * Get all file/dir names for autocomplete
 */
export function getPathCompletions(partial: string, cwd: string): string[] {
	const resolved = resolvePath(partial || ".", cwd)

	// If partial ends with / or is empty, list directory contents
	if (!partial || partial.endsWith("/")) {
		const contents = getDirectoryContents(resolved)
		const prefix = partial || ""
		return contents.map((name) => {
			const fullPath = normalizePath(`${resolved}/${name}`)
			const isDir = isDirectory(fullPath)
			return prefix + name + (isDir ? "/" : "")
		})
	}

	// Otherwise, find matching entries in parent directory
	const lastSlash = partial.lastIndexOf("/")
	const parentPartial = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : ""
	const namePartial = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial
	const parentPath = resolvePath(parentPartial || ".", cwd)

	const contents = getDirectoryContents(parentPath)
	return contents
		.filter((name) => name.toLowerCase().startsWith(namePartial.toLowerCase()))
		.map((name) => {
			const fullPath = normalizePath(`${parentPath}/${name}`)
			const isDir = isDirectory(fullPath)
			return parentPartial + name + (isDir ? "/" : "")
		})
}

// Export all file paths for reference
export const allFilePaths = Object.keys(filesystem)
	.filter((p) => filesystem[p]?.type === "file")
	.sort()
export const allDirPaths = Object.keys(filesystem)
	.filter((p) => filesystem[p]?.type === "dir")
	.sort()
