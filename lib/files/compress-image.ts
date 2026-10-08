/**
 * Browser-side image compression for the documents customers attach (deed,
 * power of attorney, national address…). Phone photos are 3–8 MB; uploads go
 * through a Server Action and Vercel rejects function requests above 4.5 MB,
 * and the local draft only keeps files ≤ 512 KB across a page reload.
 *
 * JPEG/PNG/WEBP larger than 400 KB are redrawn at most 1600 px on the long
 * side as JPEG (quality 0.8) — still sharp enough to read a deed. Anything
 * else (PDF, HEIC the browser cannot decode, small images) is returned as is.
 */
const COMPRESSIBLE_TYPES = /^image\/(jpeg|png|webp)$/i;
const MIN_BYTES_TO_COMPRESS = 400 * 1024;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

export async function compressImageFile(file: File): Promise<File> {
  if (
    typeof window === "undefined" ||
    !COMPRESSIBLE_TYPES.test(file.type) ||
    file.size < MIN_BYTES_TO_COMPRESS ||
    typeof createImageBitmap !== "function"
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close?.();
      return file;
    }

    // White background: transparent PNG areas would turn black in JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.(jpe?g|png|webp)$/i, "") || "image";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

/**
 * Vercel caps a function request at 4.5 MB: keep every Server Action upload
 * under this (multipart overhead included).
 */
export const MAX_SERVER_ACTION_UPLOAD_BYTES = 4 * 1024 * 1024;

export function totalBytes(files: Array<File | undefined | null>): number {
  return files.reduce((sum, file) => sum + (file?.size ?? 0), 0);
}
