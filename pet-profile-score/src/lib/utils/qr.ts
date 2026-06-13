import QRCode from 'qrcode';
import { SITE_URL } from '@/lib/constants/categories';

// Generate a unique public ID for a pet
export function generatePublicId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, I, 1
  let result = 'PET-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate QR code as data URL
export async function generateQRCodeDataURL(publicId: string): Promise<string> {
  const url = `${SITE_URL}/pet/${publicId}`;

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1f2937', // Gray-800
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate QR code as base64 string for storage
export async function generateQRCodeBase64(publicId: string): Promise<string> {
  const url = `${SITE_URL}/pet/${publicId}`;

  try {
    const base64 = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return base64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Get the public profile URL for a pet
export function getPetProfileUrl(publicId: string): string {
  return `${SITE_URL}/pet/${publicId}`;
}

// Download QR code as image
export async function downloadQRCode(publicId: string, petName: string): Promise<void> {
  const dataUrl = await generateQRCodeDataURL(publicId);

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${petName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
