export type ScannerMode =
  | "licence"
  | "pdf417"
  | "qr";

export interface ScanResult {
  format: string;
  text: string;
  bytes?: Uint8Array;
}

export interface DecodedResult {
  type: ScannerMode;
  data: unknown;
}