/**
 * UpgradePrompt Component
 * Encourages BASIC tier users to complete their profile for more personalization
 */

import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  title: string;
  description: string;
  benefits: string[];
}

export function UpgradePrompt({ title, description, benefits }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card
        variant="elevated"
        padding="lg"
        className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {description}
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              Complete Your Profile
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
