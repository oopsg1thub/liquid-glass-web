# Liquid Glass — component patterns

All patterns assume `assets/glass.css` and `assets/refraction-snippet.html`
are already in the page. Copy markup as-is; adjust content and tokens only.

For complete pages, choose one self-contained example:

- `example-quick-start.html` — minimal nav and hero.
- `example-components.html` — every public component pattern.
- `example-music-player.html` — interactive widget with separate demo logic.
- `example-resume.html` — responsive five-pane portfolio with print styles.

## Glass card (large surface)

```html
<article class="lg lg--thick lg-materialize" style="padding: clamp(1.4rem, 4.5vw, 2.25rem);">
  <h2>Title</h2>
  <p>Body content sits directly on the pane — no inner glass.</p>
</article>
```

## Nav pill / dock (thin chrome)

```html
<nav class="lg lg--thin lg-materialize" aria-label="Primary"
     style="--lg-radius: 999px; position: sticky; top: 0.85rem; z-index: 20;
            width: min(55rem, calc(100% - 1.75rem)); margin: 0.85rem auto 0;
            padding: 0.6rem 0.9rem 0.6rem 1.25rem;
            display: flex; align-items: center; gap: 1rem;">
  <span style="font-weight: 700; margin-right: auto;">Brand</span>
  <a href="#a">Section</a>
  <a href="#b">Section</a>
  <button class="lg-chip" id="themeToggle" aria-label="Toggle color theme">◐</button>
</nav>
```

`position: sticky` is mandatory — `fixed` + backdrop-filter janks on iOS.

## Buttons and chips (inside glass — never glass-on-glass)

```html
<a class="lg-chip" href="mailto:x@y.z">x@y.z</a>
<button class="lg-chip">Secondary</button>
<button class="lg-chip lg-cta">Primary action</button>
```

Round icon button (transport controls, toggles):

```html
<button class="lg-chip" style="width: 2.6rem; height: 2.6rem; padding: 0;
        justify-content: center; font-size: 1rem;" aria-label="Next">⏭</button>
```

## Standalone glass button (floating CTA, not inside a pane)

```html
<button class="lg lg--thin" style="--lg-radius: 999px; padding: 0.7rem 1.4rem;
        font: inherit; color: var(--ink); cursor: pointer;">Open</button>
```

Add press feedback: `button.lg:active { transform: scale(0.97); }` with
`transition: transform 160ms ease-out`.

## Modal

```html
<dialog class="lg lg--thick" style="--lg-radius: 24px; padding: 1.75rem; border: none;">
  <h2>Confirm</h2>
  <p>Proceed with this action?</p>
  <form method="dialog" style="display: flex; gap: 0.75rem;">
    <button class="lg-chip">Cancel</button>
    <button class="lg-chip lg-cta">Confirm</button>
  </form>
</dialog>
```

Pair with `dialog::backdrop { background: rgba(0,0,0,0.35); }` — a dimming
scrim behind a modal task, per Apple's focus rule.

## Progress bar (player, uploads)

```html
<div style="height: 6px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 14%, transparent); overflow: hidden;" aria-hidden="true">
  <div id="fill" style="height: 100%; width: 35%; border-radius: inherit; background: var(--accent);"></div>
</div>
```

Decorative only — pair with visible time labels or aria-live text for the
real status.

## Page skeleton

```html
<body>
  <div class="lg-backdrop" aria-hidden="true">
    <span class="b1"></span><span class="b2"></span><span class="b3"></span><span class="b4"></span>
  </div>
  <!-- glass panes here -->
  <!-- paste assets/refraction-snippet.html -->
</body>
```
