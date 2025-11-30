/**
 * CreateTemplateModal Component
 * Modal for creating new meal templates
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useMealTemplates } from '../../hooks/useMealTemplates';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTemplateModal({ isOpen, onClose }: CreateTemplateModalProps) {
  const { createTemplate, isCreating } = useMealTemplates();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // For now, create empty template - in production you'd add foods from current meal
    await createTemplate(
      name,
      description,
      [], // foods would come from current meal being logged
      mealType
    );

    // Reset form
    setName('');
    setDescription('');
    setMealType('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Meal Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Breakfast Bowl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about this meal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                  <SelectItem value="lunch">🥗 Lunch</SelectItem>
                  <SelectItem value="dinner">🍽️ Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-3">
              <p className="text-sm text-info-800 dark:text-info-200">
                💡 <strong>Tip:</strong> In production, this would save your current meal as a template for quick logging later!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              {isCreating ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
