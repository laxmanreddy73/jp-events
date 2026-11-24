export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 6000;
export const MAX_IMAGE_PIXELS = 36_000_000;

export interface VerifiedImage {
  bytes: Uint8Array;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  width: number;
  height: number;
  sha256: string;
}

function readU32BE(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false);
}

function readU32LE(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

function readU24LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function decodeJpeg(input: Uint8Array): { width: number; height: number; bytes: Uint8Array } {
  if (input.length < 4 || input[0] !== 0xff || input[1] !== 0xd8) throw new Error('Invalid JPEG signature.');
  const parts: Uint8Array[] = [input.slice(0, 2)];
  let offset = 2;
  let width = 0;
  let height = 0;

  while (offset + 4 <= input.length) {
    if (input[offset] !== 0xff) throw new Error('Malformed JPEG segment.');
    const markerStart = offset;
    while (offset < input.length && input[offset] === 0xff) offset++;
    if (offset >= input.length) break;
    const marker = input[offset++];
    if (marker === 0xd9 || marker === 0xda) {
      if (marker === 0xda) parts.push(input.slice(markerStart));
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(input.slice(markerStart, offset));
      continue;
    }
    if (offset + 2 > input.length) throw new Error('Truncated JPEG segment.');
    const segmentLength = (input[offset] << 8) | input[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > input.length) throw new Error('Invalid JPEG segment length.');
    const segmentEnd = offset + segmentLength;
    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
    if (isStartOfFrame) {
      if (segmentLength < 7) throw new Error('Invalid JPEG frame header.');
      height = (input[offset + 3] << 8) | input[offset + 4];
      width = (input[offset + 5] << 8) | input[offset + 6];
    }
    if (marker !== 0xe1) parts.push(input.slice(markerStart, segmentEnd));
    offset = segmentEnd;
  }
  if (!width || !height || !parts.length) throw new Error('Could not validate JPEG dimensions.');
  const length = parts.reduce((total, part) => total + part.length, 0);
  const bytes = new Uint8Array(length);
  let cursor = 0;
  for (const part of parts) {
    bytes.set(part, cursor);
    cursor += part.length;
  }
  return { width, height, bytes };
}

function decodePng(input: Uint8Array): { width: number; height: number; bytes: Uint8Array } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (input.length < 33 || !signature.every((value, index) => input[index] === value)) {
    throw new Error('Invalid PNG signature.');
  }
  const width = readU32BE(input, 16);
  const height = readU32BE(input, 20);
  const chunks: Uint8Array[] = [input.slice(0, 8)];
  let offset = 8;
  let foundIend = false;
  while (offset + 12 <= input.length) {
    const length = readU32BE(input, offset);
    const end = offset + 12 + length;
    if (length > MAX_IMAGE_BYTES || end > input.length) throw new Error('Malformed PNG chunk.');
    const type = String.fromCharCode(...input.slice(offset + 4, offset + 8));
    if (type !== 'eXIf') chunks.push(input.slice(offset, end));
    offset = end;
    if (type === 'IEND') {
      foundIend = true;
      break;
    }
  }
  if (!foundIend || offset !== input.length) throw new Error('PNG data is incomplete or contains trailing content.');
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, cursor);
    cursor += chunk.length;
  }
  return { width, height, bytes };
}

function decodeWebp(input: Uint8Array): { width: number; height: number; bytes: Uint8Array } {
  if (input.length < 20 || String.fromCharCode(...input.slice(0, 4)) !== 'RIFF' ||
      String.fromCharCode(...input.slice(8, 12)) !== 'WEBP' || readU32LE(input, 4) !== input.length - 8) {
    throw new Error('Invalid WebP container.');
  }

  let width = 0;
  let height = 0;
  let offset = 12;
  const chunks: Uint8Array[] = [input.slice(0, 12)];
  while (offset + 8 <= input.length) {
    const type = String.fromCharCode(...input.slice(offset, offset + 4));
    const length = new DataView(input.buffer, input.byteOffset + offset + 4, 4).getUint32(0, true);
    const end = offset + 8 + length + (length % 2);
    if (end > input.length) throw new Error('Malformed WebP chunk.');
    const dataStart = offset + 8;
    if (type === 'VP8X' && length >= 10) {
      width = readU24LE(input, dataStart + 4) + 1;
      height = readU24LE(input, dataStart + 7) + 1;
    } else if (type === 'VP8 ' && length >= 10 && input[dataStart + 3] === 0x9d &&
               input[dataStart + 4] === 0x01 && input[dataStart + 5] === 0x2a) {
      width = (input[dataStart + 6] | (input[dataStart + 7] << 8)) & 0x3fff;
      height = (input[dataStart + 8] | (input[dataStart + 9] << 8)) & 0x3fff;
    } else if (type === 'VP8L' && length >= 5 && input[dataStart] === 0x2f) {
      width = 1 + input[dataStart + 1] + ((input[dataStart + 2] & 0x3f) << 8);
      height = 1 + (input[dataStart + 2] >> 6) + (input[dataStart + 3] << 2) + ((input[dataStart + 4] & 0x0f) << 10);
    }
    if (type !== 'EXIF' && type !== 'XMP ') chunks.push(input.slice(offset, end));
    offset = end;
  }
  if (!width || !height || offset !== input.length) throw new Error('Could not validate WebP dimensions.');

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, cursor);
    cursor += chunk.length;
  }
  new DataView(bytes.buffer).setUint32(4, bytes.length - 8, true);
  return { width, height, bytes };
}

export async function verifyAndSanitizeImage(input: Uint8Array, expectedMime?: string): Promise<VerifiedImage> {
  if (!input.length || input.length > MAX_IMAGE_BYTES) throw new Error('Image size must be at most 10 MiB.');

  let decoded: { width: number; height: number; bytes: Uint8Array };
  let mimeType: VerifiedImage['mimeType'];
  if (input[0] === 0xff && input[1] === 0xd8) {
    mimeType = 'image/jpeg';
    decoded = decodeJpeg(input);
  } else if (input[0] === 137 && input[1] === 80 && input[2] === 78 && input[3] === 71) {
    mimeType = 'image/png';
    decoded = decodePng(input);
  } else if (String.fromCharCode(...input.slice(0, 4)) === 'RIFF') {
    mimeType = 'image/webp';
    decoded = decodeWebp(input);
  } else {
    throw new Error('Only JPEG, PNG, and WebP files are supported. SVG and AVIF are not accepted.');
  }

  if (expectedMime && expectedMime !== mimeType) throw new Error('Image contents do not match the claimed media type.');
  if (
    decoded.width < 1 || decoded.height < 1 ||
    decoded.width > MAX_IMAGE_DIMENSION || decoded.height > MAX_IMAGE_DIMENSION ||
    decoded.width * decoded.height > MAX_IMAGE_PIXELS
  ) throw new Error('Image dimensions exceed the 6,000 px per side / 36 megapixel limit.');

  const digest = await crypto.subtle.digest('SHA-256', decoded.bytes);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { ...decoded, mimeType, sha256 };
}
