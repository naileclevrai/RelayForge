import { tsx37Target } from '@targets';
import { describe, expect, it } from 'vitest';
import { addBranchRow, addRung, setLadderCell } from './commands.ts';
import { createEmptyLadderBody } from './factory.ts';
import { validateLadderSection } from './validate.ts';

describe('ladder workspace', () => {
  it('places contacts, coils, and a parallel branch', () => {
    let body = createEmptyLadderBody();
    const rungId = body.rungs[0]?.id ?? '';
    body = setLadderCell(body, rungId, {
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
    body = addBranchRow(body, rungId);
    body = setLadderCell(body, rungId, {
      col: 0,
      row: 0,
      kind: 'verticalLink',
    });
    body = setLadderCell(body, rungId, {
      col: 1,
      row: 1,
      kind: 'normallyClosedContact',
      operand: '%I0.2',
    });
    expect(body.rungs[0]?.rows).toBe(2);
    expect(body.rungs[0]?.cells).toHaveLength(3);
    const extra = addRung(body);
    expect(extra.rungs).toHaveLength(2);
  });

  it('reports missing operands and invalid TSX37 addresses', () => {
    let body = createEmptyLadderBody();
    const rungId = body.rungs[0]?.id ?? '';
    body = setLadderCell(body, rungId, {
      col: 0,
      row: 0,
      kind: 'normallyOpenContact',
      operand: '',
    });
    body = setLadderCell(body, rungId, { col: 11, row: 0, kind: 'coil', operand: '%I0.1' });
    const diagnostics = validateLadderSection([], { id: 's', name: 'Main', body }, tsx37Target);
    expect(diagnostics.some((item) => item.code === 'LADDER_OPERAND_MISSING')).toBe(true);
    expect(diagnostics.some((item) => item.code === 'LADDER_ADDRESS_ROLE')).toBe(true);
  });

  it('accepts SET/RESET, timers, compares, and word operations', () => {
    let body = createEmptyLadderBody();
    const rungId = body.rungs[0]?.id ?? '';
    body = setLadderCell(body, rungId, {
      col: 0,
      row: 0,
      kind: 'normallyOpenContact',
      operand: '%M0',
    });
    body = setLadderCell(body, rungId, { col: 4, row: 0, kind: 'setCoil', operand: '%M1' });
    body = setLadderCell(body, rungId, { col: 5, row: 0, kind: 'resetCoil', operand: '%M2' });
    body = setLadderCell(body, rungId, {
      col: 6,
      row: 0,
      kind: 'functionBlock',
      blockKind: 'timer',
      operand: '%TM0',
    });
    body = setLadderCell(body, rungId, {
      col: 7,
      row: 0,
      kind: 'compare',
      operand: '%MW0',
      secondaryOperand: '10',
      compareOp: 'ge',
    });
    body = setLadderCell(body, rungId, {
      col: 11,
      row: 0,
      kind: 'operate',
      operand: '%MW1',
      resultOperand: '%MW2',
      operateOp: 'add',
      secondaryOperand: '%MW3',
    });
    const errors = validateLadderSection([], { id: 's', name: 'Main', body }, tsx37Target).filter(
      (item) => item.severity === 'error',
    );
    expect(errors).toEqual([]);
  });
});
