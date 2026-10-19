# 02. CSS

CSS controls **how things look and where they sit**. Link it with `<link rel="stylesheet" href="style.css">`. Always prefer an external stylesheet over inline styles.

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Syntax and selectors

**Concept:** a rule has a selector and declarations. The selector chooses which elements are styled.

**Example:**

```css
/* selector { property: value; } */
p { color: #333; }                    /* element */
.card { padding: 1rem; }              /* class (reusable) */
#logo { width: 120px; }               /* id (unique, avoid for styling) */
a[target="_blank"] { color: teal; }   /* attribute */
nav a { text-decoration: none; }      /* descendant */
ul > li { margin: 0; }                /* direct child */
h2 + p { margin-top: 0; }             /* next sibling */
h2 ~ p { color: gray; }               /* any following sibling */
a:hover, button:focus-visible { outline: 2px solid tomato; }
li:first-child, li:nth-child(odd) { background: #f3f4f6; }
p::first-line { font-weight: bold; }
.btn::before { content: ">"; }
```

**Task:**

- [ ] Style your HTML About Me page using at least one selector of each kind above

**Checkpoint:** what is the difference between `.a .b`, `.a > .b` and `.a.b`?

### 1.2 Cascade, specificity and inheritance

**Concept:** when rules conflict, the browser decides by: importance, then specificity, then order (last wins). Specificity order: inline style, then ID, then class/attribute/pseudo-class, then element. Some properties inherit from the parent (`color`, `font-family`), others do not (`border`, `margin`).

**Example:**

```css
p { color: black; }          /* specificity 0,0,1 */
.note { color: blue; }       /* 0,1,0 - wins over p */
#intro { color: green; }     /* 1,0,0 - wins over .note */

.box { border: 1px solid; color: inherit; }
```

Avoid `!important`. If you need it, your selectors are probably too tangled.

**Task:**

- [ ] Write 3 conflicting rules, predict the winner, and verify in DevTools (Styles panel shows crossed-out losers)

**Checkpoint:** which wins: `div p.note` or `.note.highlight`?

### 1.3 The box model

**Concept:** every element is a box: content, then padding, then border, then margin. Always set `box-sizing: border-box` so `width` includes padding and border.

**Example:**

```css
*, *::before, *::after { box-sizing: border-box; }

.box {
  width: 200px;
  padding: 16px;
  border: 2px solid #000;
  margin: 24px auto;       /* auto left/right centers a block */
}
```

Margins between vertical siblings **collapse** (the larger one wins), padding never does.

**Task:**

- [ ] Make a 300px card with padding, border, margin. Study the box diagram in DevTools

**Checkpoint:** what is the total width of `.box` with and without `border-box`?

### 1.4 Units, colors and backgrounds

**Example:**

```css
.hero {
  font-size: 1.25rem;      /* rem: relative to root font size (use for text and spacing) */
  width: 80%;              /* % of parent */
  height: 100vh;           /* % of viewport height */
  max-width: 60ch;         /* ch: width of the character 0, perfect for text */
  color: #1f2937;          /* hex */
  background-color: rgb(79 70 229 / 0.1);   /* with transparency */
  border-color: hsl(250 70% 50%);
  background-image: url("bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  border-radius: 12px;
}

.gradient { background: linear-gradient(135deg, #4f46e5, #ec4899); }
```

Rule of thumb: `rem` for font and spacing, `px` for borders and shadows, `%`/`vw`/`fr` for layout.

**Task:**

- [ ] Build a hero banner with a gradient, rounded corners, shadow and readable text

### 1.5 Typography

**Example:**

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}

body {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: 0.01em;
  color: #1f2937;
}
h1 { font-size: 2rem; font-weight: 700; line-height: 1.2; }
p  { max-width: 65ch; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

**Task:**

- [ ] Restyle an article for comfortable reading: 65 characters per line, line-height 1.6, clear heading scale

### 1.6 Display, overflow and positioning

**Concept:** `display` sets how an element flows (`block`, `inline`, `inline-block`, `none`, `flex`, `grid`). `position` moves it: `relative` nudges it, `absolute` places it against the nearest positioned ancestor, `fixed` pins it to the screen, `sticky` sticks while scrolling.

**Example:**

```css
.card { position: relative; }
.badge { position: absolute; top: 0; right: 0; }
.header { position: sticky; top: 0; background: white; z-index: 10; }
.hidden { display: none; }           /* removed from layout */
.invisible { visibility: hidden; }   /* still takes space */
.scroll-box { height: 200px; overflow: auto; }
```

**Task:**

- [ ] Build a card with a corner badge and a header that stays at the top while you scroll

**Checkpoint:** why did the badge need `position: relative` on the parent?

---

## Level 2: Intermediate

### 2.1 Flexbox (one-dimensional layout)

**Concept:** Flexbox lines items in a row or column. Think: main axis and cross axis.

**Example:**

```css
.nav {
  display: flex;
  flex-direction: row;            /* main axis: row or column */
  justify-content: space-between; /* along the main axis */
  align-items: center;            /* along the cross axis */
  flex-wrap: wrap;
  gap: 1rem;
}
.nav .grow { flex: 1; }           /* grow to fill space */
.item { flex: 0 0 200px; }        /* do not grow, do not shrink, 200px */

/* Perfect centering */
.center { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
```

**Task:**

- [ ] Build a navbar with logo left, links right, vertically centered
- [ ] Build a card row that wraps on small screens
- [ ] Build a sticky footer layout (footer stays at the bottom even with little content)

**Checkpoint:** `justify-content` vs `align-items`? What does `flex: 1` mean?

### 2.2 Grid (two-dimensional layout)

**Example:**

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}
.layout > header { grid-area: header; }
.layout > aside  { grid-area: sidebar; }
.layout > main   { grid-area: main; }
.layout > footer { grid-area: footer; }

.feature { grid-column: span 2; }   /* spans 2 columns */
```

Also know: `fr` unit, `minmax()`, `auto-fill` vs `auto-fit`, `place-items`, `grid-auto-flow: dense`, subgrid.

**Task:**

- [ ] Build an image gallery that goes from 4 columns to 1 with no media queries
- [ ] Build the header, sidebar, main, footer layout above
- [ ] Build a magazine layout where one card spans two columns and two rows

**Checkpoint:** when do you pick Flexbox, and when Grid?

### 2.3 Responsive design

**Concept:** design for the smallest screen first, then add rules for larger ones.

**Example:**

```css
.container { max-width: 1100px; margin-inline: auto; padding-inline: 1rem; }
.features { display: grid; gap: 1rem; }

@media (min-width: 768px)  { .features { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .features { grid-template-columns: repeat(3, 1fr); } }

img { max-width: 100%; height: auto; display: block; }

/* User preferences */
@media (prefers-color-scheme: dark)  { :root { --bg: #111; --text: #eee; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
@media print { nav, footer { display: none; } }
```

**Task:**

- [ ] Make your portfolio look good at 360px, 768px and 1280px (use DevTools device mode)

**Checkpoint:** why mobile-first? What does `min-width` vs `max-width` change?

### 2.4 Custom properties, calc and functions

**Example:**

```css
:root {
  --brand: #4f46e5;
  --space: 1rem;
  --radius: 8px;
  --bg: #fff;
  --text: #111827;
}
[data-theme="dark"] { --bg: #111827; --text: #f9fafb; }

body { background: var(--bg); color: var(--text); }
.btn {
  background: var(--brand);
  padding: calc(var(--space) / 2) var(--space);
  border-radius: var(--radius);
  width: min(100%, 400px);
}
```

**Task:**

- [ ] Add a dark mode with a toggle button (JavaScript sets `data-theme`) and `prefers-color-scheme` as the default

### 2.5 Pseudo-classes, pseudo-elements and states

**Example:**

```css
a:hover { color: tomato; }
button:active { transform: scale(0.97); }
input:focus-visible { outline: 3px solid #4f46e5; outline-offset: 2px; }
input:invalid:not(:placeholder-shown) { border-color: crimson; }
li:not(:last-child) { border-bottom: 1px solid #e5e7eb; }
.card::after { content: ""; position: absolute; inset: 0; }
::selection { background: #fde68a; }
::placeholder { color: #9ca3af; }
```

### 2.6 Transitions, transforms and stacking

**Example:**

```css
.btn {
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.btn:hover { transform: translateY(-2px) scale(1.02); }

.modal-backdrop { position: fixed; inset: 0; background: rgb(0 0 0 / 0.5); z-index: 100; }
.thumb { aspect-ratio: 16 / 9; object-fit: cover; width: 100%; }
```

`z-index` only works on positioned elements and inside a **stacking context** (created by `position` plus `z-index`, `transform`, `opacity < 1`). Animate `transform` and `opacity` for smooth 60 fps. Avoid animating `width`, `top` or `left`.

**Task:**

- [ ] Build a card with hover lift, a focus-visible ring, and a modal with backdrop and correct stacking

---

## Level 3: Advanced

### 3.1 Modern CSS features

**Example:**

```css
/* Fluid type: min, preferred, max */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }

/* Container queries: component reacts to its parent, not the screen */
.card-wrap { container-type: inline-size; }
@container (min-width: 400px) { .card { display: flex; gap: 1rem; } }

/* :has() selects a parent based on its children */
.field:has(input:invalid) { border-color: crimson; }
.grid:has(> :nth-child(4)) { grid-template-columns: repeat(2, 1fr); }

/* :is() and :where() group selectors */
:is(h1, h2, h3) a { color: inherit; }

/* Native nesting */
.card {
  padding: 1rem;
  & h2 { margin: 0; }
  &:hover { box-shadow: 0 4px 12px rgb(0 0 0 / 0.15); }
}

/* Logical properties work for any writing direction */
.box { margin-inline: auto; padding-block: 1rem; }
```

**Task:**

- [ ] Build a card that stacks in narrow containers and goes side by side in wide ones, using a container query
- [ ] Style a form field wrapper red when its input is invalid, using `:has()`

### 3.2 Animations

**Example:**

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.hero { animation: fade-in 0.6s ease-out both; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 32px; height: 32px;
  border: 4px solid #e5e7eb; border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Always respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Newer: **View Transitions** (`document.startViewTransition`) for page and element morphs, and **scroll-driven animations** (`animation-timeline: scroll()`).

**Task:**

- [ ] Animate a hero on load, build a CSS-only spinner and a skeleton loading shimmer

### 3.3 Visual effects

**Example:**

```css
.avatar { clip-path: circle(50%); }
.diagonal { clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); }
.glass { backdrop-filter: blur(10px); background: rgb(255 255 255 / 0.2); }
.dim { filter: grayscale(1) brightness(0.8); }
.blend { mix-blend-mode: multiply; }
.fade-edge { mask-image: linear-gradient(to bottom, black 70%, transparent); }
.snap { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.snap > * { scroll-snap-align: start; flex: 0 0 80%; }
```

**Task:**

- [ ] Build a horizontally swipeable carousel with scroll snap and a glass-effect header

### 3.4 Cascade layers and architecture

**Concept:** large projects need a naming system or a layering rule so styles stay predictable.

**Example:**

```css
@layer reset, base, components, utilities;

@layer base { body { font-family: system-ui; } }
@layer components { .btn { padding: 0.5rem 1rem; } }
@layer utilities { .mt-4 { margin-top: 1rem; } }   /* wins over components */
```

**Approaches to know:**

- **BEM:** `.card`, `.card__title`, `.card--featured`
- **CSS Modules:** styles scoped per component file
- **Utility-first (Tailwind):** small classes in the HTML
- **CSS-in-JS:** styled-components, Emotion (runtime) and vanilla-extract (zero-runtime)
- **Sass/SCSS** and **PostCSS** (preprocessing, autoprefixing)
- **Design tokens:** colors, spacing and type scales stored as variables, shared with design tools
- **Component libraries:** shadcn/ui, Radix, MUI

```html
<!-- Tailwind -->
<button class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus-visible:ring-2">
  Save
</button>
```

**Task:**

- [ ] Build the same button and card in plain CSS (BEM), then in Tailwind. Write down which you prefer and why

### 3.5 CSS performance

- Animate only `transform` and `opacity`
- Use `contain: content` and `content-visibility: auto` for long off-screen sections
- Use `will-change` sparingly (it costs memory)
- Inline critical CSS, load the rest asynchronously, and remove unused CSS
- Prefer `font-display: swap`, subset your fonts, self-host them

**Task:**

- [ ] Use the DevTools Performance and Rendering panels to find paint flashing and layout shifts on your landing page, then fix two

---

## Projects

**Mini project: responsive landing page**

- [ ] Hero, three feature cards, pricing table, FAQ, footer
- [ ] Mobile-first, works from 360px to 1440px
- [ ] CSS variables, automatic dark mode with a toggle
- [ ] One animation that respects reduced motion
- [ ] Lighthouse performance and accessibility scores of 90 or higher

**Challenge project: dashboard layout**

- [ ] Grid-based layout with sidebar that collapses on mobile
- [ ] Cards, tables that scroll horizontally on small screens, badges and buttons as reusable components
- [ ] A print stylesheet that shows only the report

## Self-check

- [ ] Explain specificity and the box model with an example each
- [ ] Center anything three different ways
- [ ] Build a responsive grid without a single media query
- [ ] Explain the difference between `rem`, `em`, `%` and `vw`
- [ ] Rebuild a page from a screenshot in under an hour
