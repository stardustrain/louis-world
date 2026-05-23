# Phaser Vite Workspace Initial Setup Design

Date: 2026-05-23

## Purpose

Set up a new web game project using Phaser, Vite, Vitest, oxc, pnpm, and fnm.
The project should start as a monorepo because future packages or apps are likely,
but the initial code should stay small and focused on the game app.

The game concept is Stardew Valley-inspired in the broad sense of a top-down
2D life/farming-style game. This design does not attempt to recreate Stardew
Valley or implement gameplay systems yet. It only prepares a clean foundation
for Phaser gameplay work.

## Assumptions

- The user has `fnm` and `pnpm` installed.
- The current local interactive shell resolves Node `v24.16.0`.
- Future deployment target is Vercel, but the project will not be linked to
  Vercel during the initial setup.
- The initial focus is learning and building game logic in Phaser.
- React may be added later for DOM-based UI, but React is not part of the
  initial scaffold.

## Decisions

- Use Node `24.x`, aligned with the current local environment and Vercel's
  current default major version.
- Use pnpm workspaces with `apps/*` and `packages/*`.
- Create one app package initially: `apps/game`.
- Keep `packages/` available but empty until there is a real shared package.
- Use Vite for local development and production builds.
- Use Vitest for unit tests.
- Use `oxlint` and `oxfmt` for linting and formatting.
- Configure them with root `.oxlintrc.json` and `.oxfmtrc.json` files.
- Use `tsc --noEmit` for TypeScript type checking.
- Use Phaser without React initially.
- Keep Phaser source under `apps/game/src/game` so it can later be wrapped by
  a React bridge with minimal movement.
- Use Arcade Physics with zero gravity for top-down gameplay.
- Prepare Tiled-friendly asset folders, but do not include a Tiled sample map yet.
- Add `apps/game/src/AGENTS.md` with source-level design guidance.

## Non-Goals

- No React, routing, or React-Phaser event bridge in the initial scaffold.
- No actual farming, inventory, NPC, dialogue, save, or map system yet.
- No Phaser Editor integration.
- No Vercel project linking or deployment configuration during setup.
- No premature shared `game-core` package.
- No generated sample Tiled JSON map.

## Architecture

The repository root is a pnpm workspace. It owns workspace-level scripts,
Node/package-manager metadata, and shared tooling configuration.

`apps/game` is the only deployable app at setup time. Vercel can later use
`apps/game` as the project Root Directory. The app builds to Vite's default
`dist` directory.

The app starts without React. `apps/game/src/main.ts` is the browser entry point.
It prepares or locates the DOM container and calls a small Phaser bootstrap
function. Phaser configuration and game construction live in `src/game` so
future React integration can replace only the browser shell layer.

Framework-specific UI code must not be mixed into scenes, objects, or gameplay
systems. Future communication with external UI should use explicit events or
small adapter functions rather than scattered DOM access.

## Directory Structure

```text
.
├── AGENTS.md
├── .node-version
├── package.json
├── pnpm-workspace.yaml
├── .oxlintrc.json
├── .oxfmtrc.json
├── apps/
│   └── game/
│       ├── package.json
│       ├── index.html
│       ├── vite.config.ts
│       ├── vitest.config.ts
│       ├── tsconfig.json
│       ├── public/
│       │   └── assets/
│       │       ├── images/
│       │       ├── audio/
│       │       ├── tilemaps/
│       │       └── tilesets/
│       └── src/
│           ├── AGENTS.md
│           ├── main.ts
│           ├── style.css
│           ├── game/
│           │   ├── config.ts
│           │   ├── createGame.ts
│           │   ├── scenes/
│           │   │   ├── BootScene.ts
│           │   │   ├── PreloaderScene.ts
│           │   │   └── GameScene.ts
│           │   ├── objects/
│           │   ├── systems/
│           │   └── utils/
│           └── test/
│               └── setup.ts
└── packages/
```

`packages/` exists only to make the monorepo shape explicit. It should remain
empty until duplication or a second consumer justifies a shared package.

## Source AGENTS.md

Create `apps/game/src/AGENTS.md` with source-specific guidance:

```md
# AGENTS.md

Source-level design guidance for the game app.

- Keep Phaser game logic independent from framework-specific UI code.
- Do not scatter DOM access inside scenes or gameplay objects.
- Keep game bootstrap, Phaser config, scenes, systems, objects, and assets in
  clear boundaries.
- Prefer explicit events or small adapter functions for communication that may
  later cross into React.
- Do not introduce React, routing, or app-shell state here unless the project
  explicitly chooses that integration.
- When adding gameplay state, consider whether it is internal-only or may need
  to be observed by an external UI later.
```

## Phaser Runtime

Use three initial scenes:

```text
BootScene -> PreloaderScene -> GameScene
```

`BootScene` performs minimal startup work and moves to `PreloaderScene`.
`PreloaderScene` is the home for shared asset loading and progress display.
`GameScene` is the initial playable scene and the future home of top-down
movement, tile collision, interaction zones, and gameplay systems.

Use Phaser Arcade Physics:

```ts
physics: {
  default: "arcade",
  arcade: {
    gravity: { x: 0, y: 0 },
    debug: import.meta.env.DEV,
  },
}
```

This is the simplest fit for top-down movement, tile collision, object overlap,
and interaction-range checks. Matter Physics is out of scope until a specific
gameplay requirement needs complex rigid-body behavior.

Use a 16:9 logical game size of `1280x720` with `Phaser.Scale.FIT` and
`Phaser.Scale.CENTER_BOTH`. Do not set `pixelArt: true` until the art direction
is actually chosen.

## Assets And Tiled

Static game assets live under `apps/game/public/assets`. The initial scaffold
creates Tiled-friendly folders:

```text
public/assets/images/
public/assets/audio/
public/assets/tilemaps/
public/assets/tilesets/
```

No Tiled sample map is included in the initial scaffold. When map production
starts, Tiled JSON maps can be placed under `tilemaps/`, tileset images under
`tilesets/`, and loaded with Phaser's Tiled JSON loader.

Shared assets should be loaded by `PreloaderScene`. Scene-specific assets should
be loaded by the scene that owns them.

## Tooling

Root scripts should delegate app-specific work through pnpm filters:

```json
{
  "scripts": {
    "dev": "pnpm --filter @louis-world/game dev",
    "build": "pnpm --filter @louis-world/game build",
    "preview": "pnpm --filter @louis-world/game preview",
    "test": "pnpm --filter @louis-world/game test",
    "lint": "oxlint .",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "typecheck": "pnpm --filter @louis-world/game typecheck",
    "check": "pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

The game app scripts should be:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

Tests should start small. Initial coverage should verify stable configuration
and bootstrap behavior, such as clear failure when the game container is missing.
Deep canvas or browser gameplay testing is out of scope for the scaffold.

## Vercel Considerations

The repository should be compatible with Vercel monorepo deployment later:

- Vercel project Root Directory: `apps/game`
- Build output: `dist`
- Build command from the app root: `pnpm build`
- Alternative build command from the repository root:
  `pnpm --filter @louis-world/game build`
- Static assets copied from `apps/game/public/assets` to `dist/assets`
- Unique package name for the deployable app: `@louis-world/game`
- Root `pnpm-workspace.yaml` includes `apps/*` and `packages/*`
- Root `package.json` includes `packageManager` and `engines.node`

No `vercel.json` is required for the initial scaffold.

## Error Handling

Initial error handling should stay minimal:

- If the browser entry cannot find or create the game container, fail with a
  clear error.
- Do not add asset-loading fallback UI before real assets exist.
- Do not add Tiled map error handling before Tiled maps are introduced.
- Do not add React bridge fallback logic before React is introduced.

## Verification

The initial scaffold is complete when these commands succeed:

```text
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```

For local command execution in this environment, use an interactive zsh shell
when needed so `fnm` exposes Node and pnpm correctly:

```text
zsh -ic '<command>'
```

## References

- Phaser Vite TypeScript template:
  https://github.com/phaserjs/template-vite-ts
- Phaser React TypeScript template:
  https://github.com/phaserjs/template-react-ts
- Phaser Loader concept:
  https://docs.phaser.io/phaser/concepts/loader
- Phaser Scenes concept:
  https://docs.phaser.io/phaser/concepts/scenes
- Vercel monorepo documentation:
  https://vercel.com/docs/monorepos.md
- Vercel Node.js version documentation:
  https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
