# Contributing to billy-layout

Thanks for taking the time to contribute!

## Getting started

```bash
npm install
npm start          # showcase site on http://localhost:4201
```

The showcase site compiles the library **from sources** (the root `tsconfig.json`
maps `billy-layout` to `projects/billy-layout/src/public-api.ts`), so there is no
need to build the library while developing.

## Project layout

| Folder | Content |
|---|---|
| `projects/billy-layout/` | the library (source in `src/lib/`, markdown docs in `docs/`) |
| `src/` | the showcase site: pages, live demos, markdown viewer |

## Definition of done for a component change

A change to a library component is **not done** until:

1. Its markdown documentation under `projects/billy-layout/docs/` is up to date
   (new file in the relevant category folder for a new component; synced
   inputs/outputs/behavior/styling API for an existing one).
2. The matching live demo in `src/app/demos` is updated whenever observable
   behavior or the public API changes.
3. The design system rules in
   [`projects/billy-layout/docs/ux-guidelines.md`](projects/billy-layout/docs/ux-guidelines.md)
   are respected.
4. Unit tests pass: `npm run test:lib`.

## Code style

- Standalone components, signals for state, `input()`/`output()` functions,
  native control flow (`@if`/`@for`/`@switch`).
- No `any`; strict TypeScript.
- Accessibility matters: changes must not introduce AXE violations.

## Commits & pull requests

- Keep PRs focused on a single change.
- Explain the *why* in the PR description; screenshots for visual changes are
  appreciated.
- CI (build + tests) must be green.
