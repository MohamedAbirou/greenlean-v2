/**
 * FramedAvatar Component
 * Avatar with unlockable decorative frames
 */

import { getFrameById } from '../constants/avatarFrames';

interface FramedAvatarProps {
  src?: string;
  fallback?: string;
  frameId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function FramedAvatar({
  src,
  fallback = '👤',
  frameId = 'default',
  size = 'md',
  className = '',
}: FramedAvatarProps) {
  const frame = getFrameById(frameId);

  if (!frame) {
    // Fallback to default
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-muted flex items-center justify-center`}>
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{fallback}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Avatar Image */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{fallback}</span>
        )}
      </div>

      {/* Frame Overlay */}
      {frame.id !== 'default' && frame.svg && (
        <div
          className="absolute inset-0 pointer-events-none"
          dangerouslySetInnerHTML={{ __html: frame.svg }}
        />
      )}

      {/* Simple Border for Default */}
      {frame.id === 'default' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: frame.borderStyle,
          }}
        />
      )}

      {/* Gradient Border */}
      {frame.gradient && frame.id !== 'default' && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: frame.gradient,
            WebkitMask: 'radial-gradient(circle, transparent 46%, black 48%)',
            mask: 'radial-gradient(circle, transparent 46%, black 48%)',
          }}
        />
      )}
    </div>
  );
}
