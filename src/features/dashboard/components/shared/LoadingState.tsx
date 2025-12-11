/**
 * Loading State Component
 * Shows loading skeleton for dashboard data
 */

import React from 'react';

export function LoadingState() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
        ))}
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
      </div>
    </div>
  );
}

export function CardLoadingState() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
    </div>
  );
}
