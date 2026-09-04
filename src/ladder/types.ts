export const DEFAULT_LADDER_COLUMNS = 12;

export type LadderCellKind =
  | 'empty'
  | 'normallyOpenContact'
  | 'normallyClosedContact'
  | 'coil'
  | 'setCoil'
  | 'resetCoil'
  | 'horizontalLink'
  | 'verticalLink'
  | 'functionBlock'
  | 'compare'
  | 'operate';

export type FunctionBlockKind = 'timer' | 'counter';
export type CompareOperator = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';
export type OperateOperator = 'assign' | 'add' | 'sub' | 'mul' | 'div';

export interface LadderCell {
  col: number;
  row: number;
  kind: LadderCellKind;
  operand?: string;
  secondaryOperand?: string;
  resultOperand?: string;
  blockKind?: FunctionBlockKind;
  compareOp?: CompareOperator;
  operateOp?: OperateOperator;
}

export interface LadderRung {
  id: string;
  comment: string;
  columns: number;
  rows: number;
  cells: LadderCell[];
}

export interface LadderBody {
  rungs: LadderRung[];
}

export const CONTACT_KINDS: readonly LadderCellKind[] = [
  'normallyOpenContact',
  'normallyClosedContact',
];

export const COIL_KINDS: readonly LadderCellKind[] = ['coil', 'setCoil', 'resetCoil'];

export const BOOLEAN_ELEMENT_KINDS: readonly LadderCellKind[] = [...CONTACT_KINDS, ...COIL_KINDS];
