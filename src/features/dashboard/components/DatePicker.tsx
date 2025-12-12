/**
 * Flexible Date Picker Component
 * Supports both single date selection and date range selection
 * Uses react-day-picker for calendar UI
 */

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { addDays, format, subDays } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  mode?: 'single';
}

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  mode: 'range';
}

type Props = DatePickerProps | DateRangePickerProps;

export function DatePicker(props: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const mode = props.mode || 'single';

  // Single date mode
  if (mode === 'single') {
    const { selectedDate, onDateChange } = props as DatePickerProps;
    const currentDate = new Date(selectedDate);

    const goToPrevDay = () => {
      const newDate = subDays(currentDate, 1);
      onDateChange(format(newDate, 'yyyy-MM-dd'));
    };

    const goToNextDay = () => {
      const newDate = addDays(currentDate, 1);
      onDateChange(format(newDate, 'yyyy-MM-dd'));
    };

    const goToToday = () => {
      onDateChange(format(new Date(), 'yyyy-MM-dd'));
    };

    const isToday = format(new Date(), 'yyyy-MM-dd') === selectedDate;

    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          <Button onClick={goToPrevDay} variant="outline" size="sm">
            ← Prev
          </Button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors flex-1 justify-center"
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </span>
            {isToday && (
              <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full">
                Today
              </span>
            )}
          </button>

          <Button onClick={goToNextDay} variant="outline" size="sm">
            Next →
          </Button>

          <Button onClick={goToToday} variant="default" size="sm">
            Today
          </Button>
        </div>

        {showCalendar && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <Card className="shadow-xl">
              <CardContent className="pt-6">
                <DayPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) {
                      onDateChange(format(date, 'yyyy-MM-dd'));
                      setShowCalendar(false);
                    }
                  }}
                  className="mx-auto"
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md',
                    day_selected: 'bg-primary-500 text-primary-foreground hover:bg-primary-500 hover:text-primary-foreground focus:bg-primary-500 focus:text-primary-foreground',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    day_hidden: 'invisible',
                  }}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => setShowCalendar(false)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Date range mode
  const { startDate, endDate, onRangeChange } = props as DateRangePickerProps;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const quickRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const applyQuickRange = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    onRangeChange(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Calendar className="h-4 w-4" />
          <span className="font-medium">
            {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
          </span>
        </button>

        <div className="flex gap-2">
          {quickRanges.map((range) => (
            <Button
              key={range.days}
              onClick={() => applyQuickRange(range.days)}
              variant="outline"
              size="sm"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {showCalendar && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <DayPicker
                mode="range"
                selected={{ from: start, to: end }}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from && range?.to) {
                    onRangeChange(
                      format(range.from, 'yyyy-MM-dd'),
                      format(range.to, 'yyyy-MM-dd')
                    );
                  }
                }}
                numberOfMonths={2}
                className="mx-auto"
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md',
                  day_selected: 'bg-primary-500 text-primary-foreground hover:bg-primary-500 hover:text-primary-foreground focus:bg-primary-500 focus:text-primary-foreground',
                  day_today: 'bg-accent text-accent-foreground',
                  day_outside: 'text-muted-foreground opacity-50',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                  day_range_start: 'rounded-l-md',
                  day_range_end: 'rounded-r-md',
                }}
              />
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => setShowCalendar(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
