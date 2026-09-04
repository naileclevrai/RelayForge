import type { RelayForgeProject } from '@project';
import type { ExportResult, Exporter } from './types.ts';

export const pl7Exporter: Exporter = {
  id: 'pl7-source',
  label: 'PL7 source',
  exportProject(project: RelayForgeProject): ExportResult {
    void project;
    return {
      ok: false,
      reason: 'not-implemented',
      evidence: 'docs/pl7-evidence.md',
      message:
        'PL7 export is not implemented. No construct is generated until a V4.5 SP5 fixture is catalogued, hashed, and covered by a round-trip test.',
    };
  },
};
