export function getAppBasePath(): string {
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/ViTudy')) {
      return '/ViTudy';
    }
  }
  return envBasePath;
}

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const basePath = getAppBasePath();
    return `${origin}${basePath}`;
  }
  return 'https://nhatgreen.github.io/ViTudy';
}

export function getShareRoomUrl(roomId: string, perm: string = 'edit', spaceId?: string): string {
  const baseUrl = getAppBaseUrl();
  const params = new URLSearchParams();
  if (spaceId) params.set('space', spaceId);
  params.set('room', roomId);
  params.set('perm', perm);
  return `${baseUrl}/?${params.toString()}`;
}

export function navigateToRoom(roomId: string, perm: string = 'edit') {
  if (typeof window === 'undefined') return;
  window.location.href = getShareRoomUrl(roomId, perm);
}

/**
 * Helper to resolve static asset URLs taking into account Next.js basePath (e.g. GitHub Pages /ViTudy).
 */
export function getAssetPath(path: string): string {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = getAppBasePath();
  return `${basePath}${cleanPath}`;
}
