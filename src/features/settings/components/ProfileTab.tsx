/**
 * Profile Tab - Personal Information & Stats
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { AvatarUploader } from '@/shared/components/AvatarUploader';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ArrowRight, Ruler, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ProfileTab() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    height: profile?.height || 0,
    weight: profile?.weight || 0,
    target_weight: profile?.target_weight || 0,
  });

  // Initialize unit system from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        height: profile.height || 0,
        weight: profile.weight || 0,
        target_weight: profile.target_weight || 0,
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
          height: formData.height || null,
          weight: formData.weight || null,
          target_weight: formData.target_weight || null,
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
    <div className='space-y-6'>
      {/* Complete Profile CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 border-2 border-primary/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                Unlock Premium Personalization
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete your full profile to get maximum personalization, health adaptations, and tailored plans. Unlock PREMIUM tier instantly!
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => navigate('/settings/complete-profile')}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white border-0 flex-shrink-0"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      <AvatarUploader />

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
            {/* Height */}
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="1"
                min="120"
                max="250"
                placeholder="175"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: +e.target.value })}
              />
            </div>

            {/* Current Weight */}
            <div>
              <Label htmlFor="weight">Current Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min={'50'}
                max={'250'}
                placeholder={'70'}
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: +e.target.value })}
              />
            </div>

            {/* Target Weight */}
            <div>
              <Label htmlFor="target_weight">Target Weight</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                min={'50'}
                max={'250'}
                placeholder={'65'}
                value={formData.target_weight}
                onChange={(e) => setFormData({ ...formData, target_weight: +e.target.value })}
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
    </div>
  );
}
