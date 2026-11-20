import { getSupabase } from "@/src/infrastructure/supabase/client";

export type ImageBucket = "avatars" | "playlist-covers";

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // what we accept from the picker
const OUTPUT_SIZE = 512; // square, px
const OUTPUT_QUALITY = 0.86;

export class ImageUploadError extends Error {}

/**
 * Center-crop to a square and downscale to 512px WebP in the browser, so
 * uploads are small (~30–80 KB) whatever the original photo was.
 */
export async function prepareSquareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new ImageUploadError("Please choose an image file.");
  if (file.size > MAX_INPUT_BYTES) throw new ImageUploadError("That image is too large (max 10 MB).");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageUploadError("Couldn't read that image.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const size = Math.min(OUTPUT_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageUploadError("Couldn't process that image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", OUTPUT_QUALITY)
  );
  if (!blob) throw new ImageUploadError("Couldn't process that image.");
  return blob;
}

/**
 * Upload into <bucket>/<userId>/<name>-<timestamp>.webp and return its public URL.
 * The timestamp makes each upload a new URL, so browsers never show a stale copy.
 */
export async function uploadUserImage(
  bucket: ImageBucket,
  userId: string,
  name: string,
  image: Blob
): Promise<string> {
  const path = `${userId}/${name}-${Date.now()}.webp`;
  const db = getSupabase();
  const { error } = await db.storage
    .from(bucket)
    .upload(path, image, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) throw new ImageUploadError(`Upload failed: ${error.message}`);
  return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Best-effort delete of a previous upload (only for URLs in our own buckets). */
export async function deleteUserImage(bucket: ImageBucket, publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const at = publicUrl.indexOf(marker);
  if (at === -1) return; // e.g. a Google profile photo: not ours to delete
  const path = decodeURIComponent(publicUrl.slice(at + marker.length));
  await getSupabase().storage.from(bucket).remove([path]);
}
