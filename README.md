# Guayaswest — Personal Landing Page

A single-page personal site for **Gabriel Tarapues** (Guayaswest), Senior Software
Engineer — C#/.NET, Azure, Blazor, Low-Code.

The page presents the CV content (summary, skills, experience, education, contact)
over an animated "souls walking toward the abyss" background scene, styled after
heavy-metal album art.

---

## Tech stack

**Plain HTML, CSS, and vanilla JavaScript. No framework, no build step, no dependencies.**

This was a deliberate choice. A landing page is static content — it has no shared
application state and no component reuse problem, which is what React or Angular
exist to solve. There is no backend either, because nothing on the page needs
server-side logic.

Everything you see runs from three files that a browser can open directly. There
is nothing to install, nothing to compile, and nothing that can break when a
dependency publishes a new version.

If a backend is ever needed (a contact form that stores messages, a visitor
counter), the natural addition is a small **ASP.NET Core Minimal API** for just
that one endpoint — not a rewrite of the site.

---

## Project structure

```
landing-page/
├── index.html                     # All markup + inline SVG definitions
├── css/
│   └── styles.css                 # All styling and animation
├── js/
│   └── main.js                    # Nav toggle, scroll reveal, ember particles
├── assets/
│   ├── Gabriel_Tarapues_CV.pdf    # Linked from the "Download CV" button
│   └── images/
│       └── profile.jpg            # Hero portrait
├── .gitignore
└── README.md
```

Roughly 1,500 lines total across the three source files. A large share of
`index.html` is inline SVG path data for the background scene and the icon set.

---

## Running it locally

No build step. Any static file server works:

```bash
cd landing-page
python3 -m http.server 8765
```

Then open <http://localhost:8765>.

You can also just double-click `index.html` — but a server is recommended, since
`file://` URLs apply stricter rules to some browser features.

---

## The background scene

The most involved part of the project. It is a fixed, full-viewport composition
that stays still while the page content scrolls over it.

### Structure

`.scene` is `position: fixed; inset: 0; z-index: 0`, and the header, main, and
footer sit above it at `z-index: 1`. It is deliberately **not**
`background-attachment: fixed`, which is broken on iOS Safari.

Layers, back to front:

| Layer | Implementation |
|---|---|
| Sky | CSS gradients — a radial haze over a vertical gradient |
| Ridges, chasm, ground, skeletons, rocks | One inline SVG |
| Light beam | Blurred CSS radial gradient, `mix-blend-mode: screen` |
| Embers | `<canvas>`, animated in JS |
| Fog | Two drifting CSS radial gradients |
| Vignette | CSS gradients that darken the edges to protect text contrast |

All scene geometry lives in a **single SVG** with
`viewBox="0 0 1600 900"` and `preserveAspectRatio="xMidYMid slice"`. Keeping one
coordinate system means every element stays aligned at any viewport size — if
the skeletons were separate HTML elements positioned in percentages, they would
drift away from the ground plane as the aspect ratio changed.

### How the chasm reads as a chasm

The ground is split into a **far plane** and a **near plane**, separated by a
jagged crack running horizontally across the scene. The light lives inside the
crack.

The critical detail is the glow spill. The bloom that lights the ground around
the crack is **clipped to the ground shapes** using `<clipPath>`, so it never
paints over the crack itself. Without that clip, the glow washes across the
opening, the ground and the crack end up the same brightness, and the whole thing
flattens into a glowing smear instead of a hole. Contrast between the lit ground
and the dark void is what makes the eye read depth.

The light itself is three stacked ellipses with different Gaussian blur radii —
a wide ambient wash, a brighter core, and a hot cyan-white line — which produces
a falloff that a single gradient cannot.

### The walking skeletons

Eight skeletons walk toward the crack, four from behind it and four from the
foreground. Two of the large foreground ones carry an electric guitar.

They share one `@keyframes soulWalk` animation, with each figure's start point,
end point, start scale, end scale, duration, delay, and opacity supplied as CSS
custom properties in its `style` attribute:

```html
<g class="soul" style="--x0:250px;--y0:842px;--x1:686px;--y1:786px;--s0:1.25;--s1:.86;--dur:24s;...">
```

`transform-box: view-box` on `.soul` makes CSS pixel values in `translate()` map
to SVG user units, so the coordinates in the markup are the same numbers used
everywhere else in the scene.

Negative `animation-delay` values start each figure partway through its cycle, so
they are staggered from the first frame instead of all setting off together.

### Embers

52 canvas particles rising out of the crack, each with its own speed, drift, size,
and sine-wave wobble. The canvas is scaled for device pixel ratio (capped at 2),
and the animation loop stops on `visibilitychange` so a background tab costs
nothing.

---

## Interactions

### Melting buttons and nav links

The melt effect uses an SVG **"goo" filter** — a Gaussian blur followed by an
`feColorMatrix` that boosts alpha contrast. The blur makes nearby shapes bleed
into each other and the alpha ramp re-hardens the edges, so separate droplets
merge into one liquid mass instead of looking like floating circles.

Each button holds five droplets tucked inside its bottom edge. On hover they
slide down by different distances with staggered delays, so the bottom edge
stretches and sags before the drops break away.

The filter is applied to a **background-only layer** (`.melt-bg`); the label sits
on a separate unfiltered layer above it. Filtering the whole button would blur
the text along with it.

Nav links use a lighter version — an underline that appears and drips.

### Nav icons

Five inline SVG icons referenced with `<use>`: skull (About), electric guitar
(Skills), crossbones (Experience), pentagram (Education), guitar pick (Contact).
They use `fill: currentColor`, so they follow the link's text color, and they
tilt and scale on hover.

### Profile photo

On hover the portrait fades to 7% opacity, so you look straight through it to the
background scene. The frame keeps a thin cyan inner edge and a soft glow, which
makes it read as glass rather than as a failed image load.

### Experience timeline

Each role is marked with a skeleton whose age matches the seniority of that job —
a visual seniority ladder:

| Period | Company | Figure |
|---|---|---|
| May 2009 – Dec 2011 | Asecsistem | Baby — oversized skull, 2 ribs, stubby limbs |
| Jan 2012 – Jun 2013 | IESS | Child — 3 ribs |
| Mar 2015 – Feb 2018 | Seguros Sucre | Teenager — lanky, 4 ribs |
| Sep 2018 – Jun 2022 | nDeveloper | Adult — full proportions |
| Jun 2022 – Jan 2025 | Zemoga | Adult with an electric guitar |
| Jan 2025 – Present | AIM Inc. | Metal god — spiked crown, guitar, horns raised |

All six are built from the same parts (skull with punched-out eye sockets, jaw,
ribcage, spine, pelvis, tapered limb bones). Only the skull size, overall height,
and rib count change between stages.

The torso, pelvis, and legs are sized as **shares of the space below the
shoulders**, not as multiples of the skull radius. With the skull-relative
version, the big-headed small figures pushed their pelvis below the feet and the
child rendered with no legs at all.

---

## Accessibility

- Every decorative SVG carries `aria-hidden="true"` and is skipped by screen readers.
- `@media (prefers-reduced-motion: reduce)` disables the walking skeletons, the
  pulsing glow, the drifting fog, the ember particles, and all hover transitions.
  The scene still renders — it just holds still.
- Content sits on translucent panels with a backdrop blur so text keeps its
  contrast against the animated scene behind it.
- `lang="en"` on `<html>` enables correct hyphenation in the justified About text.
- The mobile nav toggle maintains `aria-expanded`.

---

## Browser notes

Things worth knowing before editing:

- **`<use>` shadow DOM.** Content cloned by `<svg><use>` lives in a shadow tree
  that normal CSS selectors cannot reach. A rule like `.xp-icon .xp-guitar { fill: … }`
  silently does nothing. Style it through an **inherited property** (`fill`) or a
  **CSS custom property** (`--xp-guitar`), both of which cross the shadow boundary.
  That is why the timeline guitars are colored via a variable.
- **SVG filter regions.** A filter's default region clips at 110% of the element's
  bounding box, which cuts off the melt droplets. `#goo` declares an explicit
  `x` / `y` / `width` / `height` to leave room.
- **`backdrop-filter`** needs the `-webkit-` prefix for Safari; both are set.
- **`filter: url(#id)`** must reference a filter in a rendered SVG. The definitions
  SVG uses `position: absolute; width: 0; height: 0` rather than `display: none`,
  which breaks the reference in Safari.

---

## Editing the content

All copy lives directly in `index.html` — there is no CMS or data file.

- **Text**: edit the relevant `<section>`.
- **Photo**: replace `assets/images/profile.jpg` (square images work best).
- **CV**: replace `assets/Gabriel_Tarapues_CV.pdf`, keeping the filename, or update
  the `href` on the Download CV button.
- **Colors**: the palette is defined as custom properties in `:root` at the top of
  `css/styles.css`. Changing `--accent` and `--accent-2` re-themes the accents,
  the glow, and the guitars in one place.

---

## Deployment

The site is static, so any static host works. For **GitHub Pages**:

1. Push the repository to GitHub.
2. Settings → Pages → Source: deploy from branch, `main`, folder `/ (root)`.
3. The site publishes at `https://<username>.github.io/<repo>/`.

To serve it at `guayaswest.com`, add a `CNAME` file containing the domain and
point the domain's DNS at GitHub Pages.

Netlify and Vercel both work by dropping the folder in — no build command, output
directory is the repo root.

---

## Credits

Designed and built with [Claude Code](https://claude.com/claude-code).
