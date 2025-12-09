import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Save, Edit3, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DailyNotesProps {
  userId: string;
  selectedDate: Date;
}

export function DailyNotes({ userId, selectedDate }: DailyNotesProps) {
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [userId, selectedDate]);

  const loadNotes = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_journey_timeline')
        .select('description')
        .eq('user_id', userId)
        .eq('event_date', dateStr)
        .eq('event_type', 'note')
        .maybeSingle();

      if (!error && data) {
        setNotes(data.description || '');
        setSavedNotes(data.description || '');
      } else {
        setNotes('');
        setSavedNotes('');
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleSave = async () => {
    if (notes.trim() === '') return;

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { error } = await supabase.from('user_journey_timeline').upsert(
        {
          user_id: userId,
          event_date: dateStr,
          event_type: 'note',
          title: 'Daily Journal',
          description: notes,
        },
        {
          onConflict: 'user_id,event_date,event_type',
        }
      );

      if (!error) {
        setSavedNotes(notes);
        setIsEditing(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = notes !== savedNotes;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Daily Journal</h3>
        </div>
        {!isEditing && savedNotes && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {!isEditing && !savedNotes ? (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full p-8 border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Click to add notes for this day</p>
          <p className="text-xs mt-1">Track your thoughts, feelings, or any observations</p>
        </button>
      ) : !isEditing ? (
        <div className="prose dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-sm">{savedNotes}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today? Any wins? Challenges? Observations?"
            rows={6}
            className="resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {notes.length > 0 ? `${notes.length} characters` : 'Start writing...'}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNotes(savedNotes);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading || !hasChanges || notes.trim() === ''}
              >
                <AnimatePresence mode="wait">
                  {isSaved ? (
                    <motion.div
                      key="saved"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Saved
                    </motion.div>
                  ) : (
                    <motion.div key="save" className="flex items-center">
                      <Save className="h-4 w-4 mr-1" />
                      {loading ? 'Saving...' : 'Save'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
