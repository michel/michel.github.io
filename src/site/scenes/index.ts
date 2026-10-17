import { agentic } from "./agentic"
import { architecture } from "./architecture"
import { consulting } from "./consulting"
import { development } from "./development"
import { financial } from "./financial"
import { fullStack } from "./full-stack"
import { infrastructure } from "./infrastructure"
import { problem } from "./problem"
import { production } from "./production"

// The illustrations drawn in code, inlined by vite.config.ts at <!-- scene:name -->: one per
// Expertise capability and one per Approach step
export const scenes: Record<string, () => string> = {
	consulting,
	"full-stack": fullStack,
	financial,
	agentic,
	problem,
	architecture,
	development,
	infrastructure,
	production,
}
