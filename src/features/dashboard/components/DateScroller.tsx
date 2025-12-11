/**
 * Horizontal Date Scroller
 * MyFitnessPal-style date navigation
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface DateScrollerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateScroller({ selectedDate, onDateChange }: DateScrollerProps) {
  const currentDate = new Date(selectedDate);

  const getDates = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();

  const formatDay = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const goToPrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <Button onClick={goToPrevDay} variant="ghost" size="icon">
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 justify-center">
          {dates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const selected = isSelected(date);
            const today = isToday(date);

            return (
              <button
                key={index}
                onClick={() => onDateChange(dateStr)}
                className={`flex flex-col items-center justify-center min-w-[60px] h-[70px] rounded-xl transition-all ${
                  selected
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : today
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-2 border-primary-500'
                    : 'bg-card hover:bg-muted border border-border'
                }`}
              >
                <span className="text-xs font-medium opacity-75">{formatDay(date)}</span>
                <span className="text-2xl font-bold">{formatDate(date)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={goToNextDay} variant="ghost" size="icon">
        <ChevronRight className="h-5 w-5" />
      </Button>

      <Button onClick={goToToday} variant="outline" size="sm">
        Today
      </Button>
    </div>
  );
}
