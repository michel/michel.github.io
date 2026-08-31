import type { ReactNode } from "react"
import Lightbox from "../components/Lightbox"

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
		// THE HOOK - Lead with the failure
		<span key="hook1">
			ChatGPT returned a VIN with a zero where there should be an O. WMI validation failed. The car
			couldn't be registered at the RDW. Manual work required.{" "}
			<span className="text-green font-bold">Trust in the system lost.</span>
		</span>,
		"",
		<span key="hook2">This is the problem with "just use GPT for document extraction."</span>,
		"",
		<span key="p1">
			I'm building invoice validation for{" "}
			<span className="text-blue font-bold">Revive Capital</span>, a B2B car financing company. We
			extract IBANs, VINs, Chamber of Commerce numbers, prices, and tax amounts from supplier
			invoices. Get them wrong, and we might finance the wrong car.
		</span>,
		"",
		<div key="img1-wrapper" className="flex flex-col gap-1">
			<Lightbox
				key="img1"
				src="/images/posts/llm-vs-ocr-document-extraction/invoice_example.webp"
				alt="Redacted Dutch car invoice"
				width={2473}
				height={3497}
			/>
			<span className="text-comment text-sm">
				{"// typical Dutch car invoice with VIN, IBAN, prices, and tax fields"}
			</span>
		</div>,
		"",
		// THE NAIVE APPROACH
		<h3 key="naive" className="text-cyan font-bold">
			### Just use GPT, right?
		</h3>,
		"",
		<span key="p2">
			First attempt: "Just use GPT with vision." Send the invoice image, ask it to extract all
			fields. It works great for semantic understanding. Trade-in deductions? GPT gets it. Price
			calculations across line items? No problem with the right prompt.
		</span>,
		"",
		<span key="p3">
			But then the failures started. O became 0. I became 1. Q became 0. The LLM would confidently
			return values that looked plausible but were wrong.
		</span>,
		"",
		<span key="p3b">
			This is the core problem:{" "}
			<span className="text-green font-bold">
				LLMs aggregate meaning well and transcribe symbols badly
			</span>
			. They understand what a VIN is. They can't copy one out. Tokens are probability
			distributions, not characters, and for a checksummed identifier close is useless.
		</span>,
		"",
		<h3 key="background" className="text-cyan font-bold">
			### I've seen this before
		</h3>,
		"",
		<span key="bg1">
			In 2016, I built <span className="text-blue font-bold">Dutchies Travel</span> (BackpackApp), a
			travel agency platform for backpackers in Australia. Same problem: extracting booking codes,
			dates, locations from travel voucher PDFs. Each vendor had a different format. Each required
			custom regex extractors. Formats changed over time. Constant maintenance, custom code for each
			case.
		</span>,
		"",
		<span key="bg3">
			When field extraction goes wrong, end customers, vendors, and internal stakeholders all lose
			trust.
		</span>,
		"",
		// THE SOLUTION
		<h3 key="hybrid" className="text-cyan font-bold">
			### The fix: let each tool do what it's best at
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
			• <span className="text-blue font-bold">AWS Textract</span> handles symbol-critical fields:
			IBAN, VIN, Chamber of Commerce numbers. Why? OCR is deterministic and checksum-verifiable.
			LLMs are probabilistic and token-based. For fields with validation algorithms, deterministic
			wins.
		</span>,
		<span key="b3">
			• <span className="text-blue font-bold">Merge strategy</span>: Textract only overrides GPT for
			these specific fields. Everything else uses GPT's semantic understanding.
		</span>,
		"",
		<Lightbox
			key="img2"
			src="/images/posts/llm-vs-ocr-document-extraction/extraction_prompts.webp"
			alt="Extraction prompts and extractor code"
			width={1819}
			height={1552}
		/>,
		"",
		<h3 key="prompts" className="text-cyan font-bold">
			### The prompt optimization rabbit hole
		</h3>,
		"",
		<span key="p6">
			I went deep on prompt optimization. Built a 331-line system prompt with detailed extraction
			instructions. Verification checklists. Explicit warnings about BPM vs BTW (vehicle
			registration tax vs VAT). IBAN validation instructions in the prompt itself.
		</span>,
		"",
		<span key="p7">
			Even used{" "}
			<a
				href="https://github.com/SalesforceAIResearch/promptomatix"
				className="text-blue hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				Promptomatix
			</a>{" "}
			for automated prompt optimization, running experiments against baseline prompts. The optimized
			prompts were more concise. Accuracy improved marginally.
		</span>,
		"",
		<span key="p8">
			Prompts can't fix symbol fidelity. You can tell the model to double-check and verify all you
			want; it still operates on tokens, not characters. The fix has to be architectural.
		</span>,
		"",
		<h3 key="normalization" className="text-cyan font-bold">
			### Normalization is everything
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
			I built field-specific normalizers for everything: amounts, invoice numbers, company names,
			addresses, dates, mileage. Each with their own parsing logic, tolerance thresholds, and
			comparison strategies.
		</span>,
		"",
		<Lightbox
			key="img3"
			src="/images/posts/llm-vs-ocr-document-extraction/normalizers_code.webp"
			alt="Field normalizers and extractors code"
			width={1819}
			height={1552}
		/>,
		"",
		<h3 key="degradation" className="text-cyan font-bold">
			### Building for failure
		</h3>,
		"",
		<span key="p11">Everything here fails eventually. Here's what happens when it does:</span>,
		"",
		<span key="b4">
			• <span className="text-blue font-bold">Textract fails?</span> Fall back to GPT values. Still
			works, just less accurate.
		</span>,
		<span key="b5">
			• <span className="text-blue font-bold">PDF format rejected?</span> Rasterize with Poppler,
			retry Textract on the image.
		</span>,
		<span key="b6">
			• <span className="text-blue font-bold">Field extraction fails?</span> First-value-wins merge
			from multiple extraction paths.
		</span>,
		<span key="b7">
			• <span className="text-blue font-bold">Validation near-miss?</span> Partial scoring with
			tolerance thresholds (within 1% = 0.95 score).
		</span>,
		<span key="b8">
			• <span className="text-blue font-bold">Critical fields:</span> 8 must match for valid=true.
			Non-critical fields can fail without invalidating the invoice.
		</span>,
		"",
		<h3 key="alternative" className="text-cyan font-bold">
			### Full circle: back to vendor-specific extractors?
		</h3>,
		"",
		<span key="p12">
			In 2016 the per-vendor regex extractors were too labour-intensive to maintain. But they were{" "}
			<span className="text-green font-bold">deterministic and reliable</span> for known formats.
		</span>,
		"",
		<span key="p13">
			In 2025-2026, AI coding agents change the economics. Instead of writing vendor-specific
			extractors by hand, you can use LLMs to <span className="text-blue font-bold">generate</span>{" "}
			them. The LLM writes the extractor once. After that it runs deterministically, every time.
		</span>,
		"",
		<span key="p13b">
			Concrete example: a new supplier sends invoices with the VIN in a table on page 2. Instead of
			prompt-engineering GPT to find it, generate a vendor-specific extractor: real code, with regex
			patterns and spatial relations. The regex validates the VIN format; table coordinates find it
			on page 2. When their format changes, regenerate the code. Minutes of work instead of hours of
			prompt debugging, burning tokens, and non-deterministic results.
		</span>,
		"",
		<span key="p14">
			The "old" approach might win again, now that the tooling makes it maintainable.
		</span>,
		"",
		<span key="p15b" className="text-comment">
			Note: this article reflects the state of GPT-4o and AWS Textract as of late 2025. These tools
			evolve fast. The symbol fidelity problem may improve. Swapping models is easy—better accuracy,
			cheaper tokens, just plug in the next generation.
		</span>,
		"",
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
