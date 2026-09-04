import type { AddressClass, AddressParseResult, AddressRole, ParsedAddress } from '../types.ts';

const ADDRESS_PATTERN =
  /^%(?<type>IW|QW|MW|MB|MD|MF|SW|TM|I|Q|M|S|C|X)(?<head>\d+)(?:\.(?<tail>\d+|[A-Za-z]+))?$/i;

const TYPE_CLASS: Record<string, AddressClass> = {
  I: 'inputBit',
  Q: 'outputBit',
  M: 'memoryBit',
  MW: 'memoryWord',
  MB: 'memoryByte',
  MD: 'memoryDint',
  MF: 'memoryReal',
  IW: 'analogInput',
  QW: 'analogOutput',
  S: 'systemBit',
  SW: 'systemWord',
  TM: 'timer',
  C: 'counter',
  X: 'grafcetStep',
};

const LIMITS: Record<
  AddressClass,
  { maxHead: number; needsChannel?: boolean; fields?: readonly string[] }
> = {
  inputBit: { maxHead: 15, needsChannel: true },
  outputBit: { maxHead: 15, needsChannel: true },
  analogInput: { maxHead: 15, needsChannel: true },
  analogOutput: { maxHead: 15, needsChannel: true },
  memoryBit: { maxHead: 32767 },
  memoryWord: { maxHead: 32767 },
  memoryByte: { maxHead: 65535 },
  memoryDint: { maxHead: 32766 },
  memoryReal: { maxHead: 32766 },
  systemBit: { maxHead: 127 },
  systemWord: { maxHead: 127 },
  timer: { maxHead: 255, fields: ['Q', 'P', 'V'] },
  counter: { maxHead: 255, fields: ['Q', 'D', 'E', 'P', 'V'] },
  grafcetStep: { maxHead: 255 },
};

function normalizeType(type: string): string {
  return type.toUpperCase();
}

function parseIndexes(
  type: string,
  head: string,
  tail: string | undefined,
): { indexes: number[]; field?: string } | { error: string } {
  const headIndex = Number(head);
  if (!Number.isInteger(headIndex) || headIndex < 0) {
    return { error: `Invalid index in %${type}${head}` };
  }
  if (tail === undefined) {
    return { indexes: [headIndex] };
  }
  if (/^[A-Za-z]+$/.test(tail)) {
    return { indexes: [headIndex], field: tail.toUpperCase() };
  }
  const channel = Number(tail);
  if (!Number.isInteger(channel) || channel < 0) {
    return { error: `Invalid channel in %${type}${head}.${tail}` };
  }
  return { indexes: [headIndex, channel] };
}

export function parseTsx37Address(raw: string): AddressParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Address is empty.' };
  }
  const match = ADDRESS_PATTERN.exec(trimmed);
  if (!match?.groups) {
    return {
      ok: false,
      error: `"${trimmed}" is not a TSX37 address. Expected forms such as %I0.1, %Q0.1, %M10, %MW20, %TM0.`,
    };
  }
  const type = normalizeType(match.groups.type ?? '');
  const head = match.groups.head ?? '';
  const tail = match.groups.tail;
  const addressClass = TYPE_CLASS[type];
  if (!addressClass) {
    return { ok: false, error: `Unknown TSX37 address family %${type}.` };
  }
  const parsed = parseIndexes(type, head, tail);
  if ('error' in parsed) {
    return { ok: false, error: parsed.error };
  }
  const limits = LIMITS[addressClass];
  const headIndex = parsed.indexes[0];
  if (headIndex === undefined || headIndex > limits.maxHead) {
    return {
      ok: false,
      error: `%${type} index ${headIndex ?? '?'} is out of range for TSX37 (0–${limits.maxHead}).`,
    };
  }
  if (limits.needsChannel && parsed.indexes.length < 2) {
    return { ok: false, error: `%${type} requires a module.channel form such as %${type}0.1.` };
  }
  if (
    !limits.needsChannel &&
    parsed.indexes.length > 1 &&
    !['memoryWord', 'memoryByte', 'memoryDint'].includes(addressClass)
  ) {
    return { ok: false, error: `%${type}${head} does not take a numeric channel.` };
  }
  if (parsed.field && limits.fields && !limits.fields.includes(parsed.field)) {
    return {
      ok: false,
      error: `%${type}${head}.${parsed.field} is not a valid ${addressClass} field. Expected ${limits.fields.join(', ')}.`,
    };
  }
  if (
    parsed.field &&
    !limits.fields &&
    addressClass !== 'memoryWord' &&
    addressClass !== 'memoryBit'
  ) {
    return { ok: false, error: `%${type}${head} does not accept field .${parsed.field}.` };
  }
  if (addressClass === 'memoryWord' && parsed.indexes.length === 2) {
    const bit = parsed.indexes[1];
    if (bit === undefined || bit > 15) {
      return { ok: false, error: `Bit extract %MW${head}.n must use n in 0–15.` };
    }
  }
  const normalized = `%${type}${parsed.indexes.join('.')}${parsed.field ? `.${parsed.field}` : ''}`;
  const address: ParsedAddress = {
    raw: trimmed,
    normalized,
    addressClass,
    indexes: parsed.indexes,
    field: parsed.field,
  };
  return { ok: true, address };
}

const READ_BITS: AddressClass[] = [
  'inputBit',
  'outputBit',
  'memoryBit',
  'systemBit',
  'grafcetStep',
];
const WRITE_BITS: AddressClass[] = ['outputBit', 'memoryBit'];
const WORDS: AddressClass[] = [
  'memoryWord',
  'memoryByte',
  'memoryDint',
  'memoryReal',
  'analogInput',
  'analogOutput',
  'systemWord',
];

export function tsx37RoleFits(address: ParsedAddress, role: AddressRole): boolean {
  if (role === 'booleanRead') {
    if (address.addressClass === 'memoryWord' && address.indexes.length === 2) {
      return true;
    }
    if (
      (address.addressClass === 'timer' || address.addressClass === 'counter') &&
      address.field === 'Q'
    ) {
      return true;
    }
    return READ_BITS.includes(address.addressClass);
  }
  if (role === 'booleanWrite') {
    return WRITE_BITS.includes(address.addressClass);
  }
  if (role === 'word') {
    return WORDS.includes(address.addressClass) && address.indexes.length === 1 && !address.field;
  }
  if (role === 'timer') {
    return address.addressClass === 'timer' && !address.field;
  }
  return address.addressClass === 'counter' && !address.field;
}
