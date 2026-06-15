'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ScanPage() {
  const router = useRouter();
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError('Please enter a pet ID');
      return;
    }

    const petId = manualInput.trim().toUpperCase();

    if (petId.startsWith('PET-') || petId.startsWith('BUDDY-')) {
      router.push('/pet/' + petId);
    } else {
      setError('Invalid pet ID format');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
        <p className="text-gray-600">Point your camera at a pet QR code to view their profile</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
          <Camera className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center px-4">
            Camera access required to scan QR codes
          </p>
          <p className="text-gray-400 text-sm mt-2">
            (Camera integration coming soon)
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Or enter pet ID manually</h2>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="e.g., PET-ABC123"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <Button onClick={handleManualSubmit} className="w-full" size="lg">
            View Profile
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            Find the pet ID on their profile or QR code sticker
          </p>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Do not have a QR code?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Learn how to get one
          </a>
        </p>
      </div>
    </div>
  );
}
