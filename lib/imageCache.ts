/**
 * Module-level cache to track which images have been loaded in the current session.
 * This prevents showing loading states on subsequent tab switches.
 * The cache resets on page refresh (when images would need to reload anyway).
 */

const MAX_CACHE_SIZE = 100; // Prevent unbounded memory growth
const loadedImages = new Set<string>();

/**
 * Check if an image has already been loaded this session.
 */
export function isImageLoaded(src: string): boolean {
    return loadedImages.has(src);
}

/**
 * Mark an image as loaded in the session cache.
 */
export function markImageLoaded(src: string): void {
    // Prevent unbounded growth - remove oldest entries if at limit
    if (loadedImages.size >= MAX_CACHE_SIZE) {
        const firstEntry = loadedImages.values().next().value;
        if (firstEntry) loadedImages.delete(firstEntry);
    }
    loadedImages.add(src);
}

/**
 * Clear the cache (useful for testing or forced reloads).
 */
export function clearImageCache(): void {
    loadedImages.clear();
}
