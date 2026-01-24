interface ChallengeRequirements {
  target: number;
  metric?: string;
  timeframe?: string;
}

interface Participant {
  id: string;
  user_id: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "streak" | "goal";
  difficulty: "easy" | "medium" | "hard";
  points: number;
  requirements: ChallengeRequirements;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants: Participant[];
  participants_count: number;
  completion_rate: number;
  user_progress: {
    progress: {
      current: number;
    };
    completed: boolean;
    streak_count: number;
    streak_expires_at: string;
  };
  created_at: string;
}

export interface UserRewards {
  points: number;
}
