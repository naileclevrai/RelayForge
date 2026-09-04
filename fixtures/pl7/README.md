# PL7 fixtures

This directory holds **immutable** exports produced by PL7 itself.

Rules:

1. Export from PL7 (target: V4.5 SP5) and copy the raw file here.
2. Never edit a committed fixture. A new export is a new file.
3. Add a row to `docs/pl7-evidence.md` with:
   - exact PL7 version
   - CPU / project type
   - language
   - action performed in PL7
   - SHA-256 of the file bytes
4. Write round-trip / regression tests.
5. Only then implement the matching exporter or parser construct.

Compute a hash on Windows PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 .\fixtures\pl7\your-export.ld
```
