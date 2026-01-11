/**
 * UserAvatar Component
 * Displays user avatar with optional frame styling
 * Used consistently across the entire app
 */

import { getFrameById } from '@/features/avatars';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  fallback?: string;
  frameId?: string;
  username?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showFrame?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
};

export function UserAvatar({
  src,
  fallback,
  username,
  frameId = 'default',
  size = 'md',
  className = '',
  showFrame = true,
}: UserAvatarProps) {
  const frame = showFrame ? getFrameById(frameId) : null;

  return (
    <div className={cn('relative flex-shrink-0', sizeClasses[size], className)}>
      {/* Avatar Image Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {src ? (
          <img
            src={src}
            alt={username!}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : fallback ? (
          <span className="text-xs font-bold">{fallback}</span>
        ) : (
          <User className={cn(iconSizes[size], 'text-muted-foreground')} />
        )}
      </div>

      {/* Frame Styling */}
      {showFrame && frame && (
        <>
          {/* For frames with gradient borders */}
          {frame.gradient && frame.id !== 'default' && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: frame.gradient,
                border: frame.borderStyle,
                padding: '0px',
                margin: '-5px',
                WebkitMask: 'radial-gradient(circle, transparent calc(70% - 3px), black calc(70% - 3px))',
                mask: 'radial-gradient(circle, transparent calc(70% - 3px), black calc(70% - 3px))',
              }}
            />
          )}

          {/* For default frame with solid border */}
          {frame.id === 'default' && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: '3px solid #10b981', // Emerald green
              }}
            />
          )}

          {/* SVG overlay for complex frames */}
          {frame.svg && frame.id !== 'default' && (
            <div
              className="absolute inset-0 pointer-events-none [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: frame.svg }}
            />
          )}
        </>
      )}
    </div>
  );
}