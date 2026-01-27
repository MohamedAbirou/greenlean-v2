/**
 * Barcode Scanner Component - Production Ready
 * Uses html5-qrcode library for robust barcode scanning
 * Integrates with Supabase Edge Function for product lookup
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface ScannedFood {
  id: string;
  name: string;
  brand?: string;
  barcode: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  serving_size: string;
  verified: boolean;
  image?: string;
}

interface BarcodeScannerProps {
  onFoodScanned: (food: ScannedFood) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onFoodScanned, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [manualEntry, setManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Check if camera is supported
  const isCameraSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera with html5-qrcode
  const startCamera = async () => {
    if (!isCameraSupported) {
      setError('Camera not supported on this device');
      return;
    }

    try {
      setError('');
      setIsScanning(true); // Set this BEFORE initializing scanner

      // Wait for next tick to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize html5-qrcode
      const html5QrCode = new Html5Qrcode("barcode-reader");
      html5QrCodeRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error('No cameras found');
      }

      // Use back camera if available (for mobile)
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      ) || devices[0];

      // Start scanning
      await html5QrCode.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
        },
        (decodedText) => {
          // Barcode detected - only process if different from last
          if (decodedText && decodedText !== lastScannedBarcode) {
            console.log('Barcode detected:', decodedText);
            setLastScannedBarcode(decodedText);
            // Stop scanning before lookup
            html5QrCode.stop().then(() => {
              setIsScanning(false);
              lookupBarcode(decodedText);
            }).catch(console.error);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors - they happen continuously while scanning
          // Only log if it's not the common "No MultiFormat Readers" error
          if (!errorMessage.includes('No MultiFormat Readers')) {
            console.log('Scan error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setIsScanning(false); // Reset on error
      setError(err.message || 'Failed to access camera. Please grant camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
    setIsScanning(false);
  };

  // Lookup barcode via Supabase Edge Function
  const lookupBarcode = async (barcode: string) => {
    if (!barcode || loading) return;

    setLoading(true);
    setError('');

    try {
      // Call Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barcode-scanner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ barcode }),
        }
      );

      const data = await response.json();

      if (data.success && data.food) {
        // Stop scanning after successful lookup
        await stopCamera();

        // Return the food item
        onFoodScanned(data.food);
      } else {
        setError(data.message || `Product not found for barcode: ${barcode}`);
      }
    } catch (err: any) {
      console.error('Barcode lookup error:', err);
      setError('Failed to lookup product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual barcode entry
  const handleManualSubmit = () => {
    if (manualBarcode) {
      lookupBarcode(manualBarcode);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Barcode Scanner</h3>
            <p className="text-sm text-muted-foreground">
              Scan product barcodes for instant nutrition info
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        </div>

        {/* Camera View */}
        {!manualEntry && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            {!isScanning ? (
              <div className="aspect-video flex flex-col items-center justify-center text-white p-8">
                <div className="text-6xl mb-4">📷</div>
                <h4 className="text-xl font-semibold mb-2">Ready to Scan</h4>
                <p className="text-sm text-gray-300 mb-6 text-center max-w-md">
                  Position the barcode in the center of the camera view
                </p>
                {isCameraSupported ? (
                  <Button variant="primary" onClick={startCamera}>
                    Open Camera
                  </Button>
                ) : (
                  <div className="text-center">
                    <Badge variant="error" className="mb-4">
                      Camera not supported
                    </Badge>
                    <p className="text-sm text-gray-400 mb-4">
                      Your device doesn't support camera access
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                {/* Scanner container */}
                <div
                  id="barcode-reader"
                  ref={scannerContainerRef}
                  className="w-full min-h-[400px]"
                  style={{
                    border: '2px solid #22c55e',
                    borderRadius: '0.5rem',
                  }}
                />

                {/* Scanning indicator */}
                <div className="absolute top-4 left-4 right-4 flex justify-center z-10">
                  <div className="px-4 py-2 bg-green-500/90 text-white rounded-lg backdrop-blur-sm">
                    📷 Scanning for barcode...
                  </div>
                </div>

                {/* Stop Button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                  <Button variant="secondary" onClick={stopCamera}>
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry */}
        {manualEntry && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter Barcode Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="e.g., 012345678912"
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button
                  variant="primary"
                  onClick={handleManualSubmit}
                  disabled={!manualBarcode || loading}
                >
                  {loading ? 'Looking up...' : 'Lookup'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Manual Entry */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              setManualEntry(!manualEntry);
              if (isScanning) stopCamera();
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {manualEntry ? '📷 Use Camera Instead' : '⌨️ Enter Barcode Manually'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <span className="ml-3 text-sm text-muted-foreground">
              Looking up product...
            </span>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Tips for Best Results:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Hold the camera steady and ensure good lighting</li>
            <li>• Position the barcode flat and centered in the frame</li>
            <li>• Keep the barcode in focus - not too close or far</li>
            <li>• If scanning fails, try manual entry</li>
            <li>• Supported formats: UPC, EAN, and other standard barcodes</li>
          </ul>
        </div>

        {/* Data Sources */}
        <div className="text-xs text-muted-foreground text-center">
          Powered by OpenFoodFacts and USDA FoodData Central
        </div>
      </CardContent>
    </Card>
  );
}