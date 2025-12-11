/**
 * Progress Tab
 * Track weight and progress over time
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useWeightHistory } from '../hooks/useDashboardData';
import { useAddWeightEntry, useDeleteWeightEntry } from '../hooks/useDashboardMutations';
import { useAuth } from '@/features/auth/context/AuthContext';

const getToday = () => new Date().toISOString().split('T')[0];
const get30DaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

export function ProgressTab() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(get30DaysAgo());
  const [endDate, setEndDate] = useState(getToday());
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(getToday());

  const { data, loading, refetch } = useWeightHistory(startDate, endDate);
  const [addWeightEntry] = useAddWeightEntry();
  const [deleteWeightEntry] = useDeleteWeightEntry();

  const weightEntries = data?.weight_historyCollection?.edges?.map((e) => e.node) || [];

  const handleAddWeight = async () => {
    if (!newWeight || !user?.id) return;

    await addWeightEntry({
      variables: {
        input: {
          user_id: user.id,
          weight_kg: parseFloat(newWeight),
          log_date: newWeightDate,
        },
      },
    });

    setNewWeight('');
    refetch();
  };

  const handleDeleteWeight = async (id: string) => {
    if (confirm('Delete this weight entry?')) {
      await deleteWeightEntry({ variables: { id } });
      refetch();
    }
  };

  const calculateWeightChange = () => {
    if (weightEntries.length < 2) return null;
    const oldest = weightEntries[weightEntries.length - 1];
    const newest = weightEntries[0];
    const change = newest.weight_kg - oldest.weight_kg;
    return {
      amount: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  };

  const weightChange = calculateWeightChange();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress</h2>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Change Summary */}
      {weightChange && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold">
                {weightChange.direction === 'up' && '↗️'}
                {weightChange.direction === 'down' && '↘️'}
                {weightChange.direction === 'stable' && '➡️'}
                {' ' + weightChange.amount} kg
              </p>
              <p className="text-muted-foreground mt-2">
                {weightChange.direction === 'up' && 'Weight increased'}
                {weightChange.direction === 'down' && 'Weight decreased'}
                {weightChange.direction === 'stable' && 'Weight stable'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Weight Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Log Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Date</label>
              <input
                type="date"
                value={newWeightDate}
                onChange={(e) => setNewWeightDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="70.5"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddWeight} variant="primary" fullWidth>
                Add Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {weightEntries.length > 0 ? (
            <div className="space-y-2">
              {weightEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{entry.log_date}</p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold">{entry.weight_kg} kg</p>
                    <Button
                      onClick={() => handleDeleteWeight(entry.id)}
                      variant="ghost"
                      size="sm"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No weight entries for this period
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
