import { serializeProject, type RelayForgeProject } from '@project';
import type { ExportResult, Exporter } from './types.ts';

function safeFilename(name: string): string {
  const cleaned = name.replace(/[<>:"/\\|?*]+/g, '_').trim() || 'project';
  return `${cleaned}.rfp.json`;
}

export const relayForgeExporter: Exporter = {
  id: 'relayforge-json',
  label: 'RelayForge project',
  exportProject(project: RelayForgeProject): ExportResult {
    return {
      ok: true,
      files: [
        {
          name: safeFilename(project.meta.name),
          contents: serializeProject(project),
          mimeType: 'application/json',
        },
      ],
    };
  },
};
