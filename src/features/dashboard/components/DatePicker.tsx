/**
 * Premium Date Picker Component - 2026 Modern UI/UX
 * Supports both single date selection and date range selection
 * Uses react-day-picker for calendar UI with premium styling
 */

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { addDays, format, subDays } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
          <Button
            onClick={goToPrevDay}
            variant="accent"
            size="sm"
            className="hover:bg-primary-50 hover:border-primary-500 dark:hover:bg-primary-950/20 transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="group relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-border hover:border-primary-500 rounded-xl transition-all duration-300 flex-1 justify-center hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-base">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </span>
            {isToday && (
              <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md">
                Today
              </span>
            )}
          </button>

          <Button
            onClick={goToNextDay}
            variant="secondary"
            size="sm"
            className="hover:bg-primary-50 hover:border-primary-500 dark:hover:bg-primary-950/20 transition-all duration-300 hover:scale-105"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          <Button
            onClick={goToToday}
            size="sm"
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>

        {showCalendar && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowCalendar(false)}
              />

              {/* Calendar Card */}
              <div className="absolute top-full left-0 right-0 mt-3 z-50">
                <Card className="shadow-2xl border-2 border-border/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <CardContent className="pt-6 pb-6">
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
                        caption: 'flex justify-center pt-1 relative items-center mb-4',
                        caption_label: 'text-base font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent',
                        nav: 'space-x-1 flex items-center',
                        nav_button: 'h-8 w-8 bg-primary-50 dark:bg-primary-950/20 p-0 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-all duration-200',
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex mb-2',
                        head_cell: 'text-muted-foreground rounded-md w-10 font-semibold text-sm uppercase',
                        row: 'flex w-full mt-2',
                        cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                        day: 'h-10 w-10 p-0 font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-all duration-200 hover:scale-110',
                        day_selected: 'bg-gradient-to-br from-primary-500 to-purple-500 text-white hover:from-primary-600 hover:to-purple-600 shadow-lg scale-110 font-bold',
                        day_today: 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold border-2 border-primary-300 dark:border-primary-700',
                        day_outside: 'text-muted-foreground/40 hover:text-muted-foreground/60',
                        day_disabled: 'text-muted-foreground/30 hover:bg-transparent cursor-not-allowed',
                        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                        day_hidden: 'invisible',
                      }}
                    />
                    <div className="flex justify-end mt-6 gap-2">
                      <Button
                        onClick={() => setShowCalendar(false)}
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary-50 hover:border-primary-500 dark:hover:bg-primary-950/20"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          goToToday();
                          setShowCalendar(false);
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white shadow-md"
                      >
                        Go to Today
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
        )}
      </div>
    );
  }

  // Date range mode
  const { startDate, endDate, onRangeChange } = props as DateRangePickerProps;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const quickRanges = [
    { label: 'Last 7 days', days: 7, icon: '📅' },
    { label: 'Last 30 days', days: 30, icon: '📆' },
    { label: 'Last 90 days', days: 90, icon: '🗓️' },
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
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-border hover:border-primary-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">
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
              className="hover:bg-primary-50 hover:border-primary-500 dark:hover:bg-primary-950/20 transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">{range.icon}</span>
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {showCalendar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowCalendar(false)}
          />

          {/* Calendar Card */}
          <div className="absolute top-full left-0 mt-3 z-50">
            <Card className="shadow-2xl border-2 border-border/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="pt-6 pb-6">
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
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-6 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center mb-4',
                    caption_label: 'text-base font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent',
                    nav: 'space-x-1 flex items-center',
                    nav_button: 'h-8 w-8 bg-primary-50 dark:bg-primary-950/20 p-0 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-all duration-200',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex mb-2',
                    head_cell: 'text-muted-foreground rounded-md w-10 font-semibold text-sm uppercase',
                    row: 'flex w-full mt-2',
                    cell: 'text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                    day: 'h-10 w-10 p-0 font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-all duration-200',
                    day_selected: 'bg-gradient-to-br from-primary-500 to-purple-500 text-white hover:from-primary-600 hover:to-purple-600 shadow-md font-bold',
                    day_today: 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold border-2 border-primary-300 dark:border-primary-700',
                    day_outside: 'text-muted-foreground/40 hover:text-muted-foreground/60',
                    day_disabled: 'text-muted-foreground/30 hover:bg-transparent cursor-not-allowed',
                    day_range_middle: 'bg-primary-100 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100',
                    day_range_start: 'rounded-l-lg bg-gradient-to-r from-primary-500 to-primary-500',
                    day_range_end: 'rounded-r-lg bg-gradient-to-r from-purple-500 to-purple-500',
                    day_hidden: 'invisible',
                  }}
                />
                <div className="flex justify-end mt-6 gap-2">
                  <Button
                    onClick={() => setShowCalendar(false)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary-50 hover:border-primary-500 dark:hover:bg-primary-950/20"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
