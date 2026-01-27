interface MacroRingProps {
  current: number
  goal: number
  size?: number
  strokeWidth?: number
  color?: string
  gradientId?: string
  gradientStops?: { offset: string; color: string }[]
  showPercentage?: boolean
}

export function MacroRing({
  current,
  goal,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  gradientId,
  gradientStops,
  showPercentage = false,
}: MacroRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((current / goal) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {gradientStops && gradientId && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientStops.map((stop) => (
                <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
        )}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/10"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientId ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 drop-shadow-lg"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">
          {showPercentage ? `${Math.round(percentage)}%` : Math.round(current)}
        </span>
      </div>
    </div>
  )
}
