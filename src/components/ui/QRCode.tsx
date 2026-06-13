'use client';

import { useEffect, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { generateQRCodeDataURL, downloadQRCode, getPetProfileUrl } from '@/lib/utils/qr';
import { Button } from './Button';

interface QRCodeProps {
  publicId: string;
  petName?: string;
  size?: number;
  showDownload?: boolean;
  showCopy?: boolean;
  className?: string;
}

export function QRCode({
  publicId,
  petName,
  size = 200,
  showDownload = true,
  showCopy = false,
  className = '',
}: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        const dataUrl = await generateQRCodeDataURL(publicId);
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [publicId]);

  const handleDownload = async () => {
    try {
      await downloadQRCode(publicId, petName || 'pet');
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handleCopy = async () => {
    const url = getPetProfileUrl(publicId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-lg flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-sm">Generating...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
        {qrDataUrl && (
          <img
            src={qrDataUrl}
            alt={`QR Code for ${petName || publicId}`}
            width={size}
            height={size}
            className="rounded"
          />
        )}
      </div>
      <p className="text-xs text-gray-500 font-mono">{publicId}</p>
      <div className="flex gap-2">
        {showDownload && (
          <Button variant="outline" size="sm" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
            Download
          </Button>
        )}
        {showCopy && (
          <Button variant="ghost" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        )}
      </div>
    </div>
  );
}
