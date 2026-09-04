import { createHistory, pushHistory, redoHistory, undoHistory } from '@core';
import { describe, expect, it } from 'vitest';
import { createProject } from './factory.ts';
import { migrateProject } from './migrate.ts';
import { parseProject, serializeProject } from './serialize.ts';
import { PROJECT_FORMAT, PROJECT_FORMAT_VERSION, type RelayForgeProject } from './types.ts';

describe('RelayForge project model', () => {
  it('creates a versioned TSX37 project with a ladder section', () => {
    const project = createProject({
      name: 'Mixer',
      targetFamily: 'schneider.tsx37',
      cpu: 'TSX3722',
    });
    expect(project.format).toBe(PROJECT_FORMAT);
    expect(project.formatVersion).toBe(PROJECT_FORMAT_VERSION);
    expect(project.target.family).toBe('schneider.tsx37');
    expect(project.sections).toHaveLength(1);
    expect(project.sections[0]?.kind).toBe('ladder');
    expect(project.io).toBeNull();
  });

  it('round-trips through JSON without losing structure', () => {
    const project = createProject({ name: 'Roundtrip', targetFamily: 'schneider.tsx37' });
    const restored = parseProject(serializeProject(project));
    expect(restored.meta.name).toBe('Roundtrip');
    expect(restored.sections[0]?.id).toBe(project.sections[0]?.id);
  });

  it('migrates a v1 document and rejects unknown formats', () => {
    const migrated = migrateProject({
      format: PROJECT_FORMAT,
      formatVersion: 1,
      meta: { name: 'Legacy' },
      target: { family: 'schneider.tsx37' },
    });
    expect(migrated.sections.length).toBeGreaterThan(0);
    expect(migrated.symbols).toEqual([]);
    expect(() => migrateProject({ format: 'other', formatVersion: 1 })).toThrow(
      /Unknown project format/,
    );
    expect(() =>
      migrateProject({ format: PROJECT_FORMAT, formatVersion: 99, target: { family: 'x' } }),
    ).toThrow(/newer than this RelayForge/);
  });

  it('supports undo and redo through history snapshots', () => {
    const first = createProject({ name: 'A', targetFamily: 'schneider.tsx37' });
    const second = { ...first, meta: { ...first.meta, name: 'B' } };
    const pushed = pushHistory(createHistory<RelayForgeProject>(), first, second);
    const undone = undoHistory(pushed.stack, pushed.current);
    expect(undone?.current.meta.name).toBe('A');
    const redone = undone ? redoHistory(undone.stack, undone.current) : null;
    expect(redone?.current.meta.name).toBe('B');
  });
});
