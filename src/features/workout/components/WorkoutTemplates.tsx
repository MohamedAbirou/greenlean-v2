/**
 * Workout Templates Component
 * Browse and select saved workout templates
 */

import { useAuth } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { BookOpen, Clock, Dumbbell, Heart, Loader2, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { WorkoutTemplateService, type WorkoutTemplate } from "../api/WorkoutTemplateService";
import { formatSetDisplay, getConfigForMode } from "../utils/exerciseTypeConfig";

interface WorkoutTemplatesProps {
  onTemplateSelect: (template: WorkoutTemplate) => void;
}

export function WorkoutTemplates({ onTemplateSelect }: WorkoutTemplatesProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "alphabetical">("recent");
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadTemplates();
    }
  }, [user?.id]);

  const loadTemplates = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await WorkoutTemplateService.getUserTemplates(user.id);
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: WorkoutTemplate) => {
    try {
      await WorkoutTemplateService.incrementTimesUsed(template.id);
      onTemplateSelect(template);
      toast.success(`Template "${template.name}" loaded!`);
    } catch (error) {
      console.error("Error using template:", error);
      toast.error("Failed to load template");
    }
  };

  const handleToggleFavorite = async (templateId: string, currentStatus: boolean) => {
    try {
      await WorkoutTemplateService.toggleFavorite(templateId, !currentStatus);
      setTemplates(
        templates.map((t) => (t.id === templateId ? { ...t, is_favorite: !currentStatus } : t))
      );
      toast.success(currentStatus ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Delete template "${templateName}"?`)) return;

    try {
      await WorkoutTemplateService.deleteTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));
      toast.success("Template deleted");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  // Get favorite templates
  const favoriteTemplates = useMemo(() => {
    return templates.filter((t) => t.is_favorite);
  }, [templates]);

  const filteredTemplates = (activeTab === "favorites" ? favoriteTemplates : templates)
    .filter((template) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.workout_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMealType =
        selectedWorkoutType === "all" || template.workout_type === selectedWorkoutType;

      return matchesSearch && matchesMealType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.times_used || 0) - (a.times_used || 0);
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return (
            new Date(b.last_used_at || b.created_at).getTime() -
            new Date(a.last_used_at || a.created_at).getTime()
          );
      }
    });

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const workoutTypeConfig: Record<string, { emoji: string; gradient: string }> = {
    strength: { emoji: "💪", gradient: "from-purple-500 to-indigo-500" },
    cardio: { emoji: "🏃", gradient: "from-blue-500 to-cyan-500" },
    flexibility: { emoji: "🧘", gradient: "from-green-500 to-teal-500" },
    sports: { emoji: "⚽", gradient: "from-orange-500 to-amber-500" },
    hiit: { emoji: "⚡", gradient: "from-red-500 to-pink-500" },
    other: { emoji: "🏋️", gradient: "from-gray-500 to-slate-500" },
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {/* Meal Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedWorkoutType("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedWorkoutType === "all"
                ? "bg-primary-500 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {Object.entries(workoutTypeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedWorkoutType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedWorkoutType === type
                  ? "bg-primary-500 text-white"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {config.emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1.5 border-2 border-border rounded-lg bg-background text-sm font-medium focus:border-primary-500 focus:outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="alphabetical">A-Z</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "all"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "favorites"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ⭐ Favorites ({favoriteTemplates.length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="inline-block animate-spin h-8 w-8 text-primary-500" />
          <p className="text-sm text-muted-foreground mt-2">Loading templates...</p>
        </div>
      )}

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-2">
            {searchQuery ? "No templates found" : "No saved templates"}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Create your first template by saving a workout"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500/50"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Template Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg truncate">{template.name}</h3>
                      {template.is_favorite && (
                        <Heart className="h-5 w-5 text-red-500 fill-current flex-shrink-0" />
                      )}
                    </div>

                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="capitalize">
                        <Dumbbell className="h-3 w-3 mr-1" />
                        {template.workout_type}
                      </Badge>
                      {template.difficulty_level && (
                        <Badge
                          className={`${getDifficultyColor(template.difficulty_level)} text-white capitalize`}
                        >
                          {template.difficulty_level}
                        </Badge>
                      )}
                      <Badge variant="outline">{template.exercises.length} exercises</Badge>
                      {template.estimated_duration_minutes && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {template.estimated_duration_minutes} min
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-xs text-muted-foreground">
                      Used {template.times_used} {template.times_used === 1 ? "time" : "times"}
                      {template.last_used_at && (
                        <> • Last used {new Date(template.last_used_at).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleTemplateSelect(template)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Use Template
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(template.id, template.is_favorite)}
                      >
                        <Heart
                          className={`h-4 w-4 ${template.is_favorite ? "fill-current text-red-500" : ""}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Exercise Preview */}
                <details className="mt-3 pt-3 border-t border-border">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    View exercises ({template.exercises.length})
                  </summary>
                  <div className="mt-3 space-y-3 pl-2">
                    {template.exercises.map((exercise, exIdx) => {
                      // Important: get the config based on the saved tracking mode
                      const config = getConfigForMode(exercise.trackingMode || "reps-only");

                      return (
                        <div key={exIdx} className="text-sm">
                          <div className="font-medium flex items-center gap-2">
                            {exIdx + 1}. {exercise.name}
                            <div className="text-xs text-muted-foreground mt-1">
                              {exercise.sets.length} sets •{" "}
                              {exercise.sets.reduce((sum, s) => sum + (s.reps ?? 0), 0)} reps
                            </div>
                            <Badge variant="accent" className="text-xs">
                              {config.labels.primary}
                              {config.labels.secondary && ` + ${config.labels.secondary}`}
                            </Badge>
                            {exercise.equipment && (
                              <Badge variant="secondary" className="text-xs">
                                {Array.isArray(exercise.equipment)
                                  ? exercise.equipment.join(", ")
                                  : exercise.equipment}
                              </Badge>
                            )}
                          </div>

                          <details className="mt-1">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-primary">
                              View sets ({exercise.sets.length})
                            </summary>
                            <div className="mt-2 space-y-1 pl-4 text-xs text-muted-foreground">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx}>
                                  {set.set_number}. {formatSetDisplay(config.mode, set)}
                                  {set.is_warmup && (
                                    <span className="ml-2 text-amber-600">(warm-up)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
