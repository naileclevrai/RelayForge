# RelayForge project format

Native project files use the extension `.rfp.json`.

The UI never reads or writes PL7 source. This document describes the **RelayForge** model only: PLC logic, not an external vendor encoding.

## Envelope

```json
{
  "format": "relayforge-project",
  "formatVersion": 1,
  "meta": {
    "name": "Mixer",
    "createdAt": "2026-09-04T15:00:00.000Z",
    "updatedAt": "2026-09-04T15:00:00.000Z",
    "author": ""
  },
  "target": {
    "family": "schneider.tsx37",
    "cpu": "TSX3722"
  },
  "symbols": [],
  "sections": [],
  "io": null,
  "notes": ""
}
```

| Field           | Role                                                               |
| --------------- | ------------------------------------------------------------------ |
| `format`        | Always `relayforge-project`                                        |
| `formatVersion` | Integer. Migrations live in `src/project/migrate.ts`               |
| `target.family` | Adapter id. TSX37 is `schneider.tsx37`, not a hard-wired core type |
| `io`            | Reserved for hardware configuration. `null` in v1                  |

## Symbols

```json
{
  "id": "symbol_…",
  "name": "Start",
  "address": "%I0.1",
  "dataType": "bool",
  "comment": ""
}
```

`dataType` is one of: `bool`, `byte`, `word`, `dint`, `real`, `timer`, `counter`.

## Sections

A section is either `kind: "ladder"` or `kind: "grafcet"`.

### Ladder body

A rung is a **cell grid** of PLC elements (contacts, coils, links). Cell `kind` values are RelayForge concepts, not PL7 tokens:

`empty`, `normallyOpenContact`, `normallyClosedContact`, `coil`, `setCoil`, `resetCoil`, `horizontalLink`, `verticalLink`, `functionBlock`, `compare`, `operate`.

```json
{
  "rungs": [
    {
      "id": "rung_…",
      "comment": "Start motor",
      "columns": 12,
      "rows": 1,
      "cells": [
        { "col": 0, "row": 0, "kind": "normallyOpenContact", "operand": "%I0.1" },
        { "col": 11, "row": 0, "kind": "coil", "operand": "%Q0.1" }
      ]
    }
  ]
}
```

### GRAFCET body

Nodes (`step`, `initialStep`, `transition`) and edges (`sequence`, `orBranch`, `andBranch`). Actions use IEC qualifiers `N`, `S`, `R`, `P`, `C` and an operand that refers to a symbol or address.

## Compatibility

Older `formatVersion` values are migrated on load. A newer version than the running app is rejected. Adding fields later must stay backward compatible or bump `formatVersion` with a migration.
