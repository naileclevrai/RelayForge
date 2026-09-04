import type { RelayForgeProject } from '@project';

export interface ExportFile {
  name: string;
  contents: string;
  mimeType: string;
}

export type ExportResult =
  | { ok: true; files: ExportFile[] }
  | { ok: false; reason: 'not-implemented'; message: string; evidence?: string }
  | { ok: false; reason: 'error'; message: string };

export interface Exporter {
  id: string;
  label: string;
  exportProject(project: RelayForgeProject): ExportResult;
}

export function exportProject(project: RelayForgeProject, exporter: Exporter): ExportResult {
  return exporter.exportProject(project);
}
