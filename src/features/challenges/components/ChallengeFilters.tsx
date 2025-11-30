/**
 * ChallengeFilters Component
 * Modern filters with button groups, search, and sorting
 */

import { motion } from 'framer-motion';
import { Search, Calendar, CalendarDays, Flame, Target, Award, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

interface ChallengeFiltersProps {
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

const typeFilters = [
  { value: 'all', label: 'All Types', icon: Award },
  { value: 'daily', label: 'Daily', icon: Calendar },
  { value: 'weekly', label: 'Weekly', icon: CalendarDays },
  { value: 'streak', label: 'Streak', icon: Flame },
  { value: 'goal', label: 'Goal', icon: Target },
];

const difficultyFilters = [
  { value: 'all', label: 'All Levels', color: 'bg-muted' },
  { value: 'beginner', label: 'Beginner', color: 'bg-emerald-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-cyan-500' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-500' },
];

const statusFilters = [
  { value: 'all', label: 'All', emoji: '🎯' },
  { value: 'not_joined', label: 'Available', emoji: '✨' },
  { value: 'in_progress', label: 'Active', emoji: '🔥' },
  { value: 'completed', label: 'Completed', emoji: '✅' },
];

export default function ChallengeFilters({
  activeFilter,
  setActiveFilter,
  difficultyFilter,
  setDifficultyFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
}: ChallengeFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base bg-card border-border/50 focus:border-primary/50"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg p-6 space-y-6">
        {/* Type Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Challenge Type</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {typeFilters.map((filter, index) => {
              const Icon = filter.icon;
              return (
                <motion.button
                  key={filter.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`
                    relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                    ${activeFilter === filter.value
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{filter.label}</span>
                  </div>
                  {activeFilter === filter.value && (
                    <motion.div
                      layoutId="activeTypeFilter"
                      className="absolute inset-0 bg-primary rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Difficulty Level</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {difficultyFilters.map((filter, index) => (
              <motion.button
                key={filter.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setDifficultyFilter(filter.value)}
                className={`
                  relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                  ${difficultyFilter === filter.value
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {filter.value !== 'all' && (
                    <div className={`w-2 h-2 rounded-full ${filter.color}`} />
                  )}
                  <span>{filter.label}</span>
                </div>
                {difficultyFilter === filter.value && (
                  <motion.div
                    layoutId="activeDifficultyFilter"
                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Status & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filters */}
          <div className="flex-1">
            <span className="text-sm font-semibold text-foreground mb-3 block">Status</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusFilters.map((filter) => (
                <motion.button
                  key={filter.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`
                    px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${statusFilter === filter.value
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <span className="mr-1">{filter.emoji}</span>
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <span className="text-sm font-semibold text-foreground mb-3 block">Sort By</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 bg-muted/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">🕒 Newest</SelectItem>
                <SelectItem value="oldest">⏳ Oldest</SelectItem>
                <SelectItem value="points_high">💎 Highest Points</SelectItem>
                <SelectItem value="points_low">🪶 Lowest Points</SelectItem>
                <SelectItem value="easy_first">🌱 Easiest First</SelectItem>
                <SelectItem value="hard_first">🔥 Hardest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
