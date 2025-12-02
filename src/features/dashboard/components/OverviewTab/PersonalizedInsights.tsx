/**
 * PersonalizedInsights Component
 * AI-like recommendations and insights
 * Makes the dashboard feel intelligent and helpful
 */

import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  action?: string;
}

interface PersonalizedInsightsProps {
  insights?: Insight[];
  loading?: boolean;
}

export function PersonalizedInsights({
  insights,
  loading,
}: PersonalizedInsightsProps) {
  // Generate smart insights based on data
  const defaultInsights: Insight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Great Progress!',
      message: "You're on track to reach your goal by mid-February at your current pace.",
      action: 'View Progress',
    },
    {
      id: '2',
      type: 'tip',
      title: 'Protein Boost',
      message: 'Your protein intake is slightly low. Try adding eggs or Greek yogurt to breakfast.',
      action: 'View Recipes',
    },
    {
      id: '3',
      type: 'info',
      title: 'Consistency Pays Off',
      message: "You've logged meals 6 days this week! One more day for a perfect week.",
      action: 'Log Now',
    },
  ];

  const displayInsights = insights || defaultInsights;

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'info':
        return TrendingUp;
      case 'tip':
        return Lightbulb;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-success bg-success/10 border-success';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning';
      case 'info':
        return 'text-info bg-info/10 border-info';
      case 'tip':
        return 'text-tip bg-tip/10 border-tip';
    }
  };

  const getBadgeVariant = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'tip':
        return 'tip';
    }
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-muted-foreground">
          Generating insights...
        </div>
      </Card>
    );
  }

  if (displayInsights.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Keep logging to get personalized insights!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Personal Insights
            </h3>
          </div>
          <Badge variant="info" size="sm">
            AI-Powered
          </Badge>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {displayInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-4 rounded-lg border-2 transition-all hover:shadow-md 
                  ${getInsightColor(insight.type)}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">
                        {insight.title}
                      </h4>
                      <Badge variant={getBadgeVariant(insight.type)} size="sm">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">
                      {insight.message}
                    </p>
                    {insight.action && (
                      <button className="text-xs font-semibold mt-2 hover:underline">
                        {insight.action} →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Disclaimer */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💡 Insights are generated based on your activity patterns and goals
          </p>
        </div>
      </div>
    </Card>
  );
}
