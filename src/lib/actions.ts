'use server';

import { getAdminApp } from './firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'crypto';

/**
 * Uploads an image if it's a new base64 encoded string using the Firebase Admin SDK.
 * This is a server action and is executed securely on the server with admin privileges.
 * @param imageData - The image data, either a base64 string or an existing URL.
 * @returns The public URL of the uploaded or existing image.
 */
export async function uploadImage(imageData?: string): Promise<string> {
    // If imageData is not a base64 string, it's either an existing URL or empty.
    if (!imageData || !imageData.startsWith('data:image')) {
        return imageData || '';
    }

    try {
        const adminApp = getAdminApp();
        const bucket = getStorage(adminApp).bucket();

        // Extract mime type and base64 data
        const [dataUrl, base64Data] = imageData.split(',');
        if (!base64Data) {
          throw new Error('Invalid base64 string');
        }
        
        const mimeType = dataUrl.match(/:(.*?);/)?.[1];
        if (!mimeType) {
            throw new Error('Could not extract MIME type from data URL.');
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `images/${randomUUID()}`;
        const file = bucket.file(fileName);
        
        await file.save(buffer, {
            metadata: {
                contentType: mimeType,
            },
        });

        // The public URL is in the format: https://storage.googleapis.com/[BUCKET_NAME]/[FILE_NAME]
        return `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    } catch (error) {
        console.error("Error uploading image with Admin SDK:", error);
        throw new Error("Falha no upload da imagem.");
    }
}
