/**
 * Plate Calculator Page
 * Full page for barbell plate loading calculator
 * Accessible via /dashboard/plate-calculator
 */

import { Button } from '@/shared/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlateCalculator } from '../components/PlateCalculator';

export function PlateCalculatorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get weight from URL params if provided
  const initialWeight = searchParams.get('weight')
    ? parseFloat(searchParams.get('weight')!)
    : 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4"
        >
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Plate Calculator</h1>
          <p className="text-muted-foreground mt-2">
            Calculate exactly which plates you need to load your barbell
          </p>
        </div>
      </div>

      {/* Calculator */}
      <PlateCalculator targetWeight={initialWeight} />

      {/* Info Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3">📚 How to Use</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>1. Enter target weight:</strong> The total weight you want to lift (including the bar)
          </li>
          <li>
            <strong>2. Set bar weight:</strong> Standard Olympic bars are 20kg (45lbs), but some gyms have lighter bars
          </li>
          <li>
            <strong>3. Choose your unit:</strong> kg or lbs based on your gym's equipment
          </li>
          <li>
            <strong>4. Select plate system:</strong> Olympic plates include more variety (0.5kg, 1.25kg micro plates)
          </li>
        </ul>

        <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded">
          <h4 className="text-sm font-semibold mb-2">💡 Pro Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Always use collars to secure plates (add ~2.5kg total weight)</li>
            <li>• Load plates symmetrically - one side at a time to maintain balance</li>
            <li>• Start with largest plates and work your way down</li>
            <li>• Some weights can't be loaded exactly - the calculator shows the closest match</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
