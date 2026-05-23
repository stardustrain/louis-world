# AGENTS.md

Source-level design guidance for the game app.

- Keep Phaser game logic independent from framework-specific UI code.
- Do not scatter DOM access inside scenes or gameplay objects.
- Keep game bootstrap, Phaser config, scenes, systems, objects, and assets in clear boundaries.
- Prefer explicit events or small adapter functions for communication that may later cross into React.
- Do not introduce React, routing, or app-shell state here unless the project explicitly chooses that integration.
- When adding gameplay state, consider whether it is internal-only or may need to be observed by an external UI later.
