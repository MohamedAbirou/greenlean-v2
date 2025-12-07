/**
 * Weight Display Component
 * Automatically converts and displays weight in user's preferred unit system
 * ALWAYS pass weight in kg (database format)
 */

import { formatWeight } from '@/services/unitConversion';
import { useUnitSystem } from '@/shared/hooks/useUnitSystem';

interface WeightDisplayProps {
  valueKg: number | null | undefined;
  showUnit?: boolean;
  decimals?: number;
  className?: string;
}

export function WeightDisplay({
  valueKg,
  showUnit = true,
  decimals = 1,
  className
}: WeightDisplayProps) {
  const unitSystem = useUnitSystem();

  if (valueKg === null || valueKg === undefined) {
    return <span className={className}>--</span>;
  }

  const formatted = formatWeight(valueKg, unitSystem);
  const value = decimals === 0
    ? Math.round(formatted.value)
    : formatted.value.toFixed(decimals);

  return (
    <span className={className}>
      {value}{showUnit && ` ${formatted.unit}`}
    </span>
  );
}
