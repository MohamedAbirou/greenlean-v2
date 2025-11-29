/**
 * Notifications Tab - Email & Push Notification Preferences
 */

import { Bell, Mail } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';

export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage email preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Progress Report</Label>
              <p className="text-sm text-muted-foreground">
                Get a summary of your progress every week
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label>New Features & Updates</Label>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label>Tips & Recommendations</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center">
            <Bell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage in-app notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Meal Reminders</Label>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label>Workout Reminders</Label>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label>Achievement Unlocked</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
}
