# PL7 evidence catalogue

No PL7 syntax is generated without a row in this file. Status values:

- `documented-only` — official manual excerpt; does **not** authorize emission
- `fixture-ready` — immutable export stored under `fixtures/pl7/`
- `tested` — round-trip / regression tests exist
- `implemented` — exporter or parser emits or accepts that construct

## Schema

| Field        | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| `id`         | Stable identifier                                          |
| `kind`       | `official-doc` or `fixture`                                |
| `claim`      | Exactly what the evidence allows                           |
| `pl7Version` | Exact PL7 version or manual edition                        |
| `cpu`        | CPU / project type                                         |
| `language`   | `LD`, `GR7`, `SCY`, …                                      |
| `action`     | What was done in PL7 or which page was cited               |
| `sha256`     | SHA-256 of the fixture bytes, or `n/a` for a page citation |
| `path`       | Fixture path or manual reference                           |
| `status`     | See above                                                  |

## Entries

### doc-operate-modes-source-envelope

- kind: `official-doc`
- claim: PL7 source files are ISO 8859-1 ASCII with `[HEADER]`, `[APPLICATION]`, `[SOURCE_UNIT]` or `[DATA_UNIT]`, and `[EOF]`. Extensions mentioned: `.LD`, `.GR7`, `.SCY`, `.FEF`.
- pl7Version: Operate Modes Manual 09/2000
- cpu: TSX Micro / TSX Premium (manual scope)
- language: LD / GR7 / IL / ST / SCY
- action: Cited from Schneider PL7 Operate Modes Manual, Import/Export chapter (~p. 344–350)
- sha256: n/a
- path: manual citation only
- status: `documented-only`

### doc-operate-modes-ld-rung-example

- kind: `official-doc`
- claim: One documented LD rung example uses tokens such as `P_CONTACT`, `BLOCK`, `H_LINK`, `COIL`, `OPEN_CONTACT`, `OPERATE` inside `RUNG` / `END_RUNG`.
- pl7Version: Operate Modes Manual 09/2000
- cpu: not specified in the excerpt
- language: LD
- action: Cited example `MACHINE_DOSAGE` / `MAST_MAIN`
- sha256: n/a
- path: manual citation only
- status: `documented-only`

This entry does **not** authorize generating those tokens, nor inferring undocumented siblings (`CLOSED_CONTACT`, `SET_COIL`, …).

### doc-operate-modes-gr7-example

- kind: `official-doc`
- claim: One documented GR7 page example uses `INITIAL_STEP`, `TRANSITION`, `ACTION`, `T_S_OR_LINK`, and coordinates `AT (C n,L n)`.
- pl7Version: Operate Modes Manual 09/2000
- cpu: not specified in the excerpt
- language: GR7
- action: Cited example `MOP7` / `Sequential`
- sha256: n/a
- path: manual citation only
- status: `documented-only`

## Fixtures

None yet. Place a real PL7 V4.5 SP5 export in `fixtures/pl7/`, record `sha256`, then add tests **before** implementing the construct.
