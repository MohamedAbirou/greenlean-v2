/**
 * Profile Tab - Personal Information & Stats
 */

import { useState, useEffect } from 'react';
import { User, Ruler, Scale, Target, Calendar } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';

export function ProfileTab() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.weight_kg || '',
    target_weight_kg: profile?.target_weight_kg || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        height_cm: profile.height_cm || '',
        weight_kg: profile.weight_kg || '',
        target_weight_kg: profile.target_weight_kg || '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age as string) || null,
          gender: formData.gender,
          height_cm: parseFloat(formData.height_cm as string) || null,
          weight_kg: parseFloat(formData.weight_kg as string) || null,
          target_weight_kg: parseFloat(formData.target_weight_kg as string) || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">Your personal details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Physical Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center">
            <Ruler className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Physical Measurements</h3>
            <p className="text-sm text-muted-foreground">Track your body metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="height_cm">Height (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              step="0.1"
              placeholder="175"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="weight_kg">Current Weight (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              placeholder="75"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="target_weight_kg">Target Weight (kg)</Label>
            <Input
              id="target_weight_kg"
              type="number"
              step="0.1"
              placeholder="70"
              value={formData.target_weight_kg}
              onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
