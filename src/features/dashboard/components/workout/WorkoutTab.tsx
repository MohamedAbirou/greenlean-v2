/**
 * Workout Tab - Smart Workout Logging
 * Complete workout logging with exercise tracking
 */

import React, { useState } from 'react';
import { useWorkoutSessionsByDate, useCreateWorkoutSession, useActiveWorkoutPlan } from '../../hooks/useWorkout';
import { LoadingState } from '../shared/LoadingState';
import { getToday, formatNumber } from '../../utils';

export function WorkoutTab() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showLogModal, setShowLogModal] = useState(false);

  const { data: workoutSessions, isLoading } = useWorkoutSessionsByDate(selectedDate);
  const { data: activeWorkoutPlan } = useActiveWorkoutPlan();
  const createWorkoutSession = useCreateWorkoutSession();

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workouts</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Log Workout</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => setShowLogModal(true)} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            ✏️ Manual
          </button>
          <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            🎤 Voice
          </button>
          <button disabled={!activeWorkoutPlan} className="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium disabled:opacity-50">
            🤖 AI Plan
          </button>
          <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            📋 Template
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Today's Workouts</h3>
        {workoutSessions && workoutSessions.length > 0 ? (
          <div className="space-y-4">
            {workoutSessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{session.workout_name}</h4>
                    <p className="text-sm text-gray-500">{session.workout_type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    session.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{session.total_exercises}</p>
                    <p className="text-xs text-gray-500">Exercises</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{session.total_sets}</p>
                    <p className="text-xs text-gray-500">Sets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(session.total_volume_kg)}</p>
                    <p className="text-xs text-gray-500">Volume (kg)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{session.duration_minutes || '-'}</p>
                    <p className="text-xs text-gray-500">Minutes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">No workouts logged yet</p>
            <button onClick={() => setShowLogModal(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Log Your First Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
