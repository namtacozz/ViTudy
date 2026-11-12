/**
 * Document Naming Helpers for ViTudy
 * Formats uploaded document titles into human-friendly names.
 */

export function formatUploadedDocTitle(fileName: string, isImage: boolean = false): string {
  if (!fileName) return isImage ? 'Ảnh chụp mới' : 'Tài liệu mới';

  // Strip extension
  const rawBase = fileName.replace(/\.[^/.]+$/, '').trim();

  if (isImage) {
    // Check if filename looks like a machine hash, camera timestamp, or random string
    // e.g., "815733508_1644375293917880_8219887820277246382_n", "IMG_20241112_183015", "Screenshot_2024..."
    const isNumericHash = /^[0-9_-]{12,}$/.test(rawBase);
    const isCameraOrScreenshot = /^(IMG|Pasted|Screenshot|Screen Shot|Snapshot|Capture|Photo|Image|CAM|DSC)[-_0-9A-Za-z\s]*$/i.test(rawBase);
    const isFbOrCdnHash = /^[0-9]+_[0-9]+_[0-9]+_n$/i.test(rawBase);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawBase);

    if (isNumericHash || isCameraOrScreenshot || isFbOrCdnHash || isUuid || rawBase.length > 25) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `Ảnh chụp ${day}/${month} ${hours}:${minutes}`;
    }
  }

  // Clean underscores and excess hyphens for better readability
  const cleaned = rawBase
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || (isImage ? 'Ảnh chụp' : 'Tài liệu');
}
