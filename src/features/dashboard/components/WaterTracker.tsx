import { waterTrackingService } from '@/features/nutrition/api/waterTrackingService';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Droplet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WaterTrackerProps {
  userId: string;
  selectedDate: Date;
  onUpdate?: () => void;
}

const QUICK_AMOUNTS = [250, 500, 750, 1000]; // ml

export function WaterTracker({ userId, selectedDate, onUpdate }: WaterTrackerProps) {
  const [totalMl, setTotalMl] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animateWater, setAnimateWater] = useState(false);

  const dailyGoalMl = 2000; // 2L default goal
  const percentage = Math.min((totalMl / dailyGoalMl) * 100, 100);

  useEffect(() => {
    loadDailyTotal();
  }, [userId, selectedDate]);

  const loadDailyTotal = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const result = await waterTrackingService.getDailyTotal(userId, dateStr);
    if (result.success && result.data !== undefined) {
      setTotalMl(result.data);
    }
  };

  const handleAddWater = async (amountMl: number) => {
    setLoading(true);
    setAnimateWater(true);

    const dateStr = selectedDate.toISOString().split('T')[0];
    const result = await waterTrackingService.logWater(userId, amountMl, dateStr);

    if (result.success) {
      setTotalMl((prev) => prev + amountMl);
      if (onUpdate) onUpdate();
    }

    setLoading(false);
    setTimeout(() => setAnimateWater(false), 500);
  };

  const formatLiters = (ml: number) => {
    return (ml / 1000).toFixed(1);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={animateWater ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Droplet className="h-6 w-6 text-blue-500" />
          </motion.div>
          <h3 className="font-semibold text-lg">Water Intake</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {formatLiters(totalMl)}L
          </div>
          <div className="text-xs text-muted-foreground">
            of {formatLiters(dailyGoalMl)}L goal
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {Math.round(percentage)}% complete
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => handleAddWater(amount)}
            disabled={loading}
            className="flex flex-col items-center py-3 h-auto hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <Droplet className="h-4 w-4 mb-1 text-blue-500" />
            <span className="text-xs font-semibold">{amount}ml</span>
          </Button>
        ))}
      </div>

      {/* Achievement Badge */}
      <AnimatePresence>
        {percentage >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <Droplet className="h-5 w-5" />
              <span className="font-semibold">Goal Achieved! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
