---
name: liquid-glass-web
description: Recreate Apple's Liquid Glass (iOS 26 / macOS Tahoe) material on HTML web pages — translucent frosted panels with edge refraction, specular rim lighting, a cursor-tracked spotlight, materialize entrances, and full accessibility fallbacks. Use this skill whenever the user mentions liquid glass, glassmorphism, frosted glass, translucent or glassy UI, iOS 26 / Apple-style panels, backdrop-filter effects, or wants any card, navbar, dock, button, modal, or page to look like glass — even if they never name the effect. Also use it when reviewing or debugging an existing glass implementation (corner gaps, blur that disappears, harsh highlights, Safari/Firefox fallback issues).
---

# Liquid Glass for the Web

Build a faithful Liquid Glass material from CSS and SVG. The baseline is
frosted glass in browsers with `backdrop-filter`; SVG displacement refraction
is a progressive Chromium enhancement. Solid surfaces cover accessibility and
print fallbacks.

## Fidelity contract

This skill reconstructs one tuned material. Do not recreate it from memory.

1. Copy `assets/glass.css` verbatim. For a single-file deliverable, inline the
   complete file in one `<style>` block.
2. Copy `assets/refraction-snippet.html` verbatim near the end of `<body>`,
   before any application-specific scripts and the closing `</body>`.
3. Add page-specific CSS after the canonical stylesheet. Customize only the
   documented design tokens; do not rewrite the layer structure or material
   values.
4. Do not rename `.lg*` classes. They are the public interface.
5. Use a bundled example as the starting point when it matches the request.

The canonical asset hashes for this release are:

- `assets/glass.css`: `98e07bd1b012bb0b020e50fb423c0e2d65190a9b6263f8e851ccbfafd0a7bdb4`
- `assets/refraction-snippet.html`: `7c33def72b231ecb1d009fdf4ef937fa7d637abf0a6e72dcf284260ee46c0351`

## Choose the smallest useful reference

| Request | Start with |
|---|---|
| Add one faithful glass surface | `references/example-quick-start.html` |
| Build or compare UI components | `references/example-components.html` |
| Make a compact interactive widget | `references/example-music-player.html` |
| Build a responsive portfolio or résumé | `references/example-resume.html` |
| Copy exact component markup only | `references/components.md` |

Read only the reference that matches the task, then retain the canonical CSS
and snippet without edits.

## Decide whether glass belongs

Use glass for floating navigation and control surfaces: nav pills, docks,
toolbars, compact cards, dialogs, media players, and standalone primary CTAs.

Do not use glass for an entire page background, long-form reading surfaces,
dense tables, repeated form fields, or every content section. A short card may
contain ordinary text, but long body content should remain on a stable surface.
Never stack glass on glass. Controls inside a pane use `.lg-chip` and `.lg-cta`,
which are translucent but deliberately unblurred.

Keep each viewport to 3–5 glass panes. Use fewer when one pane can establish
the hierarchy. Every pane adds backdrop compositing cost.

## Implementation workflow

1. Inspect the existing page and count the proposed panes. Preserve its content,
   semantics, layout constraints, and build system.
2. Add the complete canonical stylesheet, linked or inlined.
3. Give the material something to refract: the optional `.lg-backdrop`, existing
   imagery, or colorful content. Glass over a flat background reads as a pale box.
4. Assign material weight:
   - large surface: `class="lg lg--thick lg-materialize"`
   - small chrome: `class="lg lg--thin lg-materialize"`
   - controls inside glass: `class="lg-chip"` or `class="lg-chip lg-cta"`
5. Stagger entrances with `--enter-delay` only when multiple panes arrive
   together. Keep the existing animation implementation intact.
6. Add the canonical snippet near the end of `<body>`, then put
   application-specific scripts after it before closing `</body>`. This keeps
   the snippet auditable and verbatim.
7. Test the enhanced path, every fallback rung, keyboard operation, zoom, print,
   and console output before delivery.

## Public classes

| Class | Role |
|---|---|
| `.lg` | Base pane and three-layer material stack |
| `.lg--thick` | Large card or dialog; 24px frost and deep shadow |
| `.lg--thin` | Nav, dock, or small floating control; 12px frost |
| `.lg-materialize` | Tuned entrance; stagger with `--enter-delay` |
| `.lg-chip` | Unblurred control for use inside a pane |
| `.lg-cta` | Accent-filled `.lg-chip` variant |
| `.lg-backdrop` | Optional animated color field behind glass |

`.lg` alone is the supported medium-weight surface. The `.lg--thick` and
`.lg--thin` modifiers are optional hierarchy choices.

## Design tokens

Change tokens in a page-level override; do not edit the material declarations.

| Token | Pinned default | Safe use |
|---|---|---|
| `--lg-blur` | 16px; thick 24px; thin 12px | Chromium refraction path only |
| `--lg-sat` / `--lg-bright` | 1.8 / 1.08 | Preserve color behind blur |
| `--lg-radius` | 26px | Use 999px for pills |
| `--bg`, `--ink`, `--ink-dim`, `--hairline` | Theme-specific | Page, text, secondary text, separators |
| `--lg-tint` / `--lg-tint-a` | Theme-specific | Adjust tint and opacity together |
| `--lg-shadow` / `--lg-shadow-sm` | See asset | Large versus floating depth |
| `--sheen-a` | 0.40 light / 0.16 dark | Diagonal sheen strength |
| `--spot-max` | 0.25 light / 0.14 dark | Cursor spotlight peak |
| `--accent` / `--accent-ink` | Theme-specific | CTA and focus colors |

The SVG displacement scales `38 / 45 / 52` create the RGB split. They are
material parameters, not design tokens; leave them unchanged.

## Layer model

| Layer | Location | Function |
|---|---|---|
| Tint and frost | `.lg::before` | Translucent fill plus blur, saturation, brightness |
| Refraction | `html.refract .lg::before` | SVG displacement and chromatic split in Chromium |
| Specular response | `.lg::after` | Inset rim, diagonal sheen, cursor spotlight |

Keep the pseudo-element order and negative stacking unchanged. The specular
insets must live on `::after`; placing them on `.lg` hides them beneath frost.

## Browser and accessibility ladder

Compatibility notes were verified on 2026-07-31. Browser behavior is
time-sensitive: recheck upstream status before presenting this table as current.

| Capability | Chromium | Safari / WebKit | Firefox |
|---|---|---|---|
| Frost baseline | Yes | Yes, with `-webkit-` declaration | Yes |
| SVG filter in `backdrop-filter` | Enhanced path | Fallback; WebKit bug 245510 | Fallback |
| `corner-shape: squircle` | Chrome/Edge 139+ | Not enabled | Not enabled |
| `prefers-reduced-transparency` | Limited support | Limited support | Limited support |

Fallback order: refraction → frost → solid fill. The solid rung is activated by
reduced transparency, increased contrast, forced colors, and print rules already
present in `glass.css`.

WebKit tracking: bug 245510 remains open and repair PR 68614 remains unmerged at
the verification date. Do not gate refraction with `@supports`; Safari can parse
the syntax without rendering the effect. The canonical snippet pairs
`CSS.supports` with a Chromium-only runtime signal.

## Motion, focus, and contrast

- Keep `lg-materialize` on the pane itself. Its `backwards` fill mode removes
  `filter` after the animation so frost remains functional.
- Never leave `filter`, `transform`, `opacity < 1`, or `will-change` on a pane or
  an ancestor after entrance; each can create a new backdrop root.
- Under `prefers-reduced-motion`, movement is removed while short color feedback
  remains.
- Every interactive control needs a visible `:focus-visible` state and an
  accessible name. A symbol-only button always needs `aria-label`.
- Text on glass uses `--ink` or `--ink-dim`; do not substitute low-opacity gray.
- Use sticky chrome instead of fixed glass on iOS to avoid repaint jank.

## Debug in this order

1. **Frost disappears after entrance:** inspect computed `filter`, `transform`,
   `opacity`, and ancestors. Restore the canonical animation.
2. **Crescent gaps in Chromium corners:** apply `corner-shape` to `.lg`,
   `.lg::before`, and `.lg::after` together, as the asset does.
3. **Thin gap around the fill:** keep inner radius at
   `calc(var(--lg-radius) - 1px)`.
4. **No frost in Safari:** preserve both prefixed and unprefixed declarations;
   do not put variables in the universal filter value list.
5. **The `refract` class is present but the effect is absent:** confirm the
   canonical runtime gate and verify Chromium rather than trusting syntax
   support alone.
6. **Glass looks muddy or invisible:** add meaningful content behind it before
   raising tint or blur.
7. **Scroll is janky:** reduce pane count, remove fixed glass, and inspect ancestor
   compositing layers.

## Delivery checklist

- [ ] Canonical files are present verbatim; hashes still match.
- [ ] No glass-on-glass and no more than five `.lg` panes per viewport.
- [ ] Chromium adds `html.refract`; Safari/Firefox retain the frost-only path.
- [ ] After entrances finish, `.lg::before` retains a non-`none`
      `backdrop-filter` except in an intentional solid fallback.
- [ ] Light and dark themes preserve readable contrast.
- [ ] Keyboard, focus, 200% zoom, reduced motion, reduced transparency,
      increased contrast, forced colors, and print all remain usable.
- [ ] All controls have accessible names; axe has no serious or critical issues.
- [ ] Console has no errors, scroll remains smooth, and remote dependencies are
      absent when the deliverable must work offline.
