/**
 * BarcodeScanner Component
 * Scan product barcodes to automatically get nutrition info
 * Uses device camera for barcode scanning
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { NutritionixService, type FoodItem } from '../api/nutritionixService';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScanSuccess: (food: FoodItem) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Check if BarcodeDetector API is available
  const isBarcodeDetectorSupported = 'BarcodeDetector' in window;

  useEffect(() => {
    if (isBarcodeDetectorSupported && isScanning) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning, isBarcodeDetectorSupported]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        startBarcodeDetection();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const startBarcodeDetection = async () => {
    if (!('BarcodeDetector' in window)) return;

    try {
      // @ts-ignore - BarcodeDetector may not be in TypeScript definitions
      const barcodeDetector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
      });

      // Scan every 500ms
      scanIntervalRef.current = window.setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const barcode = barcodes[0].rawValue;
              handleBarcodeDetected(barcode);
            }
          } catch (err) {
            console.error('Barcode detection error:', err);
          }
        }
      }, 500);
    } catch (err) {
      console.error('BarcodeDetector initialization error:', err);
      setError('Barcode scanner not available on this device.');
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    // Stop scanning and fetching
    stopCamera();
    setIsScanning(false);
    setIsFetching(true);

    try {
      const food = await NutritionixService.searchByBarcode(barcode);

      if (food) {
        const foodItem = NutritionixService.toFoodItem(food);
        toast.success(`Found: ${foodItem.name}`);
        onScanSuccess(foodItem);
      } else {
        toast.error('Food not found for this barcode');
        setError(`No nutrition data found for barcode: ${barcode}`);
      }
    } catch (err) {
      console.error('Error fetching barcode data:', err);
      toast.error('Failed to fetch nutrition data');
      setError('Failed to fetch nutrition data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry) return;

    const barcode = manualEntry.trim();
    setManualEntry('');
    await handleBarcodeDetected(barcode);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl"
        >
          <Card variant="elevated" padding="lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Scan Barcode
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Camera Scanner */}
              {isBarcodeDetectorSupported ? (
                <div>
                  {isScanning ? (
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 border-4 border-primary-600/50 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-success rounded-lg" />
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded-full">
                          Position barcode within the frame
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                      <Button
                        onClick={() => setIsScanning(true)}
                        variant="primary"
                        size="lg"
                        disabled={isFetching}
                      >
                        {isFetching ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Fetching nutrition data...
                          </>
                        ) : (
                          <>
                            <Camera className="w-5 h-5" />
                            Start Camera
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-warning-light dark:bg-warning/20 border border-warning rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Camera scanning not supported
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your browser doesn't support barcode scanning. Please enter the barcode
                        manually below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-error-light dark:bg-error/20 border border-error rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">{error}</p>
                  </div>
                </div>
              )}

              {/* Manual Entry */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Or enter barcode manually:
                </p>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                    placeholder="Enter barcode number (UPC/EAN)"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    disabled={isFetching || isScanning}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={!manualEntry || isFetching || isScanning}
                  >
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </form>
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Tip:</strong> Look for the barcode on the back of packaged foods. Most
                  barcodes are UPC or EAN format.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
