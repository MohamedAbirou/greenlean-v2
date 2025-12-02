/**
 * Avatar Frame Definitions
 * Unlockable frames for user avatars
 */

export interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  isUnlockable: boolean;
  rewardValue?: string;
  svg: string; // SVG path or frame style
  gradient?: string;
  borderStyle: string;
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic clean border',
    isUnlockable: false,
    svg: '',
    borderStyle: '4px solid #10b981',
  },
  {
    id: 'gold_elite',
    name: 'Gold Elite',
    description: 'Luxurious gold frame for champions',
    isUnlockable: true,
    rewardValue: 'avatar_frame_gold',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    borderStyle: '6px solid transparent',
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="url(#gold-gradient)" stroke-width="4"/>
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
      </svg>
    `,
  },
  {
    id: 'diamond_pro',
    name: 'Diamond Pro',
    description: 'Sparkling diamond frame',
    isUnlockable: true,
    rewardValue: 'avatar_frame_diamond',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    borderStyle: '6px solid transparent',
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="url(#diamond-gradient)" stroke-width="4" stroke-dasharray="4 2"/>
        <circle cx="50" cy="50" r="46" stroke="url(#diamond-gradient-2)" stroke-width="2"/>
        <defs>
          <linearGradient id="diamond-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa"/>
            <stop offset="100%" stop-color="#3b82f6"/>
          </linearGradient>
          <linearGradient id="diamond-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#93c5fd"/>
            <stop offset="50%" stop-color="#60a5fa"/>
            <stop offset="100%" stop-color="#93c5fd"/>
          </linearGradient>
        </defs>
      </svg>
    `,
  },
  {
    id: 'platinum_master',
    name: 'Platinum Master',
    description: 'Sleek platinum frame for masters',
    isUnlockable: true,
    rewardValue: 'avatar_frame_platinum',
    gradient: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
    borderStyle: '6px solid transparent',
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="url(#platinum-gradient)" stroke-width="5"/>
        <defs>
          <linearGradient id="platinum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f3f4f6"/>
            <stop offset="50%" stop-color="#9ca3af"/>
            <stop offset="100%" stop-color="#f3f4f6"/>
          </linearGradient>
        </defs>
      </svg>
    `,
  },
  {
    id: 'fire_streak',
    name: 'Fire Streak',
    description: 'Blazing frame for streak champions',
    isUnlockable: true,
    rewardValue: 'avatar_frame_fire',
    gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    borderStyle: '6px solid transparent',
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="url(#fire-gradient)" stroke-width="4"/>
        <circle cx="50" cy="50" r="44" stroke="url(#fire-gradient-inner)" stroke-width="2" opacity="0.6"/>
        <defs>
          <linearGradient id="fire-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="50%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#dc2626"/>
          </linearGradient>
          <linearGradient id="fire-gradient-inner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
        </defs>
      </svg>
    `,
  },
  {
    id: 'champion_crown',
    name: 'Champion Crown',
    description: 'Ultimate champion frame with crown',
    isUnlockable: true,
    rewardValue: 'avatar_frame_champion',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    borderStyle: '6px solid transparent',
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="url(#champion-gradient)" stroke-width="6"/>
        <path d="M50 10 L55 20 L65 22 L57 30 L59 40 L50 35 L41 40 L43 30 L35 22 L45 20 Z"
              fill="url(#champion-star)" stroke="url(#champion-gradient)" stroke-width="1"/>
        <defs>
          <linearGradient id="champion-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
          <linearGradient id="champion-star" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef3c7"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
        </defs>
      </svg>
    `,
  },
];

export function getFrameById(id: string): AvatarFrame | undefined {
  return AVATAR_FRAMES.find(frame => frame.id === id);
}

export function getFrameByRewardValue(rewardValue: string): AvatarFrame | undefined {
  return AVATAR_FRAMES.find(frame => frame.rewardValue === rewardValue);
}

export function getUnlockableFrames(): AvatarFrame[] {
  return AVATAR_FRAMES.filter(frame => frame.isUnlockable);
}
