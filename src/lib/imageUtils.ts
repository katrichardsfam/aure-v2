/**
 * Cloudinary image enhancement utilities for perfume images
 *
 * These functions use Cloudinary's fetch feature to transform images on-the-fly
 * from external URLs (like the Fragella API).
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Validates that a string is a valid HTTP/HTTPS URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Basic check for image-like paths (optional, but helps catch obvious non-images)
    const pathname = parsed.pathname.toLowerCase();
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(pathname);
    const hasNoExtension = !pathname.includes('.') || pathname.endsWith('/');
    // Allow URLs with image extensions OR no extension (CDN URLs often omit extensions)
    return hasImageExtension || hasNoExtension || pathname.includes('image');
  } catch {
    return false;
  }
}

/**
 * Generates a Cloudinary fetch URL with the specified transformations
 * Returns null if URL encoding fails
 */
function buildCloudinaryFetchUrl(originalUrl: string, transformations: string): string | null {
  try {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformations}/${encodedUrl}`;
  } catch {
    return null;
  }
}

/**
 * Returns an enhanced perfume image URL with AI improvements
 *
 * Transformations applied:
 * - e_improve: AI-powered image enhancement (contrast, color, sharpness)
 * - w_500: Resizes width to 500px (maintains aspect ratio)
 * - q_auto:best: Highest quality automatic compression
 * - f_auto: Automatic format selection for best compression
 *
 * Note: Background removal (e_background_removal) requires Cloudinary's AI add-on
 * which is not available on free tier. Use CSS mix-blend-mode: multiply as a
 * workaround for white backgrounds on light-colored page backgrounds.
 *
 * @param originalUrl - The original image URL from Fragella API
 * @returns Cloudinary fetch URL with transformations, or original URL if unavailable
 */
export function getEnhancedPerfumeImage(originalUrl: string): string {
  // Return original URL if Cloudinary is not configured or URL is empty/invalid
  if (!CLOUDINARY_CLOUD_NAME || !originalUrl || !isValidImageUrl(originalUrl)) {
    return originalUrl;
  }

  const transformations = [
    'e_improve',    // AI enhancement for better image quality
    'w_500',        // Width 500px for consistent sizing
    'q_auto:best',  // Best quality automatic compression
    'f_auto',       // Automatic format (WebP when supported)
  ].join(',');

  // Return original URL if Cloudinary URL generation fails
  return buildCloudinaryFetchUrl(originalUrl, transformations) || originalUrl;
}

/**
 * Returns an optimized perfume image URL WITHOUT background removal
 *
 * This is faster and uses fewer Cloudinary credits than getEnhancedPerfumeImage.
 * Use this for thumbnails, grids, or when background removal isn't needed.
 *
 * Transformations applied:
 * - e_improve: AI-powered image enhancement (contrast, color, sharpness)
 * - w_400: Resizes width to 400px (slightly smaller for optimization)
 * - q_auto: Automatic quality compression (balanced)
 * - f_auto: Automatic format selection (WebP for supported browsers)
 *
 * @param originalUrl - The original image URL from Fragella API
 * @returns Cloudinary fetch URL with transformations, or original URL if unavailable
 */
export function getOptimizedPerfumeImage(originalUrl: string): string {
  // Return original URL if Cloudinary is not configured or URL is empty/invalid
  if (!CLOUDINARY_CLOUD_NAME || !originalUrl || !isValidImageUrl(originalUrl)) {
    return originalUrl;
  }

  const transformations = [
    'e_improve', // AI enhancement for better image quality
    'w_400',     // Width 400px for thumbnails/grids
    'q_auto',    // Automatic quality compression
    'f_auto',    // Automatic format (WebP when supported)
  ].join(',');

  // Return original URL if Cloudinary URL generation fails
  return buildCloudinaryFetchUrl(originalUrl, transformations) || originalUrl;
}
