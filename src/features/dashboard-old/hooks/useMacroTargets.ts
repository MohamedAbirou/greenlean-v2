/**
 * useMacroTargets Hook
 * Fetches user's current macro targets from database
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MacroTargets {
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  daily_water_ml: number;
  effective_date: string;
}

export function useMacroTargets(userId: string | undefined) {
  const [targets, setTargets] = useState<MacroTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTargets = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_macro_targets')
          .select('*')
          .eq('user_id', userId)
          .order('effective_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        setTargets(data);
      } catch (err: any) {
        console.error('Error fetching macro targets:', err);
        setError(err.message);

        // Fallback to defaults if not found
        setTargets({
          daily_calories: 2000,
          daily_protein_g: 150,
          daily_carbs_g: 200,
          daily_fats_g: 67,
          daily_water_ml: 2000,
          effective_date: new Date().toISOString().split('T')[0],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [userId]);

  return { targets, loading, error };
}
