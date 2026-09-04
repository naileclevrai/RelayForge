import type { PlcTarget } from '../types.ts';
import { parseTsx37Address, tsx37RoleFits } from './address.ts';

export const TSX37_FAMILY = 'schneider.tsx37';

export const tsx37Target: PlcTarget = {
  id: 'tsx37',
  family: TSX37_FAMILY,
  label: 'Schneider TSX37 / TSX Micro',
  parseAddress: parseTsx37Address,
  roleFits: tsx37RoleFits,
};
