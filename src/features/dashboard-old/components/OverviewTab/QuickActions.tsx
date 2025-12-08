/**
 * QuickActions Component
 * Quick action buttons for common tasks
 * Uses design system variants
 */

import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickActionProps[];
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}: QuickActionProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative overflow-hidden rounded-xl p-6 text-left transition-all',
        'bg-card',
        'border border-border',
        'hover:border-primary',
        'hover:shadow-lg'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            color
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold mb-1 text-foreground">
            {title}
          </div>
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 ml-auto flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors" />
      </div>
    </motion.button>
  );
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <QuickActionCard key={`${action.title}-${index}`} {...action} />
      ))}
    </div>
  );
}
