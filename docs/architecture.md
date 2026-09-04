# RelayForge architecture

RelayForge is a local-first SPA. PLC rules live outside React so they can be tested and reused:

```ts
validateProject(project, tsx37Target);
exportProject(project, exporter);
```

## Layers

| Folder            | Responsibility                                                     |
| ----------------- | ------------------------------------------------------------------ |
| `src/core`        | IDs, diagnostics, snapshot history                                 |
| `src/project`     | `.rfp.json` schema, factory, serialize, migrate, `validateProject` |
| `src/targets`     | PLC adapters. `tsx37` is the first, not the model                  |
| `src/ladder`      | Grid model, editor commands, validation                            |
| `src/grafcet`     | Chart model, commands, validation                                  |
| `src/exporters`   | Native JSON export; PL7 only after evidence + tests                |
| `src/persistence` | Autosave and file I/O                                              |
| `src/ui`          | IDE chrome. Calls commands; does not own address or language rules |

## Data flow

```
UI action → workspace store → core command → project snapshot
                 ↓
          validateProject(project, target)
                 ↓
          diagnostics panel + inline editor marks
```

The store holds the current `RelayForgeProject` and a history stack of snapshots. Editors receive a section body and emit commands that return a new body.

## Target adapters

A `PlcTarget` exposes `parseAddress` and `roleFits`. Project validation asks the active target; it never special-cases TSX37 in `project/` or `ui/`.

## PL7

See [pl7-evidence.md](pl7-evidence.md). The exporter is the only module allowed to know PL7 syntax, and only for constructs that are catalogued, fixture-backed, and tested.
