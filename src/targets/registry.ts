import type { PlcTarget } from './types.ts';
import { TSX37_FAMILY, tsx37Target } from './tsx37/target.ts';

const TARGETS: readonly PlcTarget[] = [tsx37Target];

export function listTargets(): readonly PlcTarget[] {
  return TARGETS;
}

export function getTarget(family: string): PlcTarget {
  const target = TARGETS.find((item) => item.family === family);
  if (!target) {
    throw new Error(`Unknown PLC target family: ${family}`);
  }
  return target;
}

export { TSX37_FAMILY, tsx37Target };
