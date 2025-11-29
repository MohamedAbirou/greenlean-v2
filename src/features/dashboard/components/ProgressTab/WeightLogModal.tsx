/**
 * WeightLogModal Component
 * Quick weight entry modal for Progress tab
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/design-system';

interface WeightLogModalProps {
  currentWeight?: number;
  onLogWeight: (weight: number, notes?: string) => Promise<void>;
}

export function WeightLogModal({ currentWeight, onLogWeight }: WeightLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState(currentWeight?.toString() || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    setLoading(true);
    try {
      await onLogWeight(weightNum, notes || undefined);
      setIsOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Failed to log weight:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Log Weight
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  'relative w-full max-w-md',
                  'bg-white dark:bg-gray-900',
                  'rounded-2xl shadow-2xl',
                  'border border-gray-200 dark:border-gray-800'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Log Weight
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Track your progress
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Weight Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g., 75.5"
                      required
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-gray-50 dark:bg-gray-800',
                        'border border-gray-200 dark:border-gray-700',
                        'text-gray-900 dark:text-gray-100',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600',
                        'transition-all'
                      )}
                    />
                    {currentWeight && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Current: {currentWeight.toFixed(1)} kg
                      </p>
                    )}
                  </div>

                  {/* Notes Input (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How are you feeling?"
                      rows={3}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-gray-50 dark:bg-gray-800',
                        'border border-gray-200 dark:border-gray-700',
                        'text-gray-900 dark:text-gray-100',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600',
                        'transition-all resize-none'
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={loading || !weight || parseFloat(weight) <= 0}
                    >
                      {loading ? 'Logging...' : 'Log Weight'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
