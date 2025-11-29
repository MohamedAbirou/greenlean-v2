/**
 * Preferences Tab - Dietary & Workout Preferences
 */

import { Utensils, Dumbbell } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Dietary Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Manage via micro-surveys as you use the app
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your dietary preferences are collected through contextual questions while you use
          GreenLean. This ensures we only ask relevant questions when needed.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Workout Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Manage via micro-surveys as you use the app
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your workout preferences are collected through contextual questions while you use
          GreenLean. This ensures optimal personalization.
        </p>
      </Card>
    </div>
  );
}
