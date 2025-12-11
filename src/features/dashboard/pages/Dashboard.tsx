/**
 * Main Dashboard Page
 * Tab navigation between Overview, Nutrition, Workout, and Progress
 */

import React, { useState } from 'react';
import { OverviewTab } from '../components/overview/OverviewTab';
import { NutritionTab } from '../components/nutrition/NutritionTab';
import { WorkoutTab } from '../components/workout/WorkoutTab';
import { ProgressTab } from '../components/progress/ProgressTab';
import type { DashboardTab } from '../types';

const tabs: Array<{ id: DashboardTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'nutrition', label: 'Nutrition', icon: '🍎' },
  { id: 'workout', label: 'Workout', icon: '💪' },
  { id: 'progress', label: 'Progress', icon: '📈' },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your fitness journey with smart logging and insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'workout' && <WorkoutTab />}
          {activeTab === 'progress' && <ProgressTab />}
        </div>
      </div>
    </div>
  );
}
