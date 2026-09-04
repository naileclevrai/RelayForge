import { describe, expect, it } from 'vitest';
import { parseTsx37Address, tsx37RoleFits } from './address.ts';

describe('TSX37 address parser', () => {
  it.each([
    ['%I0.1', 'inputBit', [0, 1]],
    ['%Q1.0', 'outputBit', [1, 0]],
    ['%M17', 'memoryBit', [17]],
    ['%MW20', 'memoryWord', [20]],
    ['%MW10.3', 'memoryWord', [10, 3]],
    ['%S6', 'systemBit', [6]],
    ['%SW0', 'systemWord', [0]],
    ['%TM0', 'timer', [0]],
    ['%TM0.Q', 'timer', [0]],
    ['%C2.P', 'counter', [2]],
    ['%X1', 'grafcetStep', [1]],
  ])('accepts %s', (raw, addressClass, indexes) => {
    const result = parseTsx37Address(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.address.addressClass).toBe(addressClass);
      expect(result.address.indexes).toEqual(indexes);
    }
  });

  it('rejects empty, unknown, and out-of-range forms', () => {
    expect(parseTsx37Address('').ok).toBe(false);
    expect(parseTsx37Address('I0.1').ok).toBe(false);
    expect(parseTsx37Address('%Z0').ok).toBe(false);
    expect(parseTsx37Address('%I0').ok).toBe(false);
    expect(parseTsx37Address('%M40000').ok).toBe(false);
    expect(parseTsx37Address('%TM0.Z').ok).toBe(false);
    expect(parseTsx37Address('%MW10.16').ok).toBe(false);
  });

  it('checks operand roles', () => {
    const input = parseTsx37Address('%I0.1');
    const output = parseTsx37Address('%Q0.1');
    const word = parseTsx37Address('%MW4');
    const timer = parseTsx37Address('%TM0');
    expect(input.ok && tsx37RoleFits(input.address, 'booleanRead')).toBe(true);
    expect(input.ok && tsx37RoleFits(input.address, 'booleanWrite')).toBe(false);
    expect(output.ok && tsx37RoleFits(output.address, 'booleanWrite')).toBe(true);
    expect(word.ok && tsx37RoleFits(word.address, 'word')).toBe(true);
    expect(timer.ok && tsx37RoleFits(timer.address, 'timer')).toBe(true);
  });
});
