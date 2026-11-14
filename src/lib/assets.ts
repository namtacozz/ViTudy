/**
 * Helper to resolve static asset URLs taking into account Next.js basePath (e.g. GitHub Pages /ViTudy).
 */
export function getAssetPath(path: string): string {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  if (envBasePath) {
    return `${envBasePath}${cleanPath}`;
  }

  // Fallback in browser if hosted on a known GitHub Pages subpath
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname === '/ViTudy-dev' || pathname.startsWith('/ViTudy-dev/')) {
      return `/ViTudy-dev${cleanPath}`;
    }
    if (pathname === '/ViTudy' || pathname.startsWith('/ViTudy/')) {
      return `/ViTudy${cleanPath}`;
    }
  }

  return cleanPath;
}
