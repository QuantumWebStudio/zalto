const MAX_WIDTH = 240;
const JPEG_QUALITY = 0.85;

/**
 * Reads an image file, resizes it to at most MAX_WIDTH wide (preserving aspect
 * ratio) via canvas, and returns a compressed data URL small enough to keep
 * many logos comfortably inside a localStorage quota.
 */
export function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode the selected image."));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas is not supported in this browser."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const isTransparentFriendly = file.type === "image/png" || file.type === "image/svg+xml";
        const mimeType = isTransparentFriendly ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.src = typeof reader.result === "string" ? reader.result : "";
    };

    reader.readAsDataURL(file);
  });
}
