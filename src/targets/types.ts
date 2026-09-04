export type AddressClass =
  | 'inputBit'
  | 'outputBit'
  | 'memoryBit'
  | 'memoryWord'
  | 'memoryByte'
  | 'memoryDint'
  | 'memoryReal'
  | 'analogInput'
  | 'analogOutput'
  | 'systemBit'
  | 'systemWord'
  | 'timer'
  | 'counter'
  | 'grafcetStep';

export type AddressRole = 'booleanRead' | 'booleanWrite' | 'word' | 'timer' | 'counter';

export interface ParsedAddress {
  raw: string;
  normalized: string;
  addressClass: AddressClass;
  indexes: number[];
  field?: string;
}

export interface AddressParseSuccess {
  ok: true;
  address: ParsedAddress;
}

export interface AddressParseFailure {
  ok: false;
  error: string;
}

export type AddressParseResult = AddressParseSuccess | AddressParseFailure;

export interface PlcTarget {
  id: string;
  family: string;
  label: string;
  parseAddress(raw: string): AddressParseResult;
  roleFits(address: ParsedAddress, role: AddressRole): boolean;
}
