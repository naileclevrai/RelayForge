import { diagnostic, type Diagnostic } from '@core';
import { validateGrafcetSection } from '@grafcet';
import { validateLadderSection } from '@ladder';
import type { PlcTarget } from '@targets';
import type { RelayForgeProject } from './types.ts';

export function validateProject(project: RelayForgeProject, target: PlcTarget): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (!project.meta.name.trim()) {
    diagnostics.push(diagnostic('error', 'PROJECT_NAME', 'Project name is required.'));
  }
  if (project.target.family !== target.family) {
    diagnostics.push(
      diagnostic(
        'warning',
        'PROJECT_TARGET_MISMATCH',
        `Project target ${project.target.family} does not match validator ${target.family}.`,
      ),
    );
  }
  const names = new Set<string>();
  const addresses = new Set<string>();
  for (const symbol of project.symbols) {
    const location = { symbolId: symbol.id, path: `symbols/${symbol.id}` };
    if (!symbol.name.trim()) {
      diagnostics.push(diagnostic('error', 'SYMBOL_NAME', 'Symbol name is required.', location));
    } else if (names.has(symbol.name.toLowerCase())) {
      diagnostics.push(
        diagnostic('error', 'SYMBOL_NAME_DUP', `Duplicate symbol name "${symbol.name}".`, location),
      );
    } else {
      names.add(symbol.name.toLowerCase());
    }
    if (symbol.address.trim()) {
      const parsed = target.parseAddress(symbol.address);
      if (!parsed.ok) {
        diagnostics.push(diagnostic('error', 'SYMBOL_ADDRESS', parsed.error, location));
      } else if (addresses.has(parsed.address.normalized)) {
        diagnostics.push(
          diagnostic(
            'warning',
            'SYMBOL_ADDRESS_DUP',
            `Address ${parsed.address.normalized} is used more than once.`,
            location,
          ),
        );
      } else {
        addresses.add(parsed.address.normalized);
      }
    }
  }
  const sectionNames = new Set<string>();
  for (const section of project.sections) {
    if (!section.name.trim()) {
      diagnostics.push(
        diagnostic('error', 'SECTION_NAME', 'Section name is required.', { sectionId: section.id }),
      );
    } else if (sectionNames.has(section.name.toLowerCase())) {
      diagnostics.push(
        diagnostic('error', 'SECTION_NAME_DUP', `Duplicate section name "${section.name}".`, {
          sectionId: section.id,
        }),
      );
    } else {
      sectionNames.add(section.name.toLowerCase());
    }
    if (section.kind === 'ladder') {
      diagnostics.push(...validateLadderSection(project.symbols, section, target));
    } else {
      diagnostics.push(...validateGrafcetSection(project.symbols, section, target));
    }
  }
  return diagnostics;
}
