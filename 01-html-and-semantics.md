# 01. HTML

HTML describes the **structure and meaning** of a page. It decides what is a heading, a link or a form. It does not decide how things look (that is CSS) or how they behave (that is JavaScript).

**Contents:** [Level 1](#level-1-fundamentals) | [Level 2](#level-2-intermediate) | [Level 3](#level-3-advanced) | [Projects](#projects)

---

## Level 1: Fundamentals

### 1.1 Page skeleton

**Concept:** every HTML file has the same outer shell. The `head` holds information about the page. The `body` holds what visitors see. Tags usually come in pairs (`<p>` opens, `</p>` closes) and can have attributes (`lang="en"`).

**Example:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My First Page</title>
  </head>
  <body>
    <!-- This is a comment: the browser ignores it -->
    <h1>Hello, web</h1>
    <p>This is a paragraph.</p>
  </body>
</html>
```

**Task:**

- [ ] Create `index.html`, open it in a browser, then change the `title` and watch the tab name change
- [ ] Remove the closing `</p>` tag and see what the browser does (it forgives, which hides bugs)

**Checkpoint:** what is the difference between `head` and `body`? What does `lang` do?

### 1.2 Text elements

**Concept:** headings (`h1` to `h6`) give the outline of the page: one `h1` per page and never skip levels. Use `p` for paragraphs, `strong` for importance, `em` for emphasis, `br` for a forced line break, `hr` for a topic break, `blockquote` for quotes, `code` and `pre` for code.

**Example:**

```html
<h1>Main title</h1>
<h2>Section</h2>
<p>This is <strong>important</strong> and this is <em>emphasized</em>.<br>New line here.</p>
<blockquote cite="https://example.com">A quoted passage.</blockquote>
<pre><code>const x = 1;
const y = 2;</code></pre>
<p>Special characters: &lt; &gt; &amp; &copy; &nbsp;</p>
```

**Block vs inline:** block elements (`div`, `p`, `h1`, `ul`) start on a new line and take the full width. Inline elements (`span`, `a`, `strong`, `img`) sit inside a line of text.

**Task:**

- [ ] Write a short article with a title, two sections, a quote, and a code snippet

**Checkpoint:** why use `strong` instead of `b`? Which is block and which is inline: `div` or `span`?

### 1.3 Links

**Concept:** links connect pages. Absolute URLs include the domain. Relative URLs are paths from the current file. Anchors jump within a page.

**Example:**

```html
<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">MDN</a>
<a href="about.html">Relative link</a>
<a href="../blog/post.html">Go up one folder</a>
<a href="#contact">Jump to contact section</a>
<a href="mailto:me@example.com">Email me</a>
<a href="tel:+639171234567">Call me</a>
<a href="/files/cv.pdf" download>Download CV</a>

<h2 id="contact">Contact</h2>
```

**Task:**

- [ ] Build a 3-page site (`index.html`, `about.html`, `contact.html`) with a navigation menu linking all pages and a "back to top" anchor

**Checkpoint:** why does `target="_blank"` need `rel="noopener"`?

### 1.4 Images and lists

**Example:**

```html
<img src="images/me.jpg" alt="Photo of me at the beach" width="200" height="200">

<ul>
  <li>Unordered item</li>
  <li>Another item
    <ul><li>Nested item</li></ul>
  </li>
</ul>

<ol start="3" reversed>
  <li>Ordered item</li>
</ol>

<dl>
  <dt>HTML</dt>
  <dd>The structure language of the web.</dd>
</dl>
```

**Task:**

- [ ] Build an "About Me" page with a bio, a photo with meaningful `alt`, a list of hobbies, and a numbered list of goals

**Checkpoint:** when should `alt` be empty (`alt=""`)?

### 1.5 Tables

**Concept:** tables are for data in rows and columns, never for page layout.

**Example:**

```html
<table>
  <caption>Weekly schedule</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">Topic</th></tr>
  </thead>
  <tbody>
    <tr><td>Mon</td><td>HTML</td></tr>
    <tr><td>Tue</td><td>CSS</td></tr>
    <tr><td colspan="2">Rest day</td></tr>
  </tbody>
  <tfoot>
    <tr><td colspan="2">Total: 2 topics</td></tr>
  </tfoot>
</table>
```

**Task:**

- [ ] Make a 7-day study table with header, body, footer, and one merged cell (`colspan`)

**Checkpoint:** what are `scope`, `caption` and `colspan` for?

---

## Level 2: Intermediate

### 2.1 Semantic layout

**Concept:** semantic tags tell browsers, search engines and screen readers what each part of the page is. Prefer them over generic `div`.

| Tag | Purpose |
|-----|---------|
| `header` | Intro or top of a page or section |
| `nav` | Main navigation links |
| `main` | The unique content of the page (only one) |
| `section` | A themed group of content with a heading |
| `article` | Self-contained piece (post, card, comment) |
| `aside` | Side content (related links, ads) |
| `footer` | Bottom of a page or section |
| `figure`, `figcaption` | An image or diagram with a caption |
| `time` | A date or time, machine-readable |
| `address` | Contact information |
| `mark` | Highlighted text |

**Example:**

```html
<body>
  <header>
    <nav aria-label="Main">
      <a href="/">Home</a> <a href="/blog">Blog</a>
    </nav>
  </header>

  <main>
    <article>
      <h1>Post title</h1>
      <p>Published <time datetime="2026-10-12">October 12, 2026</time></p>
      <figure>
        <img src="chart.png" alt="Sales rising 20 percent in Q3">
        <figcaption>Figure 1: Q3 sales</figcaption>
      </figure>
    </article>
    <aside>Related links</aside>
  </main>

  <footer><address>Contact: <a href="mailto:me@example.com">me@example.com</a></address></footer>
</body>
```

**Task:**

- [ ] Take a page built only from `div` elements and replace them with semantic tags

**Checkpoint:** what is the difference between `section` and `article`? Why only one `main`?

### 2.2 Forms

**Concept:** forms collect user input. Every input needs a `label`, and the browser can validate for you with attributes.

**Example:**

```html
<form action="/signup" method="post" enctype="multipart/form-data">
  <fieldset>
    <legend>Create account</legend>

    <label for="name">Name</label>
    <input id="name" name="name" type="text" required minlength="2" autocomplete="name">

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="email">

    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" required minlength="8" autocomplete="new-password">

    <label for="age">Age</label>
    <input id="age" name="age" type="number" min="13" max="120">

    <label for="dob">Birthday</label>
    <input id="dob" name="dob" type="date">

    <label for="country">Country</label>
    <select id="country" name="country">
      <option value="">Choose...</option>
      <option value="ph">Philippines</option>
      <option value="us">United States</option>
    </select>

    <label for="bio">Bio</label>
    <textarea id="bio" name="bio" rows="4" maxlength="300"></textarea>

    <label for="avatar">Avatar</label>
    <input id="avatar" name="avatar" type="file" accept="image/*">

    <label for="color">Favorite color</label>
    <input id="color" name="color" type="color">

    <label for="level">Skill level</label>
    <input id="level" name="level" type="range" min="1" max="10">

    <label for="lang">Language</label>
    <input id="lang" name="lang" list="langs">
    <datalist id="langs"><option value="English"><option value="Filipino"></datalist>

    <p>Gender (radio, pick one):</p>
    <label><input type="radio" name="gender" value="f"> F</label>
    <label><input type="radio" name="gender" value="m"> M</label>

    <label><input type="checkbox" name="terms" required> I agree to the terms</label>
  </fieldset>

  <button type="submit">Sign up</button>
  <button type="reset">Reset</button>
</form>
```

**Key points:**

- `name` is what is sent to the server, `id` links the label
- `GET` puts data in the URL (searches), `POST` puts it in the body (changes)
- File uploads need `method="post"` and `enctype="multipart/form-data"`
- Validation attributes: `required`, `min`, `max`, `minlength`, `maxlength`, `pattern`, `type`
- Client-side validation is for convenience only. The server must validate again

**Task:**

- [ ] Build the registration form above, submit it empty, and read the browser messages
- [ ] Add a `pattern` for a phone number and a custom `title` message

**Checkpoint:** what does `for` on a `label` connect to? Why is client-side validation not enough?

### 2.3 Media and embedding

**Example:**

```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Mountain at sunrise" width="800" height="450" loading="lazy" decoding="async">
</picture>

<!-- Different sizes for different screens -->
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
  sizes="(min-width: 800px) 800px, 100vw"
  alt="City skyline">

<video controls width="400" poster="thumb.jpg" preload="metadata">
  <source src="demo.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
</video>

<audio controls src="song.mp3"></audio>

<iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Tutorial video" loading="lazy" allowfullscreen></iframe>

<svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Green circle">
  <circle cx="20" cy="20" r="18" fill="seagreen" />
</svg>

<canvas id="game" width="300" height="150"></canvas>
```

**Task:**

- [ ] Add a responsive image with `srcset` and `sizes`, a captioned video, and an inline SVG icon

**Checkpoint:** why set `width` and `height` on images? When do you use `srcset` instead of `picture`?

### 2.4 Document head, metadata and SEO

**Example:**

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Learn HTML | My Site</title>
  <meta name="description" content="A short summary shown in search results (about 150 characters).">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#4f46e5">
  <link rel="canonical" href="https://example.com/learn-html">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="stylesheet" href="/css/style.css">

  <!-- Social sharing -->
  <meta property="og:title" content="Learn HTML">
  <meta property="og:description" content="A beginner guide.">
  <meta property="og:image" content="https://example.com/preview.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Structured data for rich search results -->
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Article", "headline": "Learn HTML", "author": { "@type": "Person", "name": "Chan" } }
  </script>
</head>
```

**Task:**

- [ ] Add a full head to your portfolio, then check the preview with a social sharing debugger and the structured data with Google's Rich Results Test

**Checkpoint:** what is the canonical link for?

### 2.5 Accessibility (a11y)

**Concept:** accessible pages work with keyboards and screen readers. Most of it is just using the right element.

**Example:**

```html
<!-- Bad: not focusable, no keyboard support -->
<div onclick="save()">Save</div>

<!-- Good -->
<button type="button" onclick="save()">Save</button>

<!-- Skip link, first element in body -->
<a href="#main" class="skip-link">Skip to content</a>
<main id="main">...</main>

<!-- Live region: announces updates to screen readers -->
<div role="status" aria-live="polite" id="msg"></div>

<!-- ARIA only when no native element exists -->
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>
```

**Checklist:**

- Every image has `alt` (empty for decorative)
- Every input has a `label`
- Headings are in order and describe the outline
- Everything clickable is reachable and visible with Tab (never remove focus outlines without replacing them)
- Color contrast is at least 4.5 to 1 for normal text
- The first rule of ARIA: do not use ARIA if a native element does the job
- Test with a screen reader (NVDA on Windows, VoiceOver on Mac) and Lighthouse or axe

**Task:**

- [ ] Unplug your mouse and complete your registration form with only the keyboard. Fix anything you cannot reach
- [ ] Run Lighthouse accessibility and fix every issue

**Checkpoint:** why is `button` better than a clickable `div`?

---

## Level 3: Advanced

### 3.1 Dialog, details and popover

**Example:**

```html
<dialog id="dlg">
  <form method="dialog">
    <p>Delete this item?</p>
    <button value="cancel">Cancel</button>
    <button value="ok">Delete</button>
  </form>
</dialog>
<button id="open">Delete</button>
<script>
  const dlg = document.getElementById("dlg");
  document.getElementById("open").onclick = () => dlg.showModal();
  dlg.addEventListener("close", () => console.log(dlg.returnValue));
</script>

<details>
  <summary>What is HTML?</summary>
  <p>The structure language of the web.</p>
</details>

<button popovertarget="tip">Info</button>
<div id="tip" popover>Popover content, no JavaScript needed.</div>
```

**Task:**

- [ ] Build an FAQ with 5 `details` items and a confirm-delete `dialog` that logs which button was pressed

### 3.2 Templates, custom elements and Shadow DOM

**Concept:** create your own reusable tags. Shadow DOM isolates a component's styles from the rest of the page.

**Example:**

```html
<star-rating value="4"></star-rating>

<template id="star-tpl">
  <style>span { color: gold; font-size: 1.5rem; }</style>
  <span></span>
</template>

<script>
  class StarRating extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.append(document.getElementById("star-tpl").content.cloneNode(true));
      const value = Number(this.getAttribute("value")) || 0;
      root.querySelector("span").textContent = "★".repeat(value) + "☆".repeat(5 - value);
    }
  }
  customElements.define("star-rating", StarRating);
</script>
```

**Task:**

- [ ] Make a `<user-card name="Chan" role="Dev">` element with its own styles that do not leak out

**Checkpoint:** why must custom element names contain a hyphen?

### 3.3 Loading performance and resource hints

**Example:**

```html
<script src="app.js" defer></script>           <!-- runs after parsing, in order -->
<script src="analytics.js" async></script>     <!-- runs as soon as loaded, any order -->
<script type="module" src="main.js"></script>  <!-- deferred by default -->

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/next-page.html">

<img src="hero.jpg" alt="Hero" fetchpriority="high">   <!-- the main image -->
<img src="below.jpg" alt="Below fold" loading="lazy">
```

**Task:**

- [ ] Run Lighthouse and fix the top three performance suggestions

**Checkpoint:** `defer` vs `async` vs `type="module"`: which keeps script order?

### 3.4 Other advanced features

- **`inert`** attribute disables a whole section (used behind modals)
- **`contenteditable`** makes any element editable
- **Drag and drop**, **`<input type="file" webkitdirectory>`**, the **Clipboard API**
- **Microdata and RDFa** (alternatives to JSON-LD), **Open Graph**, **hreflang** for multi-language sites
- **HTML email** uses tables and inline CSS (a very different world)
- **Internationalization:** `lang` on every language change, `dir="rtl"` for right-to-left scripts

**Task:**

- [ ] Add `hreflang` alternates and a language switcher to a two-language page

#### DevQuest Campaign Combat Lore: Defeating The Malformed Tag Abomination

In the **HTML Realm**, cadets encounter *The Malformed Tag Abomination* (Lord of Broken Semantics). This monster is forged from unclosed `<p>` tags, meaningless nested `<div>` soup, and inputs devoid of labels.

To vanquish the Abomination in the Boss Arena:
1. **Semantic Landmark Strike:** Replace non-semantic formatting tags (like `<b>` or `<div>`) with clear landmark elements like `<nav>` containing valid anchor links.
2. **Accessible Input Association:** Every form `<input>` must have an associated `<label for="id">` matching the input's `id="..."`, with proper validation types (`type="email"`, `required`).

---

## Projects

**Mini project: personal portfolio (HTML only)**

- [ ] Semantic layout with header, nav, main, footer
- [ ] Sections: About, Projects (using `article`), Contact form
- [ ] Complete head with SEO, Open Graph and JSON-LD
- [ ] Passes the keyboard-only test and Lighthouse accessibility 90 or higher

**Challenge project: recipe site**

- [ ] 5 recipe pages using the same semantic structure
- [ ] A recipe submission form with every input type and validation
- [ ] Images with `picture`, `srcset` and captions
- [ ] A printable version (you will style it in file 02)

## Self-check

You are done with HTML when you can, from memory:

- [ ] Write a full valid page skeleton and a semantic layout
- [ ] Build an accessible form with 8 input types and validation
- [ ] Explain `defer`, `async`, `srcset` and `canonical`
- [ ] Make an interactive widget without JavaScript (`details`, `dialog`, `popover`)
