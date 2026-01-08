import { Save, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { SelectedFood } from '../pages/LogMeal';

interface SaveTemplateDialogProps {
  setShowSaveTemplateDialog: Dispatch<SetStateAction<boolean>>;
  templateName: string;
  setTemplateName: Dispatch<SetStateAction<string>>;
  templateDescription: string;
  setTemplateDescription: Dispatch<SetStateAction<string>>;
  selectedFoods: SelectedFood[];
  totals: { calories: number; protein: number; carbs: number; fats: number; }
  handleSaveAsTemplate: () => void;
  isCreatingTemplate: boolean;
}

export default function SaveTemplateDialog({ setShowSaveTemplateDialog, templateName, setTemplateName, templateDescription, setTemplateDescription, selectedFoods, totals, handleSaveAsTemplate, isCreatingTemplate }: SaveTemplateDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Save className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Save as Template</h2>
                <p className="text-green-100 text-sm mt-1">Reuse this meal anytime</p>
              </div>
            </div>
            <button
              onClick={() => setShowSaveTemplateDialog(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Name */}
          <div>
            <label htmlFor='template-name' className="block text-sm font-semibold mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              id='template-name'
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., My Protein Breakfast, Quick Post-Workout Meal"
              className="w-full px-4 py-3 border-2 border-input rounded-xl bg-input focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor='template-description' className="block text-sm font-semibold mb-2">
              Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id='template-description'
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Add notes about when you eat this, why you like it, or preparation tips..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-input rounded-xl bg-input focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
            />
          </div>

          {/* Foods Preview */}
          <div className="bg-background rounded-xl p-4 border-2 border-border">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Foods in Template ({selectedFoods.length} items)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFoods.map((food, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-card p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{food.name}</p>
                    <p className="text-xs text-gray-500">
                      {food.quantity}x {food.serving_size}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">
                      {Math.round(food.calories * food.quantity)} cal
                    </p>
                    <p className="text-xs text-gray-500">
                      P:{Math.round(food.protein * food.quantity)}g
                      C:{Math.round(food.carbs * food.quantity)}g
                      F:{Math.round(food.fats * food.quantity)}g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-orange-500/50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{Math.round(totals.calories)}</p>
              <p className="text-xs text-foreground">Calories</p>
            </div>
            <div className="text-center p-3 bg-blue-500/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(totals.protein)}g</p>
              <p className="text-xs text-foreground">Protein</p>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{Math.round(totals.carbs)}g</p>
              <p className="text-xs text-foreground">Carbs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Math.round(totals.fats)}g</p>
              <p className="text-xs text-foreground">Fats</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background p-6 rounded-b-2xl border-t border-border flex gap-3">
          <button
            onClick={() => setShowSaveTemplateDialog(false)}
            className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAsTemplate}
            disabled={!templateName.trim() || isCreatingTemplate}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isCreatingTemplate ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}