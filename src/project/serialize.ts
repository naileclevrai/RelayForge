import { PROJECT_FORMAT, PROJECT_FORMAT_VERSION, type RelayForgeProject } from './types.ts';
import { migrateProject } from './migrate.ts';

export function serializeProject(project: RelayForgeProject): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function parseProject(raw: string): RelayForgeProject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Project file is not valid JSON.');
  }
  return migrateProject(parsed);
}

export function isRelayForgeProject(value: unknown): value is RelayForgeProject {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.format === PROJECT_FORMAT && typeof record.formatVersion === 'number';
}

export function assertCurrentFormat(project: RelayForgeProject): void {
  if (project.formatVersion !== PROJECT_FORMAT_VERSION) {
    throw new Error(
      `Unsupported project formatVersion ${project.formatVersion}; expected ${PROJECT_FORMAT_VERSION}.`,
    );
  }
}
