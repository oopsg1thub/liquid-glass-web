# Contributing

Keep this repository static and self-contained: no runtime dependency, package
publication, CDN, web font, Plugin manifest, or build requirement.

- Prefer design-token overrides or example-only CSS over material changes.
- Keep each example offline-capable and at five `.lg` panes or fewer.
- Edit the four HTML examples directly; the repository has no generator.
- Keep `README.md` and `README.zh-CN.md` aligned.

Changes to `glass.css` or `refraction-snippet.html` must explain the compatibility
reason, update their hashes in `SKILL.md` and both READMEs, update every embedded
example, and include browser and accessibility evidence.

Validate the skill structure when Codex's local validator is available:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/liquid-glass-web
```

By contributing, you agree that your contribution is licensed under the MIT
License in this repository.
