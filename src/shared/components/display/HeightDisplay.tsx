/**
 * Height Display Component
 * Automatically converts and displays height in user's preferred unit system
 * ALWAYS pass height in cm (database format)
 */

import { formatHeight } from '@/services/unitConversion';
import { useUnitSystem } from '@/shared/hooks/useUnitSystem';

interface HeightDisplayProps {
  valueCm: number | null | undefined;
  showUnit?: boolean;
  className?: string;
}

export function HeightDisplay({
  valueCm,
  showUnit = true,
  className
}: HeightDisplayProps) {
  const unitSystem = useUnitSystem();

  if (valueCm === null || valueCm === undefined) {
    return <span className={className}>--</span>;
  }

  const formatted = formatHeight(valueCm, unitSystem);

  return (
    <span className={className}>
      {formatted.display}
    </span>
  );
}
