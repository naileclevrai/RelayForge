import { createEmptyRung } from './factory.ts';
import { clearCell, isInsideRung, upsertCell } from './grid.ts';
import type { LadderBody, LadderCell, LadderRung } from './types.ts';

function replaceRung(
  body: LadderBody,
  rungId: string,
  update: (rung: LadderRung) => LadderRung,
): LadderBody {
  return {
    rungs: body.rungs.map((rung) => (rung.id === rungId ? update(rung) : rung)),
  };
}

export function addRung(body: LadderBody, afterIndex?: number): LadderBody {
  const rung = createEmptyRung();
  if (afterIndex === undefined || afterIndex < 0 || afterIndex >= body.rungs.length) {
    return { rungs: [...body.rungs, rung] };
  }
  const rungs = [...body.rungs];
  rungs.splice(afterIndex + 1, 0, rung);
  return { rungs };
}

export function removeRung(body: LadderBody, rungId: string): LadderBody {
  const rungs = body.rungs.filter((rung) => rung.id !== rungId);
  return { rungs: rungs.length > 0 ? rungs : [createEmptyRung()] };
}

export function setRungComment(body: LadderBody, rungId: string, comment: string): LadderBody {
  return replaceRung(body, rungId, (rung) => ({ ...rung, comment }));
}

export function addBranchRow(body: LadderBody, rungId: string): LadderBody {
  return replaceRung(body, rungId, (rung) => ({ ...rung, rows: rung.rows + 1 }));
}

export function removeBranchRow(body: LadderBody, rungId: string): LadderBody {
  return replaceRung(body, rungId, (rung) => {
    if (rung.rows <= 1) {
      return rung;
    }
    const rows = rung.rows - 1;
    return {
      ...rung,
      rows,
      cells: rung.cells.filter((cell) => cell.row < rows),
    };
  });
}

export function setLadderCell(body: LadderBody, rungId: string, cell: LadderCell): LadderBody {
  return replaceRung(body, rungId, (rung) => {
    if (!isInsideRung(rung, cell.col, cell.row)) {
      return rung;
    }
    return upsertCell(rung, cell);
  });
}

export function clearLadderCell(
  body: LadderBody,
  rungId: string,
  col: number,
  row: number,
): LadderBody {
  return replaceRung(body, rungId, (rung) => clearCell(rung, col, row));
}

export function moveRung(body: LadderBody, rungId: string, direction: -1 | 1): LadderBody {
  const index = body.rungs.findIndex((rung) => rung.id === rungId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= body.rungs.length) {
    return body;
  }
  const rungs = [...body.rungs];
  const [removed] = rungs.splice(index, 1);
  if (!removed) {
    return body;
  }
  rungs.splice(target, 0, removed);
  return { rungs };
}
