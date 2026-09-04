import { createId } from '@core';
import { DEFAULT_LADDER_COLUMNS, type LadderBody, type LadderRung } from './types.ts';

export function createEmptyRung(columns = DEFAULT_LADDER_COLUMNS): LadderRung {
  return {
    id: createId('rung'),
    comment: '',
    columns,
    rows: 1,
    cells: [],
  };
}

export function createEmptyLadderBody(rungCount = 1): LadderBody {
  return {
    rungs: Array.from({ length: rungCount }, () => createEmptyRung()),
  };
}
