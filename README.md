# Gouthami V — 3D Interactive Portfolio

A single-page portfolio built around a live WebGL underwater scene: procedurally generated
fish that swim with shader-driven body undulation, drifting plankton, bubble columns, god rays
and animated caustics. Behind the 3D sits a pure-CSS flowing colour field, and every
scroll-linked value on the page is driven by one rAF loop. The projects section is a real 3D
carousel — each project lives in its own `preserve-3d` division with parallaxing depth layers.

**Theme:** *Aether Flow* — pale sunlit-water base with cyan / teal / violet / pink accents,
frosted-glass panels and cool blue-grey elevation.

---

## The portrait

`assets/profile.jpg` is already in place. To swap it, overwrite that file — ~1040 × 1280 px,
portrait crop, face in the upper third, JPEG quality ~82 (under ~350 KB). If it is ever missing,
the site falls back to `assets/profile-placeholder.svg` automatically; nothing breaks, you just
get a silhouette.

---

## Run it

The page uses ES modules and an import map, so `file://` will not work. Serve it:

```bash
cd gouthami-portfolio

# Python
python3 -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

## Deploy it

It is fully static — no build step, no bundler, no npm install.

- **GitHub Pages** — push, then Settings → Pages → deploy from branch root
- **Netlify / Vercel** — drag the folder in, or connect the repo; no build command, publish directory `.`
- **Cloudflare Pages** — same; framework preset "None"

Three.js loads from unpkg via import map. To self-host it instead, drop
`three.module.js` and the `examples/jsm/` folder into `vendor/` and repoint the import map
in [index.html](index.html).

---

## Files

| Path | What it does |
| --- | --- |
| [index.html](index.html) | Semantic document, all sections, import map, project card markup |
| [css/style.css](css/style.css) | Design tokens + 21 sections of styling, flow background, reduced-motion and print rules |
| [js/ocean.js](js/ocean.js) | Three.js scene: procedural fish, shader undulation, particles, rays, caustics |
| [js/ui.js](js/ui.js) | Scroll engine, preloader, cursor, nav, reveals, counters, 3D coverflow, modal, form |
| `assets/profile.jpg` | The portrait |
| [assets/profile-placeholder.svg](assets/profile-placeholder.svg) | Automatic fallback if the photo is missing |

---

## The flow background

Below the WebGL canvas (`--z-flow: 0` vs `--z-canvas: 1`, and the renderer keeps `alpha: true`)
sits a `.flow` field made entirely of CSS — no second canvas, no images:

- **four blurred colour ribbons** on long, mismatched `alternate` drifts (30s / 34s / 38s / 42s),
  so the field never visibly loops
- **two silk layers** — `repeating-linear-gradient` bands sliding in opposite directions at
  different speeds, which reads as woven depth rather than a moving stripe
- **caustics** in `mix-blend-mode: soft-light`, a masked dot **grid**, and a top-and-bottom
  **wash** that fades the whole field into the page edges

The ribbons and the grid also carry `data-parallax`, so the field separates as you scroll.

## The scroll engine

One rAF loop in [js/ui.js](js/ui.js) owns every scroll-linked value, writes only on change, and
**parks itself after 8 idle frames** (waking on scroll, resize, or the tab becoming visible):

| Written to | Meaning |
| --- | --- |
| `--sp` on `:root` | whole-document progress, 0..1 |
| `--sv` on `:root` | smoothed scroll velocity, ~-1..1 |
| `--py` on `[data-parallax]` | per-element offset, computed from the element's **own** viewport centre so layers separate symmetrically |
| `--p` on `[data-track]` | that section's own 0..1 progress |
| `#scrollBar` width | the top rail |

CSS then consumes those declaratively — the flow field leans into `--sv`, `main` skews by a
fraction of a degree during fast scrolling, section heads settle on `--p`, and the `.flowline`
reading spine on the left scales its fill and positions its bead from `--sp`. Under
`prefers-reduced-motion` the loop paints one static frame and returns.

---

## How the fish work

No model file is downloaded. `ocean.js` builds the body by lofting elliptical cross-sections
along a Catmull-Rom silhouette (laterally compressed, `rx = 0.62r` / `ry = 1.34r`), then merges
caudal, dorsal, anal and two pectoral fins into a **single buffer geometry — one draw call per fish**.

Swimming is a vertex-shader effect injected into `MeshStandardMaterial` via `onBeforeCompile`:

- a travelling sine wave along the body, amplitude ramped by `pow(t, 1.9)` so the head barely
  moves and the tail sweeps hard
- the normal is **analytically counter-rotated** by the local slope, so lighting stays correct
  as the body bends (this is the difference between "looks like a fish" and "looks like a
  wobbling texture")
- countershading — pale belly, saturated dorsal — via `smoothstep` on local Y
- a Fresnel rim term added to `totalEmissiveRadiance` for the lit edge

Steering is boids-lite: sine wander + boundary avoidance + pointer repulsion + banking roll.

### Lighting it for a pale page

Most WebGL "underwater" scenes assume a dark background, and every one of those assumptions
inverts here:

- **No additive blending anywhere.** Additive *adds* light, which clamps to white — on a
  near-white page it is simply invisible. All five particle systems (school, bubbles, plankton,
  god rays, caustics) use normal blending and ink *downward* in teal and blue instead.
- **Bellies are mid-tone, not white.** A near-white belly vanishes against pale water, so the
  palette pairs saturated backs with readable mid-tone undersides.
- **The glow is dialled right back** (emissive ×0.05, Fresnel ×0.26). A strong rim on a light
  background reads as washed-out haze, not as light.
- Fog is `0xdfeefb` — the same tone as the CSS water — so distant fish dissolve into the page
  rather than ending on a hard silhouette edge.

## Performance

- Device tier picked from `deviceMemory` / `hardwareConcurrency` / viewport → `low` | `mid` | `high`,
  scaling fish count (3→8), particles (260→620) and DPR (1.25→1.75)
- Crowds (school, bubbles, plankton) are GPU `Points` with custom shaders, never meshes
- The scroll loop parks itself when the page is still, so an idle page runs no scroll work at all
- The flow background is composited CSS transforms and opacity only — no layout, no paint loop
- The render loop early-returns when the tab is hidden or motion is paused; `dt` is clamped so
  returning to the tab does not fast-forward the simulation
- Resize is rAF-debounced; no post-processing composer anywhere

## Accessibility

The 3D is decorative and never load-bearing:

- The carousel is real HTML — selectable text, `←` `→` `Home` `End` keys, `role="tablist"` dots,
  and `tabindex` that follows visibility so off-screen cards are not focus traps
- `prefers-reduced-motion: reduce` disables the typewriter, cursor, tilt, magnetic buttons,
  count-ups, parallax, the page skew and every flow animation, and pauses the ocean; the header
  toggle (⏸) also pauses it manually at any time
- The canvas is `aria-hidden`; if WebGL is unavailable the scene bails out cleanly and the
  CSS flow background remains
- All body text meets WCAG AA on the light base — `--text` 15.1:1, `--text-2` 8.0:1,
  `--text-3` 4.8:1, with the ratios recorded inline in the token block so the guarantee survives
  future edits; skill meters expose `role="meter"` with `aria-valuenow`
- Visible focus rings throughout; the case-study modal traps focus, closes on `Esc`, and restores
  focus to the trigger
- A print stylesheet hides the flow field and reading spine and flattens the 3D carousel into
  stacked full-width cards

## Editing content

- **Projects** — card markup in [index.html](index.html); the long-form case studies are the
  `CASES` object at the top of section 10 in [js/ui.js](js/ui.js)
- **Hero rotating phrases** — the `PHRASES` array in [js/ui.js](js/ui.js)
- **Colours / spacing / type scale** — the `:root` token block at the top of
  [css/style.css](css/style.css). Each accent is split in two: a text-safe core (`--cyan`) that
  passes contrast as type, and a brighter `-lit` variant (`--cyan-lit`) for glows and gradient
  fills only. Keep the token *names* if you retheme — every rule in the file reads through
  `var()`, so replacing just the values relights the whole page.
- **Background motion** — the `.flow__*` rules and their `drift1..4` / `silk` / `causticShift`
  keyframes in section 4 of [css/style.css](css/style.css)
- **Scene density** — the `CONF` tier table in [js/ocean.js](js/ocean.js)

## Browser support

Chrome / Edge 90+, Firefox 88+, Safari 15+. Requires WebGL 2, ES modules and import maps.
Older browsers get the full content with a static background.

## Contact form

There is no backend. Submitting validates inline, then opens the visitor's mail client with a
pre-filled message to `gouthamiyadu05@gmail.com`. To make it send server-side, point the form at
Formspree / Netlify Forms and replace the `mailto:` handoff in section 11 of [js/ui.js](js/ui.js).
