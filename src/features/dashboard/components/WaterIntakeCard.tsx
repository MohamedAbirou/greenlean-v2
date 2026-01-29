import { Droplet, Plus } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../auth";
import { useDailyWaterIntake } from "../hooks/useDashboardData";
import { upsertDailyWaterIntake } from "../hooks/useDashboardMutations";

const GLASS_ML = 250;

const WaterIntakeCard: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const { data: log, isLoading, refetch } = useDailyWaterIntake();

  const glasses = log?.glasses ?? 0;
  const totalML = log?.total_ml ?? 0;

  const handleAddGlass = async () => {
    if (!user?.id) return;

    setSaving(true);

    await upsertDailyWaterIntake({
      userId: user.id,
      glasses: glasses + 1,
      total_ml: totalML + GLASS_ML,
    });

    refetch();

    setSaving(false);
  };


  return (
    <div className="relative overflow-hidden rounded-md bg-blue-500/30 p-6 border border-blue-500 flex flex-col items-center shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Droplet className="h-8 w-8 text-blue-500" />
        <h3 className="text-lg font-semibold text-blue-500">Water Intake</h3>
      </div>
      {isLoading ? (
        <div className="text-blue-600 font-medium">Loading...</div>
      ) : (
        <>
          <div className="text-center text-4xl font-bold text-blue-500">{glasses}</div>
          <div className="text-sm text-blue-500 mb-2">glasses ({totalML} ml)</div>
          <div className="text-sm text-blue-500 mb-2">each glass is 250 ml</div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white py-1.5 px-4 rounded-md text-sm mt-1 disabled:opacity-50"
            onClick={handleAddGlass}
            disabled={saving}
            title="Add a glass of water"
          >
            <Plus size={18} /> Add Glass
          </button>
          <div className="text-[0.85em] text-blue-400 mt-3">
            Great job! Stay hydrated 🌊
          </div>
        </>
      )}
    </div>
  );
};

export default WaterIntakeCard;
