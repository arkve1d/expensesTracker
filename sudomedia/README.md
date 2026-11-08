# sudomedia.uk — animated landing page

A redesigned, animated homepage for [sudomedia.uk](https://sudomedia.uk/). It keeps the existing brand system and adds motion throughout:

- the near-black `#0a0b0b` base
- the cyan → green gradient (`#16c7df` → `#43ee72`) with mint accents
- Impact headlines with gradient emphasis, and Arial body text
- square corners and thin rules
- the flat SUDO wordmark and symbol, with the 3D render used as editorial imagery

All copy, links, SEO meta and structured data are unchanged from the live homepage.

## What's new

| Area | Animation |
| --- | --- |
| Intro | The SUDO symbol draws itself in the brand gradient, fills, then wipes away. It plays once per browser session and is skipped for reduced-motion users. |
| Hero | A canvas waveform radiates from the 3D mark and pulses at 174 BPM (half-time). The render floats and follows the pointer, with orbit rings and a perspective grid. The headline reveals line by line, and "FOR MUSIC" has a moving gradient. |
| Services strip | An infinite ticker that alternates filled and outlined Impact text, with gradient SUDO symbol separators. |
| Portfolio cards | Scroll reveal, 3D tilt and a spotlight that follows the pointer. |
| Selected work *(new)* | Two angled reels of real client artwork moving in opposite directions. Hovering pauses the reel and shows the project caption. Each tile links to its project page. |
| Services list | Gradient row sweep on hover, plus a floating artwork preview that follows the cursor. |
| About | The SUDO symbol draws on scroll, with rotating gradient rings and an equaliser. |
| Contact | Slowly shifting brand gradient with large ghost "START A PROJECT" lettering scrolling behind it. |
| Global | Scroll progress bar, magnetic buttons and gradient underline hovers on the nav. |

Accessibility and performance:

- With `prefers-reduced-motion`, nothing animates and all content shows straight away.
- The canvas pauses when the hero is off-screen or the tab is hidden.
- Cloned ticker and reel items are `aria-hidden` and can't be tabbed to.
- No libraries or build step are needed.
- Anton (Google Fonts) loads only on devices without Impact (Android, Linux), so headlines stay on-brand there. Windows and macOS keep Impact exactly as the live site does.

## Deploying

Only three files are new or changed. Copy them into the live site root:

```
index.html   ← replaces the current homepage
landing.css  ← new, loaded after the existing styles.css
landing.js   ← new, replaces script.js on the homepage only
```

Other pages (graphics, photography, contact, project pages) keep using `styles.css` and `script.js`, so they're unaffected.

`styles.css` and the files under `assets/` in this folder are copies of the live site's files. They're included only so the page can be previewed locally:

```
cd sudomedia && python3 -m http.server 8000
# open http://localhost:8000
```

Internal links such as `graphics` and `projects/...` resolve on the live site, which serves them without `.html` extensions.

The email link is written as a plain `mailto:`. Cloudflare's email obfuscation rewrites it automatically on the live site, as it does today.
