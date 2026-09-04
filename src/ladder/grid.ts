import type { LadderCell, LadderRung } from './types.ts';

export function cellKey(col: number, row: number): string {
  return `${col}:${row}`;
}

export function getCell(rung: LadderRung, col: number, row: number): LadderCell | undefined {
  return rung.cells.find((cell) => cell.col === col && cell.row === row);
}

export function upsertCell(rung: LadderRung, next: LadderCell): LadderRung {
  const remaining = rung.cells.filter((cell) => !(cell.col === next.col && cell.row === next.row));
  if (next.kind === 'empty') {
    return { ...rung, cells: remaining };
  }
  return { ...rung, cells: [...remaining, next] };
}

export function clearCell(rung: LadderRung, col: number, row: number): LadderRung {
  return {
    ...rung,
    cells: rung.cells.filter((cell) => !(cell.col === col && cell.row === row)),
  };
}

export function isInsideRung(rung: LadderRung, col: number, row: number): boolean {
  return col >= 0 && row >= 0 && col < rung.columns && row < rung.rows;
}
