import { progressTrackingService } from '@/features/progress/api/progressTrackingService';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Save, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface BodyMeasurementModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BodyMeasurementModal({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: BodyMeasurementModalProps) {
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    waist_cm: '',
    hips_cm: '',
    notes: '',
  });

  const handleSubmit = async () => {
    // Validation
    if (!measurements.weight_kg) {
      alert('Please enter your weight');
      return;
    }

    setLoading(true);
    try {
      const result = await progressTrackingService.logBodyMeasurement({
        user_id: userId,
        measurement_date: new Date().toISOString().split('T')[0],
        weight_kg: parseFloat(measurements.weight_kg),
        body_fat_percentage: measurements.body_fat_percentage
          ? parseFloat(measurements.body_fat_percentage)
          : null,
        waist_cm: measurements.waist_cm ? parseFloat(measurements.waist_cm) : null,
        hips_cm: measurements.hips_cm ? parseFloat(measurements.hips_cm) : null,
        notes: measurements.notes || null,
      });

      if (result.success) {
        // Reset form
        setMeasurements({
          weight_kg: '',
          body_fat_percentage: '',
          waist_cm: '',
          hips_cm: '',
          notes: '',
        });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        alert('Failed to log measurements');
      }
    } catch (error) {
      console.error('Failed to log measurements:', error);
      alert('Failed to log measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="fixed inset-4 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Activity className="h-6 w-6 mr-2" />
                    Log Measurements
                  </h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Weight */}
                  <div>
                    <Label htmlFor="weight" className="flex items-center">
                      Weight (kg) <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={measurements.weight_kg}
                      onChange={(e) => handleChange('weight_kg', e.target.value)}
                      placeholder="70.5"
                      required
                    />
                  </div>

                  {/* Body Fat % */}
                  <div>
                    <Label htmlFor="bodyfat">Body Fat (%)</Label>
                    <Input
                      id="bodyfat"
                      type="number"
                      step="0.1"
                      value={measurements.body_fat_percentage}
                      onChange={(e) => handleChange('body_fat_percentage', e.target.value)}
                      placeholder="15.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Optional</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Waist */}
                    <div>
                      <Label htmlFor="waist">Waist (cm)</Label>
                      <Input
                        id="waist"
                        type="number"
                        step="0.1"
                        value={measurements.waist_cm}
                        onChange={(e) => handleChange('waist_cm', e.target.value)}
                        placeholder="75"
                      />
                    </div>

                    {/* Hips */}
                    <div>
                      <Label htmlFor="hips">Hips (cm)</Label>
                      <Input
                        id="hips"
                        type="number"
                        step="0.1"
                        value={measurements.hips_cm}
                        onChange={(e) => handleChange('hips_cm', e.target.value)}
                        placeholder="95"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={measurements.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="How are you feeling today?"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Measurements'}
                  </Button>
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Track your measurements regularly to see trends and progress over time.
                      Weight is required, all other fields are optional.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
