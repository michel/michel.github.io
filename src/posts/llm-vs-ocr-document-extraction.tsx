import type { ReactNode } from "react"

export const llmVsOcrDocumentExtraction: { title: string; date: string; lines: ReactNode[] } = {
	title: "Combining LLM and OCR for Invoice Validation: Lessons Learned",
	date: "2026-01-16",
	lines: [
		<span key="fm1" className="text-comment">
			---
		</span>,
		<span key="fm2" className="text-comment">
			title: "Combining LLM and OCR for Invoice Validation: Lessons Learned"
		</span>,
		<span key="fm3" className="text-comment">
			date: "2026-01-16"
		</span>,
		<span key="fm4" className="text-comment">
			---
		</span>,
		"",
		<h1 key="title" className="text-pink font-bold text-xl">
			# Combining LLM and OCR for Invoice Validation: Lessons Learned
		</h1>,
		"",
		<span key="intro1">
			In 2016, I built <span className="text-blue font-bold">Dutchies Travel</span> (BackpackApp), a
			travel agency platform for backpackers in Australia. The main technical challenge? Extracting
			booking codes, dates, locations, and vendor names from travel voucher PDFs. Each vendor had a
			different format. Each required custom regex extractors and heuristics.
		</span>,
		"",
		<span key="intro2">
			For each vendor we had to create field extractors and normalizers. Within vendor PDFs there
			was variation, and formats changed over time. This meant constant maintenance, custom code for
			each case. And when field extraction went wrong? End customers, vendors, and internal
			stakeholders all lost trust.
		</span>,
		"",
		<span key="intro3">
			This problem isn't unique to me. My friend{" "}
			<a
				href="https://www.linkedin.com/in/jdanino"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				Joni Danino
			</a>{" "}
			at <span className="text-blue font-bold">TicketSwap</span> deals with the same class of
			problem at massive scale. They have entire teams on standby seven days a week to manually
			process and deduplicate tickets from PDFs and images, matching extracted fields to events with
			high confidence. They're on a similar journey: figuring out if LLMs can automate away the
			manual work.
		</span>,
		"",
		<h3 key="challenge" className="text-cyan font-bold">
			### The New Challenge: Revive Capital Invoices
		</h3>,
		"",
		<span key="p1">
			Fast forward to 2024-2025. I'm building invoice validation for{" "}
			<span className="text-blue font-bold">Revive Capital</span>, a B2B car financing company. Same
			fundamental problem: extract fields from unstructured vendor documents (supplier invoices),
			then match against ground truth (the lease contract data).
		</span>,
		"",
		<span key="p2">
			The stakes are high. We need to extract IBANs, VINs, Chamber of Commerce numbers, prices, and
			tax amounts. If we make mistakes, we might finance the wrong car.
		</span>,
		"",
		<h3 key="naive" className="text-cyan font-bold">
			### The Naive Approach: Just Use GPT
		</h3>,
		"",
		<span key="p3">
			First attempt: "Just use GPT with vision." Send the invoice image, ask it to extract all
			fields. It works great for semantic understanding. Trade-in deductions? GPT gets it. Price
			calculations across line items? No problem if you provide the right promt. We can sum and
			validate the extracted prices so seems to be a good fit!
		</span>,
		"",
		<span key="p4">
			But then the hallucinations started.{" "}
			<span className="text-green font-bold">Character-level hallucinations</span> on critical
			alphanumeric fields. O became 0. I became 1. Q became 0. The LLM would confidently return
			values that looked plausible but were wrong.
		</span>,
		"",
		<div key="quote" className="border-l-4 border-orange pl-4 text-comment italic">
			"The LLM would confidently return a VIN with a zero where there should be an O. WMI
			validation? Failed. OTT registration of car at RDW not possible, manual work required, loss of
			trust in the system."
		</div>,
		"",
		<h3 key="hybrid" className="text-cyan font-bold">
			### The Hybrid Approach: Let Each Tool Do What It's Best At
		</h3>,
		"",
		<span key="p5">
			The solution was a <span className="text-green font-bold">hybrid dual-extraction</span>{" "}
			approach. Run GPT and AWS Textract in parallel, then merge strategically:
		</span>,
		"",
		<span key="b1">
			• <span className="text-blue font-bold">GPT</span> handles semantic understanding: trade-in
			deductions, price sums across line items, supplier vs buyer detection, contextual reasoning
		</span>,
		<span key="b2">
			• <span className="text-blue font-bold">AWS Textract</span> handles pattern recognition: IBAN
			validation with MOD 97-10 checksums, VIN extraction with WMI verification, Chamber of Commerce
			numbers
		</span>,
		<span key="b3">
			• <span className="text-blue font-bold">Merge strategy</span>: Textract only overrides GPT for
			specific sensitive fields (IBAN, VIN, CoC). Everything else uses GPT's semantic understanding.
		</span>,
		"",
		<h3 key="prompts" className="text-cyan font-bold">
			### The Prompt Optimization Rabbit Hole
		</h3>,
		"",
		<span key="p6">
			We experimented with prompt optimization. Built a 331-line system prompt with detailed
			extraction instructions. Added verification checklists. Explicit warnings about BPM vs BTW
			(German vehicle registration tax vs VAT). IBAN validation instructions in the prompt itself.
		</span>,
		"",
		<span key="p7">
			We even used Promptomatix for automated prompt optimization, running experiments against
			baseline prompts. The optimized prompts were more concise. Accuracy improved marginally.
		</span>,
		"",
		<span key="p8">
			But here's the reality:{" "}
			<span className="text-green font-bold">
				even perfect prompts can't prevent character-level hallucinations
			</span>
			. You can tell the LLM to double-check, to verify, to be careful. It still confuses O and 0.
			Know when prompt engineering hits diminishing returns.
		</span>,
		"",
		<h3 key="normalization" className="text-cyan font-bold">
			### Normalization is Everything
		</h3>,
		"",
		<span key="p9">
			Extraction is the easy part. The real work is{" "}
			<span className="text-green font-bold">normalization</span>. Dutch invoices use 1.234,56 for
			amounts. US formats use 1,234.56. Company names come with B.V., N.V., random whitespace,
			accents. IBANs need MOD 97-10 validation. VINs need WMI whitelist verification against 160+
			manufacturer prefixes.
		</span>,
		"",
		<span key="p10">
			We built field-specific normalizers for everything: amounts, invoice numbers, company names,
			addresses, dates, mileage. Each with their own parsing logic, tolerance thresholds, and
			comparison strategies. This harness is what makes the system actually work.
		</span>,
		"",
		<h3 key="degradation" className="text-cyan font-bold">
			### Building for Failure
		</h3>,
		"",
		<span key="p11">Systems fail. The question is how gracefully. Our approach:</span>,
		"",
		<span key="b4">
			• Textract fails? Fall back to GPT values. Still works, just less accurate.
		</span>,
		<span key="b5">
			• PDF format rejected? Rasterize with Poppler, retry Textract on the image.
		</span>,
		<span key="b6">
			• Field extraction fails? First-value-wins merge from multiple extraction paths.
		</span>,
		<span key="b7">
			• Validation near-miss? Partial scoring with tolerance thresholds (within 1% = 0.95 score).
		</span>,
		<span key="b8">
			• 8 critical fields must match for valid=true. Non-critical fields can fail without
			invalidating the invoice.
		</span>,
		"",
		<h3 key="alternative" className="text-cyan font-bold">
			### The Alternative: Back to Vendor/document-Specific Extractors?
		</h3>,
		"",
		<span key="p12">
			Here's the full-circle moment. Remember 2016? Per-vendor regex extractors were too
			labor-intensive to maintain. But the approach was{" "}
			<span className="text-green font-bold">deterministic and reliable</span> for known formats.
		</span>,
		"",
		<span key="p13">
			In 2025-2026, AI coding agents change the economics. Instead of writing vendor-specific
			extractors by hand, you can use LLMs to <span className="text-blue font-bold">generate</span>{" "}
			them. Then run the generated code deterministically. Best of both worlds: LLM creativity for
			code generation, deterministic execution for reliability.
		</span>,
		"",
		<span key="p14">
			The "old" approach might win again, if the tooling makes it maintainable.
		</span>,
		"",
		<h3 key="conclusion" className="text-cyan font-bold">
			### Conclusion
		</h3>,
		"",
		<span key="p15">
			Ten years later, same problem, more tools. Neither LLM nor OCR alone is sufficient for
			production. The hybrid approach works: let each tool do what it's best at. Know your failure
			modes and design for graceful degradation.
		</span>,
		"",
		<span key="p16">
			And sometimes the deterministic approach wins, if AI makes it maintainable.
		</span>,
		"",
		<span key="link">
			See the project:{" "}
			<a href="/projects?customer=revive%20capital" className="text-blue hover:underline">
				Revive Capital on my projects page
			</a>
		</span>,
		"",
		<span key="tags" className="text-comment">
			#llm #ocr #documentextraction #typescript #fintech #ai
		</span>,
	],
}
