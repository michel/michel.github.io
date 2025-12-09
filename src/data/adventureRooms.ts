export interface Room {
	id: string
	name: string
	description: string
	exits: Record<string, string>
	items?: string[]
	onEnter?: string
	requires?: { item?: string; flag?: string }
	setsFlag?: string
}

export const rooms: Record<string, Room> = {
	bedroom: {
		id: "bedroom",
		name: "Your Bedroom",
		description: `It's 3:17 AM. Your phone is vibrating violently on the nightstand.

The PagerDuty alert reads: "CRITICAL: Production database CPU at 100%"

Slack notifications are piling up. You see 47 unread messages from #incidents.

Your laptop bag is by the DOOR. The BATHROOM is to the east.`,
		exits: { door: "hallway", east: "bathroom", bathroom: "bathroom" },
	},
	bathroom: {
		id: "bathroom",
		name: "Bathroom",
		description: `The bathroom. You look at yourself in the mirror.
You look tired. You ARE tired.

There's a 2FA DEVICE on the counter. You'll need that for VPN.

The BEDROOM is to the west.`,
		exits: { west: "bedroom", bedroom: "bedroom" },
		items: ["2fa device"],
	},
	hallway: {
		id: "hallway",
		name: "Hallway",
		description: `The dark hallway of your apartment.

Your HOME OFFICE is to the north. The BEDROOM is behind you.

A Slack message pings: "hey are you awake? site is down"`,
		exits: { north: "office", office: "office", south: "bedroom", bedroom: "bedroom" },
	},
	office: {
		id: "office",
		name: "Home Office",
		description: `Your home office. Three monitors stare at you judgmentally.

Your LAPTOP is on the desk, lid closed. There's a COFFEE MACHINE in the corner.
The coffee machine has a sticky note: "EMERGENCY USE ONLY"

The HALLWAY is to the south. Type 'use laptop' to connect.`,
		exits: { south: "hallway", hallway: "hallway" },
		items: ["coffee"],
	},
	vpn: {
		id: "vpn",
		name: "VPN Connection",
		description: `Connecting to corporate VPN...

[=========>          ] 47%

"Authenticating..."

You need your 2FA DEVICE to complete authentication.
Type 'use 2fa device' if you have it.

Type 'disconnect' to go back to the office.`,
		exits: { disconnect: "office", back: "office" },
		requires: { item: "2fa device" },
	},
	vpn_connected: {
		id: "vpn_connected",
		name: "VPN Connected",
		description: `VPN CONNECTED - Welcome to prod-bastion-01

Last login: 3 hours ago from definitely-not-a-hacker.ru

Available servers:
  - PROD-WEB-01 (type 'ssh web')
  - PROD-DB-01 (type 'ssh db')

CEO has entered #incidents: "Just checking in, is this going to affect our demo tomorrow?"

Type 'disconnect' to return to office.`,
		exits: { disconnect: "office", back: "office" },
		setsFlag: "vpn_connected",
	},
	prod_web: {
		id: "prod_web",
		name: "Production Web Server",
		description: `prod-web-01 $ top

  PID USER      %CPU %MEM    COMMAND
31337 node      2.1  4.2    node server.js
  420 nginx     0.1  0.2    nginx: worker

Everything looks... fine here? The web server is barely breaking a sweat.

Slack: "customers are getting 504 timeouts"

The issue must be in the DATABASE. Type 'ssh db' or 'back' to return.`,
		exits: { back: "vpn_connected", "ssh db": "prod_db", db: "prod_db" },
	},
	prod_db: {
		id: "prod_db",
		name: "Production Database Server",
		description: `prod-db-01 $ top

  PID USER      %CPU %MEM    COMMAND
 1337 postgres  99.8 87.3    postgres: SELECT waiting
 1338 postgres  99.7 2.1     postgres: SELECT waiting
 1339 postgres  99.9 1.8     postgres: UPDATE waiting

Oh no. Oh no no no.

The database is on FIRE. CPU is pegged. Memory is screaming.

Type 'show processlist' to see what's happening.
Type 'back' to return to bastion.`,
		exits: { back: "vpn_connected", bastion: "vpn_connected" },
	},
	processlist: {
		id: "processlist",
		name: "Database Process List",
		description: `mysql> SHOW FULL PROCESSLIST;

+------+------+-----------+--------+---------+------+----------+
| Id   | User | Host      | db     | Command | Time | State    |
+------+------+-----------+--------+---------+------+----------+
| 1337 | app  | web-01    | prod   | Query   | 3847 | Locked   |
| 1338 | app  | web-01    | prod   | Query   | 3846 | Locked   |
| 1339 | cron | localhost | prod   | Query   | 3847 | Sending  |
+------+------+-----------+--------+---------+------+----------+

Process 1339 is running:
  "UPDATE users SET last_seen = NOW() WHERE 1=1"

WHERE 1=1?! That's updating EVERY user in the table!
Some intern's cron job is updating 2 million rows every minute.

Type 'kill 1339' to terminate the query.
Type 'back' to return to database server.`,
		exits: { back: "prod_db" },
	},
	victory: {
		id: "victory",
		name: "Victory!",
		description: `mysql> KILL 1339;
Query OK, 0 rows affected (0.00 sec)

The CPU usage drops immediately. Graphs are recovering.

Slack explodes:
  - PM: "OMG IT'S WORKING"
  - CEO: "Great work team! I knew we'd figure it out"
  - Senior Dev: "who wrote this query lol"
  - Intern: "..."

You check the git blame. The query was committed by the CEO himself,
during a "quick fix" 6 months ago. The intern just added the cron job.

Time: 4:23 AM. Site is stable. You crawl back to bed.

Tomorrow you'll add query timeouts. And maybe update your resume.

===================================
  CONGRATULATIONS! YOU SAVED PROD!
===================================

Type 'quit' to exit the adventure.`,
		exits: {},
		setsFlag: "victory",
	},
}

export const itemDescriptions: Record<string, string> = {
	"2fa device": "A small hardware token that generates one-time passwords. Essential for VPN access.",
	coffee:
		"A cup of emergency coffee. The sticky note said 'EMERGENCY USE ONLY'. This counts.",
}

export const startRoom = "bedroom"
