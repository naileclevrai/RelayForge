import { setLadderCell } from '@ladder';
import { tsx37Target } from '@targets';
import { describe, expect, it } from 'vitest';
import { createProject } from './factory.ts';
import { validateProject } from './validate.ts';

describe('validateProject', () => {
  it('flags a missing coil operand on a TSX37 project', () => {
    const project = createProject({ name: 'Check', targetFamily: 'schneider.tsx37' });
    const section = project.sections[0];
    if (!section || section.kind !== 'ladder') {
      throw new Error('expected ladder section');
    }
    const body = setLadderCell(section.body, section.body.rungs[0]?.id ?? '', {
      col: 0,
      row: 0,
      kind: 'normallyOpenContact',
      operand: '%I0.1',
    });
    const next = {
      ...project,
      sections: [{ ...section, body }],
    };
    const diagnostics = validateProject(next, tsx37Target);
    expect(diagnostics.some((item) => item.code === 'LADDER_NO_OUTPUT')).toBe(true);
  });

  it('accepts a valid contact and coil pair', () => {
    const project = createProject({ name: 'Ok', targetFamily: 'schneider.tsx37' });
    const section = project.sections[0];
    if (!section || section.kind !== 'ladder') {
      throw new Error('expected ladder section');
    }
    const rungId = section.body.rungs[0]?.id ?? '';
    let body = setLadderCell(section.body, rungId, {
      col: 0,
      row: 0,
      kind: 'normallyOpenContact',
      operand: '%I0.1',
    });
    body = setLadderCell(body, rungId, {
      col: 11,
      row: 0,
      kind: 'coil',
      operand: '%Q0.1',
    });
    const diagnostics = validateProject(
      { ...project, sections: [{ ...section, body }] },
      tsx37Target,
    );
    expect(diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
  });
});
