/**
 * Upload validation shared by both entry points into the OCR pipeline
 * (the file picker and drag-and-drop). Neither the `accept="image/*"`
 * attribute nor a drag-and-drop MIME check alone is reliable: file
 * pickers can be switched to "All Files" by the user, and dropped
 * files carry no size guarantee at all. Without this, an oversized or
 * non-image file would sail past the UI and fail confusingly deep
 * inside the Tesseract worker instead of with a clear message here.
 */

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/gif',
] as const;

/** 15 MB -- comfortably above a typical phone photo, while still guarding
 * against multi-hundred-MB files that would freeze the tab during the
 * per-pixel canvas preprocessing pass. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported image type. Please upload a JPEG, PNG, WebP, BMP, or GIF file.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `"${file.name}" appears to be empty.`,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = MAX_IMAGE_BYTES / (1024 * 1024);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMb} MB, which exceeds the ${limitMb} MB limit. Try a smaller image.`,
    };
  }

  return { valid: true };
}
