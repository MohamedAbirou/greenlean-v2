/**
 * Dashboard Utility Functions
 * Helper functions for data processing, formatting, and calculations
 */

import type { DateRange } from '../types';

// ========== DATE UTILITIES ==========

export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export function getDateDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getWeekStart(date?: Date): string {
  const d = date || new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getWeekEnd(date?: Date): string {
  const weekStart = getWeekStart(date);
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

export function getMonthStart(date?: Date): string {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

export function getMonthEnd(date?: Date): string {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
}

export function getDateRange(preset: DateRange['preset']): { startDate: string; endDate: string } {
  const today = getToday();

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'week':
      return { startDate: getWeekStart(), endDate: getWeekEnd() };
    case 'month':
      return { startDate: getMonthStart(), endDate: getMonthEnd() };
    case '3months':
      return { startDate: getDateDaysAgo(90), endDate: today };
    case '6months':
      return { startDate: getDateDaysAgo(180), endDate: today };
    case 'year':
      return { startDate: getDateDaysAgo(365), endDate: today };
    default:
      return { startDate: getWeekStart(), endDate: getWeekEnd() };
  }
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDateArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  while (start <= end) {
    dates.push(start.toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }

  return dates;
}

// ========== NUTRITION CALCULATIONS ==========

export function calculateMacroPercentages(protein: number, carbs: number, fats: number) {
  const totalCalories = protein * 4 + carbs * 4 + fats * 9;

  if (totalCalories === 0) {
    return { proteinPct: 0, carbsPct: 0, fatsPct: 0 };
  }

  return {
    proteinPct: Math.round(((protein * 4) / totalCalories) * 100),
    carbsPct: Math.round(((carbs * 4) / totalCalories) * 100),
    fatsPct: Math.round(((fats * 9) / totalCalories) * 100),
  };
}

export function calculateCaloriesFromMacros(protein: number, carbs: number, fats: number): number {
  return Math.round(protein * 4 + carbs * 4 + fats * 9);
}

export function calculateMacrosFromCalories(
  calories: number,
  proteinPct: number,
  carbsPct: number,
  fatsPct: number
) {
  return {
    protein: Math.round((calories * (proteinPct / 100)) / 4),
    carbs: Math.round((calories * (carbsPct / 100)) / 4),
    fats: Math.round((calories * (fatsPct / 100)) / 9),
  };
}

export function calculateMacroProgress(
  current: number,
  goal: number
): {
  percentage: number;
  remaining: number;
  status: 'under' | 'perfect' | 'over';
} {
  const percentage = Math.round((current / goal) * 100);
  const remaining = Math.max(0, goal - current);

  let status: 'under' | 'perfect' | 'over' = 'under';
  if (percentage >= 95 && percentage <= 105) {
    status = 'perfect';
  } else if (percentage > 105) {
    status = 'over';
  }

  return { percentage, remaining, status };
}

// ========== WORKOUT CALCULATIONS ==========

export function calculateTotalVolume(sets: { weight_kg?: number; reps: number }[]): number {
  return sets.reduce((sum, set) => sum + (set.weight_kg || 0) * set.reps, 0);
}

export function calculateOneRepMax(weight: number, reps: number): number {
  // Epley formula
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function estimateCaloriesBurned(
  activityType: 'strength' | 'cardio' | 'mixed',
  durationMinutes: number,
  userWeight: number = 70 // Default 70kg
): number {
  // METs (Metabolic Equivalent of Task)
  const mets = {
    strength: 6.0, // Resistance training
    cardio: 7.0, // Moderate cardio
    mixed: 6.5, // Mixed training
  };

  const met = mets[activityType];
  // Calories = MET × weight (kg) × time (hours)
  return Math.round(met * userWeight * (durationMinutes / 60));
}

export function categorizeRPE(rpe: number): {
  label: string;
  color: string;
} {
  if (rpe >= 9) return { label: 'Max Effort', color: 'red' };
  if (rpe >= 7) return { label: 'Hard', color: 'orange' };
  if (rpe >= 5) return { label: 'Moderate', color: 'yellow' };
  return { label: 'Light', color: 'green' };
}

// ========== DATA FORMATTING FOR CHARTS ==========

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export function formatChartData(
  data: { date: string; value: number }[],
  fillMissingDates = false,
  startDate?: string,
  endDate?: string
): ChartDataPoint[] {
  if (!fillMissingDates || !startDate || !endDate) {
    return data.map(d => ({
      date: formatDate(d.date, 'short'),
      value: d.value,
    }));
  }

  const dateArray = getDateArray(startDate, endDate);
  const dataMap = new Map(data.map(d => [d.date, d.value]));

  return dateArray.map(date => ({
    date: formatDate(date, 'short'),
    value: dataMap.get(date) || 0,
  }));
}

export function aggregateByWeek(
  data: { date: string; value: number }[]
): ChartDataPoint[] {
  const weekMap = new Map<string, number[]>();

  data.forEach(item => {
    const weekStart = getWeekStart(new Date(item.date));
    if (!weekMap.has(weekStart)) {
      weekMap.set(weekStart, []);
    }
    weekMap.get(weekStart)!.push(item.value);
  });

  return Array.from(weekMap.entries()).map(([week, values]) => ({
    date: formatDate(week, 'short'),
    value: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
  }));
}

export function aggregateByMonth(
  data: { date: string; value: number }[]
): ChartDataPoint[] {
  const monthMap = new Map<string, number[]>();

  data.forEach(item => {
    const monthStart = getMonthStart(new Date(item.date));
    if (!monthMap.has(monthStart)) {
      monthMap.set(monthStart, []);
    }
    monthMap.get(monthStart)!.push(item.value);
  });

  return Array.from(monthMap.entries()).map(([month, values]) => ({
    date: formatDate(month, 'short'),
    value: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
  }));
}

// ========== PROGRESS CALCULATIONS ==========

export function calculateWeightChange(
  startWeight: number,
  currentWeight: number
): {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} {
  const change = currentWeight - startWeight;
  const percentage = Math.round((change / startWeight) * 100 * 10) / 10;

  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(change) < 0.1) {
    direction = 'stable';
  } else if (change > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  return { change: Math.round(change * 10) / 10, percentage, direction };
}

export function calculateGoalProgress(
  startValue: number,
  currentValue: number,
  targetValue: number
): {
  percentage: number;
  remaining: number;
  onTrack: boolean;
} {
  const totalChange = targetValue - startValue;
  const currentChange = currentValue - startValue;
  const percentage = Math.round((currentChange / totalChange) * 100);
  const remaining = targetValue - currentValue;

  return {
    percentage: Math.max(0, Math.min(100, percentage)),
    remaining: Math.abs(remaining),
    onTrack: percentage > 0 && percentage <= 100,
  };
}

// ========== STRING UTILITIES ==========

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatMealType(mealType: string): string {
  const formatted = mealType.replace(/_/g, ' ');
  return capitalizeFirst(formatted);
}

export function formatExerciseName(name: string): string {
  return name
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// ========== VALIDATION ==========

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isToday(dateString: string): boolean {
  return dateString === getToday();
}

export function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date();
}

export function isValidMacros(protein: number, carbs: number, fats: number): boolean {
  return protein >= 0 && carbs >= 0 && fats >= 0;
}

// ========== SORTING & FILTERING ==========

export function sortByDate<T extends { date: string }>(
  data: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

export function groupByDate<T extends { date: string }>(
  data: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  data.forEach(item => {
    const date = item.date;
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(item);
  });

  return grouped;
}

// ========== NUMBER FORMATTING ==========

export function formatNumber(num: number, decimals = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${formatNumber(kg * 2.20462, 1)} lbs`;
  }
  return `${formatNumber(kg, 1)} kg`;
}

export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    return `${formatNumber(meters / 1609.34, 2)} mi`;
  }
  return `${formatNumber(meters / 1000, 2)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ========== COLOR UTILITIES ==========

export function getProgressColor(percentage: number): string {
  if (percentage < 50) return '#ef4444'; // red
  if (percentage < 75) return '#f59e0b'; // orange
  if (percentage < 95) return '#eab308'; // yellow
  if (percentage <= 105) return '#22c55e'; // green
  return '#3b82f6'; // blue (over goal)
}

export function getMacroColor(macroType: 'protein' | 'carbs' | 'fats'): string {
  const colors = {
    protein: '#3b82f6', // blue
    carbs: '#22c55e', // green
    fats: '#f59e0b', // orange
  };
  return colors[macroType];
}

// ========== LOCAL STORAGE ==========

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}
