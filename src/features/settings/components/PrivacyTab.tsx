/**
 * Privacy Tab - Data & Privacy Settings
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Download, Shield } from 'lucide-react';

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground">Control your data and privacy</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <Label>Activity Tracking</Label>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <Label>Analytics & Performance</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center">
            <Download className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Data Export</h3>
            <p className="text-sm text-muted-foreground">Download your data</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Request a copy of all your data including meal plans, workout logs, and progress history.
        </p>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Request Data Export
        </Button>
      </Card>
    </div>
  );
}
