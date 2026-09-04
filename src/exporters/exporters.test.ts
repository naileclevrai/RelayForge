import { createProject } from '@project';
import { describe, expect, it } from 'vitest';
import { exportProject } from './types.ts';
import { pl7Exporter } from './pl7.ts';
import { relayForgeExporter } from './relayforge.ts';

describe('exporters', () => {
  it('writes a RelayForge JSON document', () => {
    const project = createProject({ name: 'Line A', targetFamily: 'schneider.tsx37' });
    const result = exportProject(project, relayForgeExporter);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.files[0]?.name).toBe('Line A.rfp.json');
      expect(result.files[0]?.contents).toContain('"format": "relayforge-project"');
    }
  });

  it('refuses to invent PL7 syntax', () => {
    const project = createProject({ name: 'Line A', targetFamily: 'schneider.tsx37' });
    const result = exportProject(project, pl7Exporter);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('not-implemented');
      expect(result.message).toMatch(/fixture/i);
    }
  });
});
