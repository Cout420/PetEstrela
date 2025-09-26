/**
 * @fileoverview A "service" for creating and retrieving shortened links.
 * In a real-world application, this would use a database.
 * For this demo, we're just constructing the production URL.
 */

// This should be replaced with the actual production domain of the deployed app.
export const PROD_DOMAIN = 'https://petestrelatest.netlify.app';

/**
 * Creates a "shortened" link for a memorial.
 * In this implementation, it simply returns the full, production-ready URL.
 * @param memorialId - The ID of the memorial.
 * @returns The public URL for the memorial.
 */
export async function createShortLink(memorialId: number): Promise<string> {
  const fullUrl = `${PROD_DOMAIN}/memorial/${memorialId}`;
  // In a real app, you might store the fullUrl and return a truly short
  // unique ID, e.g., `${PROD_DOMAIN}/m/xY1aZ2`.
  // For now, the full URL is sufficient to make the QR code work externally.
  return Promise.resolve(fullUrl);
}
