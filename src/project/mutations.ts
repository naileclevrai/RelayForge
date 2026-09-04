import { createId } from '@core';
import type { GrafcetBody } from '@grafcet';
import type { LadderBody } from '@ladder';
import { touchProject } from './factory.ts';
import type { RelayForgeProject, Section, SymbolDefinition } from './types.ts';

export function updateSectionBody(
  project: RelayForgeProject,
  sectionId: string,
  body: LadderBody | GrafcetBody,
): RelayForgeProject {
  return touchProject({
    ...project,
    sections: project.sections.map((section) =>
      section.id === sectionId ? ({ ...section, body } as Section) : section,
    ),
  });
}

export function updateSection(
  project: RelayForgeProject,
  sectionId: string,
  patch: Partial<Pick<Section, 'name' | 'comment'>>,
): RelayForgeProject {
  return touchProject({
    ...project,
    sections: project.sections.map((section) =>
      section.id === sectionId ? { ...section, ...patch } : section,
    ),
  });
}

export function addSectionToProject(
  project: RelayForgeProject,
  section: Section,
): RelayForgeProject {
  return touchProject({
    ...project,
    sections: [...project.sections, section],
  });
}

export function removeSectionFromProject(
  project: RelayForgeProject,
  sectionId: string,
): RelayForgeProject {
  const sections = project.sections.filter((section) => section.id !== sectionId);
  if (sections.length === 0) {
    return project;
  }
  return touchProject({ ...project, sections });
}

export function upsertSymbol(
  project: RelayForgeProject,
  symbol: SymbolDefinition,
): RelayForgeProject {
  const exists = project.symbols.some((item) => item.id === symbol.id);
  return touchProject({
    ...project,
    symbols: exists
      ? project.symbols.map((item) => (item.id === symbol.id ? symbol : item))
      : [...project.symbols, symbol],
  });
}

export function createSymbol(partial?: Partial<SymbolDefinition>): SymbolDefinition {
  return {
    id: createId('symbol'),
    name: partial?.name ?? '',
    address: partial?.address ?? '',
    dataType: partial?.dataType ?? 'bool',
    comment: partial?.comment ?? '',
  };
}

export function removeSymbol(project: RelayForgeProject, symbolId: string): RelayForgeProject {
  return touchProject({
    ...project,
    symbols: project.symbols.filter((item) => item.id !== symbolId),
  });
}

export function renameProject(project: RelayForgeProject, name: string): RelayForgeProject {
  return touchProject({
    ...project,
    meta: { ...project.meta, name },
  });
}
