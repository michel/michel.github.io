# AGENTS.md

Guidance for coding agents working on this repository: the source of https://re-invention.nl, the
site of re-invention, Michel de Graaf's software consultancy.

## The site

Two sites in one Vite build, deployed together to GitHub Pages:

- **The company homepage** at `/`: static HTML in `index.html` (and `404.html`), styled by
  `src/site/site.css` and enhanced by `src/site/main.ts`. No framework. Its illustrations are
  drawn in code (`src/site/scenes/*.ts`, inlined at `<!-- scene:name -->`) or are Figma masters
  (`src/site/figures/*.svg`, inlined at `<!-- figure:name -->`); see `vite.config.ts`.
- **The blog** at `/blog`: a React app (`blog/index.html`, `src/main.tsx`, `src/App.tsx`) rendered
  as a vim/tmux session. Posts live in `src/posts/` as arrays of lines and are registered in
  `src/posts/index.ts`; pages are in `src/pages/`.

`scripts/prerender.tsx` prerenders every blog route to static HTML, writes the sitemap and the
redirect stubs for old URLs, and inlines the stylesheets. `scripts/llms.ts` then writes the site for
language models: `/llms.txt`, `/llms-full.txt` and a Markdown copy of each page next to its HTML
(`/index.md`, `/blog/posts/<slug>.md`, `/blog/about.md`). Both run as part of the build, so new
posts show up everywhere without further work.

The root-level `css/`, `js/`, `img/` and the PDFs are older static files that are still served.

## Commands

```sh
npm ci            # install
npm run dev       # dev server
npm run build     # typecheck, build, prerender, write llms.txt (needs Bun)
npm run check     # Biome: lint and format, writing fixes
```

Run `npm run build` and `npx biome check .` before committing.

## Deploying

Every push to `master` deploys through `.github/workflows/deploy.yml`, which runs the build and
publishes `dist/` to GitHub Pages. There is no staging environment; check the result of the build
locally first.

## Conventions

- Formatting is Biome's: tabs, a line width of 100, no semicolons in TypeScript.
- Comments are full sentences that say why, in the voice of the surrounding code, without a
  closing full stop on the last sentence. Match the density of the file you are in.
- The homepage is plain HTML and CSS first: it must read and work without JavaScript, and motion
  stays behind the `.motion` class (set when the visitor does not prefer reduced motion).
- Colours are tokens in `src/site/site.css`, with a light and a dark theme; the illustrations
  draw in the monochrome palette of `src/site/scenes/iso.ts`, mapped to those tokens.
- Commit subjects describe the change in plain words (for example "Phone hero: pulses along the
  symbol run smoothly"), with a short bullet list in the body when it helps.
