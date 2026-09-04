# RelayForge

A modern, local-first PLC programming IDE for **Ladder Logic** and **GRAFCET**. The first hardware target is Schneider / Telemecanique **TSX37** (TSX Micro), with PL7 Micro as the validation reference.

RelayForge is an alternative to the PL7 Micro editing experience — not a clone, and not a replacement of the full Schneider toolchain. The intended V1 path is:

**RelayForge → author the program → export for PL7 → import in PL7 Micro → compile / transfer to a TSX37**

Direct PLC communication (Uni-Telway / serial) is out of scope for now.

## Current status

Usable today:

- Create a TSX37 project with Ladder and GRAFCET sections
- Edit Ladder rungs (contacts, coils, branches, timers, counters, compares, word operations)
- Edit GRAFCET charts (steps, transitions, actions, AND/OR links)
- Validate against the TSX37 address model
- Undo/redo, autosave, import/export of the native `.rfp.json` project format

Intentionally **not implemented**:

- PL7 `.LD` / `.GR7` / `.SCY` generation — see [docs/pl7-evidence.md](docs/pl7-evidence.md)
- Online monitoring, simulation, Uni-Telway
- Full I/O hardware configuration

## PL7 compatibility policy

Three rules, non-negotiable:

1. **Evidence-first** — no PL7 syntax is generated without a traceable entry in `docs/pl7-evidence.md`.
2. **Fixture-first** — real PL7 export → immutable fixture → regression test → implementation.
3. **Model independence** — the RelayForge project model describes PLC logic, never how PL7 writes it.

Drop real PL7 V4.5 SP5 exports in `fixtures/pl7/` (see the README there) before any exporter construct is written.

## Getting started

```bash
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

| Script             | Purpose                         |
| ------------------ | ------------------------------- |
| `npm run dev`      | Development server              |
| `npm run build`    | Typecheck + production bundle   |
| `npm run test`     | Unit tests (Vitest)             |
| `npm run lint`     | ESLint + Prettier check         |
| `npm run test:e2e` | Playwright vertical-slice tests |

## Architecture

The UI never owns PLC rules. Core packages are React-free:

```
src/core          IDs, diagnostics, undo history
src/project       Versioned .rfp.json model, migrations
src/targets       PLC adapters (tsx37 is the first)
src/ladder        Grid model, commands, validation
src/grafcet       Chart model, commands, validation
src/exporters     Native JSON + PL7 stub (NotImplemented)
src/persistence   Autosave + file I/O
src/ui            IDE chrome and editors
```

Stable contracts:

```ts
validateProject(project, target);
exportProject(project, exporter);
```

See [docs/architecture.md](docs/architecture.md) and [docs/project-format.md](docs/project-format.md).

## License

[MIT](LICENSE)
