import { Card } from '@/shared/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroBreakdownProps {
  protein: number;
  carbs: number;
  fats: number;
}

const COLORS = {
  protein: '#ef4444', // red
  carbs: '#3b82f6', // blue
  fats: '#f59e0b', // amber
};

export function MacroBreakdown({ protein, carbs, fats }: MacroBreakdownProps) {
  // Calculate calories from macros
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatsCal = fats * 9;
  const totalCal = proteinCal + carbsCal + fatsCal;

  const data = [
    { name: 'Protein', value: proteinCal, grams: protein, color: COLORS.protein },
    { name: 'Carbs', value: carbsCal, grams: carbs, color: COLORS.carbs },
    { name: 'Fats', value: fatsCal, grams: fats, color: COLORS.fats },
  ].filter((item) => item.value > 0);

  const calculatePercentage = (value: number) => {
    if (totalCal === 0) return 0;
    return ((value / totalCal) * 100).toFixed(1);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.grams}g ({calculatePercentage(data.value)}%)
          </p>
          <p className="text-sm text-muted-foreground">{Math.round(data.value)} cal</p>
        </div>
      );
    }
    return null;
  };

  if (totalCal === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Macro Breakdown</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>No nutrition data yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Macro Breakdown</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with grams */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.protein }} />
            <span className="text-sm font-medium">Protein</span>
          </div>
          <div className="text-lg font-bold">{protein}g</div>
          <div className="text-xs text-muted-foreground">
            {calculatePercentage(proteinCal)}%
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.carbs }} />
            <span className="text-sm font-medium">Carbs</span>
          </div>
          <div className="text-lg font-bold">{carbs}g</div>
          <div className="text-xs text-muted-foreground">
            {calculatePercentage(carbsCal)}%
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.fats }} />
            <span className="text-sm font-medium">Fats</span>
          </div>
          <div className="text-lg font-bold">{fats}g</div>
          <div className="text-xs text-muted-foreground">
            {calculatePercentage(fatsCal)}%
          </div>
        </div>
      </div>
    </Card>
  );
}
