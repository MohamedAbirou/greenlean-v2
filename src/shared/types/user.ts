export type User = {
  id: string;
  full_name: string;
  email: string;
  username: string;
  is_admin: boolean;
  role?: "super_admin" | "admin";
  created_at: string;

  plan_id: "free" | "pro";
  status: string;
  stripe_customer_id?: string;
  subscription_id?: string;
  latest_invoice_id?: string;
  joined?: string;
  canceled_at?: string | null;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  unit_system: string;
  country: string; // ISO 3166-1 alpha-2 country code
  activity_level: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  avatar_frame: string;
}