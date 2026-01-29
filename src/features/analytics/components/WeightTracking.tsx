/**
 * Weight Tracking Component
 * Beautifully logs weight, displays history, changes, trends, and useful info
 */

import { useAuth } from "@/features/auth";
import { addWeightEntry, deleteWeightEntry, updateWeightEntry, useWeightHistory } from "@/features/dashboard";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { formatDuration } from "@/shared/utils/dateFormatter";
import { differenceInDays, format } from "date-fns";
import { Scale, TrendingDown, TrendingUp, Weight } from "lucide-react";
import { useMemo, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// Helper to format date for chart
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

interface WeightTrackingProps {
    startDate: string;
    endDate: string;
}

export function WeightTracking({ startDate, endDate }: WeightTrackingProps) {
    const { user } = useAuth();
    const [newWeight, setNewWeight] = useState("");
    const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingWeight, setEditingWeight] = useState("");

    // Fetch full weight history (no range for simplicity, assuming all-time)
    const { data: weightEntries, isLoading, refetch } = useWeightHistory(startDate, endDate);

    // Sorted weights
    const sortedWeights = useMemo(() => {
        return weightEntries
            ? [...weightEntries].sort(
                (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
            )
            : [];
    }, [weightEntries]);

    // Chart data with smoothed trend (7-day rolling average)
    const chartData = useMemo(() => {
        return sortedWeights.map((entry, idx) => {
            const rollingSum = sortedWeights
                .slice(Math.max(0, idx - 6), idx + 1)
                .reduce((sum, e) => sum + e.weight, 0);
            const rollingCount = Math.min(7, idx + 1);
            return {
                date: formatDate(entry.log_date),
                weight: entry.weight,
                trend: (rollingSum / rollingCount).toFixed(1),
            };
        });
    }, [sortedWeights]);

    // Calculate weight change (from old code)
    const calculateWeightChange = () => {
        if (sortedWeights.length < 2) return null;

        // Unique by day
        const uniqueByDay = Object.values(
            Object.fromEntries(sortedWeights.map((e) => [e.log_date, e]))
        ) as any[];

        if (uniqueByDay.length < 2) return null;

        const oldest = uniqueByDay[0];
        const newest = uniqueByDay[uniqueByDay.length - 1];

        const change = newest.weight - oldest.weight;
        const daysDiff = differenceInDays(new Date(newest.log_date), new Date(oldest.log_date));

        // Additional useful info
        const avgWeight = (
            sortedWeights.reduce((sum, e) => sum + e.weight, 0) / sortedWeights.length
        ).toFixed(1);
        const minWeight = Math.min(...sortedWeights.map((e) => e.weight)).toFixed(1);
        const maxWeight = Math.max(...sortedWeights.map((e) => e.weight)).toFixed(1);

        return {
            amount: Math.abs(change).toFixed(1),
            direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
            daysDiff,
            oldestDate: oldest.log_date,
            newestDate: newest.log_date,
            avgWeight,
            minWeight,
            maxWeight,
        };
    };

    const weightChange = calculateWeightChange();

    const handleAddWeight = async () => {
        if (!newWeight || !user?.id) return;

        await addWeightEntry(user.id, newWeightDate, parseFloat(newWeight));
        setNewWeight("");
        setNewWeightDate(format(new Date(), 'yyyy-MM-dd'));
        refetch();
    };

    const startEditing = (entry: any) => {
        setEditingId(entry.id);
        setEditingWeight(entry.weight.toString());
    };

    const handleUpdateWeight = async (id: string) => {
        const value = parseFloat(editingWeight);
        if (isNaN(value)) return;

        await updateWeightEntry(id, { weight: value });
        setEditingId(null);
        setEditingWeight("");
        refetch();
    };

    const handleDeleteWeight = async (id: string) => {
        if (confirm("Delete this weight entry?")) {
            await deleteWeightEntry(id);
            refetch();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Weight Tracking</h2>

            {/* Grid for Chart and Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight Trend Chart */}
                <Card className="border-0 shadow-xl hover:shadow-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Weight className="h-5 w-5" />
                            Weight Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <defs>
                                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="date" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis domain={["auto", "auto"]} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                            padding: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Weight (kg)" />
                                    <Line type="monotone" dataKey="trend" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="7-Day Trend" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                <p>No weight data yet. Log your first entry!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Log Weight Form */}
                <Card className="border-0 shadow-xl space-y-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Scale className="h-5 w-5" />
                            Log New Weight
                        </CardTitle>
                    </CardHeader>
                    <CardContent >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-2">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Date</label>
                                <Input
                                    type="date"
                                    value={newWeightDate}
                                    onChange={(e) => setNewWeightDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Weight (kg)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    placeholder="70.5"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleAddWeight} className="w-full">
                                    Add Entry
                                </Button>
                            </div>
                        </div>
                        <div>
                            {sortedWeights.length > 0 ? (
                                <div className="space-y-4 overflow-y-auto max-h-[15rem]">
                                    {sortedWeights.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between border-b py-3">
                                            {editingId === entry.id ? (
                                                <>
                                                    <div>
                                                        <p className="font-medium">{entry.log_date}</p>
                                                        {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            value={editingWeight}
                                                            onChange={(e) => setEditingWeight(e.target.value)}
                                                            className="w-24"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleUpdateWeight(entry.id);
                                                                if (e.key === "Escape") {
                                                                    setEditingId(null);
                                                                    setEditingWeight("");
                                                                }
                                                            }}
                                                        />
                                                        <Button size="sm" onClick={() => handleUpdateWeight(entry.id)}>
                                                            Save
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <p className="font-medium">{entry.log_date}</p>
                                                        {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-semibold">{entry.weight} kg</p>
                                                        <Button variant="ghost" size="sm" onClick={() => startEditing(entry)}>
                                                            ✏️
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteWeight(entry.id)}>
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-8 text-muted-foreground">No weight entries yet. Add one above!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weight Change and Useful Info */}
            {weightChange && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                        <CardHeader>
                            <CardTitle className="text-sm">Total Change</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold">
                                {weightChange.direction === "up" ? <TrendingUp className="inline h-6 w-6 text-green-500" /> : <TrendingDown className="inline h-6 w-6 text-red-500" />}
                                {weightChange.amount} kg
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Over {formatDuration(weightChange.daysDiff)} ({weightChange.oldestDate} → {weightChange.newestDate})
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-sm">Average Weight</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold">{weightChange.avgWeight} kg</p>
                            <p className="text-sm text-muted-foreground mt-2">Across all entries</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-sm">Minimum Weight</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold">{weightChange.minWeight} kg</p>
                            <p className="text-sm text-muted-foreground mt-2">Lowest recorded</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-sm">Maximum Weight</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold">{weightChange.maxWeight} kg</p>
                            <p className="text-sm text-muted-foreground mt-2">Highest recorded</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Weight History List */}
            {/* <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle>Weight History</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedWeights.length > 0 ? (
                        <div className="space-y-4 overflow-y-auto max-h-[300px]">
                            {sortedWeights.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between border-b py-3">
                                    {editingId === entry.id ? (
                                        <>
                                            <div>
                                                <p className="font-medium">{entry.log_date}</p>
                                                {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={editingWeight}
                                                    onChange={(e) => setEditingWeight(e.target.value)}
                                                    className="w-24"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleUpdateWeight(entry.id);
                                                        if (e.key === "Escape") {
                                                            setEditingId(null);
                                                            setEditingWeight("");
                                                        }
                                                    }}
                                                />
                                                <Button size="sm" onClick={() => handleUpdateWeight(entry.id)}>
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="font-medium">{entry.log_date}</p>
                                                {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-semibold">{entry.weight} kg</p>
                                                <Button variant="ghost" size="sm" onClick={() => startEditing(entry)}>
                                                    ✏️
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteWeight(entry.id)}>
                                                    🗑️
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-muted-foreground">No weight entries yet. Add one above!</p>
                    )}
                </CardContent>
            </Card> */}
        </div>
    );
}