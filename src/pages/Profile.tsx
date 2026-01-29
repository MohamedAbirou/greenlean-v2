/**
 * Profile Page - User Profile with Progress Tracking
 * Displays: Stats, Weight Progress, Streaks, rewards, Activity Summary
 */

import { useAuth } from "@/features/auth";
import { useUserStreaks } from "@/features/dashboard/hooks/useDashboardData";
import { supabase } from "@/lib/supabase";
import { mlService } from "@/services/ml";
import { useSubscription } from "@/services/stripe";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { Calendar, Crown, Flame, Settings, TrendingDown, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface WeightEntry {
  weight: number;
  log_date: string;
}

interface WeeklySummary {
  week_start_date: string;
  total_workouts: number;
  total_meals_logged: number;
  weight_change: number;
  avg_daily_calories: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { tier, isPro, isPremium } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);

  // Profile completeness
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Progress data
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [weightChange, setWeightChange] = useState<number>(0);


  // Weekly summary
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);

  // Streaks
  const { data: streaks, isLoading: loadingStreaks } = useUserStreaks()

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [data] = await Promise.all([
        mlService.getProfileCompleteness(user.id),
        fetchWeightHistory(),
        fetchWeeklySummary(),
      ]);

      if (data) {
        setProfileCompleteness(Math.round(data.completeness || 0));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeightHistory = async () => {
    const { data, error } = await supabase
      .from("weight_history")
      .select("weight, log_date")
      .eq("user_id", user!.id)
      .order("log_date", { ascending: false })
      .limit(30);

    if (!error && data) {
      setWeightHistory(data);
      if (data.length > 0) {
        setCurrentWeight(data[0].weight);

        // Calculate weight change from 30 days ago
        if (data.length > 1) {
          const oldestWeight = data[data.length - 1].weight;
          setWeightChange(data[0].weight - oldestWeight);
        }
      }
    }

    // Get target weight from profile
    if (profile?.target_weight) {
      setTargetWeight(profile.target_weight);
    }
  };

  const fetchWeeklySummary = async () => {
    const { data, error } = await supabase
      .from("weekly_summaries")
      .select(
        "week_start_date, total_workouts, total_meals_logged, weight_change, avg_daily_calories"
      )
      .eq("user_id", user!.id)
      .order("week_start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setWeeklySummary(data);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getStreakIcon = (type: string) => {
    switch (type) {
      case "nutrition_logging":
        return "🍎";
      case "workout_logging":
        return "💪";
      case "daily_weigh_in":
        return "⚖️";
      case "water_goal":
        return "💧";
      default:
        return "🔥";
    }
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case "nutrition_logging":
        return "Nutrition Logging";
      case "workout_logging":
        return "Workout Logging";
      case "daily_weigh_in":
        return "Daily Weigh-In";
      case "water_goal":
        return "Water Goal";
      default:
        return type;
    }
  };

  const getTierBadgeColor = () => {
    if (isPremium) return "bg-accent";
    if (isPro) return "bg-tip";
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">Track your progress and achievements</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <UserAvatar
                  src={profile?.avatar_url}
                  frameId={profile?.avatar_frame || "default"}
                  size="xl"
                  showFrame={true}
                />

                {/* Tier Badge */}
                <div
                  className={`absolute -bottom-2 -right-2 ${getTierBadgeColor()} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                >
                  {isPremium && <Crown className="w-3 h-3" />}
                  {isPro && <Zap className="w-3 h-3" />}
                  {tier.toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {profile?.full_name || user.email?.split("@")[0] || "User"}
                </h2>
                <p className="text-muted-foreground mb-4">{user.email}</p>

                {/* Profile Completeness */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completeness</span>
                    <span className="text-sm text-muted-foreground">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                  {profileCompleteness < 100 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Complete your profile to unlock better AI personalization
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {streaks && streaks.reduce((sum, s) => sum + s.total_days_logged, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Days Logged</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Weight Progress</h3>
                  <p className="text-sm text-muted-foreground">Your weight journey</p>
                </div>
              </div>

              {currentWeight ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold">{currentWeight}</div>
                      <div className="text-xs text-muted-foreground">Current (kg)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{targetWeight || "-"}</div>
                      <div className="text-xs text-muted-foreground">Target (kg)</div>
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold ${weightChange < 0 ? "text-green-600" : "text-orange-600"
                          }`}
                      >
                        {weightChange > 0 ? "+" : ""}
                        {weightChange.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">30-day change</div>
                    </div>
                  </div>

                  {targetWeight && currentWeight > targetWeight && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress to Goal</span>
                        <span className="text-sm text-muted-foreground">
                          {(currentWeight - targetWeight).toFixed(1)} kg to go
                        </span>
                      </div>
                      <Progress
                        value={
                          ((weightHistory[weightHistory.length - 1]?.weight - currentWeight) /
                            (weightHistory[weightHistory.length - 1]?.weight - targetWeight)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Entries</h4>
                    {weightHistory.slice(0, 5).map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                      >
                        <span className="text-muted-foreground">
                          {new Date(entry.log_date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">{entry.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No weight data yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard?tab=progress")}
                  >
                    Log Your Weight
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Current Streaks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Activity Streaks</h3>
                  <p className="text-sm text-muted-foreground">Keep the momentum going</p>
                </div>
              </div>

              {loadingStreaks && (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">Loading your activity streaks...</p>
                  </div>
                </div>
              )}

              {streaks && streaks.length > 0 ? (
                <div className="space-y-4">
                  {streaks.map((streak: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStreakIcon(streak.streak_type)}</span>
                        <div>
                          <div className="font-medium">{getStreakLabel(streak.streak_type)}</div>
                          <div className="text-xs text-muted-foreground">
                            Total: {streak.total_days_logged} days
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {streak.current_streak}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Best: {streak.longest_streak}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Start logging to build streaks!</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* This Week Summary */}
          {weeklySummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">This Week</h3>
                    <p className="text-sm text-muted-foreground">
                      Week of {new Date(weeklySummary.week_start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{weeklySummary.total_workouts}</div>
                    <div className="text-sm text-muted-foreground">Workouts</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{weeklySummary.total_meals_logged}</div>
                    <div className="text-sm text-muted-foreground">Meals Logged</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {Math.round(weeklySummary.avg_daily_calories || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Calories</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div
                      className={`text-2xl font-bold ${(weeklySummary.weight_change || 0) < 0
                        ? "text-green-600"
                        : "text-orange-600"
                        }`}
                    >
                      {(weeklySummary.weight_change || 0) > 0 ? "+" : ""}
                      {(weeklySummary.weight_change || 0).toFixed(1)}kg
                    </div>
                    <div className="text-sm text-muted-foreground">Weight Change</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
