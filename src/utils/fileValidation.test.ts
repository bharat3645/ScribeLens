import { describe, it, expect } from 'vitest';
import { validateImageFile, MAX_IMAGE_BYTES } from './fileValidation';

/** Builds a File with a specific reported `size` without allocating that
 * many real bytes -- `size` is normally derived from the Blob's contents,
 * but overriding the property directly keeps these tests fast. */
function makeFile(name: string, type: string, size: number): File {
  const file = new File([new Blob([''])], name, { type });
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  return file;
}

describe('validateImageFile', () => {
  it('accepts a normal-sized image of an accepted type', () => {
    const file = makeFile('scan.jpg', 'image/jpeg', 1024 * 1024);
    expect(validateImageFile(file)).toEqual({ valid: true });
  });

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'])(
    'accepts %s',
    (type) => {
      const file = makeFile('image.dat', type, 1024);
      expect(validateImageFile(file).valid).toBe(true);
    }
  );

  it('rejects non-image files', () => {
    const file = makeFile('notes.pdf', 'application/pdf', 1024);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not a supported image type/i);
  });

  it('rejects an empty file', () => {
    const file = makeFile('empty.png', 'image/png', 0);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('rejects a file larger than the size limit', () => {
    const file = makeFile('huge.png', 'image/png', MAX_IMAGE_BYTES + 1);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds/i);
  });

  it('accepts a file exactly at the size limit', () => {
    const file = makeFile('boundary.png', 'image/png', MAX_IMAGE_BYTES);
    expect(validateImageFile(file).valid).toBe(true);
  });
});
