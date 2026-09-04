import { diagnostic, type Diagnostic } from '@core';
import type { AddressRole, PlcTarget } from '@targets';
import { getCell } from './grid.ts';
import {
  BOOLEAN_ELEMENT_KINDS,
  COIL_KINDS,
  CONTACT_KINDS,
  type LadderBody,
  type LadderCell,
  type LadderCellKind,
  type LadderRung,
} from './types.ts';

export interface LadderSymbolRef {
  name: string;
  address: string;
}

export interface LadderSectionRef {
  id: string;
  name: string;
  body: LadderBody;
}

function operandRole(kind: LadderCellKind): AddressRole | undefined {
  if (CONTACT_KINDS.includes(kind)) {
    return 'booleanRead';
  }
  if (COIL_KINDS.includes(kind)) {
    return 'booleanWrite';
  }
  if (kind === 'functionBlock') {
    return undefined;
  }
  if (kind === 'compare' || kind === 'operate') {
    return 'word';
  }
  return undefined;
}

function validateOperand(
  symbols: LadderSymbolRef[],
  target: PlcTarget,
  section: LadderSectionRef,
  rung: LadderRung,
  cell: LadderCell,
  operand: string | undefined,
  role: AddressRole,
  field: string,
): Diagnostic[] {
  const location = {
    sectionId: section.id,
    rungId: rung.id,
    cell: { col: cell.col, row: cell.row },
    path: `sections/${section.id}/rungs/${rung.id}`,
  };
  const value = operand?.trim() ?? '';
  if (!value) {
    return [
      diagnostic('error', 'LADDER_OPERAND_MISSING', `Missing ${field} on ${cell.kind}.`, location),
    ];
  }
  const symbol = symbols.find(
    (item) =>
      item.name.toLowerCase() === value.toLowerCase() ||
      item.address.toLowerCase() === value.toLowerCase(),
  );
  const raw = symbol?.address || value;
  const parsed = target.parseAddress(raw);
  if (!parsed.ok) {
    return [diagnostic('error', 'LADDER_ADDRESS_INVALID', parsed.error, location)];
  }
  if (!target.roleFits(parsed.address, role)) {
    return [
      diagnostic(
        'error',
        'LADDER_ADDRESS_ROLE',
        `${parsed.address.normalized} cannot be used as ${role}.`,
        location,
      ),
    ];
  }
  return [];
}

export function validateLadderSection(
  symbols: LadderSymbolRef[],
  section: LadderSectionRef,
  target: PlcTarget,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (section.body.rungs.length === 0) {
    diagnostics.push(
      diagnostic(
        'warning',
        'LADDER_EMPTY_SECTION',
        `Ladder section "${section.name}" has no rungs.`,
        {
          sectionId: section.id,
        },
      ),
    );
  }
  for (const rung of section.body.rungs) {
    const hasElement = rung.cells.some(
      (cell) => cell.kind !== 'empty' && cell.kind !== 'horizontalLink',
    );
    if (!hasElement) {
      diagnostics.push(
        diagnostic('warning', 'LADDER_EMPTY_RUNG', 'Rung has no contacts or coils.', {
          sectionId: section.id,
          rungId: rung.id,
        }),
      );
    }
    const hasCoil = rung.cells.some(
      (cell) => COIL_KINDS.includes(cell.kind) || cell.kind === 'operate',
    );
    if (hasElement && !hasCoil) {
      diagnostics.push(
        diagnostic('warning', 'LADDER_NO_OUTPUT', 'Rung has no coil or operate element.', {
          sectionId: section.id,
          rungId: rung.id,
        }),
      );
    }
    for (const cell of rung.cells) {
      if (
        !BOOLEAN_ELEMENT_KINDS.includes(cell.kind) &&
        cell.kind !== 'functionBlock' &&
        cell.kind !== 'compare' &&
        cell.kind !== 'operate'
      ) {
        continue;
      }
      if (BOOLEAN_ELEMENT_KINDS.includes(cell.kind)) {
        const role = operandRole(cell.kind);
        if (role) {
          diagnostics.push(
            ...validateOperand(symbols, target, section, rung, cell, cell.operand, role, 'operand'),
          );
        }
      }
      if (cell.kind === 'functionBlock') {
        const role: AddressRole = cell.blockKind === 'counter' ? 'counter' : 'timer';
        diagnostics.push(
          ...validateOperand(
            symbols,
            target,
            section,
            rung,
            cell,
            cell.operand,
            role,
            'block operand',
          ),
        );
      }
      if (cell.kind === 'compare') {
        diagnostics.push(
          ...validateOperand(
            symbols,
            target,
            section,
            rung,
            cell,
            cell.operand,
            'word',
            'left operand',
          ),
        );
        if (cell.secondaryOperand && Number.isNaN(Number(cell.secondaryOperand))) {
          diagnostics.push(
            ...validateOperand(
              symbols,
              target,
              section,
              rung,
              cell,
              cell.secondaryOperand,
              'word',
              'right operand',
            ),
          );
        }
      }
      if (cell.kind === 'operate') {
        diagnostics.push(
          ...validateOperand(
            symbols,
            target,
            section,
            rung,
            cell,
            cell.resultOperand ?? cell.operand,
            'word',
            'result',
          ),
        );
      }
    }
    for (let row = 0; row < rung.rows; row += 1) {
      for (let col = 0; col < rung.columns; col += 1) {
        const cell = getCell(rung, col, row);
        if (cell?.kind === 'verticalLink' && row >= rung.rows - 1) {
          diagnostics.push(
            diagnostic(
              'error',
              'LADDER_ORPHAN_BRANCH',
              'Vertical link must connect to a lower row.',
              {
                sectionId: section.id,
                rungId: rung.id,
                cell: { col, row },
              },
            ),
          );
        }
      }
    }
  }
  return diagnostics;
}
