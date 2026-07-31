# Contributing

Thank you for helping keep Liquid Glass Web faithful, understandable, and
accessible. The repository is intentionally small: one self-contained skill,
four examples, and private test/publishing tools.

## Before changing code

- Open an issue for changes to the canonical material, public class names,
  fallback strategy, or browser gate.
- For page-specific styling, prefer token overrides or example-only CSS.
- Do not add a Plugin manifest, runtime dependency, CDN, web font, npm publish
  configuration, or build requirement to the installed skill.
- Keep every example offline-capable and at five `.lg` panes or fewer.

## Canonical asset policy

The following files are release-pinned:

- `skills/liquid-glass-web/assets/glass.css`
- `skills/liquid-glass-web/assets/refraction-snippet.html`

Changing either file requires all of the following in one pull request:

1. Explain the visual or compatibility problem and why a token override is not
   sufficient.
2. Update the pinned SHA-256 values in the build script, project checks,
   `SKILL.md`, and both READMEs.
3. Regenerate all four examples with `npm run build`.
4. Provide before/after evidence for Chromium and the Safari/WebKit and Firefox
   fallback paths.
5. Re-run automated accessibility, motion, theme, console, and frost-retention
   checks.

Do not edit generated example files directly. Edit `templates/examples/` and
run the generator.

## Local setup

Node.js 20 or newer is required.

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm run check
npm test
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/liquid-glass-web
```

The Agent Skills reference validator also runs in CI. `package.json` must remain
`private: true`; repository tooling is not a product API.

## Documentation changes

Keep `README.md` and `README.zh-CN.md` aligned by section and link. English is
the technical source of truth. Recheck time-sensitive browser statements and
record the verification date.

A fresh reader should be able to answer four questions without repository
context:

1. How is the skill installed and invoked?
2. Which values may be customized without changing the material?
3. Why does Safari or Firefox show frost instead of refraction?
4. What should be inspected when frost disappears after an entrance?

## Pull request checklist

- [ ] Changes are limited to the stated problem.
- [ ] Generated files are current and canonical hashes pass.
- [ ] Examples have no remote resources, duplicate IDs, or more than five panes.
- [ ] Chromium, Firefox, and WebKit Playwright tests pass with no console errors.
- [ ] axe reports no serious or critical violations.
- [ ] Keyboard, 200% zoom, reduced motion, print, and both themes remain usable.
- [ ] User-facing documentation is updated in both languages when necessary.

By contributing, you agree that your contribution is licensed under the MIT
License in this repository.
