/**
 * Macro Ring - Circular Progress
 * MyFitnessPal-style macro visualization
 */

interface MacroRingProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function MacroRing({ current, goal, size = 120, strokeWidth = 8, color = '#3b82f6' }: MacroRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((current / goal) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(current)}</span>
        <span className="text-xs text-muted-foreground">/ {Math.round(goal)}</span>
      </div>
    </div>
  );
}
