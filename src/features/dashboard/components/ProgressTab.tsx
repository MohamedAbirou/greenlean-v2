/**
 * Progress Tab - 2026 INSANE Modern UI/UX
 * Premium analytics dashboard with beautiful charts and comprehensive metrics
 */

// import { useAuth } from '@/features/auth';
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  Flame,
  LineChart as LineChartIcon,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useWeightHistory, useWorkoutSessionsRange } from "../hooks/useDashboardData";
import { useAddWeightEntry, useDeleteWeightEntry } from "../hooks/useDashboardMutations";

// Helper functions
const getToday = () => new Date().toISOString().split("T")[0];
const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export function ProgressTabNew() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(7); // 7, 30, 90 days
  const [startDate, setStartDate] = useState(getDaysAgo(7));
  const [endDate, setEndDate] = useState(getToday());
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(getToday());

  // Fetch data for the selected range
  const { data: workoutsData } = useWorkoutSessionsRange(startDate, endDate);
  const { data, loading, refetch } = useWeightHistory(startDate, endDate);

  // Process workout data for charts
  const workoutStats = useMemo(() => {
    const workouts = workoutsData || [];

    // Group by date
    const byDate: Record<string, any> = {};
    workouts.forEach((workout: any) => {
      const date = workout.session_date;
      if (!byDate[date]) {
        byDate[date] = {
          date,
          workouts: 0,
          totalDuration: 0,
          totalCalories: 0,
          exerciseCount: 0,
        };
      }
      byDate[date].workouts += 1;
      byDate[date].totalDuration += workout.duration_minutes || 0;
      byDate[date].totalCalories += workout.calories_burned || 0;
      byDate[date].exerciseCount += workout.total_exercises || 0;
    });

    // 2. Create ALL dates in the selected range
    const allDates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      allDates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    // 3. Build final chart data — include 0 for missing days
    const chartData = allDates.map((dateStr) => {
      const entry = byDate[dateStr] || {
        date: dateStr,
        workouts: 0,
        totalDuration: 0,
        totalCalories: 0,
      };
      return {
        date: formatDate(dateStr),
        workouts: entry.workouts,
        duration: entry.totalDuration,
        calories: entry.totalCalories,
      };
    });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce(
      (sum: number, w: any) => sum + (w.duration_minutes || 0),
      0
    );
    const totalCalories = workouts.reduce(
      (sum: number, w: any) => sum + (w.calories_burned || 0),
      0
    );
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    const trainedDays = Object.keys(byDate).length;
    const totalDays = allDates.length;

    return {
      chartData,
      totalWorkouts,
      totalDuration,
      totalCalories,
      avgDuration,

      // One message per chart
      frequencyMessage: `You trained on ${trainedDays} out of ${totalDays} days — keep going! 💪`,
      durationMessage:
        totalDuration > 0
          ? `You've put in ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m of training — strong consistency! 🔥`
          : `Rest days build strength too — log your next session! 💪`,
      caloriesMessage:
        totalCalories > 0
          ? `You've burned ${totalCalories.toLocaleString()} calories — that's serious work! ⚡`
          : `Every session adds up — start burning and watch the numbers climb! 🔥`,
    };
  }, [workoutsData, startDate, endDate]);

  // Calculate date range options
  const handleDateRangeChange = (days: number) => {
    setDateRange(days);
    setStartDate(getDaysAgo(days));
    setEndDate(getToday());
  };

  const [addWeightEntry] = useAddWeightEntry();
  const [deleteWeightEntry] = useDeleteWeightEntry();

  const weightEntries =
    (data as any)?.weight_historyCollection?.edges?.map((e: any) => e.node) || [];

  const handleAddWeight = async () => {
    if (!newWeight || !user?.id) return;

    await addWeightEntry({
      user_id: user.id,
      weight_kg: parseFloat(newWeight),
      log_date: newWeightDate,
    });

    setNewWeight("");
    refetch();
  };

  const handleDeleteWeight = async (id: string) => {
    if (confirm("Delete this weight entry?")) {
      await deleteWeightEntry({ id });
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
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
    };
  };

  const weightChange = calculateWeightChange();

  const statCards = [
    {
      label: "Total Workouts",
      value: workoutStats.totalWorkouts,
      icon: Dumbbell,
      gradient: "from-blue-500 to-cyan-500",
      bg: "from-blue-500/50 to-cyan-500/50",
      textColor: "text-blue-600 dark:text-blue-400",
      subtitle: `Last ${dateRange} days`,
    },
    {
      label: "Training Time",
      value: `${Math.floor(workoutStats.totalDuration / 60)}h ${workoutStats.totalDuration % 60}m`,
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
      bg: "from-purple-500/50 to-pink-500/50",
      textColor: "text-purple-600 dark:text-purple-400",
      subtitle: `Avg: ${workoutStats.avgDuration} min/workout`,
    },
    {
      label: "Calories Burned",
      value: workoutStats.totalCalories.toLocaleString(),
      icon: Flame,
      gradient: "from-orange-500 to-red-500",
      bg: "from-orange-500/50 to-red-500/50",
      textColor: "text-orange-600 dark:text-orange-400",
      subtitle: "From workouts",
    },
    {
      label: "Frequency",
      value: (workoutStats.totalWorkouts / (dateRange / 7)).toFixed(1),
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bg: "from-green-500/50 to-emerald-500/50",
      textColor: "text-green-600 dark:text-green-400",
      subtitle: "Workouts per week",
    },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-10 text-white shadow-2xl border border-blue-400/20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-bold">Progress Analytics</h2>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
            Track your journey with comprehensive metrics and beautiful visualizations
          </p>
        </div>
      </div>

      {/* Premium Date Range Selector */}
      <Card className="border-0 bg-gradient-hero shadow-xl">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Range Buttons */}
            <div className="flex gap-3">
              <Button
                variant={dateRange === 7 ? "default" : "outline"}
                size="lg"
                onClick={() => handleDateRangeChange(7)}
                className={
                  dateRange === 7
                    ? "bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    : "hover:border-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                }
              >
                <CalendarIcon className="h-4 w-4 mr-2" />7 Days
              </Button>
              <Button
                variant={dateRange === 30 ? "default" : "outline"}
                size="lg"
                onClick={() => handleDateRangeChange(30)}
                className={
                  dateRange === 30
                    ? "bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    : "hover:border-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                }
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                30 Days
              </Button>
              <Button
                variant={dateRange === 90 ? "default" : "outline"}
                size="lg"
                onClick={() => handleDateRangeChange(90)}
                className={
                  dateRange === 90
                    ? "bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    : "hover:border-primary-500 hover:bg-primary-500/10 transition-all duration-300"
                }
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                90 Days
              </Button>
            </div>

            {/* Custom Date Range */}
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-border rounded-xl bg-background text-sm font-medium hover:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-muted-foreground font-semibold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 border-2 border-border rounded-xl bg-background text-sm font-medium hover:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              <label className="text-sm text-muted-foreground mb-2 block">Weight (kg)</label>
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

      {/* Premium Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />
              <CardContent className="pt-8 pb-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{stat.label}</p>
                <p className={`text-4xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Premium Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Frequency Chart */}
        <Card className="border-0 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 transition-all duration-300">
          <CardHeader className="border-b border-border/50 rounded-lg p-2">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Workout Frequency</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {workoutStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutStats.chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tickFormatter={(value) => value}
                    fontSize={12}
                    fontWeight={600}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis fontSize={12} fontWeight={600} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                  />
                  <Bar dataKey="workouts" fill="url(#barGradient)" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold text-lg">No workout data for this period</p>
                  <p className="text-sm mt-1">Start logging workouts to see your progress!</p>
                </div>
              </div>
            )}
            {/* Workout Frequency Chart */}
            {workoutStats.chartData.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {workoutStats.frequencyMessage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Training Duration Chart */}
        <Card className="border-0 shadow-xl hover:shadow-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 transition-all duration-300">
          <CardHeader className="border-b border-border/50 rounded-lg p-2">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Training Duration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {workoutStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={workoutStats.chartData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tickFormatter={(value) => value}
                    fontSize={12}
                    fontWeight={600}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis fontSize={12} fontWeight={600} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold text-lg">No duration data for this period</p>
                  <p className="text-sm mt-1">Start logging workouts to see your progress!</p>
                </div>
              </div>
            )}
            {/* Training Duration Chart */}
            {workoutStats.chartData.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {workoutStats.durationMessage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Calories Burned Chart */}
        <Card className="border-0 shadow-xl hover:shadow-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 transition-all duration-300">
          <CardHeader className="border-b border-border/50  rounded-lg p-2">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Calories Burned</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {workoutStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={workoutStats.chartData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgb(249, 115, 22)" />
                      <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tickFormatter={(value) => value}
                    fontSize={12}
                    fontWeight={600}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis fontSize={12} fontWeight={600} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "2px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ fill: "rgb(249, 115, 22)", r: 5, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4 shadow-lg">
                    <Flame className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold text-lg">No calorie data for this period</p>
                  <p className="text-sm mt-1">Start logging workouts to see your progress!</p>
                </div>
              </div>
            )}
            {/* Calories Burned Chart */}
            {workoutStats.chartData.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {workoutStats.caloriesMessage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Nutrition Tracking - Coming Soon */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <LineChartIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Nutrition Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-xl animate-pulse">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <p className="font-bold text-xl mb-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Coming in Next Update
                </p>
                <p className="text-sm max-w-xs mx-auto text-muted-foreground leading-relaxed">
                  Calorie intake, macro tracking, and nutrition adherence charts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weight Change Summary */}
      {weightChange && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold">
                {weightChange.direction === "up" && "↗️"}
                {weightChange.direction === "down" && "↘️"}
                {weightChange.direction === "stable" && "➡️"}
                {" " + weightChange.amount} kg
              </p>
              <p className="text-muted-foreground mt-2">
                {weightChange.direction === "up" && "Weight increased"}
                {weightChange.direction === "down" && "Weight decreased"}
                {weightChange.direction === "stable" && "Weight stable"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {weightEntries.length > 0 ? (
            <div className="space-y-2">
              {weightEntries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{entry.log_date}</p>
                    {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold">{entry.weight_kg} kg</p>
                    <Button onClick={() => handleDeleteWeight(entry.id)} variant="ghost" size="sm">
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

      {/* Premium Info Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 border-2 border-primary-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-base font-bold mb-2 flex items-center gap-2">
              Track Your Progress Consistently
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your progress data is automatically tracked as you log workouts and meals. Charts
              update in real-time to show your fitness journey. Keep logging consistently to see
              meaningful trends and celebrate your achievements! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
