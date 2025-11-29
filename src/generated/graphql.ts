import { gql } from "@apollo/client";
import { useQuery, useMutation, useLazyQuery, useSuspenseQuery, skipToken } from "@apollo/client/react";
import type { QueryHookOptions, LazyQueryHookOptions, MutationHookOptions, QueryResult, SuspenseQueryHookOptions, SkipToken } from "@apollo/client/react";

// Type aliases for codegen compatibility
export type OperationVariables = Record<string, any>;
export type MutationFunction<TData, TVariables extends OperationVariables = OperationVariables> = (options?: { variables?: TVariables }) => Promise<{ data?: TData }>;
export type MutationResult<TData> = { data?: TData; loading: boolean; error?: any };
export type BaseMutationOptions<TData, TVariables extends OperationVariables = OperationVariables> = MutationHookOptions<TData, TVariables>;
export type MutationTuple<TData, TVariables extends OperationVariables = OperationVariables> = [MutationFunction<TData, TVariables>, MutationResult<TData>];
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigFloat: { input: number; output: number; }
  BigInt: { input: number; output: number; }
  Date: { input: string; output: string; }
  Datetime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  Opaque: { input: any; output: any; }
  Time: { input: string; output: string; }
  UUID: { input: string; output: string; }
};

export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
};

export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename: 'Mutation';
  deleteFromprofilesCollection?: Maybe<ProfilesDeleteResponse>;
  insertIntoai_meal_plansCollection?: Maybe<Ai_Meal_PlansInsertResponse>;
  insertIntoai_workout_plansCollection?: Maybe<Ai_Workout_PlansInsertResponse>;
  insertIntodaily_nutrition_logsCollection?: Maybe<Daily_Nutrition_LogsInsertResponse>;
  insertIntoprofilesCollection?: Maybe<ProfilesInsertResponse>;
  insertIntoworkout_logsCollection?: Maybe<Workout_LogsInsertResponse>;
  updateprofilesCollection?: Maybe<ProfilesUpdateResponse>;
};


export type MutationDeleteFromprofilesCollectionArgs = {
  filter: ProfilesFilter;
};


export type MutationInsertIntoai_Meal_PlansCollectionArgs = {
  objects: Array<Ai_Meal_PlansInsertInput>;
};


export type MutationInsertIntoai_Workout_PlansCollectionArgs = {
  objects: Array<Ai_Workout_PlansInsertInput>;
};


export type MutationInsertIntodaily_Nutrition_LogsCollectionArgs = {
  objects: Array<Daily_Nutrition_LogsInsertInput>;
};


export type MutationInsertIntoprofilesCollectionArgs = {
  objects: Array<ProfilesInsertInput>;
};


export type MutationInsertIntoworkout_LogsCollectionArgs = {
  objects: Array<Workout_LogsInsertInput>;
};


export type MutationUpdateprofilesCollectionArgs = {
  filter?: InputMaybe<ProfilesFilter>;
  set: ProfilesUpdateInput;
};

export type OrderByDirection =
  | 'AscNullsFirst'
  | 'AscNullsLast'
  | 'DescNullsFirst'
  | 'DescNullsLast';

export type PageInfo = {
  __typename: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename: 'Query';
  ai_meal_plansCollection?: Maybe<Ai_Meal_PlansConnection>;
  ai_workout_plansCollection?: Maybe<Ai_Workout_PlansConnection>;
  daily_nutrition_logsCollection?: Maybe<Daily_Nutrition_LogsConnection>;
  profilesCollection?: Maybe<ProfilesConnection>;
  progress_photosCollection?: Maybe<Progress_PhotosConnection>;
  quiz_resultsCollection?: Maybe<Quiz_ResultsConnection>;
  subscriptionsCollection?: Maybe<SubscriptionsConnection>;
  workout_logsCollection?: Maybe<Workout_LogsConnection>;
};


export type QueryAi_Meal_PlansCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Ai_Meal_PlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Ai_Meal_PlansOrderBy>>;
};


export type QueryAi_Workout_PlansCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Ai_Workout_PlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDaily_Nutrition_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Daily_Nutrition_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProfilesCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ProfilesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ProfilesOrderBy>>;
};


export type QueryProgress_PhotosCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Progress_PhotosFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryQuiz_ResultsCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Quiz_ResultsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySubscriptionsCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SubscriptionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkout_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Workout_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
};

export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

export type Ai_Meal_Plans = {
  __typename: 'ai_meal_plans';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_calories?: Maybe<Scalars['Int']['output']>;
  daily_carbs?: Maybe<Scalars['Float']['output']>;
  daily_fats?: Maybe<Scalars['Float']['output']>;
  daily_protein?: Maybe<Scalars['Float']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  generated_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  plan_data?: Maybe<Scalars['JSON']['output']>;
  preferences?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Profiles>;
  quiz_result?: Maybe<Quiz_Results>;
  quiz_result_id?: Maybe<Scalars['UUID']['output']>;
  restrictions?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Ai_Meal_PlansConnection = {
  __typename: 'ai_meal_plansConnection';
  edges: Array<Ai_Meal_PlansEdge>;
  pageInfo: PageInfo;
};

export type Ai_Meal_PlansEdge = {
  __typename: 'ai_meal_plansEdge';
  cursor: Scalars['String']['output'];
  node: Ai_Meal_Plans;
};

export type Ai_Meal_PlansFilter = {
  is_active?: InputMaybe<BooleanFilter>;
  status?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Ai_Meal_PlansInsertInput = {
  daily_calories?: InputMaybe<Scalars['Int']['input']>;
  daily_carbs?: InputMaybe<Scalars['Float']['input']>;
  daily_fats?: InputMaybe<Scalars['Float']['input']>;
  daily_protein?: InputMaybe<Scalars['Float']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan_data: Scalars['JSON']['input'];
  preferences?: InputMaybe<Scalars['String']['input']>;
  quiz_result_id?: InputMaybe<Scalars['UUID']['input']>;
  restrictions?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  user_id: Scalars['UUID']['input'];
};

export type Ai_Meal_PlansInsertResponse = {
  __typename: 'ai_meal_plansInsertResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Ai_Meal_Plans>;
};

export type Ai_Meal_PlansOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  generated_at?: InputMaybe<OrderByDirection>;
};

export type Ai_Workout_Plans = {
  __typename: 'ai_workout_plans';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  duration_per_session?: Maybe<Scalars['String']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  frequency_per_week?: Maybe<Scalars['Int']['output']>;
  generated_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  plan_data?: Maybe<Scalars['JSON']['output']>;
  profile?: Maybe<Profiles>;
  quiz_result?: Maybe<Quiz_Results>;
  quiz_result_id?: Maybe<Scalars['UUID']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_type?: Maybe<Scalars['String']['output']>;
};

export type Ai_Workout_PlansConnection = {
  __typename: 'ai_workout_plansConnection';
  edges: Array<Ai_Workout_PlansEdge>;
  pageInfo: PageInfo;
};

export type Ai_Workout_PlansEdge = {
  __typename: 'ai_workout_plansEdge';
  cursor: Scalars['String']['output'];
  node: Ai_Workout_Plans;
};

export type Ai_Workout_PlansFilter = {
  is_active?: InputMaybe<BooleanFilter>;
  status?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Ai_Workout_PlansInsertInput = {
  duration_per_session?: InputMaybe<Scalars['String']['input']>;
  frequency_per_week?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan_data: Scalars['JSON']['input'];
  quiz_result_id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  user_id: Scalars['UUID']['input'];
  workout_type: Scalars['String']['input'];
};

export type Ai_Workout_PlansInsertResponse = {
  __typename: 'ai_workout_plansInsertResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Ai_Workout_Plans>;
};

export type Daily_Nutrition_Logs = {
  __typename: 'daily_nutrition_logs';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  food_items?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['UUID']['output'];
  log_date?: Maybe<Scalars['Date']['output']>;
  meal_type?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Profiles>;
  total_calories?: Maybe<Scalars['Float']['output']>;
  total_carbs?: Maybe<Scalars['Float']['output']>;
  total_fats?: Maybe<Scalars['Float']['output']>;
  total_protein?: Maybe<Scalars['Float']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Daily_Nutrition_LogsConnection = {
  __typename: 'daily_nutrition_logsConnection';
  edges: Array<Daily_Nutrition_LogsEdge>;
  pageInfo: PageInfo;
};

export type Daily_Nutrition_LogsEdge = {
  __typename: 'daily_nutrition_logsEdge';
  cursor: Scalars['String']['output'];
  node: Daily_Nutrition_Logs;
};

export type Daily_Nutrition_LogsFilter = {
  log_date?: InputMaybe<DatetimeFilter>;
  meal_type?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Daily_Nutrition_LogsInsertInput = {
  food_items: Scalars['JSON']['input'];
  log_date: Scalars['Date']['input'];
  meal_type: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  total_calories?: InputMaybe<Scalars['Float']['input']>;
  total_carbs?: InputMaybe<Scalars['Float']['input']>;
  total_fats?: InputMaybe<Scalars['Float']['input']>;
  total_protein?: InputMaybe<Scalars['Float']['input']>;
  user_id: Scalars['UUID']['input'];
};

export type Daily_Nutrition_LogsInsertResponse = {
  __typename: 'daily_nutrition_logsInsertResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Daily_Nutrition_Logs>;
};

export type Profiles = {
  __typename: 'profiles';
  age?: Maybe<Scalars['Int']['output']>;
  ai_meal_plans?: Maybe<Array<Ai_Meal_Plans>>;
  ai_workout_plans?: Maybe<Array<Ai_Workout_Plans>>;
  avatar_url?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_nutrition_logs?: Maybe<Array<Daily_Nutrition_Logs>>;
  email: Scalars['String']['output'];
  full_name?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  height_cm?: Maybe<Scalars['Float']['output']>;
  id: Scalars['UUID']['output'];
  occupation_activity?: Maybe<Scalars['String']['output']>;
  onboarding_completed?: Maybe<Scalars['Boolean']['output']>;
  onboarding_step?: Maybe<Scalars['Int']['output']>;
  progress_photos?: Maybe<Array<Progress_Photos>>;
  quiz_results?: Maybe<Array<Quiz_Results>>;
  subscriptions?: Maybe<Subscriptions>;
  target_weight_kg?: Maybe<Scalars['Float']['output']>;
  unit_system?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  weight_kg?: Maybe<Scalars['Float']['output']>;
  workout_logs?: Maybe<Array<Workout_Logs>>;
};

export type ProfilesConnection = {
  __typename: 'profilesConnection';
  edges: Array<ProfilesEdge>;
  pageInfo: PageInfo;
};

export type ProfilesDeleteResponse = {
  __typename: 'profilesDeleteResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Profiles>;
};

export type ProfilesEdge = {
  __typename: 'profilesEdge';
  cursor: Scalars['String']['output'];
  node: Profiles;
};

export type ProfilesFilter = {
  created_at?: InputMaybe<DatetimeFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  onboarding_completed?: InputMaybe<BooleanFilter>;
  username?: InputMaybe<StringFilter>;
};

export type ProfilesInsertInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  full_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  occupation_activity?: InputMaybe<Scalars['String']['input']>;
  onboarding_completed?: InputMaybe<Scalars['Boolean']['input']>;
  onboarding_step?: InputMaybe<Scalars['Int']['input']>;
  target_weight_kg?: InputMaybe<Scalars['Float']['input']>;
  unit_system?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  weight_kg?: InputMaybe<Scalars['Float']['input']>;
};

export type ProfilesInsertResponse = {
  __typename: 'profilesInsertResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Profiles>;
};

export type ProfilesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type ProfilesUpdateInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Float']['input']>;
  occupation_activity?: InputMaybe<Scalars['String']['input']>;
  onboarding_completed?: InputMaybe<Scalars['Boolean']['input']>;
  onboarding_step?: InputMaybe<Scalars['Int']['input']>;
  target_weight_kg?: InputMaybe<Scalars['Float']['input']>;
  unit_system?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  weight_kg?: InputMaybe<Scalars['Float']['input']>;
};

export type ProfilesUpdateResponse = {
  __typename: 'profilesUpdateResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Profiles>;
};

export type Progress_Photos = {
  __typename: 'progress_photos';
  body_fat_percentage?: Maybe<Scalars['Float']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  photo_date?: Maybe<Scalars['Date']['output']>;
  photo_url?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Profiles>;
  user_id: Scalars['UUID']['output'];
  visibility?: Maybe<Scalars['String']['output']>;
  weight_kg?: Maybe<Scalars['Float']['output']>;
};

export type Progress_PhotosConnection = {
  __typename: 'progress_photosConnection';
  edges: Array<Progress_PhotosEdge>;
  pageInfo: PageInfo;
};

export type Progress_PhotosEdge = {
  __typename: 'progress_photosEdge';
  cursor: Scalars['String']['output'];
  node: Progress_Photos;
};

export type Progress_PhotosFilter = {
  photo_date?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  visibility?: InputMaybe<StringFilter>;
};

export type Quiz_Results = {
  __typename: 'quiz_results';
  answers?: Maybe<Scalars['JSON']['output']>;
  calculations?: Maybe<Scalars['JSON']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  profile?: Maybe<Profiles>;
  user_id: Scalars['UUID']['output'];
};

export type Quiz_ResultsConnection = {
  __typename: 'quiz_resultsConnection';
  edges: Array<Quiz_ResultsEdge>;
  pageInfo: PageInfo;
};

export type Quiz_ResultsEdge = {
  __typename: 'quiz_resultsEdge';
  cursor: Scalars['String']['output'];
  node: Quiz_Results;
};

export type Quiz_ResultsFilter = {
  created_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Subscriptions = {
  __typename: 'subscriptions';
  cancel_at_period_end?: Maybe<Scalars['Boolean']['output']>;
  canceled_at?: Maybe<Scalars['Datetime']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  current_period_end?: Maybe<Scalars['Datetime']['output']>;
  current_period_start?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  profile?: Maybe<Profiles>;
  status?: Maybe<Scalars['String']['output']>;
  stripe_customer_id?: Maybe<Scalars['String']['output']>;
  stripe_price_id?: Maybe<Scalars['String']['output']>;
  stripe_subscription_id?: Maybe<Scalars['String']['output']>;
  tier?: Maybe<Scalars['String']['output']>;
  trial_end?: Maybe<Scalars['Datetime']['output']>;
  trial_start?: Maybe<Scalars['Datetime']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type SubscriptionsConnection = {
  __typename: 'subscriptionsConnection';
  edges: Array<SubscriptionsEdge>;
  pageInfo: PageInfo;
};

export type SubscriptionsEdge = {
  __typename: 'subscriptionsEdge';
  cursor: Scalars['String']['output'];
  node: Subscriptions;
};

export type SubscriptionsFilter = {
  status?: InputMaybe<StringFilter>;
  tier?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Workout_Logs = {
  __typename: 'workout_logs';
  calories_burned?: Maybe<Scalars['Int']['output']>;
  completed?: Maybe<Scalars['Boolean']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  duration_minutes?: Maybe<Scalars['Int']['output']>;
  exercises?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['UUID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Profiles>;
  user_id: Scalars['UUID']['output'];
  workout_date?: Maybe<Scalars['Date']['output']>;
  workout_type?: Maybe<Scalars['String']['output']>;
};

export type Workout_LogsConnection = {
  __typename: 'workout_logsConnection';
  edges: Array<Workout_LogsEdge>;
  pageInfo: PageInfo;
};

export type Workout_LogsEdge = {
  __typename: 'workout_logsEdge';
  cursor: Scalars['String']['output'];
  node: Workout_Logs;
};

export type Workout_LogsFilter = {
  completed?: InputMaybe<BooleanFilter>;
  user_id?: InputMaybe<UuidFilter>;
  workout_date?: InputMaybe<DatetimeFilter>;
};

export type Workout_LogsInsertInput = {
  calories_burned?: InputMaybe<Scalars['Int']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  exercises: Scalars['JSON']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  user_id: Scalars['UUID']['input'];
  workout_date: Scalars['Date']['input'];
  workout_type: Scalars['String']['input'];
};

export type Workout_LogsInsertResponse = {
  __typename: 'workout_logsInsertResponse';
  affectedCount: Scalars['Int']['output'];
  records: Array<Workout_Logs>;
};

export type GetDailyNutritionLogsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  logDate: Scalars['Datetime']['input'];
}>;


export type GetDailyNutritionLogsQuery = { __typename: 'Query', daily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsConnection', edges: Array<{ __typename: 'daily_nutrition_logsEdge', node: { __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date?: string | null, meal_type?: string | null, food_items?: any | null, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetRecentNutritionLogsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecentNutritionLogsQuery = { __typename: 'Query', daily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsConnection', edges: Array<{ __typename: 'daily_nutrition_logsEdge', node: { __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date?: string | null, meal_type?: string | null, food_items?: any | null, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetNutritionLogsByMealQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  logDate: Scalars['Datetime']['input'];
  mealType: Scalars['String']['input'];
}>;


export type GetNutritionLogsByMealQuery = { __typename: 'Query', daily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsConnection', edges: Array<{ __typename: 'daily_nutrition_logsEdge', node: { __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date?: string | null, meal_type?: string | null, food_items?: any | null, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null } }> } | null };

export type LogNutritionMutationVariables = Exact<{
  input: Daily_Nutrition_LogsInsertInput;
}>;


export type LogNutritionMutation = { __typename: 'Mutation', insertIntodaily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsInsertResponse', affectedCount: number, records: Array<{ __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date?: string | null, meal_type?: string | null, food_items?: any | null, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null }> } | null };

export type GetDailyWorkoutLogsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  workoutDate: Scalars['Datetime']['input'];
}>;


export type GetDailyWorkoutLogsQuery = { __typename: 'Query', workout_logsCollection?: { __typename: 'workout_logsConnection', edges: Array<{ __typename: 'workout_logsEdge', node: { __typename: 'workout_logs', id: string, user_id: string, workout_date?: string | null, workout_type?: string | null, exercises?: any | null, duration_minutes?: number | null, calories_burned?: number | null, notes?: string | null, completed?: boolean | null, created_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetRecentWorkoutLogsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecentWorkoutLogsQuery = { __typename: 'Query', workout_logsCollection?: { __typename: 'workout_logsConnection', edges: Array<{ __typename: 'workout_logsEdge', node: { __typename: 'workout_logs', id: string, user_id: string, workout_date?: string | null, workout_type?: string | null, exercises?: any | null, duration_minutes?: number | null, calories_burned?: number | null, notes?: string | null, completed?: boolean | null, created_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetRecentCompletedWorkoutsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecentCompletedWorkoutsQuery = { __typename: 'Query', workout_logsCollection?: { __typename: 'workout_logsConnection', edges: Array<{ __typename: 'workout_logsEdge', node: { __typename: 'workout_logs', id: string, user_id: string, workout_date?: string | null, workout_type?: string | null, exercises?: any | null, duration_minutes?: number | null, calories_burned?: number | null, notes?: string | null, completed?: boolean | null, created_at?: string | null } }> } | null };

export type LogWorkoutMutationVariables = Exact<{
  input: Workout_LogsInsertInput;
}>;


export type LogWorkoutMutation = { __typename: 'Mutation', insertIntoworkout_logsCollection?: { __typename: 'workout_logsInsertResponse', affectedCount: number, records: Array<{ __typename: 'workout_logs', id: string, user_id: string, workout_date?: string | null, workout_type?: string | null, exercises?: any | null, duration_minutes?: number | null, calories_burned?: number | null, notes?: string | null, completed?: boolean | null, created_at?: string | null }> } | null };

export type GetActiveMealPlanQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetActiveMealPlanQuery = { __typename: 'Query', ai_meal_plansCollection?: { __typename: 'ai_meal_plansConnection', edges: Array<{ __typename: 'ai_meal_plansEdge', node: { __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, daily_protein?: number | null, daily_carbs?: number | null, daily_fats?: number | null, preferences?: string | null, restrictions?: string | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetUserMealPlansQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserMealPlansQuery = { __typename: 'Query', ai_meal_plansCollection?: { __typename: 'ai_meal_plansConnection', edges: Array<{ __typename: 'ai_meal_plansEdge', node: { __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, daily_protein?: number | null, daily_carbs?: number | null, daily_fats?: number | null, preferences?: string | null, restrictions?: string | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type CreateMealPlanMutationVariables = Exact<{
  input: Ai_Meal_PlansInsertInput;
}>;


export type CreateMealPlanMutation = { __typename: 'Mutation', insertIntoai_meal_plansCollection?: { __typename: 'ai_meal_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, daily_protein?: number | null, daily_carbs?: number | null, daily_fats?: number | null, preferences?: string | null, restrictions?: string | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };

export type GetUserOnboardingStatusQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserOnboardingStatusQuery = { __typename: 'Query', profilesCollection?: { __typename: 'profilesConnection', edges: Array<{ __typename: 'profilesEdge', node: { __typename: 'profiles', id: string, email: string, onboarding_completed?: boolean | null, onboarding_step?: number | null, height_cm?: number | null, weight_kg?: number | null, age?: number | null, gender?: string | null, created_at?: string | null } }> } | null };

export type GetUserQuizResultsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserQuizResultsQuery = { __typename: 'Query', quiz_resultsCollection?: { __typename: 'quiz_resultsConnection', edges: Array<{ __typename: 'quiz_resultsEdge', node: { __typename: 'quiz_results', id: string, user_id: string, answers?: any | null, calculations?: any | null, created_at?: string | null } }> } | null };

export type SaveOnboardingDataMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  updates: ProfilesUpdateInput;
}>;


export type SaveOnboardingDataMutation = { __typename: 'Mutation', updateprofilesCollection?: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, email: string, full_name?: string | null, age?: number | null, gender?: string | null, height_cm?: number | null, weight_kg?: number | null, target_weight_kg?: number | null, unit_system?: string | null, occupation_activity?: string | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, updated_at?: string | null }> } | null };

export type GenerateAiMealPlanMutationVariables = Exact<{
  input: Ai_Meal_PlansInsertInput;
}>;


export type GenerateAiMealPlanMutation = { __typename: 'Mutation', insertIntoai_meal_plansCollection?: { __typename: 'ai_meal_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, daily_protein?: number | null, daily_carbs?: number | null, daily_fats?: number | null, preferences?: string | null, restrictions?: string | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };

export type GenerateAiWorkoutPlanMutationVariables = Exact<{
  input: Ai_Workout_PlansInsertInput;
}>;


export type GenerateAiWorkoutPlanMutation = { __typename: 'Mutation', insertIntoai_workout_plansCollection?: { __typename: 'ai_workout_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, workout_type?: string | null, duration_per_session?: string | null, frequency_per_week?: number | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };

export type GetUserProfileQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserProfileQuery = { __typename: 'Query', profilesCollection?: { __typename: 'profilesConnection', edges: Array<{ __typename: 'profilesEdge', node: { __typename: 'profiles', id: string, email: string, full_name?: string | null, username?: string | null, avatar_url?: string | null, age?: number | null, gender?: string | null, height_cm?: number | null, weight_kg?: number | null, target_weight_kg?: number | null, unit_system?: string | null, occupation_activity?: string | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, created_at?: string | null, updated_at?: string | null, subscriptions?: { __typename: 'subscriptions', id: string, tier?: string | null, status?: string | null, stripe_customer_id?: string | null, stripe_subscription_id?: string | null, current_period_start?: string | null, current_period_end?: string | null, trial_end?: string | null, cancel_at_period_end?: boolean | null } | null } }> } | null };

export type GetProfileQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetProfileQuery = { __typename: 'Query', profilesCollection?: { __typename: 'profilesConnection', edges: Array<{ __typename: 'profilesEdge', node: { __typename: 'profiles', id: string, email: string, full_name?: string | null, username?: string | null, avatar_url?: string | null, age?: number | null, gender?: string | null, height_cm?: number | null, weight_kg?: number | null, target_weight_kg?: number | null, unit_system?: string | null, occupation_activity?: string | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, created_at?: string | null, updated_at?: string | null } }> } | null };

export type GetUserSubscriptionQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserSubscriptionQuery = { __typename: 'Query', subscriptionsCollection?: { __typename: 'subscriptionsConnection', edges: Array<{ __typename: 'subscriptionsEdge', node: { __typename: 'subscriptions', id: string, user_id: string, tier?: string | null, status?: string | null, stripe_customer_id?: string | null, stripe_subscription_id?: string | null, stripe_price_id?: string | null, current_period_start?: string | null, current_period_end?: string | null, trial_start?: string | null, trial_end?: string | null, cancel_at_period_end?: boolean | null, canceled_at?: string | null, metadata?: any | null, created_at?: string | null, updated_at?: string | null } }> } | null };

export type UpdateUserProfileMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  age?: InputMaybe<Scalars['Int']['input']>;
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  heightCm?: InputMaybe<Scalars['Float']['input']>;
  weightKg?: InputMaybe<Scalars['Float']['input']>;
  targetWeightKg?: InputMaybe<Scalars['Float']['input']>;
  unitSystem?: InputMaybe<Scalars['String']['input']>;
  occupationActivity?: InputMaybe<Scalars['String']['input']>;
  onboardingCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  onboardingStep?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateUserProfileMutation = { __typename: 'Mutation', updateprofilesCollection?: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, email: string, full_name?: string | null, username?: string | null, avatar_url?: string | null, age?: number | null, gender?: string | null, height_cm?: number | null, weight_kg?: number | null, target_weight_kg?: number | null, unit_system?: string | null, occupation_activity?: string | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, updated_at?: string | null }> } | null };

export type CreateUserProfileMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  email: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  age?: InputMaybe<Scalars['Int']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  heightCm?: InputMaybe<Scalars['Float']['input']>;
  weightKg?: InputMaybe<Scalars['Float']['input']>;
  targetWeightKg?: InputMaybe<Scalars['Float']['input']>;
}>;


export type CreateUserProfileMutation = { __typename: 'Mutation', insertIntoprofilesCollection?: { __typename: 'profilesInsertResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, email: string, full_name?: string | null, age?: number | null, gender?: string | null, height_cm?: number | null, weight_kg?: number | null, target_weight_kg?: number | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, created_at?: string | null }> } | null };

export type UpdateUserAvatarMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  avatarUrl: Scalars['String']['input'];
}>;


export type UpdateUserAvatarMutation = { __typename: 'Mutation', updateprofilesCollection?: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, avatar_url?: string | null, updated_at?: string | null }> } | null };

export type DeleteUserAvatarMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type DeleteUserAvatarMutation = { __typename: 'Mutation', updateprofilesCollection?: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, avatar_url?: string | null, updated_at?: string | null }> } | null };

export type GetActiveWorkoutPlanQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetActiveWorkoutPlanQuery = { __typename: 'Query', ai_workout_plansCollection?: { __typename: 'ai_workout_plansConnection', edges: Array<{ __typename: 'ai_workout_plansEdge', node: { __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, workout_type?: string | null, duration_per_session?: string | null, frequency_per_week?: number | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetUserWorkoutPlansQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserWorkoutPlansQuery = { __typename: 'Query', ai_workout_plansCollection?: { __typename: 'ai_workout_plansConnection', edges: Array<{ __typename: 'ai_workout_plansEdge', node: { __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, workout_type?: string | null, duration_per_session?: string | null, frequency_per_week?: number | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type CreateWorkoutPlanMutationVariables = Exact<{
  input: Ai_Workout_PlansInsertInput;
}>;


export type CreateWorkoutPlanMutation = { __typename: 'Mutation', insertIntoai_workout_plansCollection?: { __typename: 'ai_workout_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, workout_type?: string | null, duration_per_session?: string | null, frequency_per_week?: number | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };


export const GetDailyNutritionLogsDocument = gql`
    query GetDailyNutritionLogs($userId: UUID!, $logDate: Datetime!) {
  daily_nutrition_logsCollection(
    filter: {user_id: {eq: $userId}, log_date: {eq: $logDate}}
    first: 100
  ) {
    edges {
      node {
        id
        user_id
        log_date
        meal_type
        food_items
        total_calories
        total_protein
        total_carbs
        total_fats
        notes
        created_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetDailyNutritionLogsQuery__
 *
 * To run a query within a React component, call `useGetDailyNutritionLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDailyNutritionLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDailyNutritionLogsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      logDate: // value for 'logDate'
 *   },
 * });
 */
export function useGetDailyNutritionLogsQuery(baseOptions: QueryHookOptions<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables> & ({ variables: GetDailyNutritionLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables>(GetDailyNutritionLogsDocument, options);
      }
export function useGetDailyNutritionLogsLazyQuery(baseOptions?: LazyQueryHookOptions<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables>(GetDailyNutritionLogsDocument, options);
        }
export function useGetDailyNutritionLogsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables>(GetDailyNutritionLogsDocument, options as any);
        }
export type GetDailyNutritionLogsQueryHookResult = ReturnType<typeof useGetDailyNutritionLogsQuery>;
export type GetDailyNutritionLogsLazyQueryHookResult = ReturnType<typeof useGetDailyNutritionLogsLazyQuery>;
export type GetDailyNutritionLogsSuspenseQueryHookResult = ReturnType<typeof useGetDailyNutritionLogsSuspenseQuery>;
export type GetDailyNutritionLogsQueryResult = QueryResult<GetDailyNutritionLogsQuery, GetDailyNutritionLogsQueryVariables>;
export const GetRecentNutritionLogsDocument = gql`
    query GetRecentNutritionLogs($userId: UUID!, $first: Int = 50) {
  daily_nutrition_logsCollection(filter: {user_id: {eq: $userId}}, first: $first) {
    edges {
      node {
        id
        user_id
        log_date
        meal_type
        food_items
        total_calories
        total_protein
        total_carbs
        total_fats
        notes
        created_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetRecentNutritionLogsQuery__
 *
 * To run a query within a React component, call `useGetRecentNutritionLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentNutritionLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentNutritionLogsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGetRecentNutritionLogsQuery(baseOptions: QueryHookOptions<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables> & ({ variables: GetRecentNutritionLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables>(GetRecentNutritionLogsDocument, options);
      }
export function useGetRecentNutritionLogsLazyQuery(baseOptions?: LazyQueryHookOptions<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables>(GetRecentNutritionLogsDocument, options);
        }
export function useGetRecentNutritionLogsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables>(GetRecentNutritionLogsDocument, options as any);
        }
export type GetRecentNutritionLogsQueryHookResult = ReturnType<typeof useGetRecentNutritionLogsQuery>;
export type GetRecentNutritionLogsLazyQueryHookResult = ReturnType<typeof useGetRecentNutritionLogsLazyQuery>;
export type GetRecentNutritionLogsSuspenseQueryHookResult = ReturnType<typeof useGetRecentNutritionLogsSuspenseQuery>;
export type GetRecentNutritionLogsQueryResult = QueryResult<GetRecentNutritionLogsQuery, GetRecentNutritionLogsQueryVariables>;
export const GetNutritionLogsByMealDocument = gql`
    query GetNutritionLogsByMeal($userId: UUID!, $logDate: Datetime!, $mealType: String!) {
  daily_nutrition_logsCollection(
    filter: {user_id: {eq: $userId}, log_date: {eq: $logDate}, meal_type: {eq: $mealType}}
    first: 100
  ) {
    edges {
      node {
        id
        user_id
        log_date
        meal_type
        food_items
        total_calories
        total_protein
        total_carbs
        total_fats
        notes
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetNutritionLogsByMealQuery__
 *
 * To run a query within a React component, call `useGetNutritionLogsByMealQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNutritionLogsByMealQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNutritionLogsByMealQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      logDate: // value for 'logDate'
 *      mealType: // value for 'mealType'
 *   },
 * });
 */
export function useGetNutritionLogsByMealQuery(baseOptions: QueryHookOptions<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables> & ({ variables: GetNutritionLogsByMealQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables>(GetNutritionLogsByMealDocument, options);
      }
export function useGetNutritionLogsByMealLazyQuery(baseOptions?: LazyQueryHookOptions<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables>(GetNutritionLogsByMealDocument, options);
        }
export function useGetNutritionLogsByMealSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables>(GetNutritionLogsByMealDocument, options as any);
        }
export type GetNutritionLogsByMealQueryHookResult = ReturnType<typeof useGetNutritionLogsByMealQuery>;
export type GetNutritionLogsByMealLazyQueryHookResult = ReturnType<typeof useGetNutritionLogsByMealLazyQuery>;
export type GetNutritionLogsByMealSuspenseQueryHookResult = ReturnType<typeof useGetNutritionLogsByMealSuspenseQuery>;
export type GetNutritionLogsByMealQueryResult = QueryResult<GetNutritionLogsByMealQuery, GetNutritionLogsByMealQueryVariables>;
export const LogNutritionDocument = gql`
    mutation LogNutrition($input: daily_nutrition_logsInsertInput!) {
  insertIntodaily_nutrition_logsCollection(objects: [$input]) {
    records {
      id
      user_id
      log_date
      meal_type
      food_items
      total_calories
      total_protein
      total_carbs
      total_fats
      notes
      created_at
    }
    affectedCount
  }
}
    `;
export type LogNutritionMutationFn = MutationFunction<LogNutritionMutation, LogNutritionMutationVariables>;

/**
 * __useLogNutritionMutation__
 *
 * To run a mutation, you first call `useLogNutritionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogNutritionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logNutritionMutation, { data, loading, error }] = useLogNutritionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLogNutritionMutation(baseOptions?: MutationHookOptions<LogNutritionMutation, LogNutritionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<LogNutritionMutation, LogNutritionMutationVariables>(LogNutritionDocument, options);
      }
export type LogNutritionMutationHookResult = ReturnType<typeof useLogNutritionMutation>;
export type LogNutritionMutationResult = MutationResult<LogNutritionMutation>;
export type LogNutritionMutationOptions = BaseMutationOptions<LogNutritionMutation, LogNutritionMutationVariables>;
export const GetDailyWorkoutLogsDocument = gql`
    query GetDailyWorkoutLogs($userId: UUID!, $workoutDate: Datetime!) {
  workout_logsCollection(
    filter: {user_id: {eq: $userId}, workout_date: {eq: $workoutDate}}
    first: 100
  ) {
    edges {
      node {
        id
        user_id
        workout_date
        workout_type
        exercises
        duration_minutes
        calories_burned
        notes
        completed
        created_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
    `;

/**
 * __useGetDailyWorkoutLogsQuery__
 *
 * To run a query within a React component, call `useGetDailyWorkoutLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDailyWorkoutLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDailyWorkoutLogsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      workoutDate: // value for 'workoutDate'
 *   },
 * });
 */
export function useGetDailyWorkoutLogsQuery(baseOptions: QueryHookOptions<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables> & ({ variables: GetDailyWorkoutLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables>(GetDailyWorkoutLogsDocument, options);
      }
export function useGetDailyWorkoutLogsLazyQuery(baseOptions?: LazyQueryHookOptions<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables>(GetDailyWorkoutLogsDocument, options);
        }
export function useGetDailyWorkoutLogsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables>(GetDailyWorkoutLogsDocument, options as any);
        }
export type GetDailyWorkoutLogsQueryHookResult = ReturnType<typeof useGetDailyWorkoutLogsQuery>;
export type GetDailyWorkoutLogsLazyQueryHookResult = ReturnType<typeof useGetDailyWorkoutLogsLazyQuery>;
export type GetDailyWorkoutLogsSuspenseQueryHookResult = ReturnType<typeof useGetDailyWorkoutLogsSuspenseQuery>;
export type GetDailyWorkoutLogsQueryResult = QueryResult<GetDailyWorkoutLogsQuery, GetDailyWorkoutLogsQueryVariables>;
export const GetRecentWorkoutLogsDocument = gql`
    query GetRecentWorkoutLogs($userId: UUID!, $first: Int = 50) {
  workout_logsCollection(filter: {user_id: {eq: $userId}}, first: $first) {
    edges {
      node {
        id
        user_id
        workout_date
        workout_type
        exercises
        duration_minutes
        calories_burned
        notes
        completed
        created_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetRecentWorkoutLogsQuery__
 *
 * To run a query within a React component, call `useGetRecentWorkoutLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentWorkoutLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentWorkoutLogsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGetRecentWorkoutLogsQuery(baseOptions: QueryHookOptions<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables> & ({ variables: GetRecentWorkoutLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables>(GetRecentWorkoutLogsDocument, options);
      }
export function useGetRecentWorkoutLogsLazyQuery(baseOptions?: LazyQueryHookOptions<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables>(GetRecentWorkoutLogsDocument, options);
        }
export function useGetRecentWorkoutLogsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables>(GetRecentWorkoutLogsDocument, options as any);
        }
export type GetRecentWorkoutLogsQueryHookResult = ReturnType<typeof useGetRecentWorkoutLogsQuery>;
export type GetRecentWorkoutLogsLazyQueryHookResult = ReturnType<typeof useGetRecentWorkoutLogsLazyQuery>;
export type GetRecentWorkoutLogsSuspenseQueryHookResult = ReturnType<typeof useGetRecentWorkoutLogsSuspenseQuery>;
export type GetRecentWorkoutLogsQueryResult = QueryResult<GetRecentWorkoutLogsQuery, GetRecentWorkoutLogsQueryVariables>;
export const GetRecentCompletedWorkoutsDocument = gql`
    query GetRecentCompletedWorkouts($userId: UUID!, $first: Int = 10) {
  workout_logsCollection(
    filter: {user_id: {eq: $userId}, completed: {eq: true}}
    first: $first
  ) {
    edges {
      node {
        id
        user_id
        workout_date
        workout_type
        exercises
        duration_minutes
        calories_burned
        notes
        completed
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetRecentCompletedWorkoutsQuery__
 *
 * To run a query within a React component, call `useGetRecentCompletedWorkoutsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRecentCompletedWorkoutsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRecentCompletedWorkoutsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGetRecentCompletedWorkoutsQuery(baseOptions: QueryHookOptions<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables> & ({ variables: GetRecentCompletedWorkoutsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables>(GetRecentCompletedWorkoutsDocument, options);
      }
export function useGetRecentCompletedWorkoutsLazyQuery(baseOptions?: LazyQueryHookOptions<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables>(GetRecentCompletedWorkoutsDocument, options);
        }
export function useGetRecentCompletedWorkoutsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables>(GetRecentCompletedWorkoutsDocument, options as any);
        }
export type GetRecentCompletedWorkoutsQueryHookResult = ReturnType<typeof useGetRecentCompletedWorkoutsQuery>;
export type GetRecentCompletedWorkoutsLazyQueryHookResult = ReturnType<typeof useGetRecentCompletedWorkoutsLazyQuery>;
export type GetRecentCompletedWorkoutsSuspenseQueryHookResult = ReturnType<typeof useGetRecentCompletedWorkoutsSuspenseQuery>;
export type GetRecentCompletedWorkoutsQueryResult = QueryResult<GetRecentCompletedWorkoutsQuery, GetRecentCompletedWorkoutsQueryVariables>;
export const LogWorkoutDocument = gql`
    mutation LogWorkout($input: workout_logsInsertInput!) {
  insertIntoworkout_logsCollection(objects: [$input]) {
    records {
      id
      user_id
      workout_date
      workout_type
      exercises
      duration_minutes
      calories_burned
      notes
      completed
      created_at
    }
    affectedCount
  }
}
    `;
export type LogWorkoutMutationFn = MutationFunction<LogWorkoutMutation, LogWorkoutMutationVariables>;

/**
 * __useLogWorkoutMutation__
 *
 * To run a mutation, you first call `useLogWorkoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogWorkoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logWorkoutMutation, { data, loading, error }] = useLogWorkoutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLogWorkoutMutation(baseOptions?: MutationHookOptions<LogWorkoutMutation, LogWorkoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<LogWorkoutMutation, LogWorkoutMutationVariables>(LogWorkoutDocument, options);
      }
export type LogWorkoutMutationHookResult = ReturnType<typeof useLogWorkoutMutation>;
export type LogWorkoutMutationResult = MutationResult<LogWorkoutMutation>;
export type LogWorkoutMutationOptions = BaseMutationOptions<LogWorkoutMutation, LogWorkoutMutationVariables>;
export const GetActiveMealPlanDocument = gql`
    query GetActiveMealPlan($userId: UUID!) {
  ai_meal_plansCollection(
    filter: {user_id: {eq: $userId}, is_active: {eq: true}}
    first: 1
    orderBy: [{generated_at: DescNullsLast}]
  ) {
    edges {
      node {
        id
        user_id
        quiz_result_id
        plan_data
        daily_calories
        daily_protein
        daily_carbs
        daily_fats
        preferences
        restrictions
        status
        is_active
        error_message
        generated_at
        created_at
        updated_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetActiveMealPlanQuery__
 *
 * To run a query within a React component, call `useGetActiveMealPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveMealPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveMealPlanQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetActiveMealPlanQuery(baseOptions: QueryHookOptions<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables> & ({ variables: GetActiveMealPlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables>(GetActiveMealPlanDocument, options);
      }
export function useGetActiveMealPlanLazyQuery(baseOptions?: LazyQueryHookOptions<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables>(GetActiveMealPlanDocument, options);
        }
export function useGetActiveMealPlanSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables>(GetActiveMealPlanDocument, options as any);
        }
export type GetActiveMealPlanQueryHookResult = ReturnType<typeof useGetActiveMealPlanQuery>;
export type GetActiveMealPlanLazyQueryHookResult = ReturnType<typeof useGetActiveMealPlanLazyQuery>;
export type GetActiveMealPlanSuspenseQueryHookResult = ReturnType<typeof useGetActiveMealPlanSuspenseQuery>;
export type GetActiveMealPlanQueryResult = QueryResult<GetActiveMealPlanQuery, GetActiveMealPlanQueryVariables>;
export const GetUserMealPlansDocument = gql`
    query GetUserMealPlans($userId: UUID!, $first: Int = 10) {
  ai_meal_plansCollection(
    filter: {user_id: {eq: $userId}}
    first: $first
    orderBy: [{generated_at: DescNullsLast}]
  ) {
    edges {
      node {
        id
        user_id
        quiz_result_id
        plan_data
        daily_calories
        daily_protein
        daily_carbs
        daily_fats
        preferences
        restrictions
        status
        is_active
        error_message
        generated_at
        created_at
        updated_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetUserMealPlansQuery__
 *
 * To run a query within a React component, call `useGetUserMealPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserMealPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserMealPlansQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGetUserMealPlansQuery(baseOptions: QueryHookOptions<GetUserMealPlansQuery, GetUserMealPlansQueryVariables> & ({ variables: GetUserMealPlansQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserMealPlansQuery, GetUserMealPlansQueryVariables>(GetUserMealPlansDocument, options);
      }
export function useGetUserMealPlansLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserMealPlansQuery, GetUserMealPlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserMealPlansQuery, GetUserMealPlansQueryVariables>(GetUserMealPlansDocument, options);
        }
export function useGetUserMealPlansSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserMealPlansQuery, GetUserMealPlansQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserMealPlansQuery, GetUserMealPlansQueryVariables>(GetUserMealPlansDocument, options as any);
        }
export type GetUserMealPlansQueryHookResult = ReturnType<typeof useGetUserMealPlansQuery>;
export type GetUserMealPlansLazyQueryHookResult = ReturnType<typeof useGetUserMealPlansLazyQuery>;
export type GetUserMealPlansSuspenseQueryHookResult = ReturnType<typeof useGetUserMealPlansSuspenseQuery>;
export type GetUserMealPlansQueryResult = QueryResult<GetUserMealPlansQuery, GetUserMealPlansQueryVariables>;
export const CreateMealPlanDocument = gql`
    mutation CreateMealPlan($input: ai_meal_plansInsertInput!) {
  insertIntoai_meal_plansCollection(objects: [$input]) {
    records {
      id
      user_id
      quiz_result_id
      plan_data
      daily_calories
      daily_protein
      daily_carbs
      daily_fats
      preferences
      restrictions
      status
      is_active
      generated_at
      created_at
    }
    affectedCount
  }
}
    `;
export type CreateMealPlanMutationFn = MutationFunction<CreateMealPlanMutation, CreateMealPlanMutationVariables>;

/**
 * __useCreateMealPlanMutation__
 *
 * To run a mutation, you first call `useCreateMealPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMealPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMealPlanMutation, { data, loading, error }] = useCreateMealPlanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMealPlanMutation(baseOptions?: MutationHookOptions<CreateMealPlanMutation, CreateMealPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<CreateMealPlanMutation, CreateMealPlanMutationVariables>(CreateMealPlanDocument, options);
      }
export type CreateMealPlanMutationHookResult = ReturnType<typeof useCreateMealPlanMutation>;
export type CreateMealPlanMutationResult = MutationResult<CreateMealPlanMutation>;
export type CreateMealPlanMutationOptions = BaseMutationOptions<CreateMealPlanMutation, CreateMealPlanMutationVariables>;
export const GetUserOnboardingStatusDocument = gql`
    query GetUserOnboardingStatus($userId: UUID!) {
  profilesCollection(filter: {id: {eq: $userId}}, first: 1) {
    edges {
      node {
        id
        email
        onboarding_completed
        onboarding_step
        height_cm
        weight_kg
        age
        gender
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetUserOnboardingStatusQuery__
 *
 * To run a query within a React component, call `useGetUserOnboardingStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserOnboardingStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserOnboardingStatusQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserOnboardingStatusQuery(baseOptions: QueryHookOptions<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables> & ({ variables: GetUserOnboardingStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables>(GetUserOnboardingStatusDocument, options);
      }
export function useGetUserOnboardingStatusLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables>(GetUserOnboardingStatusDocument, options);
        }
export function useGetUserOnboardingStatusSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables>(GetUserOnboardingStatusDocument, options as any);
        }
export type GetUserOnboardingStatusQueryHookResult = ReturnType<typeof useGetUserOnboardingStatusQuery>;
export type GetUserOnboardingStatusLazyQueryHookResult = ReturnType<typeof useGetUserOnboardingStatusLazyQuery>;
export type GetUserOnboardingStatusSuspenseQueryHookResult = ReturnType<typeof useGetUserOnboardingStatusSuspenseQuery>;
export type GetUserOnboardingStatusQueryResult = QueryResult<GetUserOnboardingStatusQuery, GetUserOnboardingStatusQueryVariables>;
export const GetUserQuizResultsDocument = gql`
    query GetUserQuizResults($userId: UUID!) {
  quiz_resultsCollection(filter: {user_id: {eq: $userId}}, first: 1) {
    edges {
      node {
        id
        user_id
        answers
        calculations
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetUserQuizResultsQuery__
 *
 * To run a query within a React component, call `useGetUserQuizResultsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuizResultsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuizResultsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserQuizResultsQuery(baseOptions: QueryHookOptions<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables> & ({ variables: GetUserQuizResultsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables>(GetUserQuizResultsDocument, options);
      }
export function useGetUserQuizResultsLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables>(GetUserQuizResultsDocument, options);
        }
export function useGetUserQuizResultsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables>(GetUserQuizResultsDocument, options as any);
        }
export type GetUserQuizResultsQueryHookResult = ReturnType<typeof useGetUserQuizResultsQuery>;
export type GetUserQuizResultsLazyQueryHookResult = ReturnType<typeof useGetUserQuizResultsLazyQuery>;
export type GetUserQuizResultsSuspenseQueryHookResult = ReturnType<typeof useGetUserQuizResultsSuspenseQuery>;
export type GetUserQuizResultsQueryResult = QueryResult<GetUserQuizResultsQuery, GetUserQuizResultsQueryVariables>;
export const SaveOnboardingDataDocument = gql`
    mutation SaveOnboardingData($userId: UUID!, $updates: profilesUpdateInput!) {
  updateprofilesCollection(filter: {id: {eq: $userId}}, set: $updates) {
    records {
      id
      email
      full_name
      age
      gender
      height_cm
      weight_kg
      target_weight_kg
      unit_system
      occupation_activity
      onboarding_completed
      onboarding_step
      updated_at
    }
    affectedCount
  }
}
    `;
export type SaveOnboardingDataMutationFn = MutationFunction<SaveOnboardingDataMutation, SaveOnboardingDataMutationVariables>;

/**
 * __useSaveOnboardingDataMutation__
 *
 * To run a mutation, you first call `useSaveOnboardingDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveOnboardingDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveOnboardingDataMutation, { data, loading, error }] = useSaveOnboardingDataMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      updates: // value for 'updates'
 *   },
 * });
 */
export function useSaveOnboardingDataMutation(baseOptions?: MutationHookOptions<SaveOnboardingDataMutation, SaveOnboardingDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<SaveOnboardingDataMutation, SaveOnboardingDataMutationVariables>(SaveOnboardingDataDocument, options);
      }
export type SaveOnboardingDataMutationHookResult = ReturnType<typeof useSaveOnboardingDataMutation>;
export type SaveOnboardingDataMutationResult = MutationResult<SaveOnboardingDataMutation>;
export type SaveOnboardingDataMutationOptions = BaseMutationOptions<SaveOnboardingDataMutation, SaveOnboardingDataMutationVariables>;
export const GenerateAiMealPlanDocument = gql`
    mutation GenerateAIMealPlan($input: ai_meal_plansInsertInput!) {
  insertIntoai_meal_plansCollection(objects: [$input]) {
    records {
      id
      user_id
      quiz_result_id
      plan_data
      daily_calories
      daily_protein
      daily_carbs
      daily_fats
      preferences
      restrictions
      status
      is_active
      generated_at
      created_at
    }
    affectedCount
  }
}
    `;
export type GenerateAiMealPlanMutationFn = MutationFunction<GenerateAiMealPlanMutation, GenerateAiMealPlanMutationVariables>;

/**
 * __useGenerateAiMealPlanMutation__
 *
 * To run a mutation, you first call `useGenerateAiMealPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateAiMealPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateAiMealPlanMutation, { data, loading, error }] = useGenerateAiMealPlanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateAiMealPlanMutation(baseOptions?: MutationHookOptions<GenerateAiMealPlanMutation, GenerateAiMealPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<GenerateAiMealPlanMutation, GenerateAiMealPlanMutationVariables>(GenerateAiMealPlanDocument, options);
      }
export type GenerateAiMealPlanMutationHookResult = ReturnType<typeof useGenerateAiMealPlanMutation>;
export type GenerateAiMealPlanMutationResult = MutationResult<GenerateAiMealPlanMutation>;
export type GenerateAiMealPlanMutationOptions = BaseMutationOptions<GenerateAiMealPlanMutation, GenerateAiMealPlanMutationVariables>;
export const GenerateAiWorkoutPlanDocument = gql`
    mutation GenerateAIWorkoutPlan($input: ai_workout_plansInsertInput!) {
  insertIntoai_workout_plansCollection(objects: [$input]) {
    records {
      id
      user_id
      quiz_result_id
      plan_data
      workout_type
      duration_per_session
      frequency_per_week
      status
      is_active
      generated_at
      created_at
    }
    affectedCount
  }
}
    `;
export type GenerateAiWorkoutPlanMutationFn = MutationFunction<GenerateAiWorkoutPlanMutation, GenerateAiWorkoutPlanMutationVariables>;

/**
 * __useGenerateAiWorkoutPlanMutation__
 *
 * To run a mutation, you first call `useGenerateAiWorkoutPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateAiWorkoutPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateAiWorkoutPlanMutation, { data, loading, error }] = useGenerateAiWorkoutPlanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateAiWorkoutPlanMutation(baseOptions?: MutationHookOptions<GenerateAiWorkoutPlanMutation, GenerateAiWorkoutPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<GenerateAiWorkoutPlanMutation, GenerateAiWorkoutPlanMutationVariables>(GenerateAiWorkoutPlanDocument, options);
      }
export type GenerateAiWorkoutPlanMutationHookResult = ReturnType<typeof useGenerateAiWorkoutPlanMutation>;
export type GenerateAiWorkoutPlanMutationResult = MutationResult<GenerateAiWorkoutPlanMutation>;
export type GenerateAiWorkoutPlanMutationOptions = BaseMutationOptions<GenerateAiWorkoutPlanMutation, GenerateAiWorkoutPlanMutationVariables>;
export const GetUserProfileDocument = gql`
    query GetUserProfile($userId: UUID!) {
  profilesCollection(filter: {id: {eq: $userId}}, first: 1) {
    edges {
      node {
        id
        email
        full_name
        username
        avatar_url
        age
        gender
        height_cm
        weight_kg
        target_weight_kg
        unit_system
        occupation_activity
        onboarding_completed
        onboarding_step
        created_at
        updated_at
        subscriptions {
          id
          tier
          status
          stripe_customer_id
          stripe_subscription_id
          current_period_start
          current_period_end
          trial_end
          cancel_at_period_end
        }
      }
    }
  }
}
    `;

/**
 * __useGetUserProfileQuery__
 *
 * To run a query within a React component, call `useGetUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserProfileQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserProfileQuery(baseOptions: QueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables> & ({ variables: GetUserProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
      }
export function useGetUserProfileLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
        }
export function useGetUserProfileSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options as any);
        }
export type GetUserProfileQueryHookResult = ReturnType<typeof useGetUserProfileQuery>;
export type GetUserProfileLazyQueryHookResult = ReturnType<typeof useGetUserProfileLazyQuery>;
export type GetUserProfileSuspenseQueryHookResult = ReturnType<typeof useGetUserProfileSuspenseQuery>;
export type GetUserProfileQueryResult = QueryResult<GetUserProfileQuery, GetUserProfileQueryVariables>;
export const GetProfileDocument = gql`
    query GetProfile($userId: UUID!) {
  profilesCollection(filter: {id: {eq: $userId}}, first: 1) {
    edges {
      node {
        id
        email
        full_name
        username
        avatar_url
        age
        gender
        height_cm
        weight_kg
        target_weight_kg
        unit_system
        occupation_activity
        onboarding_completed
        onboarding_step
        created_at
        updated_at
      }
    }
  }
}
    `;

/**
 * __useGetProfileQuery__
 *
 * To run a query within a React component, call `useGetProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProfileQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetProfileQuery(baseOptions: QueryHookOptions<GetProfileQuery, GetProfileQueryVariables> & ({ variables: GetProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
      }
export function useGetProfileLazyQuery(baseOptions?: LazyQueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
        }
export function useGetProfileSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options as any);
        }
export type GetProfileQueryHookResult = ReturnType<typeof useGetProfileQuery>;
export type GetProfileLazyQueryHookResult = ReturnType<typeof useGetProfileLazyQuery>;
export type GetProfileSuspenseQueryHookResult = ReturnType<typeof useGetProfileSuspenseQuery>;
export type GetProfileQueryResult = QueryResult<GetProfileQuery, GetProfileQueryVariables>;
export const GetUserSubscriptionDocument = gql`
    query GetUserSubscription($userId: UUID!) {
  subscriptionsCollection(filter: {user_id: {eq: $userId}}, first: 1) {
    edges {
      node {
        id
        user_id
        tier
        status
        stripe_customer_id
        stripe_subscription_id
        stripe_price_id
        current_period_start
        current_period_end
        trial_start
        trial_end
        cancel_at_period_end
        canceled_at
        metadata
        created_at
        updated_at
      }
    }
  }
}
    `;

/**
 * __useGetUserSubscriptionQuery__
 *
 * To run a query within a React component, call `useGetUserSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSubscriptionQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserSubscriptionQuery(baseOptions: QueryHookOptions<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables> & ({ variables: GetUserSubscriptionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables>(GetUserSubscriptionDocument, options);
      }
export function useGetUserSubscriptionLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables>(GetUserSubscriptionDocument, options);
        }
export function useGetUserSubscriptionSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables>(GetUserSubscriptionDocument, options as any);
        }
export type GetUserSubscriptionQueryHookResult = ReturnType<typeof useGetUserSubscriptionQuery>;
export type GetUserSubscriptionLazyQueryHookResult = ReturnType<typeof useGetUserSubscriptionLazyQuery>;
export type GetUserSubscriptionSuspenseQueryHookResult = ReturnType<typeof useGetUserSubscriptionSuspenseQuery>;
export type GetUserSubscriptionQueryResult = QueryResult<GetUserSubscriptionQuery, GetUserSubscriptionQueryVariables>;
export const UpdateUserProfileDocument = gql`
    mutation UpdateUserProfile($userId: UUID!, $fullName: String, $username: String, $avatarUrl: String, $age: Int, $dateOfBirth: Date, $gender: String, $country: String, $heightCm: Float, $weightKg: Float, $targetWeightKg: Float, $unitSystem: String, $occupationActivity: String, $onboardingCompleted: Boolean, $onboardingStep: Int) {
  updateprofilesCollection(
    filter: {id: {eq: $userId}}
    set: {full_name: $fullName, username: $username, avatar_url: $avatarUrl, age: $age, gender: $gender, height_cm: $heightCm, weight_kg: $weightKg, target_weight_kg: $targetWeightKg, unit_system: $unitSystem, occupation_activity: $occupationActivity, onboarding_completed: $onboardingCompleted, onboarding_step: $onboardingStep}
  ) {
    records {
      id
      email
      full_name
      username
      avatar_url
      age
      gender
      height_cm
      weight_kg
      target_weight_kg
      unit_system
      occupation_activity
      onboarding_completed
      onboarding_step
      updated_at
    }
    affectedCount
  }
}
    `;
export type UpdateUserProfileMutationFn = MutationFunction<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;

/**
 * __useUpdateUserProfileMutation__
 *
 * To run a mutation, you first call `useUpdateUserProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserProfileMutation, { data, loading, error }] = useUpdateUserProfileMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      fullName: // value for 'fullName'
 *      username: // value for 'username'
 *      avatarUrl: // value for 'avatarUrl'
 *      age: // value for 'age'
 *      dateOfBirth: // value for 'dateOfBirth'
 *      gender: // value for 'gender'
 *      country: // value for 'country'
 *      heightCm: // value for 'heightCm'
 *      weightKg: // value for 'weightKg'
 *      targetWeightKg: // value for 'targetWeightKg'
 *      unitSystem: // value for 'unitSystem'
 *      occupationActivity: // value for 'occupationActivity'
 *      onboardingCompleted: // value for 'onboardingCompleted'
 *      onboardingStep: // value for 'onboardingStep'
 *   },
 * });
 */
export function useUpdateUserProfileMutation(baseOptions?: MutationHookOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>(UpdateUserProfileDocument, options);
      }
export type UpdateUserProfileMutationHookResult = ReturnType<typeof useUpdateUserProfileMutation>;
export type UpdateUserProfileMutationResult = MutationResult<UpdateUserProfileMutation>;
export type UpdateUserProfileMutationOptions = BaseMutationOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const CreateUserProfileDocument = gql`
    mutation CreateUserProfile($id: UUID!, $email: String!, $fullName: String, $age: Int, $gender: String, $heightCm: Float, $weightKg: Float, $targetWeightKg: Float) {
  insertIntoprofilesCollection(
    objects: [{id: $id, email: $email, full_name: $fullName, age: $age, gender: $gender, height_cm: $heightCm, weight_kg: $weightKg, target_weight_kg: $targetWeightKg, onboarding_completed: false, onboarding_step: 0}]
  ) {
    records {
      id
      email
      full_name
      age
      gender
      height_cm
      weight_kg
      target_weight_kg
      onboarding_completed
      onboarding_step
      created_at
    }
    affectedCount
  }
}
    `;
export type CreateUserProfileMutationFn = MutationFunction<CreateUserProfileMutation, CreateUserProfileMutationVariables>;

/**
 * __useCreateUserProfileMutation__
 *
 * To run a mutation, you first call `useCreateUserProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserProfileMutation, { data, loading, error }] = useCreateUserProfileMutation({
 *   variables: {
 *      id: // value for 'id'
 *      email: // value for 'email'
 *      fullName: // value for 'fullName'
 *      age: // value for 'age'
 *      gender: // value for 'gender'
 *      heightCm: // value for 'heightCm'
 *      weightKg: // value for 'weightKg'
 *      targetWeightKg: // value for 'targetWeightKg'
 *   },
 * });
 */
export function useCreateUserProfileMutation(baseOptions?: MutationHookOptions<CreateUserProfileMutation, CreateUserProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<CreateUserProfileMutation, CreateUserProfileMutationVariables>(CreateUserProfileDocument, options);
      }
export type CreateUserProfileMutationHookResult = ReturnType<typeof useCreateUserProfileMutation>;
export type CreateUserProfileMutationResult = MutationResult<CreateUserProfileMutation>;
export type CreateUserProfileMutationOptions = BaseMutationOptions<CreateUserProfileMutation, CreateUserProfileMutationVariables>;
export const UpdateUserAvatarDocument = gql`
    mutation UpdateUserAvatar($userId: UUID!, $avatarUrl: String!) {
  updateprofilesCollection(
    filter: {id: {eq: $userId}}
    set: {avatar_url: $avatarUrl}
  ) {
    records {
      id
      avatar_url
      updated_at
    }
    affectedCount
  }
}
    `;
export type UpdateUserAvatarMutationFn = MutationFunction<UpdateUserAvatarMutation, UpdateUserAvatarMutationVariables>;

/**
 * __useUpdateUserAvatarMutation__
 *
 * To run a mutation, you first call `useUpdateUserAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserAvatarMutation, { data, loading, error }] = useUpdateUserAvatarMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      avatarUrl: // value for 'avatarUrl'
 *   },
 * });
 */
export function useUpdateUserAvatarMutation(baseOptions?: MutationHookOptions<UpdateUserAvatarMutation, UpdateUserAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<UpdateUserAvatarMutation, UpdateUserAvatarMutationVariables>(UpdateUserAvatarDocument, options);
      }
export type UpdateUserAvatarMutationHookResult = ReturnType<typeof useUpdateUserAvatarMutation>;
export type UpdateUserAvatarMutationResult = MutationResult<UpdateUserAvatarMutation>;
export type UpdateUserAvatarMutationOptions = BaseMutationOptions<UpdateUserAvatarMutation, UpdateUserAvatarMutationVariables>;
export const DeleteUserAvatarDocument = gql`
    mutation DeleteUserAvatar($userId: UUID!) {
  updateprofilesCollection(filter: {id: {eq: $userId}}, set: {avatar_url: null}) {
    records {
      id
      avatar_url
      updated_at
    }
    affectedCount
  }
}
    `;
export type DeleteUserAvatarMutationFn = MutationFunction<DeleteUserAvatarMutation, DeleteUserAvatarMutationVariables>;

/**
 * __useDeleteUserAvatarMutation__
 *
 * To run a mutation, you first call `useDeleteUserAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserAvatarMutation, { data, loading, error }] = useDeleteUserAvatarMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteUserAvatarMutation(baseOptions?: MutationHookOptions<DeleteUserAvatarMutation, DeleteUserAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<DeleteUserAvatarMutation, DeleteUserAvatarMutationVariables>(DeleteUserAvatarDocument, options);
      }
export type DeleteUserAvatarMutationHookResult = ReturnType<typeof useDeleteUserAvatarMutation>;
export type DeleteUserAvatarMutationResult = MutationResult<DeleteUserAvatarMutation>;
export type DeleteUserAvatarMutationOptions = BaseMutationOptions<DeleteUserAvatarMutation, DeleteUserAvatarMutationVariables>;
export const GetActiveWorkoutPlanDocument = gql`
    query GetActiveWorkoutPlan($userId: UUID!) {
  ai_workout_plansCollection(
    filter: {user_id: {eq: $userId}, is_active: {eq: true}}
    first: 1
  ) {
    edges {
      node {
        id
        user_id
        quiz_result_id
        plan_data
        workout_type
        duration_per_session
        frequency_per_week
        status
        is_active
        error_message
        generated_at
        created_at
        updated_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetActiveWorkoutPlanQuery__
 *
 * To run a query within a React component, call `useGetActiveWorkoutPlanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveWorkoutPlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveWorkoutPlanQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetActiveWorkoutPlanQuery(baseOptions: QueryHookOptions<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables> & ({ variables: GetActiveWorkoutPlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables>(GetActiveWorkoutPlanDocument, options);
      }
export function useGetActiveWorkoutPlanLazyQuery(baseOptions?: LazyQueryHookOptions<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables>(GetActiveWorkoutPlanDocument, options);
        }
export function useGetActiveWorkoutPlanSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables>(GetActiveWorkoutPlanDocument, options as any);
        }
export type GetActiveWorkoutPlanQueryHookResult = ReturnType<typeof useGetActiveWorkoutPlanQuery>;
export type GetActiveWorkoutPlanLazyQueryHookResult = ReturnType<typeof useGetActiveWorkoutPlanLazyQuery>;
export type GetActiveWorkoutPlanSuspenseQueryHookResult = ReturnType<typeof useGetActiveWorkoutPlanSuspenseQuery>;
export type GetActiveWorkoutPlanQueryResult = QueryResult<GetActiveWorkoutPlanQuery, GetActiveWorkoutPlanQueryVariables>;
export const GetUserWorkoutPlansDocument = gql`
    query GetUserWorkoutPlans($userId: UUID!, $first: Int = 10) {
  ai_workout_plansCollection(filter: {user_id: {eq: $userId}}, first: $first) {
    edges {
      node {
        id
        user_id
        quiz_result_id
        plan_data
        workout_type
        duration_per_session
        frequency_per_week
        status
        is_active
        error_message
        generated_at
        created_at
        updated_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

/**
 * __useGetUserWorkoutPlansQuery__
 *
 * To run a query within a React component, call `useGetUserWorkoutPlansQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserWorkoutPlansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserWorkoutPlansQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGetUserWorkoutPlansQuery(baseOptions: QueryHookOptions<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables> & ({ variables: GetUserWorkoutPlansQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables>(GetUserWorkoutPlansDocument, options);
      }
export function useGetUserWorkoutPlansLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables>(GetUserWorkoutPlansDocument, options);
        }
export function useGetUserWorkoutPlansSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables>(GetUserWorkoutPlansDocument, options as any);
        }
export type GetUserWorkoutPlansQueryHookResult = ReturnType<typeof useGetUserWorkoutPlansQuery>;
export type GetUserWorkoutPlansLazyQueryHookResult = ReturnType<typeof useGetUserWorkoutPlansLazyQuery>;
export type GetUserWorkoutPlansSuspenseQueryHookResult = ReturnType<typeof useGetUserWorkoutPlansSuspenseQuery>;
export type GetUserWorkoutPlansQueryResult = QueryResult<GetUserWorkoutPlansQuery, GetUserWorkoutPlansQueryVariables>;
export const CreateWorkoutPlanDocument = gql`
    mutation CreateWorkoutPlan($input: ai_workout_plansInsertInput!) {
  insertIntoai_workout_plansCollection(objects: [$input]) {
    records {
      id
      user_id
      quiz_result_id
      plan_data
      workout_type
      duration_per_session
      frequency_per_week
      status
      is_active
      generated_at
      created_at
    }
    affectedCount
  }
}
    `;
export type CreateWorkoutPlanMutationFn = MutationFunction<CreateWorkoutPlanMutation, CreateWorkoutPlanMutationVariables>;

/**
 * __useCreateWorkoutPlanMutation__
 *
 * To run a mutation, you first call `useCreateWorkoutPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkoutPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkoutPlanMutation, { data, loading, error }] = useCreateWorkoutPlanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWorkoutPlanMutation(baseOptions?: MutationHookOptions<CreateWorkoutPlanMutation, CreateWorkoutPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<CreateWorkoutPlanMutation, CreateWorkoutPlanMutationVariables>(CreateWorkoutPlanDocument, options);
      }
export type CreateWorkoutPlanMutationHookResult = ReturnType<typeof useCreateWorkoutPlanMutation>;
export type CreateWorkoutPlanMutationResult = MutationResult<CreateWorkoutPlanMutation>;
export type CreateWorkoutPlanMutationOptions = BaseMutationOptions<CreateWorkoutPlanMutation, CreateWorkoutPlanMutationVariables>;