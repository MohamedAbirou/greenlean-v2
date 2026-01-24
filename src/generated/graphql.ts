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
  Cursor: { input: any; output: any; }
  Date: { input: string; output: string; }
  Datetime: { input: string; output: string; }
  JSON: { input: any; output: any; }
  Opaque: { input: any; output: any; }
  Time: { input: string; output: string; }
  UUID: { input: string; output: string; }
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']['input']>;
  gt?: InputMaybe<Scalars['BigFloat']['input']>;
  gte?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']['input']>;
  lte?: InputMaybe<Scalars['BigFloat']['input']>;
  neq?: InputMaybe<Scalars['BigFloat']['input']>;
};

/** Boolean expression comparing fields on type "BigFloatList" */
export type BigFloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars['BigInt']['input']>;
  gt?: InputMaybe<Scalars['BigInt']['input']>;
  gte?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigInt']['input']>;
  lte?: InputMaybe<Scalars['BigInt']['input']>;
  neq?: InputMaybe<Scalars['BigInt']['input']>;
};

/** Boolean expression comparing fields on type "BigIntList" */
export type BigIntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "BooleanList" */
export type BooleanListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  contains?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  eq?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

/** Boolean expression comparing fields on type "DateList" */
export type DateListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Date']['input']>>;
  contains?: InputMaybe<Array<Scalars['Date']['input']>>;
  eq?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Date']['input']>>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

/** Boolean expression comparing fields on type "DatetimeList" */
export type DatetimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  contains?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  eq?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};

export type FilterIs =
  | 'NOT_NULL'
  | 'NULL';

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

/** Boolean expression comparing fields on type "FloatList" */
export type FloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Float']['input']>>;
  contains?: InputMaybe<Array<Scalars['Float']['input']>>;
  eq?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Float']['input']>>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression comparing fields on type "IntList" */
export type IntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Int']['input']>>;
  contains?: InputMaybe<Array<Scalars['Int']['input']>>;
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  __typename: 'Mutation';
  award_points?: Maybe<Scalars['Opaque']['output']>;
  calculate_meal_plan_adherence?: Maybe<Scalars['Opaque']['output']>;
  create_coupon_from_reward?: Maybe<Scalars['String']['output']>;
  /** Deletes zero or more records from the `ai_meal_plans` collection */
  deleteFromai_meal_plansCollection: Ai_Meal_PlansDeleteResponse;
  /** Deletes zero or more records from the `ai_workout_plans` collection */
  deleteFromai_workout_plansCollection: Ai_Workout_PlansDeleteResponse;
  /** Deletes zero or more records from the `challenge_participants` collection */
  deleteFromchallenge_participantsCollection: Challenge_ParticipantsDeleteResponse;
  /** Deletes zero or more records from the `challenges` collection */
  deleteFromchallengesCollection: ChallengesDeleteResponse;
  /** Deletes zero or more records from the `coupon_codes` collection */
  deleteFromcoupon_codesCollection: Coupon_CodesDeleteResponse;
  /** Deletes zero or more records from the `daily_activity_summary` collection */
  deleteFromdaily_activity_summaryCollection: Daily_Activity_SummaryDeleteResponse;
  /** Deletes zero or more records from the `daily_nutrition_logs` collection */
  deleteFromdaily_nutrition_logsCollection: Daily_Nutrition_LogsDeleteResponse;
  /** Deletes zero or more records from the `daily_water_intake` collection */
  deleteFromdaily_water_intakeCollection: Daily_Water_IntakeDeleteResponse;
  /** Deletes zero or more records from the `data_exports` collection */
  deleteFromdata_exportsCollection: Data_ExportsDeleteResponse;
  /** Deletes zero or more records from the `exercise_personal_records` collection */
  deleteFromexercise_personal_recordsCollection: Exercise_Personal_RecordsDeleteResponse;
  /** Deletes zero or more records from the `exercise_sets` collection */
  deleteFromexercise_setsCollection: Exercise_SetsDeleteResponse;
  /** Deletes zero or more records from the `meal_items` collection */
  deleteFrommeal_itemsCollection: Meal_ItemsDeleteResponse;
  /** Deletes zero or more records from the `meal_photo_logs` collection */
  deleteFrommeal_photo_logsCollection: Meal_Photo_LogsDeleteResponse;
  /** Deletes zero or more records from the `meal_plan_adherence` collection */
  deleteFrommeal_plan_adherenceCollection: Meal_Plan_AdherenceDeleteResponse;
  /** Deletes zero or more records from the `meal_templates` collection */
  deleteFrommeal_templatesCollection: Meal_TemplatesDeleteResponse;
  /** Deletes zero or more records from the `newsletter_subscribers` collection */
  deleteFromnewsletter_subscribersCollection: Newsletter_SubscribersDeleteResponse;
  /** Deletes zero or more records from the `notifications` collection */
  deleteFromnotificationsCollection: NotificationsDeleteResponse;
  /** Deletes zero or more records from the `plan_regeneration_usage` collection */
  deleteFromplan_regeneration_usageCollection: Plan_Regeneration_UsageDeleteResponse;
  /** Deletes zero or more records from the `profiles` collection */
  deleteFromprofilesCollection: ProfilesDeleteResponse;
  /** Deletes zero or more records from the `quiz_results` collection */
  deleteFromquiz_resultsCollection: Quiz_ResultsDeleteResponse;
  /** Deletes zero or more records from the `rewards_catalog` collection */
  deleteFromrewards_catalogCollection: Rewards_CatalogDeleteResponse;
  /** Deletes zero or more records from the `subscription_tiers` collection */
  deleteFromsubscription_tiersCollection: Subscription_TiersDeleteResponse;
  /** Deletes zero or more records from the `subscriptions` collection */
  deleteFromsubscriptionsCollection: SubscriptionsDeleteResponse;
  /** Deletes zero or more records from the `tier_unlock_events` collection */
  deleteFromtier_unlock_eventsCollection: Tier_Unlock_EventsDeleteResponse;
  /** Deletes zero or more records from the `usage_metrics` collection */
  deleteFromusage_metricsCollection: Usage_MetricsDeleteResponse;
  /** Deletes zero or more records from the `user_macro_targets` collection */
  deleteFromuser_macro_targetsCollection: User_Macro_TargetsDeleteResponse;
  /** Deletes zero or more records from the `user_profile_extended` collection */
  deleteFromuser_profile_extendedCollection: User_Profile_ExtendedDeleteResponse;
  /** Deletes zero or more records from the `user_redeemed_rewards` collection */
  deleteFromuser_redeemed_rewardsCollection: User_Redeemed_RewardsDeleteResponse;
  /** Deletes zero or more records from the `user_rewards` collection */
  deleteFromuser_rewardsCollection: User_RewardsDeleteResponse;
  /** Deletes zero or more records from the `user_streaks` collection */
  deleteFromuser_streaksCollection: User_StreaksDeleteResponse;
  /** Deletes zero or more records from the `user_themes` collection */
  deleteFromuser_themesCollection: User_ThemesDeleteResponse;
  /** Deletes zero or more records from the `voice_meal_logs` collection */
  deleteFromvoice_meal_logsCollection: Voice_Meal_LogsDeleteResponse;
  /** Deletes zero or more records from the `water_intake_logs` collection */
  deleteFromwater_intake_logsCollection: Water_Intake_LogsDeleteResponse;
  /** Deletes zero or more records from the `weekly_summaries` collection */
  deleteFromweekly_summariesCollection: Weekly_SummariesDeleteResponse;
  /** Deletes zero or more records from the `weight_history` collection */
  deleteFromweight_historyCollection: Weight_HistoryDeleteResponse;
  /** Deletes zero or more records from the `workout_exercise_history` collection */
  deleteFromworkout_exercise_historyCollection: Workout_Exercise_HistoryDeleteResponse;
  /** Deletes zero or more records from the `workout_plan_adherence` collection */
  deleteFromworkout_plan_adherenceCollection: Workout_Plan_AdherenceDeleteResponse;
  /** Deletes zero or more records from the `workout_sessions` collection */
  deleteFromworkout_sessionsCollection: Workout_SessionsDeleteResponse;
  /** Deletes zero or more records from the `workout_templates` collection */
  deleteFromworkout_templatesCollection: Workout_TemplatesDeleteResponse;
  determine_tier?: Maybe<Scalars['String']['output']>;
  generate_coupon_code?: Maybe<Scalars['String']['output']>;
  /** Adds one or more `ai_meal_plans` records to the collection */
  insertIntoai_meal_plansCollection?: Maybe<Ai_Meal_PlansInsertResponse>;
  /** Adds one or more `ai_workout_plans` records to the collection */
  insertIntoai_workout_plansCollection?: Maybe<Ai_Workout_PlansInsertResponse>;
  /** Adds one or more `challenge_participants` records to the collection */
  insertIntochallenge_participantsCollection?: Maybe<Challenge_ParticipantsInsertResponse>;
  /** Adds one or more `challenges` records to the collection */
  insertIntochallengesCollection?: Maybe<ChallengesInsertResponse>;
  /** Adds one or more `coupon_codes` records to the collection */
  insertIntocoupon_codesCollection?: Maybe<Coupon_CodesInsertResponse>;
  /** Adds one or more `daily_activity_summary` records to the collection */
  insertIntodaily_activity_summaryCollection?: Maybe<Daily_Activity_SummaryInsertResponse>;
  /** Adds one or more `daily_nutrition_logs` records to the collection */
  insertIntodaily_nutrition_logsCollection?: Maybe<Daily_Nutrition_LogsInsertResponse>;
  /** Adds one or more `daily_water_intake` records to the collection */
  insertIntodaily_water_intakeCollection?: Maybe<Daily_Water_IntakeInsertResponse>;
  /** Adds one or more `data_exports` records to the collection */
  insertIntodata_exportsCollection?: Maybe<Data_ExportsInsertResponse>;
  /** Adds one or more `exercise_personal_records` records to the collection */
  insertIntoexercise_personal_recordsCollection?: Maybe<Exercise_Personal_RecordsInsertResponse>;
  /** Adds one or more `exercise_sets` records to the collection */
  insertIntoexercise_setsCollection?: Maybe<Exercise_SetsInsertResponse>;
  /** Adds one or more `meal_items` records to the collection */
  insertIntomeal_itemsCollection?: Maybe<Meal_ItemsInsertResponse>;
  /** Adds one or more `meal_photo_logs` records to the collection */
  insertIntomeal_photo_logsCollection?: Maybe<Meal_Photo_LogsInsertResponse>;
  /** Adds one or more `meal_plan_adherence` records to the collection */
  insertIntomeal_plan_adherenceCollection?: Maybe<Meal_Plan_AdherenceInsertResponse>;
  /** Adds one or more `meal_templates` records to the collection */
  insertIntomeal_templatesCollection?: Maybe<Meal_TemplatesInsertResponse>;
  /** Adds one or more `newsletter_subscribers` records to the collection */
  insertIntonewsletter_subscribersCollection?: Maybe<Newsletter_SubscribersInsertResponse>;
  /** Adds one or more `notifications` records to the collection */
  insertIntonotificationsCollection?: Maybe<NotificationsInsertResponse>;
  /** Adds one or more `plan_regeneration_usage` records to the collection */
  insertIntoplan_regeneration_usageCollection?: Maybe<Plan_Regeneration_UsageInsertResponse>;
  /** Adds one or more `profiles` records to the collection */
  insertIntoprofilesCollection?: Maybe<ProfilesInsertResponse>;
  /** Adds one or more `quiz_results` records to the collection */
  insertIntoquiz_resultsCollection?: Maybe<Quiz_ResultsInsertResponse>;
  /** Adds one or more `rewards_catalog` records to the collection */
  insertIntorewards_catalogCollection?: Maybe<Rewards_CatalogInsertResponse>;
  /** Adds one or more `subscription_tiers` records to the collection */
  insertIntosubscription_tiersCollection?: Maybe<Subscription_TiersInsertResponse>;
  /** Adds one or more `subscriptions` records to the collection */
  insertIntosubscriptionsCollection?: Maybe<SubscriptionsInsertResponse>;
  /** Adds one or more `tier_unlock_events` records to the collection */
  insertIntotier_unlock_eventsCollection?: Maybe<Tier_Unlock_EventsInsertResponse>;
  /** Adds one or more `usage_metrics` records to the collection */
  insertIntousage_metricsCollection?: Maybe<Usage_MetricsInsertResponse>;
  /** Adds one or more `user_macro_targets` records to the collection */
  insertIntouser_macro_targetsCollection?: Maybe<User_Macro_TargetsInsertResponse>;
  /** Adds one or more `user_profile_extended` records to the collection */
  insertIntouser_profile_extendedCollection?: Maybe<User_Profile_ExtendedInsertResponse>;
  /** Adds one or more `user_redeemed_rewards` records to the collection */
  insertIntouser_redeemed_rewardsCollection?: Maybe<User_Redeemed_RewardsInsertResponse>;
  /** Adds one or more `user_rewards` records to the collection */
  insertIntouser_rewardsCollection?: Maybe<User_RewardsInsertResponse>;
  /** Adds one or more `user_streaks` records to the collection */
  insertIntouser_streaksCollection?: Maybe<User_StreaksInsertResponse>;
  /** Adds one or more `user_themes` records to the collection */
  insertIntouser_themesCollection?: Maybe<User_ThemesInsertResponse>;
  /** Adds one or more `voice_meal_logs` records to the collection */
  insertIntovoice_meal_logsCollection?: Maybe<Voice_Meal_LogsInsertResponse>;
  /** Adds one or more `water_intake_logs` records to the collection */
  insertIntowater_intake_logsCollection?: Maybe<Water_Intake_LogsInsertResponse>;
  /** Adds one or more `weekly_summaries` records to the collection */
  insertIntoweekly_summariesCollection?: Maybe<Weekly_SummariesInsertResponse>;
  /** Adds one or more `weight_history` records to the collection */
  insertIntoweight_historyCollection?: Maybe<Weight_HistoryInsertResponse>;
  /** Adds one or more `workout_exercise_history` records to the collection */
  insertIntoworkout_exercise_historyCollection?: Maybe<Workout_Exercise_HistoryInsertResponse>;
  /** Adds one or more `workout_plan_adherence` records to the collection */
  insertIntoworkout_plan_adherenceCollection?: Maybe<Workout_Plan_AdherenceInsertResponse>;
  /** Adds one or more `workout_sessions` records to the collection */
  insertIntoworkout_sessionsCollection?: Maybe<Workout_SessionsInsertResponse>;
  /** Adds one or more `workout_templates` records to the collection */
  insertIntoworkout_templatesCollection?: Maybe<Workout_TemplatesInsertResponse>;
  track_regeneration?: Maybe<Scalars['Opaque']['output']>;
  track_usage?: Maybe<Scalars['Opaque']['output']>;
  update_user_streak?: Maybe<Scalars['Opaque']['output']>;
  /** Updates zero or more records in the `ai_meal_plans` collection */
  updateai_meal_plansCollection: Ai_Meal_PlansUpdateResponse;
  /** Updates zero or more records in the `ai_workout_plans` collection */
  updateai_workout_plansCollection: Ai_Workout_PlansUpdateResponse;
  /** Updates zero or more records in the `challenge_participants` collection */
  updatechallenge_participantsCollection: Challenge_ParticipantsUpdateResponse;
  /** Updates zero or more records in the `challenges` collection */
  updatechallengesCollection: ChallengesUpdateResponse;
  /** Updates zero or more records in the `coupon_codes` collection */
  updatecoupon_codesCollection: Coupon_CodesUpdateResponse;
  /** Updates zero or more records in the `daily_activity_summary` collection */
  updatedaily_activity_summaryCollection: Daily_Activity_SummaryUpdateResponse;
  /** Updates zero or more records in the `daily_nutrition_logs` collection */
  updatedaily_nutrition_logsCollection: Daily_Nutrition_LogsUpdateResponse;
  /** Updates zero or more records in the `daily_water_intake` collection */
  updatedaily_water_intakeCollection: Daily_Water_IntakeUpdateResponse;
  /** Updates zero or more records in the `data_exports` collection */
  updatedata_exportsCollection: Data_ExportsUpdateResponse;
  /** Updates zero or more records in the `exercise_personal_records` collection */
  updateexercise_personal_recordsCollection: Exercise_Personal_RecordsUpdateResponse;
  /** Updates zero or more records in the `exercise_sets` collection */
  updateexercise_setsCollection: Exercise_SetsUpdateResponse;
  /** Updates zero or more records in the `meal_items` collection */
  updatemeal_itemsCollection: Meal_ItemsUpdateResponse;
  /** Updates zero or more records in the `meal_photo_logs` collection */
  updatemeal_photo_logsCollection: Meal_Photo_LogsUpdateResponse;
  /** Updates zero or more records in the `meal_plan_adherence` collection */
  updatemeal_plan_adherenceCollection: Meal_Plan_AdherenceUpdateResponse;
  /** Updates zero or more records in the `meal_templates` collection */
  updatemeal_templatesCollection: Meal_TemplatesUpdateResponse;
  /** Updates zero or more records in the `newsletter_subscribers` collection */
  updatenewsletter_subscribersCollection: Newsletter_SubscribersUpdateResponse;
  /** Updates zero or more records in the `notifications` collection */
  updatenotificationsCollection: NotificationsUpdateResponse;
  /** Updates zero or more records in the `plan_regeneration_usage` collection */
  updateplan_regeneration_usageCollection: Plan_Regeneration_UsageUpdateResponse;
  /** Updates zero or more records in the `profiles` collection */
  updateprofilesCollection: ProfilesUpdateResponse;
  /** Updates zero or more records in the `quiz_results` collection */
  updatequiz_resultsCollection: Quiz_ResultsUpdateResponse;
  /** Updates zero or more records in the `rewards_catalog` collection */
  updaterewards_catalogCollection: Rewards_CatalogUpdateResponse;
  /** Updates zero or more records in the `subscription_tiers` collection */
  updatesubscription_tiersCollection: Subscription_TiersUpdateResponse;
  /** Updates zero or more records in the `subscriptions` collection */
  updatesubscriptionsCollection: SubscriptionsUpdateResponse;
  /** Updates zero or more records in the `tier_unlock_events` collection */
  updatetier_unlock_eventsCollection: Tier_Unlock_EventsUpdateResponse;
  /** Updates zero or more records in the `usage_metrics` collection */
  updateusage_metricsCollection: Usage_MetricsUpdateResponse;
  /** Updates zero or more records in the `user_macro_targets` collection */
  updateuser_macro_targetsCollection: User_Macro_TargetsUpdateResponse;
  /** Updates zero or more records in the `user_profile_extended` collection */
  updateuser_profile_extendedCollection: User_Profile_ExtendedUpdateResponse;
  /** Updates zero or more records in the `user_redeemed_rewards` collection */
  updateuser_redeemed_rewardsCollection: User_Redeemed_RewardsUpdateResponse;
  /** Updates zero or more records in the `user_rewards` collection */
  updateuser_rewardsCollection: User_RewardsUpdateResponse;
  /** Updates zero or more records in the `user_streaks` collection */
  updateuser_streaksCollection: User_StreaksUpdateResponse;
  /** Updates zero or more records in the `user_themes` collection */
  updateuser_themesCollection: User_ThemesUpdateResponse;
  /** Updates zero or more records in the `voice_meal_logs` collection */
  updatevoice_meal_logsCollection: Voice_Meal_LogsUpdateResponse;
  /** Updates zero or more records in the `water_intake_logs` collection */
  updatewater_intake_logsCollection: Water_Intake_LogsUpdateResponse;
  /** Updates zero or more records in the `weekly_summaries` collection */
  updateweekly_summariesCollection: Weekly_SummariesUpdateResponse;
  /** Updates zero or more records in the `weight_history` collection */
  updateweight_historyCollection: Weight_HistoryUpdateResponse;
  /** Updates zero or more records in the `workout_exercise_history` collection */
  updateworkout_exercise_historyCollection: Workout_Exercise_HistoryUpdateResponse;
  /** Updates zero or more records in the `workout_plan_adherence` collection */
  updateworkout_plan_adherenceCollection: Workout_Plan_AdherenceUpdateResponse;
  /** Updates zero or more records in the `workout_sessions` collection */
  updateworkout_sessionsCollection: Workout_SessionsUpdateResponse;
  /** Updates zero or more records in the `workout_templates` collection */
  updateworkout_templatesCollection: Workout_TemplatesUpdateResponse;
};


/** The root type for creating and mutating data */
export type MutationAward_PointsArgs = {
  p_points: Scalars['Int']['input'];
  p_reason?: InputMaybe<Scalars['String']['input']>;
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationCalculate_Meal_Plan_AdherenceArgs = {
  p_date: Scalars['Date']['input'];
  p_meal_plan_id: Scalars['UUID']['input'];
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationCreate_Coupon_From_RewardArgs = {
  p_discount_type: Scalars['String']['input'];
  p_discount_value: Scalars['String']['input'];
  p_expires_days?: InputMaybe<Scalars['Int']['input']>;
  p_reward_id: Scalars['UUID']['input'];
  p_reward_name: Scalars['String']['input'];
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationDeleteFromai_Meal_PlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Ai_Meal_PlansFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromai_Workout_PlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Ai_Workout_PlansFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromchallenge_ParticipantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Challenge_ParticipantsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromchallengesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ChallengesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromcoupon_CodesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Coupon_CodesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromdaily_Activity_SummaryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Daily_Activity_SummaryFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromdaily_Nutrition_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Daily_Nutrition_LogsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromdaily_Water_IntakeCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Daily_Water_IntakeFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromdata_ExportsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Data_ExportsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromexercise_Personal_RecordsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Exercise_Personal_RecordsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromexercise_SetsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Exercise_SetsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommeal_ItemsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_ItemsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommeal_Photo_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_Photo_LogsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommeal_Plan_AdherenceCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_Plan_AdherenceFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommeal_TemplatesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_TemplatesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromnewsletter_SubscribersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Newsletter_SubscribersFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromnotificationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<NotificationsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromplan_Regeneration_UsageCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Plan_Regeneration_UsageFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromprofilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromquiz_ResultsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Quiz_ResultsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromrewards_CatalogCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Rewards_CatalogFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromsubscription_TiersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Subscription_TiersFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromsubscriptionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SubscriptionsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromtier_Unlock_EventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Tier_Unlock_EventsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromusage_MetricsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Usage_MetricsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_Macro_TargetsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_Macro_TargetsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_Profile_ExtendedCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_Profile_ExtendedFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_Redeemed_RewardsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_Redeemed_RewardsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_RewardsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_RewardsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_StreaksCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_StreaksFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_ThemesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_ThemesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromvoice_Meal_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Voice_Meal_LogsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromwater_Intake_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Water_Intake_LogsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromweekly_SummariesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Weekly_SummariesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromweight_HistoryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Weight_HistoryFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Exercise_HistoryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_Exercise_HistoryFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_Plan_AdherenceCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_Plan_AdherenceFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_SessionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_SessionsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromworkout_TemplatesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_TemplatesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDetermine_TierArgs = {
  p_completeness: Scalars['Float']['input'];
};


/** The root type for creating and mutating data */
export type MutationInsertIntoai_Meal_PlansCollectionArgs = {
  objects: Array<Ai_Meal_PlansInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoai_Workout_PlansCollectionArgs = {
  objects: Array<Ai_Workout_PlansInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntochallenge_ParticipantsCollectionArgs = {
  objects: Array<Challenge_ParticipantsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntochallengesCollectionArgs = {
  objects: Array<ChallengesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntocoupon_CodesCollectionArgs = {
  objects: Array<Coupon_CodesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntodaily_Activity_SummaryCollectionArgs = {
  objects: Array<Daily_Activity_SummaryInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntodaily_Nutrition_LogsCollectionArgs = {
  objects: Array<Daily_Nutrition_LogsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntodaily_Water_IntakeCollectionArgs = {
  objects: Array<Daily_Water_IntakeInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntodata_ExportsCollectionArgs = {
  objects: Array<Data_ExportsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoexercise_Personal_RecordsCollectionArgs = {
  objects: Array<Exercise_Personal_RecordsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoexercise_SetsCollectionArgs = {
  objects: Array<Exercise_SetsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomeal_ItemsCollectionArgs = {
  objects: Array<Meal_ItemsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomeal_Photo_LogsCollectionArgs = {
  objects: Array<Meal_Photo_LogsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomeal_Plan_AdherenceCollectionArgs = {
  objects: Array<Meal_Plan_AdherenceInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomeal_TemplatesCollectionArgs = {
  objects: Array<Meal_TemplatesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntonewsletter_SubscribersCollectionArgs = {
  objects: Array<Newsletter_SubscribersInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntonotificationsCollectionArgs = {
  objects: Array<NotificationsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoplan_Regeneration_UsageCollectionArgs = {
  objects: Array<Plan_Regeneration_UsageInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoprofilesCollectionArgs = {
  objects: Array<ProfilesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoquiz_ResultsCollectionArgs = {
  objects: Array<Quiz_ResultsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntorewards_CatalogCollectionArgs = {
  objects: Array<Rewards_CatalogInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntosubscription_TiersCollectionArgs = {
  objects: Array<Subscription_TiersInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntosubscriptionsCollectionArgs = {
  objects: Array<SubscriptionsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntotier_Unlock_EventsCollectionArgs = {
  objects: Array<Tier_Unlock_EventsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntousage_MetricsCollectionArgs = {
  objects: Array<Usage_MetricsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_Macro_TargetsCollectionArgs = {
  objects: Array<User_Macro_TargetsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_Profile_ExtendedCollectionArgs = {
  objects: Array<User_Profile_ExtendedInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_Redeemed_RewardsCollectionArgs = {
  objects: Array<User_Redeemed_RewardsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_RewardsCollectionArgs = {
  objects: Array<User_RewardsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_StreaksCollectionArgs = {
  objects: Array<User_StreaksInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_ThemesCollectionArgs = {
  objects: Array<User_ThemesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntovoice_Meal_LogsCollectionArgs = {
  objects: Array<Voice_Meal_LogsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntowater_Intake_LogsCollectionArgs = {
  objects: Array<Water_Intake_LogsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoweekly_SummariesCollectionArgs = {
  objects: Array<Weekly_SummariesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoweight_HistoryCollectionArgs = {
  objects: Array<Weight_HistoryInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Exercise_HistoryCollectionArgs = {
  objects: Array<Workout_Exercise_HistoryInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_Plan_AdherenceCollectionArgs = {
  objects: Array<Workout_Plan_AdherenceInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_SessionsCollectionArgs = {
  objects: Array<Workout_SessionsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoworkout_TemplatesCollectionArgs = {
  objects: Array<Workout_TemplatesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationTrack_RegenerationArgs = {
  p_plan_type: Scalars['String']['input'];
  p_regeneration_type?: InputMaybe<Scalars['String']['input']>;
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationTrack_UsageArgs = {
  p_feature: Scalars['String']['input'];
  p_increment?: InputMaybe<Scalars['Int']['input']>;
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationUpdate_User_StreakArgs = {
  p_log_date?: InputMaybe<Scalars['Date']['input']>;
  p_streak_type: Scalars['String']['input'];
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationUpdateai_Meal_PlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Ai_Meal_PlansFilter>;
  set: Ai_Meal_PlansUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateai_Workout_PlansCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Ai_Workout_PlansFilter>;
  set: Ai_Workout_PlansUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatechallenge_ParticipantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Challenge_ParticipantsFilter>;
  set: Challenge_ParticipantsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatechallengesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ChallengesFilter>;
  set: ChallengesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatecoupon_CodesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Coupon_CodesFilter>;
  set: Coupon_CodesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatedaily_Activity_SummaryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Daily_Activity_SummaryFilter>;
  set: Daily_Activity_SummaryUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatedaily_Nutrition_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Daily_Nutrition_LogsFilter>;
  set: Daily_Nutrition_LogsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatedaily_Water_IntakeCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Daily_Water_IntakeFilter>;
  set: Daily_Water_IntakeUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatedata_ExportsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Data_ExportsFilter>;
  set: Data_ExportsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateexercise_Personal_RecordsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Exercise_Personal_RecordsFilter>;
  set: Exercise_Personal_RecordsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateexercise_SetsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Exercise_SetsFilter>;
  set: Exercise_SetsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemeal_ItemsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_ItemsFilter>;
  set: Meal_ItemsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemeal_Photo_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_Photo_LogsFilter>;
  set: Meal_Photo_LogsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemeal_Plan_AdherenceCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_Plan_AdherenceFilter>;
  set: Meal_Plan_AdherenceUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemeal_TemplatesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_TemplatesFilter>;
  set: Meal_TemplatesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatenewsletter_SubscribersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Newsletter_SubscribersFilter>;
  set: Newsletter_SubscribersUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatenotificationsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<NotificationsFilter>;
  set: NotificationsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateplan_Regeneration_UsageCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Plan_Regeneration_UsageFilter>;
  set: Plan_Regeneration_UsageUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateprofilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
  set: ProfilesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatequiz_ResultsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Quiz_ResultsFilter>;
  set: Quiz_ResultsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdaterewards_CatalogCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Rewards_CatalogFilter>;
  set: Rewards_CatalogUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatesubscription_TiersCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Subscription_TiersFilter>;
  set: Subscription_TiersUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatesubscriptionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<SubscriptionsFilter>;
  set: SubscriptionsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatetier_Unlock_EventsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Tier_Unlock_EventsFilter>;
  set: Tier_Unlock_EventsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateusage_MetricsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Usage_MetricsFilter>;
  set: Usage_MetricsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_Macro_TargetsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_Macro_TargetsFilter>;
  set: User_Macro_TargetsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_Profile_ExtendedCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_Profile_ExtendedFilter>;
  set: User_Profile_ExtendedUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_Redeemed_RewardsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_Redeemed_RewardsFilter>;
  set: User_Redeemed_RewardsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_RewardsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_RewardsFilter>;
  set: User_RewardsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_StreaksCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_StreaksFilter>;
  set: User_StreaksUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_ThemesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_ThemesFilter>;
  set: User_ThemesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatevoice_Meal_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Voice_Meal_LogsFilter>;
  set: Voice_Meal_LogsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatewater_Intake_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Water_Intake_LogsFilter>;
  set: Water_Intake_LogsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateweekly_SummariesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Weekly_SummariesFilter>;
  set: Weekly_SummariesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateweight_HistoryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Weight_HistoryFilter>;
  set: Weight_HistoryUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateworkout_Exercise_HistoryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_Exercise_HistoryFilter>;
  set: Workout_Exercise_HistoryUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateworkout_Plan_AdherenceCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_Plan_AdherenceFilter>;
  set: Workout_Plan_AdherenceUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateworkout_SessionsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_SessionsFilter>;
  set: Workout_SessionsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateworkout_TemplatesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Workout_TemplatesFilter>;
  set: Workout_TemplatesUpdateInput;
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars['ID']['output'];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars['Opaque']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Defines a per-field sorting order */
export type OrderByDirection =
  /** Ascending order, nulls first */
  | 'AscNullsFirst'
  /** Ascending order, nulls last */
  | 'AscNullsLast'
  /** Descending order, nulls first */
  | 'DescNullsFirst'
  /** Descending order, nulls last */
  | 'DescNullsLast';

export type PageInfo = {
  __typename: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** The root type for querying data */
export type Query = {
  __typename: 'Query';
  /** A pagable collection of type `ai_meal_plans` */
  ai_meal_plansCollection?: Maybe<Ai_Meal_PlansConnection>;
  /** A pagable collection of type `ai_workout_plans` */
  ai_workout_plansCollection?: Maybe<Ai_Workout_PlansConnection>;
  calculate_profile_completeness?: Maybe<Scalars['Float']['output']>;
  can_regenerate_plan?: Maybe<Scalars['Boolean']['output']>;
  can_use_feature?: Maybe<Scalars['Boolean']['output']>;
  /** A pagable collection of type `challenge_participants` */
  challenge_participantsCollection?: Maybe<Challenge_ParticipantsConnection>;
  /** A pagable collection of type `challenges` */
  challengesCollection?: Maybe<ChallengesConnection>;
  /** A pagable collection of type `coupon_codes` */
  coupon_codesCollection?: Maybe<Coupon_CodesConnection>;
  /** A pagable collection of type `daily_activity_summary` */
  daily_activity_summaryCollection?: Maybe<Daily_Activity_SummaryConnection>;
  /** A pagable collection of type `daily_nutrition_logs` */
  daily_nutrition_logsCollection?: Maybe<Daily_Nutrition_LogsConnection>;
  /** A pagable collection of type `daily_water_intake` */
  daily_water_intakeCollection?: Maybe<Daily_Water_IntakeConnection>;
  /** A pagable collection of type `data_exports` */
  data_exportsCollection?: Maybe<Data_ExportsConnection>;
  /** A pagable collection of type `exercise_personal_records` */
  exercise_personal_recordsCollection?: Maybe<Exercise_Personal_RecordsConnection>;
  /** A pagable collection of type `exercise_sets` */
  exercise_setsCollection?: Maybe<Exercise_SetsConnection>;
  /** A pagable collection of type `meal_items` */
  meal_itemsCollection?: Maybe<Meal_ItemsConnection>;
  /** A pagable collection of type `meal_photo_logs` */
  meal_photo_logsCollection?: Maybe<Meal_Photo_LogsConnection>;
  /** A pagable collection of type `meal_plan_adherence` */
  meal_plan_adherenceCollection?: Maybe<Meal_Plan_AdherenceConnection>;
  /** A pagable collection of type `meal_templates` */
  meal_templatesCollection?: Maybe<Meal_TemplatesConnection>;
  /** A pagable collection of type `newsletter_subscribers` */
  newsletter_subscribersCollection?: Maybe<Newsletter_SubscribersConnection>;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** A pagable collection of type `notifications` */
  notificationsCollection?: Maybe<NotificationsConnection>;
  /** A pagable collection of type `plan_regeneration_usage` */
  plan_regeneration_usageCollection?: Maybe<Plan_Regeneration_UsageConnection>;
  /** A pagable collection of type `profiles` */
  profilesCollection?: Maybe<ProfilesConnection>;
  /** A pagable collection of type `quiz_results` */
  quiz_resultsCollection?: Maybe<Quiz_ResultsConnection>;
  /** A pagable collection of type `rewards_catalog` */
  rewards_catalogCollection?: Maybe<Rewards_CatalogConnection>;
  /** A pagable collection of type `subscription_tiers` */
  subscription_tiersCollection?: Maybe<Subscription_TiersConnection>;
  /** A pagable collection of type `subscriptions` */
  subscriptionsCollection?: Maybe<SubscriptionsConnection>;
  /** A pagable collection of type `tier_unlock_events` */
  tier_unlock_eventsCollection?: Maybe<Tier_Unlock_EventsConnection>;
  /** A pagable collection of type `usage_metrics` */
  usage_metricsCollection?: Maybe<Usage_MetricsConnection>;
  /** A pagable collection of type `user_macro_targets` */
  user_macro_targetsCollection?: Maybe<User_Macro_TargetsConnection>;
  /** A pagable collection of type `user_profile_extended` */
  user_profile_extendedCollection?: Maybe<User_Profile_ExtendedConnection>;
  /** A pagable collection of type `user_redeemed_rewards` */
  user_redeemed_rewardsCollection?: Maybe<User_Redeemed_RewardsConnection>;
  /** A pagable collection of type `user_rewards` */
  user_rewardsCollection?: Maybe<User_RewardsConnection>;
  /** A pagable collection of type `user_streaks` */
  user_streaksCollection?: Maybe<User_StreaksConnection>;
  /** A pagable collection of type `user_themes` */
  user_themesCollection?: Maybe<User_ThemesConnection>;
  /** A pagable collection of type `voice_meal_logs` */
  voice_meal_logsCollection?: Maybe<Voice_Meal_LogsConnection>;
  /** A pagable collection of type `water_intake_logs` */
  water_intake_logsCollection?: Maybe<Water_Intake_LogsConnection>;
  /** A pagable collection of type `weekly_summaries` */
  weekly_summariesCollection?: Maybe<Weekly_SummariesConnection>;
  /** A pagable collection of type `weight_history` */
  weight_historyCollection?: Maybe<Weight_HistoryConnection>;
  /** A pagable collection of type `workout_exercise_history` */
  workout_exercise_historyCollection?: Maybe<Workout_Exercise_HistoryConnection>;
  /** A pagable collection of type `workout_plan_adherence` */
  workout_plan_adherenceCollection?: Maybe<Workout_Plan_AdherenceConnection>;
  /** A pagable collection of type `workout_sessions` */
  workout_sessionsCollection?: Maybe<Workout_SessionsConnection>;
  /** A pagable collection of type `workout_templates` */
  workout_templatesCollection?: Maybe<Workout_TemplatesConnection>;
};


/** The root type for querying data */
export type QueryAi_Meal_PlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Ai_Meal_PlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Ai_Meal_PlansOrderBy>>;
};


/** The root type for querying data */
export type QueryAi_Workout_PlansCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Ai_Workout_PlansFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Ai_Workout_PlansOrderBy>>;
};


/** The root type for querying data */
export type QueryCalculate_Profile_CompletenessArgs = {
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryCan_Regenerate_PlanArgs = {
  p_plan_type: Scalars['String']['input'];
  p_regeneration_type?: InputMaybe<Scalars['String']['input']>;
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryCan_Use_FeatureArgs = {
  p_feature: Scalars['String']['input'];
  p_user_id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryChallenge_ParticipantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Challenge_ParticipantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Challenge_ParticipantsOrderBy>>;
};


/** The root type for querying data */
export type QueryChallengesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ChallengesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ChallengesOrderBy>>;
};


/** The root type for querying data */
export type QueryCoupon_CodesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Coupon_CodesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Coupon_CodesOrderBy>>;
};


/** The root type for querying data */
export type QueryDaily_Activity_SummaryCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Daily_Activity_SummaryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Daily_Activity_SummaryOrderBy>>;
};


/** The root type for querying data */
export type QueryDaily_Nutrition_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Daily_Nutrition_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Daily_Nutrition_LogsOrderBy>>;
};


/** The root type for querying data */
export type QueryDaily_Water_IntakeCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Daily_Water_IntakeFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Daily_Water_IntakeOrderBy>>;
};


/** The root type for querying data */
export type QueryData_ExportsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Data_ExportsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Data_ExportsOrderBy>>;
};


/** The root type for querying data */
export type QueryExercise_Personal_RecordsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exercise_Personal_RecordsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exercise_Personal_RecordsOrderBy>>;
};


/** The root type for querying data */
export type QueryExercise_SetsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exercise_SetsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exercise_SetsOrderBy>>;
};


/** The root type for querying data */
export type QueryMeal_ItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_ItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_ItemsOrderBy>>;
};


/** The root type for querying data */
export type QueryMeal_Photo_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_Photo_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_Photo_LogsOrderBy>>;
};


/** The root type for querying data */
export type QueryMeal_Plan_AdherenceCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_Plan_AdherenceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_Plan_AdherenceOrderBy>>;
};


/** The root type for querying data */
export type QueryMeal_TemplatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_TemplatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_TemplatesOrderBy>>;
};


/** The root type for querying data */
export type QueryNewsletter_SubscribersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Newsletter_SubscribersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Newsletter_SubscribersOrderBy>>;
};


/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root type for querying data */
export type QueryNotificationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<NotificationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<NotificationsOrderBy>>;
};


/** The root type for querying data */
export type QueryPlan_Regeneration_UsageCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Plan_Regeneration_UsageFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Plan_Regeneration_UsageOrderBy>>;
};


/** The root type for querying data */
export type QueryProfilesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ProfilesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ProfilesOrderBy>>;
};


/** The root type for querying data */
export type QueryQuiz_ResultsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Quiz_ResultsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Quiz_ResultsOrderBy>>;
};


/** The root type for querying data */
export type QueryRewards_CatalogCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Rewards_CatalogFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Rewards_CatalogOrderBy>>;
};


/** The root type for querying data */
export type QuerySubscription_TiersCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Subscription_TiersFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Subscription_TiersOrderBy>>;
};


/** The root type for querying data */
export type QuerySubscriptionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<SubscriptionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<SubscriptionsOrderBy>>;
};


/** The root type for querying data */
export type QueryTier_Unlock_EventsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Tier_Unlock_EventsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Tier_Unlock_EventsOrderBy>>;
};


/** The root type for querying data */
export type QueryUsage_MetricsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Usage_MetricsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Usage_MetricsOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_Macro_TargetsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_Macro_TargetsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_Macro_TargetsOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_Profile_ExtendedCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_Profile_ExtendedFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_Profile_ExtendedOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_Redeemed_RewardsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_Redeemed_RewardsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_Redeemed_RewardsOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_RewardsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_RewardsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_RewardsOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_StreaksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_StreaksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_StreaksOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_ThemesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_ThemesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_ThemesOrderBy>>;
};


/** The root type for querying data */
export type QueryVoice_Meal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Voice_Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Voice_Meal_LogsOrderBy>>;
};


/** The root type for querying data */
export type QueryWater_Intake_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Water_Intake_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Water_Intake_LogsOrderBy>>;
};


/** The root type for querying data */
export type QueryWeekly_SummariesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Weekly_SummariesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Weekly_SummariesOrderBy>>;
};


/** The root type for querying data */
export type QueryWeight_HistoryCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Weight_HistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Weight_HistoryOrderBy>>;
};


/** The root type for querying data */
export type QueryWorkout_Exercise_HistoryCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_Exercise_HistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_Exercise_HistoryOrderBy>>;
};


/** The root type for querying data */
export type QueryWorkout_Plan_AdherenceCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_Plan_AdherenceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_Plan_AdherenceOrderBy>>;
};


/** The root type for querying data */
export type QueryWorkout_SessionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_SessionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_SessionsOrderBy>>;
};


/** The root type for querying data */
export type QueryWorkout_TemplatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_TemplatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_TemplatesOrderBy>>;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  iregex?: InputMaybe<Scalars['String']['input']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  regex?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: InputMaybe<Array<Scalars['String']['input']>>;
  contains?: InputMaybe<Array<Scalars['String']['input']>>;
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  neq?: InputMaybe<Scalars['Time']['input']>;
};

/** Boolean expression comparing fields on type "TimeList" */
export type TimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Time']['input']>>;
  contains?: InputMaybe<Array<Scalars['Time']['input']>>;
  eq?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Time']['input']>>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

/** Boolean expression comparing fields on type "UUIDList" */
export type UuidListFilter = {
  containedBy?: InputMaybe<Array<Scalars['UUID']['input']>>;
  contains?: InputMaybe<Array<Scalars['UUID']['input']>>;
  eq?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type Ai_Meal_Plans = Node & {
  __typename: 'ai_meal_plans';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_calories?: Maybe<Scalars['Int']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  generated_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  meal_itemsCollection?: Maybe<Meal_ItemsConnection>;
  meal_plan_adherenceCollection?: Maybe<Meal_Plan_AdherenceConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  plan_data?: Maybe<Scalars['JSON']['output']>;
  profiles?: Maybe<Profiles>;
  quiz_result_id?: Maybe<Scalars['UUID']['output']>;
  quiz_results?: Maybe<Quiz_Results>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};


export type Ai_Meal_PlansMeal_ItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_ItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_ItemsOrderBy>>;
};


export type Ai_Meal_PlansMeal_Plan_AdherenceCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_Plan_AdherenceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_Plan_AdherenceOrderBy>>;
};

export type Ai_Meal_PlansConnection = {
  __typename: 'ai_meal_plansConnection';
  edges: Array<Ai_Meal_PlansEdge>;
  pageInfo: PageInfo;
};

export type Ai_Meal_PlansDeleteResponse = {
  __typename: 'ai_meal_plansDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Ai_Meal_Plans>;
};

export type Ai_Meal_PlansEdge = {
  __typename: 'ai_meal_plansEdge';
  cursor: Scalars['String']['output'];
  node: Ai_Meal_Plans;
};

export type Ai_Meal_PlansFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Ai_Meal_PlansFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  daily_calories?: InputMaybe<IntFilter>;
  error_message?: InputMaybe<StringFilter>;
  generated_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Ai_Meal_PlansFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Ai_Meal_PlansFilter>>;
  quiz_result_id?: InputMaybe<UuidFilter>;
  status?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Ai_Meal_PlansInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  daily_calories?: InputMaybe<Scalars['Int']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  generated_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan_data?: InputMaybe<Scalars['JSON']['input']>;
  quiz_result_id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Ai_Meal_PlansInsertResponse = {
  __typename: 'ai_meal_plansInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Ai_Meal_Plans>;
};

export type Ai_Meal_PlansOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  daily_calories?: InputMaybe<OrderByDirection>;
  error_message?: InputMaybe<OrderByDirection>;
  generated_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  quiz_result_id?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Ai_Meal_PlansUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  daily_calories?: InputMaybe<Scalars['Int']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  generated_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan_data?: InputMaybe<Scalars['JSON']['input']>;
  quiz_result_id?: InputMaybe<Scalars['UUID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Ai_Meal_PlansUpdateResponse = {
  __typename: 'ai_meal_plansUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Ai_Meal_Plans>;
};

export type Ai_Workout_Plans = Node & {
  __typename: 'ai_workout_plans';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  generated_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  last_regenerated_at?: Maybe<Scalars['Datetime']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  plan_data?: Maybe<Scalars['JSON']['output']>;
  profiles?: Maybe<Profiles>;
  quiz_result_id?: Maybe<Scalars['UUID']['output']>;
  quiz_results?: Maybe<Quiz_Results>;
  regeneration_count?: Maybe<Scalars['Int']['output']>;
  regeneration_reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_plan_adherenceCollection?: Maybe<Workout_Plan_AdherenceConnection>;
  workout_sessionsCollection?: Maybe<Workout_SessionsConnection>;
};


export type Ai_Workout_PlansWorkout_Plan_AdherenceCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_Plan_AdherenceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_Plan_AdherenceOrderBy>>;
};


export type Ai_Workout_PlansWorkout_SessionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_SessionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_SessionsOrderBy>>;
};

export type Ai_Workout_PlansConnection = {
  __typename: 'ai_workout_plansConnection';
  edges: Array<Ai_Workout_PlansEdge>;
  pageInfo: PageInfo;
};

export type Ai_Workout_PlansDeleteResponse = {
  __typename: 'ai_workout_plansDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Ai_Workout_Plans>;
};

export type Ai_Workout_PlansEdge = {
  __typename: 'ai_workout_plansEdge';
  cursor: Scalars['String']['output'];
  node: Ai_Workout_Plans;
};

export type Ai_Workout_PlansFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Ai_Workout_PlansFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  error_message?: InputMaybe<StringFilter>;
  generated_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  last_regenerated_at?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Ai_Workout_PlansFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Ai_Workout_PlansFilter>>;
  quiz_result_id?: InputMaybe<UuidFilter>;
  regeneration_count?: InputMaybe<IntFilter>;
  regeneration_reason?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Ai_Workout_PlansInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  generated_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_regenerated_at?: InputMaybe<Scalars['Datetime']['input']>;
  plan_data?: InputMaybe<Scalars['JSON']['input']>;
  quiz_result_id?: InputMaybe<Scalars['UUID']['input']>;
  regeneration_count?: InputMaybe<Scalars['Int']['input']>;
  regeneration_reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Ai_Workout_PlansInsertResponse = {
  __typename: 'ai_workout_plansInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Ai_Workout_Plans>;
};

export type Ai_Workout_PlansOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  error_message?: InputMaybe<OrderByDirection>;
  generated_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  last_regenerated_at?: InputMaybe<OrderByDirection>;
  quiz_result_id?: InputMaybe<OrderByDirection>;
  regeneration_count?: InputMaybe<OrderByDirection>;
  regeneration_reason?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Ai_Workout_PlansUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  generated_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_regenerated_at?: InputMaybe<Scalars['Datetime']['input']>;
  plan_data?: InputMaybe<Scalars['JSON']['input']>;
  quiz_result_id?: InputMaybe<Scalars['UUID']['input']>;
  regeneration_count?: InputMaybe<Scalars['Int']['input']>;
  regeneration_reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Ai_Workout_PlansUpdateResponse = {
  __typename: 'ai_workout_plansUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Ai_Workout_Plans>;
};

export type Challenge_Participants = Node & {
  __typename: 'challenge_participants';
  challenge_id: Scalars['UUID']['output'];
  challenges?: Maybe<Challenges>;
  completed?: Maybe<Scalars['Boolean']['output']>;
  completion_date?: Maybe<Scalars['Datetime']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  last_progress_date?: Maybe<Scalars['Datetime']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  progress?: Maybe<Scalars['JSON']['output']>;
  streak_count?: Maybe<Scalars['Int']['output']>;
  streak_expires_at?: Maybe<Scalars['Datetime']['output']>;
  streak_warning_sent?: Maybe<Scalars['Boolean']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Challenge_ParticipantsConnection = {
  __typename: 'challenge_participantsConnection';
  edges: Array<Challenge_ParticipantsEdge>;
  pageInfo: PageInfo;
};

export type Challenge_ParticipantsDeleteResponse = {
  __typename: 'challenge_participantsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Challenge_Participants>;
};

export type Challenge_ParticipantsEdge = {
  __typename: 'challenge_participantsEdge';
  cursor: Scalars['String']['output'];
  node: Challenge_Participants;
};

export type Challenge_ParticipantsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Challenge_ParticipantsFilter>>;
  challenge_id?: InputMaybe<UuidFilter>;
  completed?: InputMaybe<BooleanFilter>;
  completion_date?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  last_progress_date?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Challenge_ParticipantsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Challenge_ParticipantsFilter>>;
  streak_count?: InputMaybe<IntFilter>;
  streak_expires_at?: InputMaybe<DatetimeFilter>;
  streak_warning_sent?: InputMaybe<BooleanFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Challenge_ParticipantsInsertInput = {
  challenge_id?: InputMaybe<Scalars['UUID']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  completion_date?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  last_progress_date?: InputMaybe<Scalars['Datetime']['input']>;
  progress?: InputMaybe<Scalars['JSON']['input']>;
  streak_count?: InputMaybe<Scalars['Int']['input']>;
  streak_expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  streak_warning_sent?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Challenge_ParticipantsInsertResponse = {
  __typename: 'challenge_participantsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Challenge_Participants>;
};

export type Challenge_ParticipantsOrderBy = {
  challenge_id?: InputMaybe<OrderByDirection>;
  completed?: InputMaybe<OrderByDirection>;
  completion_date?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  last_progress_date?: InputMaybe<OrderByDirection>;
  streak_count?: InputMaybe<OrderByDirection>;
  streak_expires_at?: InputMaybe<OrderByDirection>;
  streak_warning_sent?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Challenge_ParticipantsUpdateInput = {
  challenge_id?: InputMaybe<Scalars['UUID']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  completion_date?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  last_progress_date?: InputMaybe<Scalars['Datetime']['input']>;
  progress?: InputMaybe<Scalars['JSON']['input']>;
  streak_count?: InputMaybe<Scalars['Int']['input']>;
  streak_expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  streak_warning_sent?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Challenge_ParticipantsUpdateResponse = {
  __typename: 'challenge_participantsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Challenge_Participants>;
};

export type Challenges = Node & {
  __typename: 'challenges';
  challenge_participantsCollection?: Maybe<Challenge_ParticipantsConnection>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  description: Scalars['String']['output'];
  difficulty: Scalars['String']['output'];
  end_date?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  points: Scalars['Int']['output'];
  requirements: Scalars['JSON']['output'];
  start_date?: Maybe<Scalars['Datetime']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Datetime']['output']>;
};


export type ChallengesChallenge_ParticipantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Challenge_ParticipantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Challenge_ParticipantsOrderBy>>;
};

export type ChallengesConnection = {
  __typename: 'challengesConnection';
  edges: Array<ChallengesEdge>;
  pageInfo: PageInfo;
};

export type ChallengesDeleteResponse = {
  __typename: 'challengesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Challenges>;
};

export type ChallengesEdge = {
  __typename: 'challengesEdge';
  cursor: Scalars['String']['output'];
  node: Challenges;
};

export type ChallengesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ChallengesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  difficulty?: InputMaybe<StringFilter>;
  end_date?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ChallengesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ChallengesFilter>>;
  points?: InputMaybe<IntFilter>;
  start_date?: InputMaybe<DatetimeFilter>;
  title?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type ChallengesInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  requirements?: InputMaybe<Scalars['JSON']['input']>;
  start_date?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ChallengesInsertResponse = {
  __typename: 'challengesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Challenges>;
};

export type ChallengesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  difficulty?: InputMaybe<OrderByDirection>;
  end_date?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  points?: InputMaybe<OrderByDirection>;
  start_date?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type ChallengesUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  requirements?: InputMaybe<Scalars['JSON']['input']>;
  start_date?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ChallengesUpdateResponse = {
  __typename: 'challengesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Challenges>;
};

export type Coupon_Codes = Node & {
  __typename: 'coupon_codes';
  code: Scalars['String']['output'];
  created_at?: Maybe<Scalars['Datetime']['output']>;
  discount_type: Scalars['String']['output'];
  discount_value: Scalars['String']['output'];
  expires_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  reward_id?: Maybe<Scalars['UUID']['output']>;
  reward_name: Scalars['String']['output'];
  rewards_catalog?: Maybe<Rewards_Catalog>;
  stripe_coupon_id?: Maybe<Scalars['String']['output']>;
  used?: Maybe<Scalars['Boolean']['output']>;
  used_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Coupon_CodesConnection = {
  __typename: 'coupon_codesConnection';
  edges: Array<Coupon_CodesEdge>;
  pageInfo: PageInfo;
};

export type Coupon_CodesDeleteResponse = {
  __typename: 'coupon_codesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Coupon_Codes>;
};

export type Coupon_CodesEdge = {
  __typename: 'coupon_codesEdge';
  cursor: Scalars['String']['output'];
  node: Coupon_Codes;
};

export type Coupon_CodesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Coupon_CodesFilter>>;
  code?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  discount_type?: InputMaybe<StringFilter>;
  discount_value?: InputMaybe<StringFilter>;
  expires_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Coupon_CodesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Coupon_CodesFilter>>;
  reward_id?: InputMaybe<UuidFilter>;
  reward_name?: InputMaybe<StringFilter>;
  stripe_coupon_id?: InputMaybe<StringFilter>;
  used?: InputMaybe<BooleanFilter>;
  used_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Coupon_CodesInsertInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  discount_type?: InputMaybe<Scalars['String']['input']>;
  discount_value?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  reward_id?: InputMaybe<Scalars['UUID']['input']>;
  reward_name?: InputMaybe<Scalars['String']['input']>;
  stripe_coupon_id?: InputMaybe<Scalars['String']['input']>;
  used?: InputMaybe<Scalars['Boolean']['input']>;
  used_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Coupon_CodesInsertResponse = {
  __typename: 'coupon_codesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Coupon_Codes>;
};

export type Coupon_CodesOrderBy = {
  code?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  discount_type?: InputMaybe<OrderByDirection>;
  discount_value?: InputMaybe<OrderByDirection>;
  expires_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  reward_id?: InputMaybe<OrderByDirection>;
  reward_name?: InputMaybe<OrderByDirection>;
  stripe_coupon_id?: InputMaybe<OrderByDirection>;
  used?: InputMaybe<OrderByDirection>;
  used_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Coupon_CodesUpdateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  discount_type?: InputMaybe<Scalars['String']['input']>;
  discount_value?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  reward_id?: InputMaybe<Scalars['UUID']['input']>;
  reward_name?: InputMaybe<Scalars['String']['input']>;
  stripe_coupon_id?: InputMaybe<Scalars['String']['input']>;
  used?: InputMaybe<Scalars['Boolean']['input']>;
  used_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Coupon_CodesUpdateResponse = {
  __typename: 'coupon_codesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Coupon_Codes>;
};

export type Daily_Activity_Summary = Node & {
  __typename: 'daily_activity_summary';
  activity_date: Scalars['Date']['output'];
  calories_burned?: Maybe<Scalars['Int']['output']>;
  calories_consumed?: Maybe<Scalars['Int']['output']>;
  carbs_g?: Maybe<Scalars['Float']['output']>;
  completed_all_goals?: Maybe<Scalars['Boolean']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  fats_g?: Maybe<Scalars['Float']['output']>;
  id: Scalars['UUID']['output'];
  logged_nutrition?: Maybe<Scalars['Boolean']['output']>;
  logged_weight?: Maybe<Scalars['Boolean']['output']>;
  logged_workout?: Maybe<Scalars['Boolean']['output']>;
  meals_logged?: Maybe<Scalars['Int']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  protein_g?: Maybe<Scalars['Float']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  water_glasses?: Maybe<Scalars['Int']['output']>;
  workout_duration_minutes?: Maybe<Scalars['Int']['output']>;
  workouts_completed?: Maybe<Scalars['Int']['output']>;
};

export type Daily_Activity_SummaryConnection = {
  __typename: 'daily_activity_summaryConnection';
  edges: Array<Daily_Activity_SummaryEdge>;
  pageInfo: PageInfo;
};

export type Daily_Activity_SummaryDeleteResponse = {
  __typename: 'daily_activity_summaryDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Activity_Summary>;
};

export type Daily_Activity_SummaryEdge = {
  __typename: 'daily_activity_summaryEdge';
  cursor: Scalars['String']['output'];
  node: Daily_Activity_Summary;
};

export type Daily_Activity_SummaryFilter = {
  activity_date?: InputMaybe<DateFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Daily_Activity_SummaryFilter>>;
  calories_burned?: InputMaybe<IntFilter>;
  calories_consumed?: InputMaybe<IntFilter>;
  carbs_g?: InputMaybe<FloatFilter>;
  completed_all_goals?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  fats_g?: InputMaybe<FloatFilter>;
  id?: InputMaybe<UuidFilter>;
  logged_nutrition?: InputMaybe<BooleanFilter>;
  logged_weight?: InputMaybe<BooleanFilter>;
  logged_workout?: InputMaybe<BooleanFilter>;
  meals_logged?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Daily_Activity_SummaryFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Daily_Activity_SummaryFilter>>;
  protein_g?: InputMaybe<FloatFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  water_glasses?: InputMaybe<IntFilter>;
  workout_duration_minutes?: InputMaybe<IntFilter>;
  workouts_completed?: InputMaybe<IntFilter>;
};

export type Daily_Activity_SummaryInsertInput = {
  activity_date?: InputMaybe<Scalars['Date']['input']>;
  calories_burned?: InputMaybe<Scalars['Int']['input']>;
  calories_consumed?: InputMaybe<Scalars['Int']['input']>;
  carbs_g?: InputMaybe<Scalars['Float']['input']>;
  completed_all_goals?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  fats_g?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  logged_nutrition?: InputMaybe<Scalars['Boolean']['input']>;
  logged_weight?: InputMaybe<Scalars['Boolean']['input']>;
  logged_workout?: InputMaybe<Scalars['Boolean']['input']>;
  meals_logged?: InputMaybe<Scalars['Int']['input']>;
  protein_g?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  water_glasses?: InputMaybe<Scalars['Int']['input']>;
  workout_duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  workouts_completed?: InputMaybe<Scalars['Int']['input']>;
};

export type Daily_Activity_SummaryInsertResponse = {
  __typename: 'daily_activity_summaryInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Activity_Summary>;
};

export type Daily_Activity_SummaryOrderBy = {
  activity_date?: InputMaybe<OrderByDirection>;
  calories_burned?: InputMaybe<OrderByDirection>;
  calories_consumed?: InputMaybe<OrderByDirection>;
  carbs_g?: InputMaybe<OrderByDirection>;
  completed_all_goals?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  fats_g?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  logged_nutrition?: InputMaybe<OrderByDirection>;
  logged_weight?: InputMaybe<OrderByDirection>;
  logged_workout?: InputMaybe<OrderByDirection>;
  meals_logged?: InputMaybe<OrderByDirection>;
  protein_g?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  water_glasses?: InputMaybe<OrderByDirection>;
  workout_duration_minutes?: InputMaybe<OrderByDirection>;
  workouts_completed?: InputMaybe<OrderByDirection>;
};

export type Daily_Activity_SummaryUpdateInput = {
  activity_date?: InputMaybe<Scalars['Date']['input']>;
  calories_burned?: InputMaybe<Scalars['Int']['input']>;
  calories_consumed?: InputMaybe<Scalars['Int']['input']>;
  carbs_g?: InputMaybe<Scalars['Float']['input']>;
  completed_all_goals?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  fats_g?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  logged_nutrition?: InputMaybe<Scalars['Boolean']['input']>;
  logged_weight?: InputMaybe<Scalars['Boolean']['input']>;
  logged_workout?: InputMaybe<Scalars['Boolean']['input']>;
  meals_logged?: InputMaybe<Scalars['Int']['input']>;
  protein_g?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  water_glasses?: InputMaybe<Scalars['Int']['input']>;
  workout_duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  workouts_completed?: InputMaybe<Scalars['Int']['input']>;
};

export type Daily_Activity_SummaryUpdateResponse = {
  __typename: 'daily_activity_summaryUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Activity_Summary>;
};

export type Daily_Nutrition_Logs = Node & {
  __typename: 'daily_nutrition_logs';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  food_items: Scalars['JSON']['output'];
  id: Scalars['UUID']['output'];
  log_date: Scalars['Date']['output'];
  meal_itemsCollection?: Maybe<Meal_ItemsConnection>;
  meal_photo_logsCollection?: Maybe<Meal_Photo_LogsConnection>;
  meal_type: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  profiles?: Maybe<Profiles>;
  total_calories?: Maybe<Scalars['Float']['output']>;
  total_carbs?: Maybe<Scalars['Float']['output']>;
  total_fats?: Maybe<Scalars['Float']['output']>;
  total_protein?: Maybe<Scalars['Float']['output']>;
  user_id: Scalars['UUID']['output'];
  voice_meal_logsCollection?: Maybe<Voice_Meal_LogsConnection>;
};


export type Daily_Nutrition_LogsMeal_ItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_ItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_ItemsOrderBy>>;
};


export type Daily_Nutrition_LogsMeal_Photo_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_Photo_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_Photo_LogsOrderBy>>;
};


export type Daily_Nutrition_LogsVoice_Meal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Voice_Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Voice_Meal_LogsOrderBy>>;
};

export type Daily_Nutrition_LogsConnection = {
  __typename: 'daily_nutrition_logsConnection';
  edges: Array<Daily_Nutrition_LogsEdge>;
  pageInfo: PageInfo;
};

export type Daily_Nutrition_LogsDeleteResponse = {
  __typename: 'daily_nutrition_logsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Nutrition_Logs>;
};

export type Daily_Nutrition_LogsEdge = {
  __typename: 'daily_nutrition_logsEdge';
  cursor: Scalars['String']['output'];
  node: Daily_Nutrition_Logs;
};

export type Daily_Nutrition_LogsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Daily_Nutrition_LogsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  log_date?: InputMaybe<DateFilter>;
  meal_type?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Daily_Nutrition_LogsFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Daily_Nutrition_LogsFilter>>;
  total_calories?: InputMaybe<FloatFilter>;
  total_carbs?: InputMaybe<FloatFilter>;
  total_fats?: InputMaybe<FloatFilter>;
  total_protein?: InputMaybe<FloatFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Daily_Nutrition_LogsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  food_items?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  total_calories?: InputMaybe<Scalars['Float']['input']>;
  total_carbs?: InputMaybe<Scalars['Float']['input']>;
  total_fats?: InputMaybe<Scalars['Float']['input']>;
  total_protein?: InputMaybe<Scalars['Float']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Daily_Nutrition_LogsInsertResponse = {
  __typename: 'daily_nutrition_logsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Nutrition_Logs>;
};

export type Daily_Nutrition_LogsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  log_date?: InputMaybe<OrderByDirection>;
  meal_type?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  total_calories?: InputMaybe<OrderByDirection>;
  total_carbs?: InputMaybe<OrderByDirection>;
  total_fats?: InputMaybe<OrderByDirection>;
  total_protein?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Daily_Nutrition_LogsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  food_items?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  total_calories?: InputMaybe<Scalars['Float']['input']>;
  total_carbs?: InputMaybe<Scalars['Float']['input']>;
  total_fats?: InputMaybe<Scalars['Float']['input']>;
  total_protein?: InputMaybe<Scalars['Float']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Daily_Nutrition_LogsUpdateResponse = {
  __typename: 'daily_nutrition_logsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Nutrition_Logs>;
};

export type Daily_Water_Intake = Node & {
  __typename: 'daily_water_intake';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  glasses?: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  log_date: Scalars['Date']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  total_ml?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Daily_Water_IntakeConnection = {
  __typename: 'daily_water_intakeConnection';
  edges: Array<Daily_Water_IntakeEdge>;
  pageInfo: PageInfo;
};

export type Daily_Water_IntakeDeleteResponse = {
  __typename: 'daily_water_intakeDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Water_Intake>;
};

export type Daily_Water_IntakeEdge = {
  __typename: 'daily_water_intakeEdge';
  cursor: Scalars['String']['output'];
  node: Daily_Water_Intake;
};

export type Daily_Water_IntakeFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Daily_Water_IntakeFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  glasses?: InputMaybe<IntFilter>;
  id?: InputMaybe<UuidFilter>;
  log_date?: InputMaybe<DateFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Daily_Water_IntakeFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Daily_Water_IntakeFilter>>;
  total_ml?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Daily_Water_IntakeInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  glasses?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  total_ml?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Daily_Water_IntakeInsertResponse = {
  __typename: 'daily_water_intakeInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Water_Intake>;
};

export type Daily_Water_IntakeOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  glasses?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  log_date?: InputMaybe<OrderByDirection>;
  total_ml?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Daily_Water_IntakeUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  glasses?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  total_ml?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Daily_Water_IntakeUpdateResponse = {
  __typename: 'daily_water_intakeUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Daily_Water_Intake>;
};

export type Data_Exports = Node & {
  __typename: 'data_exports';
  completed_at?: Maybe<Scalars['Datetime']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  date_range_end?: Maybe<Scalars['Date']['output']>;
  date_range_start?: Maybe<Scalars['Date']['output']>;
  download_count?: Maybe<Scalars['Int']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['Datetime']['output']>;
  export_format: Scalars['String']['output'];
  export_type: Scalars['String']['output'];
  file_size_bytes?: Maybe<Scalars['BigInt']['output']>;
  file_url?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  include_analytics?: Maybe<Scalars['Boolean']['output']>;
  include_photos?: Maybe<Scalars['Boolean']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  started_at?: Maybe<Scalars['Datetime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Data_ExportsConnection = {
  __typename: 'data_exportsConnection';
  edges: Array<Data_ExportsEdge>;
  pageInfo: PageInfo;
};

export type Data_ExportsDeleteResponse = {
  __typename: 'data_exportsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Data_Exports>;
};

export type Data_ExportsEdge = {
  __typename: 'data_exportsEdge';
  cursor: Scalars['String']['output'];
  node: Data_Exports;
};

export type Data_ExportsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Data_ExportsFilter>>;
  completed_at?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  date_range_end?: InputMaybe<DateFilter>;
  date_range_start?: InputMaybe<DateFilter>;
  download_count?: InputMaybe<IntFilter>;
  error_message?: InputMaybe<StringFilter>;
  expires_at?: InputMaybe<DatetimeFilter>;
  export_format?: InputMaybe<StringFilter>;
  export_type?: InputMaybe<StringFilter>;
  file_size_bytes?: InputMaybe<BigIntFilter>;
  file_url?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  include_analytics?: InputMaybe<BooleanFilter>;
  include_photos?: InputMaybe<BooleanFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Data_ExportsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Data_ExportsFilter>>;
  started_at?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Data_ExportsInsertInput = {
  completed_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  date_range_end?: InputMaybe<Scalars['Date']['input']>;
  date_range_start?: InputMaybe<Scalars['Date']['input']>;
  download_count?: InputMaybe<Scalars['Int']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  export_format?: InputMaybe<Scalars['String']['input']>;
  export_type?: InputMaybe<Scalars['String']['input']>;
  file_size_bytes?: InputMaybe<Scalars['BigInt']['input']>;
  file_url?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  include_analytics?: InputMaybe<Scalars['Boolean']['input']>;
  include_photos?: InputMaybe<Scalars['Boolean']['input']>;
  started_at?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Data_ExportsInsertResponse = {
  __typename: 'data_exportsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Data_Exports>;
};

export type Data_ExportsOrderBy = {
  completed_at?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  date_range_end?: InputMaybe<OrderByDirection>;
  date_range_start?: InputMaybe<OrderByDirection>;
  download_count?: InputMaybe<OrderByDirection>;
  error_message?: InputMaybe<OrderByDirection>;
  expires_at?: InputMaybe<OrderByDirection>;
  export_format?: InputMaybe<OrderByDirection>;
  export_type?: InputMaybe<OrderByDirection>;
  file_size_bytes?: InputMaybe<OrderByDirection>;
  file_url?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  include_analytics?: InputMaybe<OrderByDirection>;
  include_photos?: InputMaybe<OrderByDirection>;
  started_at?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Data_ExportsUpdateInput = {
  completed_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  date_range_end?: InputMaybe<Scalars['Date']['input']>;
  date_range_start?: InputMaybe<Scalars['Date']['input']>;
  download_count?: InputMaybe<Scalars['Int']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  export_format?: InputMaybe<Scalars['String']['input']>;
  export_type?: InputMaybe<Scalars['String']['input']>;
  file_size_bytes?: InputMaybe<Scalars['BigInt']['input']>;
  file_url?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  include_analytics?: InputMaybe<Scalars['Boolean']['input']>;
  include_photos?: InputMaybe<Scalars['Boolean']['input']>;
  started_at?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Data_ExportsUpdateResponse = {
  __typename: 'data_exportsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Data_Exports>;
};

export type Exercise_Personal_Records = Node & {
  __typename: 'exercise_personal_records';
  best_1rm_date?: Maybe<Scalars['Date']['output']>;
  best_1rm_kg?: Maybe<Scalars['Float']['output']>;
  best_time_date?: Maybe<Scalars['Date']['output']>;
  best_time_seconds?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  exercise_id?: Maybe<Scalars['String']['output']>;
  exercise_sets?: Maybe<Exercise_Sets>;
  id: Scalars['UUID']['output'];
  max_distance_date?: Maybe<Scalars['Date']['output']>;
  max_distance_meters?: Maybe<Scalars['Float']['output']>;
  max_reps?: Maybe<Scalars['Int']['output']>;
  max_reps_date?: Maybe<Scalars['Date']['output']>;
  max_reps_set_id?: Maybe<Scalars['UUID']['output']>;
  max_volume?: Maybe<Scalars['Float']['output']>;
  max_volume_date?: Maybe<Scalars['Date']['output']>;
  max_volume_set_id?: Maybe<Scalars['UUID']['output']>;
  max_weight_date?: Maybe<Scalars['Date']['output']>;
  max_weight_kg?: Maybe<Scalars['Float']['output']>;
  max_weight_set_id?: Maybe<Scalars['UUID']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Exercise_Personal_RecordsConnection = {
  __typename: 'exercise_personal_recordsConnection';
  edges: Array<Exercise_Personal_RecordsEdge>;
  pageInfo: PageInfo;
};

export type Exercise_Personal_RecordsDeleteResponse = {
  __typename: 'exercise_personal_recordsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exercise_Personal_Records>;
};

export type Exercise_Personal_RecordsEdge = {
  __typename: 'exercise_personal_recordsEdge';
  cursor: Scalars['String']['output'];
  node: Exercise_Personal_Records;
};

export type Exercise_Personal_RecordsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Exercise_Personal_RecordsFilter>>;
  best_1rm_date?: InputMaybe<DateFilter>;
  best_1rm_kg?: InputMaybe<FloatFilter>;
  best_time_date?: InputMaybe<DateFilter>;
  best_time_seconds?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  exercise_id?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  max_distance_date?: InputMaybe<DateFilter>;
  max_distance_meters?: InputMaybe<FloatFilter>;
  max_reps?: InputMaybe<IntFilter>;
  max_reps_date?: InputMaybe<DateFilter>;
  max_reps_set_id?: InputMaybe<UuidFilter>;
  max_volume?: InputMaybe<FloatFilter>;
  max_volume_date?: InputMaybe<DateFilter>;
  max_volume_set_id?: InputMaybe<UuidFilter>;
  max_weight_date?: InputMaybe<DateFilter>;
  max_weight_kg?: InputMaybe<FloatFilter>;
  max_weight_set_id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Exercise_Personal_RecordsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Exercise_Personal_RecordsFilter>>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Exercise_Personal_RecordsInsertInput = {
  best_1rm_date?: InputMaybe<Scalars['Date']['input']>;
  best_1rm_kg?: InputMaybe<Scalars['Float']['input']>;
  best_time_date?: InputMaybe<Scalars['Date']['input']>;
  best_time_seconds?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  exercise_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  max_distance_date?: InputMaybe<Scalars['Date']['input']>;
  max_distance_meters?: InputMaybe<Scalars['Float']['input']>;
  max_reps?: InputMaybe<Scalars['Int']['input']>;
  max_reps_date?: InputMaybe<Scalars['Date']['input']>;
  max_reps_set_id?: InputMaybe<Scalars['UUID']['input']>;
  max_volume?: InputMaybe<Scalars['Float']['input']>;
  max_volume_date?: InputMaybe<Scalars['Date']['input']>;
  max_volume_set_id?: InputMaybe<Scalars['UUID']['input']>;
  max_weight_date?: InputMaybe<Scalars['Date']['input']>;
  max_weight_kg?: InputMaybe<Scalars['Float']['input']>;
  max_weight_set_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Exercise_Personal_RecordsInsertResponse = {
  __typename: 'exercise_personal_recordsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exercise_Personal_Records>;
};

export type Exercise_Personal_RecordsOrderBy = {
  best_1rm_date?: InputMaybe<OrderByDirection>;
  best_1rm_kg?: InputMaybe<OrderByDirection>;
  best_time_date?: InputMaybe<OrderByDirection>;
  best_time_seconds?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  max_distance_date?: InputMaybe<OrderByDirection>;
  max_distance_meters?: InputMaybe<OrderByDirection>;
  max_reps?: InputMaybe<OrderByDirection>;
  max_reps_date?: InputMaybe<OrderByDirection>;
  max_reps_set_id?: InputMaybe<OrderByDirection>;
  max_volume?: InputMaybe<OrderByDirection>;
  max_volume_date?: InputMaybe<OrderByDirection>;
  max_volume_set_id?: InputMaybe<OrderByDirection>;
  max_weight_date?: InputMaybe<OrderByDirection>;
  max_weight_kg?: InputMaybe<OrderByDirection>;
  max_weight_set_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Exercise_Personal_RecordsUpdateInput = {
  best_1rm_date?: InputMaybe<Scalars['Date']['input']>;
  best_1rm_kg?: InputMaybe<Scalars['Float']['input']>;
  best_time_date?: InputMaybe<Scalars['Date']['input']>;
  best_time_seconds?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  exercise_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  max_distance_date?: InputMaybe<Scalars['Date']['input']>;
  max_distance_meters?: InputMaybe<Scalars['Float']['input']>;
  max_reps?: InputMaybe<Scalars['Int']['input']>;
  max_reps_date?: InputMaybe<Scalars['Date']['input']>;
  max_reps_set_id?: InputMaybe<Scalars['UUID']['input']>;
  max_volume?: InputMaybe<Scalars['Float']['input']>;
  max_volume_date?: InputMaybe<Scalars['Date']['input']>;
  max_volume_set_id?: InputMaybe<Scalars['UUID']['input']>;
  max_weight_date?: InputMaybe<Scalars['Date']['input']>;
  max_weight_kg?: InputMaybe<Scalars['Float']['input']>;
  max_weight_set_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Exercise_Personal_RecordsUpdateResponse = {
  __typename: 'exercise_personal_recordsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exercise_Personal_Records>;
};

export type Exercise_Sets = Node & {
  __typename: 'exercise_sets';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  distance_meters?: Maybe<Scalars['Float']['output']>;
  duration_seconds?: Maybe<Scalars['Int']['output']>;
  exercise_category?: Maybe<Scalars['String']['output']>;
  exercise_id?: Maybe<Scalars['String']['output']>;
  exercise_name: Scalars['String']['output'];
  exercise_personal_recordsCollection?: Maybe<Exercise_Personal_RecordsConnection>;
  id: Scalars['UUID']['output'];
  is_dropset?: Maybe<Scalars['Boolean']['output']>;
  is_failure?: Maybe<Scalars['Boolean']['output']>;
  is_pr_distance?: Maybe<Scalars['Boolean']['output']>;
  is_pr_duration?: Maybe<Scalars['Boolean']['output']>;
  is_pr_reps?: Maybe<Scalars['Boolean']['output']>;
  is_pr_volume?: Maybe<Scalars['Boolean']['output']>;
  is_pr_weight?: Maybe<Scalars['Boolean']['output']>;
  is_warmup?: Maybe<Scalars['Boolean']['output']>;
  muscle_group?: Maybe<Scalars['String']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  profiles?: Maybe<Profiles>;
  reps?: Maybe<Scalars['Int']['output']>;
  rest_seconds?: Maybe<Scalars['Int']['output']>;
  rpe?: Maybe<Scalars['Int']['output']>;
  set_number: Scalars['Int']['output'];
  tempo?: Maybe<Scalars['String']['output']>;
  tracking_mode?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['UUID']['output'];
  weight_kg?: Maybe<Scalars['Float']['output']>;
  workout_session_id: Scalars['UUID']['output'];
  workout_sessions?: Maybe<Workout_Sessions>;
};


export type Exercise_SetsExercise_Personal_RecordsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exercise_Personal_RecordsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exercise_Personal_RecordsOrderBy>>;
};

export type Exercise_SetsConnection = {
  __typename: 'exercise_setsConnection';
  edges: Array<Exercise_SetsEdge>;
  pageInfo: PageInfo;
};

export type Exercise_SetsDeleteResponse = {
  __typename: 'exercise_setsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exercise_Sets>;
};

export type Exercise_SetsEdge = {
  __typename: 'exercise_setsEdge';
  cursor: Scalars['String']['output'];
  node: Exercise_Sets;
};

export type Exercise_SetsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Exercise_SetsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  distance_meters?: InputMaybe<FloatFilter>;
  duration_seconds?: InputMaybe<IntFilter>;
  exercise_category?: InputMaybe<StringFilter>;
  exercise_id?: InputMaybe<StringFilter>;
  exercise_name?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  is_dropset?: InputMaybe<BooleanFilter>;
  is_failure?: InputMaybe<BooleanFilter>;
  is_pr_distance?: InputMaybe<BooleanFilter>;
  is_pr_duration?: InputMaybe<BooleanFilter>;
  is_pr_reps?: InputMaybe<BooleanFilter>;
  is_pr_volume?: InputMaybe<BooleanFilter>;
  is_pr_weight?: InputMaybe<BooleanFilter>;
  is_warmup?: InputMaybe<BooleanFilter>;
  muscle_group?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Exercise_SetsFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Exercise_SetsFilter>>;
  reps?: InputMaybe<IntFilter>;
  rest_seconds?: InputMaybe<IntFilter>;
  rpe?: InputMaybe<IntFilter>;
  set_number?: InputMaybe<IntFilter>;
  tempo?: InputMaybe<StringFilter>;
  tracking_mode?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
  weight_kg?: InputMaybe<FloatFilter>;
  workout_session_id?: InputMaybe<UuidFilter>;
};

export type Exercise_SetsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  distance_meters?: InputMaybe<Scalars['Float']['input']>;
  duration_seconds?: InputMaybe<Scalars['Int']['input']>;
  exercise_category?: InputMaybe<Scalars['String']['input']>;
  exercise_id?: InputMaybe<Scalars['String']['input']>;
  exercise_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_dropset?: InputMaybe<Scalars['Boolean']['input']>;
  is_failure?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_distance?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_duration?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_reps?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_volume?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_weight?: InputMaybe<Scalars['Boolean']['input']>;
  is_warmup?: InputMaybe<Scalars['Boolean']['input']>;
  muscle_group?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  reps?: InputMaybe<Scalars['Int']['input']>;
  rest_seconds?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  set_number?: InputMaybe<Scalars['Int']['input']>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  tracking_mode?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weight_kg?: InputMaybe<Scalars['Float']['input']>;
  workout_session_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Exercise_SetsInsertResponse = {
  __typename: 'exercise_setsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exercise_Sets>;
};

export type Exercise_SetsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  distance_meters?: InputMaybe<OrderByDirection>;
  duration_seconds?: InputMaybe<OrderByDirection>;
  exercise_category?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  exercise_name?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_dropset?: InputMaybe<OrderByDirection>;
  is_failure?: InputMaybe<OrderByDirection>;
  is_pr_distance?: InputMaybe<OrderByDirection>;
  is_pr_duration?: InputMaybe<OrderByDirection>;
  is_pr_reps?: InputMaybe<OrderByDirection>;
  is_pr_volume?: InputMaybe<OrderByDirection>;
  is_pr_weight?: InputMaybe<OrderByDirection>;
  is_warmup?: InputMaybe<OrderByDirection>;
  muscle_group?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  reps?: InputMaybe<OrderByDirection>;
  rest_seconds?: InputMaybe<OrderByDirection>;
  rpe?: InputMaybe<OrderByDirection>;
  set_number?: InputMaybe<OrderByDirection>;
  tempo?: InputMaybe<OrderByDirection>;
  tracking_mode?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  weight_kg?: InputMaybe<OrderByDirection>;
  workout_session_id?: InputMaybe<OrderByDirection>;
};

export type Exercise_SetsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  distance_meters?: InputMaybe<Scalars['Float']['input']>;
  duration_seconds?: InputMaybe<Scalars['Int']['input']>;
  exercise_category?: InputMaybe<Scalars['String']['input']>;
  exercise_id?: InputMaybe<Scalars['String']['input']>;
  exercise_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_dropset?: InputMaybe<Scalars['Boolean']['input']>;
  is_failure?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_distance?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_duration?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_reps?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_volume?: InputMaybe<Scalars['Boolean']['input']>;
  is_pr_weight?: InputMaybe<Scalars['Boolean']['input']>;
  is_warmup?: InputMaybe<Scalars['Boolean']['input']>;
  muscle_group?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  reps?: InputMaybe<Scalars['Int']['input']>;
  rest_seconds?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  set_number?: InputMaybe<Scalars['Int']['input']>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  tracking_mode?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weight_kg?: InputMaybe<Scalars['Float']['input']>;
  workout_session_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Exercise_SetsUpdateResponse = {
  __typename: 'exercise_setsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exercise_Sets>;
};

export type Meal_Items = Node & {
  __typename: 'meal_items';
  ai_meal_plan_id?: Maybe<Scalars['UUID']['output']>;
  ai_meal_plans?: Maybe<Ai_Meal_Plans>;
  brand_name?: Maybe<Scalars['String']['output']>;
  calories: Scalars['Float']['output'];
  carbs: Scalars['Float']['output'];
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_nutrition_logs?: Maybe<Daily_Nutrition_Logs>;
  fats: Scalars['Float']['output'];
  fiber?: Maybe<Scalars['Float']['output']>;
  food_id?: Maybe<Scalars['String']['output']>;
  food_name: Scalars['String']['output'];
  from_ai_plan?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['UUID']['output'];
  logged_at?: Maybe<Scalars['Datetime']['output']>;
  meal_photo_logs?: Maybe<Meal_Photo_Logs>;
  meal_type?: Maybe<Scalars['String']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  nutrition_log_id?: Maybe<Scalars['UUID']['output']>;
  photo_log_id?: Maybe<Scalars['UUID']['output']>;
  plan_meal_name?: Maybe<Scalars['String']['output']>;
  profiles?: Maybe<Profiles>;
  protein: Scalars['Float']['output'];
  serving_qty: Scalars['Float']['output'];
  serving_unit: Scalars['String']['output'];
  sodium?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  sugar?: Maybe<Scalars['Float']['output']>;
  user_id: Scalars['UUID']['output'];
  voice_log_id?: Maybe<Scalars['UUID']['output']>;
  voice_meal_logs?: Maybe<Voice_Meal_Logs>;
};

export type Meal_ItemsConnection = {
  __typename: 'meal_itemsConnection';
  edges: Array<Meal_ItemsEdge>;
  pageInfo: PageInfo;
};

export type Meal_ItemsDeleteResponse = {
  __typename: 'meal_itemsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Items>;
};

export type Meal_ItemsEdge = {
  __typename: 'meal_itemsEdge';
  cursor: Scalars['String']['output'];
  node: Meal_Items;
};

export type Meal_ItemsFilter = {
  ai_meal_plan_id?: InputMaybe<UuidFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Meal_ItemsFilter>>;
  brand_name?: InputMaybe<StringFilter>;
  calories?: InputMaybe<FloatFilter>;
  carbs?: InputMaybe<FloatFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  fats?: InputMaybe<FloatFilter>;
  fiber?: InputMaybe<FloatFilter>;
  food_id?: InputMaybe<StringFilter>;
  food_name?: InputMaybe<StringFilter>;
  from_ai_plan?: InputMaybe<BooleanFilter>;
  id?: InputMaybe<UuidFilter>;
  logged_at?: InputMaybe<DatetimeFilter>;
  meal_type?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Meal_ItemsFilter>;
  notes?: InputMaybe<StringFilter>;
  nutrition_log_id?: InputMaybe<UuidFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Meal_ItemsFilter>>;
  photo_log_id?: InputMaybe<UuidFilter>;
  plan_meal_name?: InputMaybe<StringFilter>;
  protein?: InputMaybe<FloatFilter>;
  serving_qty?: InputMaybe<FloatFilter>;
  serving_unit?: InputMaybe<StringFilter>;
  sodium?: InputMaybe<FloatFilter>;
  source?: InputMaybe<StringFilter>;
  sugar?: InputMaybe<FloatFilter>;
  user_id?: InputMaybe<UuidFilter>;
  voice_log_id?: InputMaybe<UuidFilter>;
};

export type Meal_ItemsInsertInput = {
  ai_meal_plan_id?: InputMaybe<Scalars['UUID']['input']>;
  brand_name?: InputMaybe<Scalars['String']['input']>;
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  fats?: InputMaybe<Scalars['Float']['input']>;
  fiber?: InputMaybe<Scalars['Float']['input']>;
  food_id?: InputMaybe<Scalars['String']['input']>;
  food_name?: InputMaybe<Scalars['String']['input']>;
  from_ai_plan?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  logged_at?: InputMaybe<Scalars['Datetime']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  nutrition_log_id?: InputMaybe<Scalars['UUID']['input']>;
  photo_log_id?: InputMaybe<Scalars['UUID']['input']>;
  plan_meal_name?: InputMaybe<Scalars['String']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  serving_qty?: InputMaybe<Scalars['Float']['input']>;
  serving_unit?: InputMaybe<Scalars['String']['input']>;
  sodium?: InputMaybe<Scalars['Float']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sugar?: InputMaybe<Scalars['Float']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  voice_log_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Meal_ItemsInsertResponse = {
  __typename: 'meal_itemsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Items>;
};

export type Meal_ItemsOrderBy = {
  ai_meal_plan_id?: InputMaybe<OrderByDirection>;
  brand_name?: InputMaybe<OrderByDirection>;
  calories?: InputMaybe<OrderByDirection>;
  carbs?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  fats?: InputMaybe<OrderByDirection>;
  fiber?: InputMaybe<OrderByDirection>;
  food_id?: InputMaybe<OrderByDirection>;
  food_name?: InputMaybe<OrderByDirection>;
  from_ai_plan?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  logged_at?: InputMaybe<OrderByDirection>;
  meal_type?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  nutrition_log_id?: InputMaybe<OrderByDirection>;
  photo_log_id?: InputMaybe<OrderByDirection>;
  plan_meal_name?: InputMaybe<OrderByDirection>;
  protein?: InputMaybe<OrderByDirection>;
  serving_qty?: InputMaybe<OrderByDirection>;
  serving_unit?: InputMaybe<OrderByDirection>;
  sodium?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  sugar?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  voice_log_id?: InputMaybe<OrderByDirection>;
};

export type Meal_ItemsUpdateInput = {
  ai_meal_plan_id?: InputMaybe<Scalars['UUID']['input']>;
  brand_name?: InputMaybe<Scalars['String']['input']>;
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  fats?: InputMaybe<Scalars['Float']['input']>;
  fiber?: InputMaybe<Scalars['Float']['input']>;
  food_id?: InputMaybe<Scalars['String']['input']>;
  food_name?: InputMaybe<Scalars['String']['input']>;
  from_ai_plan?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  logged_at?: InputMaybe<Scalars['Datetime']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  nutrition_log_id?: InputMaybe<Scalars['UUID']['input']>;
  photo_log_id?: InputMaybe<Scalars['UUID']['input']>;
  plan_meal_name?: InputMaybe<Scalars['String']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  serving_qty?: InputMaybe<Scalars['Float']['input']>;
  serving_unit?: InputMaybe<Scalars['String']['input']>;
  sodium?: InputMaybe<Scalars['Float']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  sugar?: InputMaybe<Scalars['Float']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  voice_log_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Meal_ItemsUpdateResponse = {
  __typename: 'meal_itemsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Items>;
};

export type Meal_Photo_Logs = Node & {
  __typename: 'meal_photo_logs';
  ai_model_used?: Maybe<Scalars['String']['output']>;
  confidence_score?: Maybe<Scalars['Float']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_nutrition_logs?: Maybe<Daily_Nutrition_Logs>;
  detected_foods?: Maybe<Scalars['JSON']['output']>;
  error_message?: Maybe<Scalars['String']['output']>;
  estimated_calories?: Maybe<Scalars['Int']['output']>;
  estimated_carbs?: Maybe<Scalars['Float']['output']>;
  estimated_fats?: Maybe<Scalars['Float']['output']>;
  estimated_protein?: Maybe<Scalars['Float']['output']>;
  final_calories?: Maybe<Scalars['Int']['output']>;
  final_carbs?: Maybe<Scalars['Float']['output']>;
  final_fats?: Maybe<Scalars['Float']['output']>;
  final_protein?: Maybe<Scalars['Float']['output']>;
  id: Scalars['UUID']['output'];
  meal_itemsCollection?: Maybe<Meal_ItemsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  nutrition_log_id?: Maybe<Scalars['UUID']['output']>;
  photo_storage_path?: Maybe<Scalars['String']['output']>;
  photo_url: Scalars['String']['output'];
  processed_at?: Maybe<Scalars['Datetime']['output']>;
  profiles?: Maybe<Profiles>;
  status?: Maybe<Scalars['String']['output']>;
  user_edited?: Maybe<Scalars['Boolean']['output']>;
  user_id: Scalars['UUID']['output'];
  user_verified?: Maybe<Scalars['Boolean']['output']>;
};


export type Meal_Photo_LogsMeal_ItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_ItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_ItemsOrderBy>>;
};

export type Meal_Photo_LogsConnection = {
  __typename: 'meal_photo_logsConnection';
  edges: Array<Meal_Photo_LogsEdge>;
  pageInfo: PageInfo;
};

export type Meal_Photo_LogsDeleteResponse = {
  __typename: 'meal_photo_logsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Photo_Logs>;
};

export type Meal_Photo_LogsEdge = {
  __typename: 'meal_photo_logsEdge';
  cursor: Scalars['String']['output'];
  node: Meal_Photo_Logs;
};

export type Meal_Photo_LogsFilter = {
  ai_model_used?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Meal_Photo_LogsFilter>>;
  confidence_score?: InputMaybe<FloatFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  error_message?: InputMaybe<StringFilter>;
  estimated_calories?: InputMaybe<IntFilter>;
  estimated_carbs?: InputMaybe<FloatFilter>;
  estimated_fats?: InputMaybe<FloatFilter>;
  estimated_protein?: InputMaybe<FloatFilter>;
  final_calories?: InputMaybe<IntFilter>;
  final_carbs?: InputMaybe<FloatFilter>;
  final_fats?: InputMaybe<FloatFilter>;
  final_protein?: InputMaybe<FloatFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Meal_Photo_LogsFilter>;
  nutrition_log_id?: InputMaybe<UuidFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Meal_Photo_LogsFilter>>;
  photo_storage_path?: InputMaybe<StringFilter>;
  photo_url?: InputMaybe<StringFilter>;
  processed_at?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StringFilter>;
  user_edited?: InputMaybe<BooleanFilter>;
  user_id?: InputMaybe<UuidFilter>;
  user_verified?: InputMaybe<BooleanFilter>;
};

export type Meal_Photo_LogsInsertInput = {
  ai_model_used?: InputMaybe<Scalars['String']['input']>;
  confidence_score?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  detected_foods?: InputMaybe<Scalars['JSON']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  estimated_calories?: InputMaybe<Scalars['Int']['input']>;
  estimated_carbs?: InputMaybe<Scalars['Float']['input']>;
  estimated_fats?: InputMaybe<Scalars['Float']['input']>;
  estimated_protein?: InputMaybe<Scalars['Float']['input']>;
  final_calories?: InputMaybe<Scalars['Int']['input']>;
  final_carbs?: InputMaybe<Scalars['Float']['input']>;
  final_fats?: InputMaybe<Scalars['Float']['input']>;
  final_protein?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  nutrition_log_id?: InputMaybe<Scalars['UUID']['input']>;
  photo_storage_path?: InputMaybe<Scalars['String']['input']>;
  photo_url?: InputMaybe<Scalars['String']['input']>;
  processed_at?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  user_edited?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  user_verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Meal_Photo_LogsInsertResponse = {
  __typename: 'meal_photo_logsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Photo_Logs>;
};

export type Meal_Photo_LogsOrderBy = {
  ai_model_used?: InputMaybe<OrderByDirection>;
  confidence_score?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  error_message?: InputMaybe<OrderByDirection>;
  estimated_calories?: InputMaybe<OrderByDirection>;
  estimated_carbs?: InputMaybe<OrderByDirection>;
  estimated_fats?: InputMaybe<OrderByDirection>;
  estimated_protein?: InputMaybe<OrderByDirection>;
  final_calories?: InputMaybe<OrderByDirection>;
  final_carbs?: InputMaybe<OrderByDirection>;
  final_fats?: InputMaybe<OrderByDirection>;
  final_protein?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  nutrition_log_id?: InputMaybe<OrderByDirection>;
  photo_storage_path?: InputMaybe<OrderByDirection>;
  photo_url?: InputMaybe<OrderByDirection>;
  processed_at?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  user_edited?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  user_verified?: InputMaybe<OrderByDirection>;
};

export type Meal_Photo_LogsUpdateInput = {
  ai_model_used?: InputMaybe<Scalars['String']['input']>;
  confidence_score?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  detected_foods?: InputMaybe<Scalars['JSON']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  estimated_calories?: InputMaybe<Scalars['Int']['input']>;
  estimated_carbs?: InputMaybe<Scalars['Float']['input']>;
  estimated_fats?: InputMaybe<Scalars['Float']['input']>;
  estimated_protein?: InputMaybe<Scalars['Float']['input']>;
  final_calories?: InputMaybe<Scalars['Int']['input']>;
  final_carbs?: InputMaybe<Scalars['Float']['input']>;
  final_fats?: InputMaybe<Scalars['Float']['input']>;
  final_protein?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  nutrition_log_id?: InputMaybe<Scalars['UUID']['input']>;
  photo_storage_path?: InputMaybe<Scalars['String']['input']>;
  photo_url?: InputMaybe<Scalars['String']['input']>;
  processed_at?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  user_edited?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  user_verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Meal_Photo_LogsUpdateResponse = {
  __typename: 'meal_photo_logsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Photo_Logs>;
};

export type Meal_Plan_Adherence = Node & {
  __typename: 'meal_plan_adherence';
  actual_calories?: Maybe<Scalars['Int']['output']>;
  actual_protein?: Maybe<Scalars['Float']['output']>;
  adherence_percentage?: Maybe<Scalars['Float']['output']>;
  ai_meal_plans?: Maybe<Ai_Meal_Plans>;
  calories_variance?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  logged_meals: Scalars['JSON']['output'];
  meal_plan_id: Scalars['UUID']['output'];
  meals_followed?: Maybe<Scalars['Int']['output']>;
  meals_total?: Maybe<Scalars['Int']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  planned_calories?: Maybe<Scalars['Int']['output']>;
  planned_meals: Scalars['JSON']['output'];
  planned_protein?: Maybe<Scalars['Float']['output']>;
  profiles?: Maybe<Profiles>;
  protein_variance?: Maybe<Scalars['Float']['output']>;
  skip_reason?: Maybe<Scalars['String']['output']>;
  tracking_date: Scalars['Date']['output'];
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Meal_Plan_AdherenceConnection = {
  __typename: 'meal_plan_adherenceConnection';
  edges: Array<Meal_Plan_AdherenceEdge>;
  pageInfo: PageInfo;
};

export type Meal_Plan_AdherenceDeleteResponse = {
  __typename: 'meal_plan_adherenceDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Plan_Adherence>;
};

export type Meal_Plan_AdherenceEdge = {
  __typename: 'meal_plan_adherenceEdge';
  cursor: Scalars['String']['output'];
  node: Meal_Plan_Adherence;
};

export type Meal_Plan_AdherenceFilter = {
  actual_calories?: InputMaybe<IntFilter>;
  actual_protein?: InputMaybe<FloatFilter>;
  adherence_percentage?: InputMaybe<FloatFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Meal_Plan_AdherenceFilter>>;
  calories_variance?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  meal_plan_id?: InputMaybe<UuidFilter>;
  meals_followed?: InputMaybe<IntFilter>;
  meals_total?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Meal_Plan_AdherenceFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Meal_Plan_AdherenceFilter>>;
  planned_calories?: InputMaybe<IntFilter>;
  planned_protein?: InputMaybe<FloatFilter>;
  protein_variance?: InputMaybe<FloatFilter>;
  skip_reason?: InputMaybe<StringFilter>;
  tracking_date?: InputMaybe<DateFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Meal_Plan_AdherenceInsertInput = {
  actual_calories?: InputMaybe<Scalars['Int']['input']>;
  actual_protein?: InputMaybe<Scalars['Float']['input']>;
  calories_variance?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  logged_meals?: InputMaybe<Scalars['JSON']['input']>;
  meal_plan_id?: InputMaybe<Scalars['UUID']['input']>;
  meals_followed?: InputMaybe<Scalars['Int']['input']>;
  meals_total?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  planned_calories?: InputMaybe<Scalars['Int']['input']>;
  planned_meals?: InputMaybe<Scalars['JSON']['input']>;
  planned_protein?: InputMaybe<Scalars['Float']['input']>;
  protein_variance?: InputMaybe<Scalars['Float']['input']>;
  skip_reason?: InputMaybe<Scalars['String']['input']>;
  tracking_date?: InputMaybe<Scalars['Date']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Meal_Plan_AdherenceInsertResponse = {
  __typename: 'meal_plan_adherenceInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Plan_Adherence>;
};

export type Meal_Plan_AdherenceOrderBy = {
  actual_calories?: InputMaybe<OrderByDirection>;
  actual_protein?: InputMaybe<OrderByDirection>;
  adherence_percentage?: InputMaybe<OrderByDirection>;
  calories_variance?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  meal_plan_id?: InputMaybe<OrderByDirection>;
  meals_followed?: InputMaybe<OrderByDirection>;
  meals_total?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  planned_calories?: InputMaybe<OrderByDirection>;
  planned_protein?: InputMaybe<OrderByDirection>;
  protein_variance?: InputMaybe<OrderByDirection>;
  skip_reason?: InputMaybe<OrderByDirection>;
  tracking_date?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Meal_Plan_AdherenceUpdateInput = {
  actual_calories?: InputMaybe<Scalars['Int']['input']>;
  actual_protein?: InputMaybe<Scalars['Float']['input']>;
  calories_variance?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  logged_meals?: InputMaybe<Scalars['JSON']['input']>;
  meal_plan_id?: InputMaybe<Scalars['UUID']['input']>;
  meals_followed?: InputMaybe<Scalars['Int']['input']>;
  meals_total?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  planned_calories?: InputMaybe<Scalars['Int']['input']>;
  planned_meals?: InputMaybe<Scalars['JSON']['input']>;
  planned_protein?: InputMaybe<Scalars['Float']['input']>;
  protein_variance?: InputMaybe<Scalars['Float']['input']>;
  skip_reason?: InputMaybe<Scalars['String']['input']>;
  tracking_date?: InputMaybe<Scalars['Date']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Meal_Plan_AdherenceUpdateResponse = {
  __typename: 'meal_plan_adherenceUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Plan_Adherence>;
};

export type Meal_Templates = Node & {
  __typename: 'meal_templates';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  foods: Scalars['JSON']['output'];
  id: Scalars['UUID']['output'];
  is_favorite?: Maybe<Scalars['Boolean']['output']>;
  last_used_at?: Maybe<Scalars['Datetime']['output']>;
  meal_type?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  total_calories?: Maybe<Scalars['Float']['output']>;
  total_carbs?: Maybe<Scalars['Float']['output']>;
  total_fats?: Maybe<Scalars['Float']['output']>;
  total_protein?: Maybe<Scalars['Float']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  use_count: Scalars['Int']['output'];
  user_id: Scalars['UUID']['output'];
};

export type Meal_TemplatesConnection = {
  __typename: 'meal_templatesConnection';
  edges: Array<Meal_TemplatesEdge>;
  pageInfo: PageInfo;
};

export type Meal_TemplatesDeleteResponse = {
  __typename: 'meal_templatesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Templates>;
};

export type Meal_TemplatesEdge = {
  __typename: 'meal_templatesEdge';
  cursor: Scalars['String']['output'];
  node: Meal_Templates;
};

export type Meal_TemplatesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Meal_TemplatesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  is_favorite?: InputMaybe<BooleanFilter>;
  last_used_at?: InputMaybe<DatetimeFilter>;
  meal_type?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Meal_TemplatesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Meal_TemplatesFilter>>;
  total_calories?: InputMaybe<FloatFilter>;
  total_carbs?: InputMaybe<FloatFilter>;
  total_fats?: InputMaybe<FloatFilter>;
  total_protein?: InputMaybe<FloatFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  use_count?: InputMaybe<IntFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Meal_TemplatesInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  foods?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['Datetime']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  total_calories?: InputMaybe<Scalars['Float']['input']>;
  total_carbs?: InputMaybe<Scalars['Float']['input']>;
  total_fats?: InputMaybe<Scalars['Float']['input']>;
  total_protein?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  use_count?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Meal_TemplatesInsertResponse = {
  __typename: 'meal_templatesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Templates>;
};

export type Meal_TemplatesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_favorite?: InputMaybe<OrderByDirection>;
  last_used_at?: InputMaybe<OrderByDirection>;
  meal_type?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  total_calories?: InputMaybe<OrderByDirection>;
  total_carbs?: InputMaybe<OrderByDirection>;
  total_fats?: InputMaybe<OrderByDirection>;
  total_protein?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  use_count?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Meal_TemplatesUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  foods?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['Datetime']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  total_calories?: InputMaybe<Scalars['Float']['input']>;
  total_carbs?: InputMaybe<Scalars['Float']['input']>;
  total_fats?: InputMaybe<Scalars['Float']['input']>;
  total_protein?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  use_count?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Meal_TemplatesUpdateResponse = {
  __typename: 'meal_templatesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Templates>;
};

export type Newsletter_Subscribers = Node & {
  __typename: 'newsletter_subscribers';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subscribed_at?: Maybe<Scalars['Datetime']['output']>;
  unsubscribed_at?: Maybe<Scalars['Datetime']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
};

export type Newsletter_SubscribersConnection = {
  __typename: 'newsletter_subscribersConnection';
  edges: Array<Newsletter_SubscribersEdge>;
  pageInfo: PageInfo;
};

export type Newsletter_SubscribersDeleteResponse = {
  __typename: 'newsletter_subscribersDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Newsletter_Subscribers>;
};

export type Newsletter_SubscribersEdge = {
  __typename: 'newsletter_subscribersEdge';
  cursor: Scalars['String']['output'];
  node: Newsletter_Subscribers;
};

export type Newsletter_SubscribersFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Newsletter_SubscribersFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Newsletter_SubscribersFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Newsletter_SubscribersFilter>>;
  source?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  subscribed_at?: InputMaybe<DatetimeFilter>;
  unsubscribed_at?: InputMaybe<DatetimeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type Newsletter_SubscribersInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subscribed_at?: InputMaybe<Scalars['Datetime']['input']>;
  unsubscribed_at?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Newsletter_SubscribersInsertResponse = {
  __typename: 'newsletter_subscribersInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Newsletter_Subscribers>;
};

export type Newsletter_SubscribersOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  email?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  subscribed_at?: InputMaybe<OrderByDirection>;
  unsubscribed_at?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type Newsletter_SubscribersUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subscribed_at?: InputMaybe<Scalars['Datetime']['input']>;
  unsubscribed_at?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type Newsletter_SubscribersUpdateResponse = {
  __typename: 'newsletter_subscribersUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Newsletter_Subscribers>;
};

export type Notifications = Node & {
  __typename: 'notifications';
  action_label?: Maybe<Scalars['String']['output']>;
  action_url?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  expires_at?: Maybe<Scalars['Datetime']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  read?: Maybe<Scalars['Boolean']['output']>;
  read_at?: Maybe<Scalars['Datetime']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  user_id: Scalars['UUID']['output'];
};

export type NotificationsConnection = {
  __typename: 'notificationsConnection';
  edges: Array<NotificationsEdge>;
  pageInfo: PageInfo;
};

export type NotificationsDeleteResponse = {
  __typename: 'notificationsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Notifications>;
};

export type NotificationsEdge = {
  __typename: 'notificationsEdge';
  cursor: Scalars['String']['output'];
  node: Notifications;
};

export type NotificationsFilter = {
  action_label?: InputMaybe<StringFilter>;
  action_url?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<NotificationsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  expires_at?: InputMaybe<DatetimeFilter>;
  icon?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  message?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<NotificationsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<NotificationsFilter>>;
  read?: InputMaybe<BooleanFilter>;
  read_at?: InputMaybe<DatetimeFilter>;
  title?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type NotificationsInsertInput = {
  action_label?: InputMaybe<Scalars['String']['input']>;
  action_url?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  read?: InputMaybe<Scalars['Boolean']['input']>;
  read_at?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type NotificationsInsertResponse = {
  __typename: 'notificationsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Notifications>;
};

export type NotificationsOrderBy = {
  action_label?: InputMaybe<OrderByDirection>;
  action_url?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  expires_at?: InputMaybe<OrderByDirection>;
  icon?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  message?: InputMaybe<OrderByDirection>;
  read?: InputMaybe<OrderByDirection>;
  read_at?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type NotificationsUpdateInput = {
  action_label?: InputMaybe<Scalars['String']['input']>;
  action_url?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  expires_at?: InputMaybe<Scalars['Datetime']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  read?: InputMaybe<Scalars['Boolean']['input']>;
  read_at?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type NotificationsUpdateResponse = {
  __typename: 'notificationsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Notifications>;
};

export type Plan_Regeneration_Usage = Node & {
  __typename: 'plan_regeneration_usage';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  meal_plan_regenerations?: Maybe<Scalars['Int']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  period_end: Scalars['Datetime']['output'];
  period_start: Scalars['Datetime']['output'];
  profiles?: Maybe<Profiles>;
  total_regenerations?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_plan_regenerations?: Maybe<Scalars['Int']['output']>;
};

export type Plan_Regeneration_UsageConnection = {
  __typename: 'plan_regeneration_usageConnection';
  edges: Array<Plan_Regeneration_UsageEdge>;
  pageInfo: PageInfo;
};

export type Plan_Regeneration_UsageDeleteResponse = {
  __typename: 'plan_regeneration_usageDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Plan_Regeneration_Usage>;
};

export type Plan_Regeneration_UsageEdge = {
  __typename: 'plan_regeneration_usageEdge';
  cursor: Scalars['String']['output'];
  node: Plan_Regeneration_Usage;
};

export type Plan_Regeneration_UsageFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Plan_Regeneration_UsageFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  meal_plan_regenerations?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Plan_Regeneration_UsageFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Plan_Regeneration_UsageFilter>>;
  period_end?: InputMaybe<DatetimeFilter>;
  period_start?: InputMaybe<DatetimeFilter>;
  total_regenerations?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  workout_plan_regenerations?: InputMaybe<IntFilter>;
};

export type Plan_Regeneration_UsageInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  meal_plan_regenerations?: InputMaybe<Scalars['Int']['input']>;
  period_end?: InputMaybe<Scalars['Datetime']['input']>;
  period_start?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_plan_regenerations?: InputMaybe<Scalars['Int']['input']>;
};

export type Plan_Regeneration_UsageInsertResponse = {
  __typename: 'plan_regeneration_usageInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Plan_Regeneration_Usage>;
};

export type Plan_Regeneration_UsageOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  meal_plan_regenerations?: InputMaybe<OrderByDirection>;
  period_end?: InputMaybe<OrderByDirection>;
  period_start?: InputMaybe<OrderByDirection>;
  total_regenerations?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  workout_plan_regenerations?: InputMaybe<OrderByDirection>;
};

export type Plan_Regeneration_UsageUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  meal_plan_regenerations?: InputMaybe<Scalars['Int']['input']>;
  period_end?: InputMaybe<Scalars['Datetime']['input']>;
  period_start?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_plan_regenerations?: InputMaybe<Scalars['Int']['input']>;
};

export type Plan_Regeneration_UsageUpdateResponse = {
  __typename: 'plan_regeneration_usageUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Plan_Regeneration_Usage>;
};

export type Profiles = Node & {
  __typename: 'profiles';
  age?: Maybe<Scalars['Int']['output']>;
  ai_meal_plans?: Maybe<Ai_Meal_Plans>;
  ai_workout_plans?: Maybe<Ai_Workout_Plans>;
  avatar_frame?: Maybe<Scalars['String']['output']>;
  avatar_url?: Maybe<Scalars['String']['output']>;
  challenge_participantsCollection?: Maybe<Challenge_ParticipantsConnection>;
  coupon_codesCollection?: Maybe<Coupon_CodesConnection>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_activity_summary?: Maybe<Daily_Activity_Summary>;
  daily_nutrition_logsCollection?: Maybe<Daily_Nutrition_LogsConnection>;
  daily_water_intakeCollection?: Maybe<Daily_Water_IntakeConnection>;
  data_exportsCollection?: Maybe<Data_ExportsConnection>;
  email: Scalars['String']['output'];
  exercise_personal_recordsCollection?: Maybe<Exercise_Personal_RecordsConnection>;
  exercise_setsCollection?: Maybe<Exercise_SetsConnection>;
  full_name?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['UUID']['output'];
  meal_itemsCollection?: Maybe<Meal_ItemsConnection>;
  meal_photo_logsCollection?: Maybe<Meal_Photo_LogsConnection>;
  meal_plan_adherenceCollection?: Maybe<Meal_Plan_AdherenceConnection>;
  meal_templatesCollection?: Maybe<Meal_TemplatesConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notificationsCollection?: Maybe<NotificationsConnection>;
  onboarding_completed?: Maybe<Scalars['Boolean']['output']>;
  onboarding_step?: Maybe<Scalars['Int']['output']>;
  plan_regeneration_usageCollection?: Maybe<Plan_Regeneration_UsageConnection>;
  quiz_resultsCollection?: Maybe<Quiz_ResultsConnection>;
  subscriptions?: Maybe<Subscriptions>;
  target_weight?: Maybe<Scalars['Float']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  usage_metricsCollection?: Maybe<Usage_MetricsConnection>;
  user_macro_targets?: Maybe<User_Macro_Targets>;
  user_redeemed_rewardsCollection?: Maybe<User_Redeemed_RewardsConnection>;
  user_rewards?: Maybe<User_Rewards>;
  user_streaksCollection?: Maybe<User_StreaksConnection>;
  user_themesCollection?: Maybe<User_ThemesConnection>;
  username?: Maybe<Scalars['String']['output']>;
  voice_meal_logsCollection?: Maybe<Voice_Meal_LogsConnection>;
  water_intake_logsCollection?: Maybe<Water_Intake_LogsConnection>;
  weekly_summaries?: Maybe<Weekly_Summaries>;
  weight?: Maybe<Scalars['Float']['output']>;
  weight_historyCollection?: Maybe<Weight_HistoryConnection>;
  workout_plan_adherenceCollection?: Maybe<Workout_Plan_AdherenceConnection>;
  workout_sessionsCollection?: Maybe<Workout_SessionsConnection>;
  workout_templatesCollection?: Maybe<Workout_TemplatesConnection>;
};


export type ProfilesChallenge_ParticipantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Challenge_ParticipantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Challenge_ParticipantsOrderBy>>;
};


export type ProfilesCoupon_CodesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Coupon_CodesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Coupon_CodesOrderBy>>;
};


export type ProfilesDaily_Nutrition_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Daily_Nutrition_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Daily_Nutrition_LogsOrderBy>>;
};


export type ProfilesDaily_Water_IntakeCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Daily_Water_IntakeFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Daily_Water_IntakeOrderBy>>;
};


export type ProfilesData_ExportsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Data_ExportsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Data_ExportsOrderBy>>;
};


export type ProfilesExercise_Personal_RecordsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exercise_Personal_RecordsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exercise_Personal_RecordsOrderBy>>;
};


export type ProfilesExercise_SetsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exercise_SetsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exercise_SetsOrderBy>>;
};


export type ProfilesMeal_ItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_ItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_ItemsOrderBy>>;
};


export type ProfilesMeal_Photo_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_Photo_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_Photo_LogsOrderBy>>;
};


export type ProfilesMeal_Plan_AdherenceCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_Plan_AdherenceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_Plan_AdherenceOrderBy>>;
};


export type ProfilesMeal_TemplatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_TemplatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_TemplatesOrderBy>>;
};


export type ProfilesNotificationsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<NotificationsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<NotificationsOrderBy>>;
};


export type ProfilesPlan_Regeneration_UsageCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Plan_Regeneration_UsageFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Plan_Regeneration_UsageOrderBy>>;
};


export type ProfilesQuiz_ResultsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Quiz_ResultsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Quiz_ResultsOrderBy>>;
};


export type ProfilesUsage_MetricsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Usage_MetricsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Usage_MetricsOrderBy>>;
};


export type ProfilesUser_Redeemed_RewardsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_Redeemed_RewardsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_Redeemed_RewardsOrderBy>>;
};


export type ProfilesUser_StreaksCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_StreaksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_StreaksOrderBy>>;
};


export type ProfilesUser_ThemesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_ThemesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_ThemesOrderBy>>;
};


export type ProfilesVoice_Meal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Voice_Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Voice_Meal_LogsOrderBy>>;
};


export type ProfilesWater_Intake_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Water_Intake_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Water_Intake_LogsOrderBy>>;
};


export type ProfilesWeight_HistoryCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Weight_HistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Weight_HistoryOrderBy>>;
};


export type ProfilesWorkout_Plan_AdherenceCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_Plan_AdherenceFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_Plan_AdherenceOrderBy>>;
};


export type ProfilesWorkout_SessionsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_SessionsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_SessionsOrderBy>>;
};


export type ProfilesWorkout_TemplatesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Workout_TemplatesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Workout_TemplatesOrderBy>>;
};

export type ProfilesConnection = {
  __typename: 'profilesConnection';
  edges: Array<ProfilesEdge>;
  pageInfo: PageInfo;
};

export type ProfilesDeleteResponse = {
  __typename: 'profilesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesEdge = {
  __typename: 'profilesEdge';
  cursor: Scalars['String']['output'];
  node: Profiles;
};

export type ProfilesFilter = {
  age?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ProfilesFilter>>;
  avatar_frame?: InputMaybe<StringFilter>;
  avatar_url?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  email?: InputMaybe<StringFilter>;
  full_name?: InputMaybe<StringFilter>;
  gender?: InputMaybe<StringFilter>;
  height?: InputMaybe<FloatFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ProfilesFilter>;
  onboarding_completed?: InputMaybe<BooleanFilter>;
  onboarding_step?: InputMaybe<IntFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ProfilesFilter>>;
  target_weight?: InputMaybe<FloatFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  username?: InputMaybe<StringFilter>;
  weight?: InputMaybe<FloatFilter>;
};

export type ProfilesInsertInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  avatar_frame?: InputMaybe<Scalars['String']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  onboarding_completed?: InputMaybe<Scalars['Boolean']['input']>;
  onboarding_step?: InputMaybe<Scalars['Int']['input']>;
  target_weight?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type ProfilesInsertResponse = {
  __typename: 'profilesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesOrderBy = {
  age?: InputMaybe<OrderByDirection>;
  avatar_frame?: InputMaybe<OrderByDirection>;
  avatar_url?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  email?: InputMaybe<OrderByDirection>;
  full_name?: InputMaybe<OrderByDirection>;
  gender?: InputMaybe<OrderByDirection>;
  height?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  onboarding_completed?: InputMaybe<OrderByDirection>;
  onboarding_step?: InputMaybe<OrderByDirection>;
  target_weight?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  username?: InputMaybe<OrderByDirection>;
  weight?: InputMaybe<OrderByDirection>;
};

export type ProfilesUpdateInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  avatar_frame?: InputMaybe<Scalars['String']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  onboarding_completed?: InputMaybe<Scalars['Boolean']['input']>;
  onboarding_step?: InputMaybe<Scalars['Int']['input']>;
  target_weight?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type ProfilesUpdateResponse = {
  __typename: 'profilesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type Quiz_Results = Node & {
  __typename: 'quiz_results';
  ai_meal_plans?: Maybe<Ai_Meal_Plans>;
  ai_workout_plans?: Maybe<Ai_Workout_Plans>;
  answers: Scalars['JSON']['output'];
  calculations?: Maybe<Scalars['JSON']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  user_id: Scalars['UUID']['output'];
};

export type Quiz_ResultsConnection = {
  __typename: 'quiz_resultsConnection';
  edges: Array<Quiz_ResultsEdge>;
  pageInfo: PageInfo;
};

export type Quiz_ResultsDeleteResponse = {
  __typename: 'quiz_resultsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Quiz_Results>;
};

export type Quiz_ResultsEdge = {
  __typename: 'quiz_resultsEdge';
  cursor: Scalars['String']['output'];
  node: Quiz_Results;
};

export type Quiz_ResultsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Quiz_ResultsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Quiz_ResultsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Quiz_ResultsFilter>>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Quiz_ResultsInsertInput = {
  answers?: InputMaybe<Scalars['JSON']['input']>;
  calculations?: InputMaybe<Scalars['JSON']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Quiz_ResultsInsertResponse = {
  __typename: 'quiz_resultsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Quiz_Results>;
};

export type Quiz_ResultsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Quiz_ResultsUpdateInput = {
  answers?: InputMaybe<Scalars['JSON']['input']>;
  calculations?: InputMaybe<Scalars['JSON']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Quiz_ResultsUpdateResponse = {
  __typename: 'quiz_resultsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Quiz_Results>;
};

export type Rewards_Catalog = Node & {
  __typename: 'rewards_catalog';
  coupon_codesCollection?: Maybe<Coupon_CodesConnection>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  points_cost: Scalars['Int']['output'];
  stock_quantity?: Maybe<Scalars['Int']['output']>;
  tier_requirement?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_redeemed_rewardsCollection?: Maybe<User_Redeemed_RewardsConnection>;
  value?: Maybe<Scalars['String']['output']>;
};


export type Rewards_CatalogCoupon_CodesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Coupon_CodesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Coupon_CodesOrderBy>>;
};


export type Rewards_CatalogUser_Redeemed_RewardsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_Redeemed_RewardsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_Redeemed_RewardsOrderBy>>;
};

export type Rewards_CatalogConnection = {
  __typename: 'rewards_catalogConnection';
  edges: Array<Rewards_CatalogEdge>;
  pageInfo: PageInfo;
};

export type Rewards_CatalogDeleteResponse = {
  __typename: 'rewards_catalogDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Rewards_Catalog>;
};

export type Rewards_CatalogEdge = {
  __typename: 'rewards_catalogEdge';
  cursor: Scalars['String']['output'];
  node: Rewards_Catalog;
};

export type Rewards_CatalogFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Rewards_CatalogFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  image_url?: InputMaybe<StringFilter>;
  is_active?: InputMaybe<BooleanFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Rewards_CatalogFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Rewards_CatalogFilter>>;
  points_cost?: InputMaybe<IntFilter>;
  stock_quantity?: InputMaybe<IntFilter>;
  tier_requirement?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  value?: InputMaybe<StringFilter>;
};

export type Rewards_CatalogInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  points_cost?: InputMaybe<Scalars['Int']['input']>;
  stock_quantity?: InputMaybe<Scalars['Int']['input']>;
  tier_requirement?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Rewards_CatalogInsertResponse = {
  __typename: 'rewards_catalogInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Rewards_Catalog>;
};

export type Rewards_CatalogOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  image_url?: InputMaybe<OrderByDirection>;
  is_active?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  points_cost?: InputMaybe<OrderByDirection>;
  stock_quantity?: InputMaybe<OrderByDirection>;
  tier_requirement?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  value?: InputMaybe<OrderByDirection>;
};

export type Rewards_CatalogUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  points_cost?: InputMaybe<Scalars['Int']['input']>;
  stock_quantity?: InputMaybe<Scalars['Int']['input']>;
  tier_requirement?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Rewards_CatalogUpdateResponse = {
  __typename: 'rewards_catalogUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Rewards_Catalog>;
};

export type Subscription_Tiers = Node & {
  __typename: 'subscription_tiers';
  ai_generations_per_month: Scalars['Int']['output'];
  can_access_ai_photo_analysis?: Maybe<Scalars['Boolean']['output']>;
  can_access_barcode_scanner?: Maybe<Scalars['Boolean']['output']>;
  can_access_social_features?: Maybe<Scalars['Boolean']['output']>;
  can_unlock_themes?: Maybe<Scalars['Boolean']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  features?: Maybe<Scalars['JSON']['output']>;
  meal_plans_storage_limit?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  price_monthly_cents?: Maybe<Scalars['Int']['output']>;
  price_yearly_cents?: Maybe<Scalars['Int']['output']>;
  priority_support?: Maybe<Scalars['Boolean']['output']>;
  tier: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  workout_plans_storage_limit?: Maybe<Scalars['Int']['output']>;
};

export type Subscription_TiersConnection = {
  __typename: 'subscription_tiersConnection';
  edges: Array<Subscription_TiersEdge>;
  pageInfo: PageInfo;
};

export type Subscription_TiersDeleteResponse = {
  __typename: 'subscription_tiersDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Subscription_Tiers>;
};

export type Subscription_TiersEdge = {
  __typename: 'subscription_tiersEdge';
  cursor: Scalars['String']['output'];
  node: Subscription_Tiers;
};

export type Subscription_TiersFilter = {
  ai_generations_per_month?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Subscription_TiersFilter>>;
  can_access_ai_photo_analysis?: InputMaybe<BooleanFilter>;
  can_access_barcode_scanner?: InputMaybe<BooleanFilter>;
  can_access_social_features?: InputMaybe<BooleanFilter>;
  can_unlock_themes?: InputMaybe<BooleanFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  meal_plans_storage_limit?: InputMaybe<IntFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Subscription_TiersFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Subscription_TiersFilter>>;
  price_monthly_cents?: InputMaybe<IntFilter>;
  price_yearly_cents?: InputMaybe<IntFilter>;
  priority_support?: InputMaybe<BooleanFilter>;
  tier?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  workout_plans_storage_limit?: InputMaybe<IntFilter>;
};

export type Subscription_TiersInsertInput = {
  ai_generations_per_month?: InputMaybe<Scalars['Int']['input']>;
  can_access_ai_photo_analysis?: InputMaybe<Scalars['Boolean']['input']>;
  can_access_barcode_scanner?: InputMaybe<Scalars['Boolean']['input']>;
  can_access_social_features?: InputMaybe<Scalars['Boolean']['input']>;
  can_unlock_themes?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  features?: InputMaybe<Scalars['JSON']['input']>;
  meal_plans_storage_limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price_monthly_cents?: InputMaybe<Scalars['Int']['input']>;
  price_yearly_cents?: InputMaybe<Scalars['Int']['input']>;
  priority_support?: InputMaybe<Scalars['Boolean']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  workout_plans_storage_limit?: InputMaybe<Scalars['Int']['input']>;
};

export type Subscription_TiersInsertResponse = {
  __typename: 'subscription_tiersInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Subscription_Tiers>;
};

export type Subscription_TiersOrderBy = {
  ai_generations_per_month?: InputMaybe<OrderByDirection>;
  can_access_ai_photo_analysis?: InputMaybe<OrderByDirection>;
  can_access_barcode_scanner?: InputMaybe<OrderByDirection>;
  can_access_social_features?: InputMaybe<OrderByDirection>;
  can_unlock_themes?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  meal_plans_storage_limit?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  price_monthly_cents?: InputMaybe<OrderByDirection>;
  price_yearly_cents?: InputMaybe<OrderByDirection>;
  priority_support?: InputMaybe<OrderByDirection>;
  tier?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  workout_plans_storage_limit?: InputMaybe<OrderByDirection>;
};

export type Subscription_TiersUpdateInput = {
  ai_generations_per_month?: InputMaybe<Scalars['Int']['input']>;
  can_access_ai_photo_analysis?: InputMaybe<Scalars['Boolean']['input']>;
  can_access_barcode_scanner?: InputMaybe<Scalars['Boolean']['input']>;
  can_access_social_features?: InputMaybe<Scalars['Boolean']['input']>;
  can_unlock_themes?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  features?: InputMaybe<Scalars['JSON']['input']>;
  meal_plans_storage_limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price_monthly_cents?: InputMaybe<Scalars['Int']['input']>;
  price_yearly_cents?: InputMaybe<Scalars['Int']['input']>;
  priority_support?: InputMaybe<Scalars['Boolean']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  workout_plans_storage_limit?: InputMaybe<Scalars['Int']['input']>;
};

export type Subscription_TiersUpdateResponse = {
  __typename: 'subscription_tiersUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Subscription_Tiers>;
};

export type Subscriptions = Node & {
  __typename: 'subscriptions';
  cancel_at_period_end?: Maybe<Scalars['Boolean']['output']>;
  canceled_at?: Maybe<Scalars['Datetime']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  current_period_end?: Maybe<Scalars['Datetime']['output']>;
  current_period_start?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  status: Scalars['String']['output'];
  stripe_customer_id?: Maybe<Scalars['String']['output']>;
  stripe_price_id?: Maybe<Scalars['String']['output']>;
  stripe_subscription_id?: Maybe<Scalars['String']['output']>;
  tier: Scalars['String']['output'];
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

export type SubscriptionsDeleteResponse = {
  __typename: 'subscriptionsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Subscriptions>;
};

export type SubscriptionsEdge = {
  __typename: 'subscriptionsEdge';
  cursor: Scalars['String']['output'];
  node: Subscriptions;
};

export type SubscriptionsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<SubscriptionsFilter>>;
  cancel_at_period_end?: InputMaybe<BooleanFilter>;
  canceled_at?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  current_period_end?: InputMaybe<DatetimeFilter>;
  current_period_start?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<SubscriptionsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<SubscriptionsFilter>>;
  status?: InputMaybe<StringFilter>;
  stripe_customer_id?: InputMaybe<StringFilter>;
  stripe_price_id?: InputMaybe<StringFilter>;
  stripe_subscription_id?: InputMaybe<StringFilter>;
  tier?: InputMaybe<StringFilter>;
  trial_end?: InputMaybe<DatetimeFilter>;
  trial_start?: InputMaybe<DatetimeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type SubscriptionsInsertInput = {
  cancel_at_period_end?: InputMaybe<Scalars['Boolean']['input']>;
  canceled_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  current_period_end?: InputMaybe<Scalars['Datetime']['input']>;
  current_period_start?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  stripe_customer_id?: InputMaybe<Scalars['String']['input']>;
  stripe_price_id?: InputMaybe<Scalars['String']['input']>;
  stripe_subscription_id?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
  trial_end?: InputMaybe<Scalars['Datetime']['input']>;
  trial_start?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type SubscriptionsInsertResponse = {
  __typename: 'subscriptionsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Subscriptions>;
};

export type SubscriptionsOrderBy = {
  cancel_at_period_end?: InputMaybe<OrderByDirection>;
  canceled_at?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  current_period_end?: InputMaybe<OrderByDirection>;
  current_period_start?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  stripe_customer_id?: InputMaybe<OrderByDirection>;
  stripe_price_id?: InputMaybe<OrderByDirection>;
  stripe_subscription_id?: InputMaybe<OrderByDirection>;
  tier?: InputMaybe<OrderByDirection>;
  trial_end?: InputMaybe<OrderByDirection>;
  trial_start?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type SubscriptionsUpdateInput = {
  cancel_at_period_end?: InputMaybe<Scalars['Boolean']['input']>;
  canceled_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  current_period_end?: InputMaybe<Scalars['Datetime']['input']>;
  current_period_start?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  stripe_customer_id?: InputMaybe<Scalars['String']['input']>;
  stripe_price_id?: InputMaybe<Scalars['String']['input']>;
  stripe_subscription_id?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
  trial_end?: InputMaybe<Scalars['Datetime']['input']>;
  trial_start?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type SubscriptionsUpdateResponse = {
  __typename: 'subscriptionsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Subscriptions>;
};

export type Tier_Unlock_Events = Node & {
  __typename: 'tier_unlock_events';
  completeness_percentage: Scalars['Float']['output'];
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  meal_plan_regenerated?: Maybe<Scalars['Boolean']['output']>;
  new_tier: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  old_tier: Scalars['String']['output'];
  regeneration_accepted_at?: Maybe<Scalars['Datetime']['output']>;
  regeneration_dismissed_at?: Maybe<Scalars['Datetime']['output']>;
  regeneration_offered_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_plan_regenerated?: Maybe<Scalars['Boolean']['output']>;
};

export type Tier_Unlock_EventsConnection = {
  __typename: 'tier_unlock_eventsConnection';
  edges: Array<Tier_Unlock_EventsEdge>;
  pageInfo: PageInfo;
};

export type Tier_Unlock_EventsDeleteResponse = {
  __typename: 'tier_unlock_eventsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Tier_Unlock_Events>;
};

export type Tier_Unlock_EventsEdge = {
  __typename: 'tier_unlock_eventsEdge';
  cursor: Scalars['String']['output'];
  node: Tier_Unlock_Events;
};

export type Tier_Unlock_EventsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Tier_Unlock_EventsFilter>>;
  completeness_percentage?: InputMaybe<FloatFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  meal_plan_regenerated?: InputMaybe<BooleanFilter>;
  new_tier?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Tier_Unlock_EventsFilter>;
  old_tier?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Tier_Unlock_EventsFilter>>;
  regeneration_accepted_at?: InputMaybe<DatetimeFilter>;
  regeneration_dismissed_at?: InputMaybe<DatetimeFilter>;
  regeneration_offered_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  workout_plan_regenerated?: InputMaybe<BooleanFilter>;
};

export type Tier_Unlock_EventsInsertInput = {
  completeness_percentage?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  meal_plan_regenerated?: InputMaybe<Scalars['Boolean']['input']>;
  new_tier?: InputMaybe<Scalars['String']['input']>;
  old_tier?: InputMaybe<Scalars['String']['input']>;
  regeneration_accepted_at?: InputMaybe<Scalars['Datetime']['input']>;
  regeneration_dismissed_at?: InputMaybe<Scalars['Datetime']['input']>;
  regeneration_offered_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_plan_regenerated?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Tier_Unlock_EventsInsertResponse = {
  __typename: 'tier_unlock_eventsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Tier_Unlock_Events>;
};

export type Tier_Unlock_EventsOrderBy = {
  completeness_percentage?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  meal_plan_regenerated?: InputMaybe<OrderByDirection>;
  new_tier?: InputMaybe<OrderByDirection>;
  old_tier?: InputMaybe<OrderByDirection>;
  regeneration_accepted_at?: InputMaybe<OrderByDirection>;
  regeneration_dismissed_at?: InputMaybe<OrderByDirection>;
  regeneration_offered_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  workout_plan_regenerated?: InputMaybe<OrderByDirection>;
};

export type Tier_Unlock_EventsUpdateInput = {
  completeness_percentage?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  meal_plan_regenerated?: InputMaybe<Scalars['Boolean']['input']>;
  new_tier?: InputMaybe<Scalars['String']['input']>;
  old_tier?: InputMaybe<Scalars['String']['input']>;
  regeneration_accepted_at?: InputMaybe<Scalars['Datetime']['input']>;
  regeneration_dismissed_at?: InputMaybe<Scalars['Datetime']['input']>;
  regeneration_offered_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_plan_regenerated?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Tier_Unlock_EventsUpdateResponse = {
  __typename: 'tier_unlock_eventsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Tier_Unlock_Events>;
};

export type Usage_Metrics = Node & {
  __typename: 'usage_metrics';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  feature: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  period_end: Scalars['Datetime']['output'];
  period_start: Scalars['Datetime']['output'];
  profiles?: Maybe<Profiles>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  usage_count?: Maybe<Scalars['Int']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type Usage_MetricsConnection = {
  __typename: 'usage_metricsConnection';
  edges: Array<Usage_MetricsEdge>;
  pageInfo: PageInfo;
};

export type Usage_MetricsDeleteResponse = {
  __typename: 'usage_metricsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Usage_Metrics>;
};

export type Usage_MetricsEdge = {
  __typename: 'usage_metricsEdge';
  cursor: Scalars['String']['output'];
  node: Usage_Metrics;
};

export type Usage_MetricsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Usage_MetricsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  feature?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Usage_MetricsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Usage_MetricsFilter>>;
  period_end?: InputMaybe<DatetimeFilter>;
  period_start?: InputMaybe<DatetimeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  usage_count?: InputMaybe<IntFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Usage_MetricsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  feature?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  period_end?: InputMaybe<Scalars['Datetime']['input']>;
  period_start?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  usage_count?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Usage_MetricsInsertResponse = {
  __typename: 'usage_metricsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Usage_Metrics>;
};

export type Usage_MetricsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  feature?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  period_end?: InputMaybe<OrderByDirection>;
  period_start?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  usage_count?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Usage_MetricsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  feature?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  period_end?: InputMaybe<Scalars['Datetime']['input']>;
  period_start?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  usage_count?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Usage_MetricsUpdateResponse = {
  __typename: 'usage_metricsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Usage_Metrics>;
};

export type User_Macro_Targets = Node & {
  __typename: 'user_macro_targets';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_calories: Scalars['Int']['output'];
  daily_carbs_g: Scalars['Float']['output'];
  daily_fats_g: Scalars['Float']['output'];
  daily_protein_g: Scalars['Float']['output'];
  daily_water_ml?: Maybe<Scalars['Int']['output']>;
  effective_date: Scalars['Date']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  profiles?: Maybe<Profiles>;
  source?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type User_Macro_TargetsConnection = {
  __typename: 'user_macro_targetsConnection';
  edges: Array<User_Macro_TargetsEdge>;
  pageInfo: PageInfo;
};

export type User_Macro_TargetsDeleteResponse = {
  __typename: 'user_macro_targetsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Macro_Targets>;
};

export type User_Macro_TargetsEdge = {
  __typename: 'user_macro_targetsEdge';
  cursor: Scalars['String']['output'];
  node: User_Macro_Targets;
};

export type User_Macro_TargetsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_Macro_TargetsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  daily_calories?: InputMaybe<IntFilter>;
  daily_carbs_g?: InputMaybe<FloatFilter>;
  daily_fats_g?: InputMaybe<FloatFilter>;
  daily_protein_g?: InputMaybe<FloatFilter>;
  daily_water_ml?: InputMaybe<IntFilter>;
  effective_date?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_Macro_TargetsFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_Macro_TargetsFilter>>;
  source?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_Macro_TargetsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  daily_calories?: InputMaybe<Scalars['Int']['input']>;
  daily_carbs_g?: InputMaybe<Scalars['Float']['input']>;
  daily_fats_g?: InputMaybe<Scalars['Float']['input']>;
  daily_protein_g?: InputMaybe<Scalars['Float']['input']>;
  daily_water_ml?: InputMaybe<Scalars['Int']['input']>;
  effective_date?: InputMaybe<Scalars['Date']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_Macro_TargetsInsertResponse = {
  __typename: 'user_macro_targetsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Macro_Targets>;
};

export type User_Macro_TargetsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  daily_calories?: InputMaybe<OrderByDirection>;
  daily_carbs_g?: InputMaybe<OrderByDirection>;
  daily_fats_g?: InputMaybe<OrderByDirection>;
  daily_protein_g?: InputMaybe<OrderByDirection>;
  daily_water_ml?: InputMaybe<OrderByDirection>;
  effective_date?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_Macro_TargetsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  daily_calories?: InputMaybe<Scalars['Int']['input']>;
  daily_carbs_g?: InputMaybe<Scalars['Float']['input']>;
  daily_fats_g?: InputMaybe<Scalars['Float']['input']>;
  daily_protein_g?: InputMaybe<Scalars['Float']['input']>;
  daily_water_ml?: InputMaybe<Scalars['Int']['input']>;
  effective_date?: InputMaybe<Scalars['Date']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_Macro_TargetsUpdateResponse = {
  __typename: 'user_macro_targetsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Macro_Targets>;
};

export type User_Profile_Extended = Node & {
  __typename: 'user_profile_extended';
  completeness_percentage?: Maybe<Scalars['Float']['output']>;
  cooking_skill?: Maybe<Scalars['String']['output']>;
  cooking_time?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  current_tier?: Maybe<Scalars['String']['output']>;
  dietary_restrictions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  disliked_foods?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  equipment_available?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  fitness_experience?: Maybe<Scalars['String']['output']>;
  food_allergies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  grocery_budget?: Maybe<Scalars['String']['output']>;
  gym_access?: Maybe<Scalars['Boolean']['output']>;
  health_conditions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  injuries_limitations?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  meal_prep_preference?: Maybe<Scalars['String']['output']>;
  meals_per_day?: Maybe<Scalars['Int']['output']>;
  medications?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  sleep_quality?: Maybe<Scalars['Int']['output']>;
  stress_level?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_location_preference?: Maybe<Scalars['String']['output']>;
};

export type User_Profile_ExtendedConnection = {
  __typename: 'user_profile_extendedConnection';
  edges: Array<User_Profile_ExtendedEdge>;
  pageInfo: PageInfo;
};

export type User_Profile_ExtendedDeleteResponse = {
  __typename: 'user_profile_extendedDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Profile_Extended>;
};

export type User_Profile_ExtendedEdge = {
  __typename: 'user_profile_extendedEdge';
  cursor: Scalars['String']['output'];
  node: User_Profile_Extended;
};

export type User_Profile_ExtendedFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_Profile_ExtendedFilter>>;
  completeness_percentage?: InputMaybe<FloatFilter>;
  cooking_skill?: InputMaybe<StringFilter>;
  cooking_time?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  current_tier?: InputMaybe<StringFilter>;
  dietary_restrictions?: InputMaybe<StringListFilter>;
  disliked_foods?: InputMaybe<StringListFilter>;
  equipment_available?: InputMaybe<StringListFilter>;
  fitness_experience?: InputMaybe<StringFilter>;
  food_allergies?: InputMaybe<StringListFilter>;
  grocery_budget?: InputMaybe<StringFilter>;
  gym_access?: InputMaybe<BooleanFilter>;
  health_conditions?: InputMaybe<StringListFilter>;
  injuries_limitations?: InputMaybe<StringListFilter>;
  meal_prep_preference?: InputMaybe<StringFilter>;
  meals_per_day?: InputMaybe<IntFilter>;
  medications?: InputMaybe<StringListFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_Profile_ExtendedFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_Profile_ExtendedFilter>>;
  sleep_quality?: InputMaybe<IntFilter>;
  stress_level?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  workout_location_preference?: InputMaybe<StringFilter>;
};

export type User_Profile_ExtendedInsertInput = {
  completeness_percentage?: InputMaybe<Scalars['Float']['input']>;
  cooking_skill?: InputMaybe<Scalars['String']['input']>;
  cooking_time?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  current_tier?: InputMaybe<Scalars['String']['input']>;
  dietary_restrictions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  disliked_foods?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  equipment_available?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fitness_experience?: InputMaybe<Scalars['String']['input']>;
  food_allergies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  grocery_budget?: InputMaybe<Scalars['String']['input']>;
  gym_access?: InputMaybe<Scalars['Boolean']['input']>;
  health_conditions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  injuries_limitations?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  meal_prep_preference?: InputMaybe<Scalars['String']['input']>;
  meals_per_day?: InputMaybe<Scalars['Int']['input']>;
  medications?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sleep_quality?: InputMaybe<Scalars['Int']['input']>;
  stress_level?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_location_preference?: InputMaybe<Scalars['String']['input']>;
};

export type User_Profile_ExtendedInsertResponse = {
  __typename: 'user_profile_extendedInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Profile_Extended>;
};

export type User_Profile_ExtendedOrderBy = {
  completeness_percentage?: InputMaybe<OrderByDirection>;
  cooking_skill?: InputMaybe<OrderByDirection>;
  cooking_time?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  current_tier?: InputMaybe<OrderByDirection>;
  fitness_experience?: InputMaybe<OrderByDirection>;
  grocery_budget?: InputMaybe<OrderByDirection>;
  gym_access?: InputMaybe<OrderByDirection>;
  meal_prep_preference?: InputMaybe<OrderByDirection>;
  meals_per_day?: InputMaybe<OrderByDirection>;
  sleep_quality?: InputMaybe<OrderByDirection>;
  stress_level?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  workout_location_preference?: InputMaybe<OrderByDirection>;
};

export type User_Profile_ExtendedUpdateInput = {
  completeness_percentage?: InputMaybe<Scalars['Float']['input']>;
  cooking_skill?: InputMaybe<Scalars['String']['input']>;
  cooking_time?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  current_tier?: InputMaybe<Scalars['String']['input']>;
  dietary_restrictions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  disliked_foods?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  equipment_available?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fitness_experience?: InputMaybe<Scalars['String']['input']>;
  food_allergies?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  grocery_budget?: InputMaybe<Scalars['String']['input']>;
  gym_access?: InputMaybe<Scalars['Boolean']['input']>;
  health_conditions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  injuries_limitations?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  meal_prep_preference?: InputMaybe<Scalars['String']['input']>;
  meals_per_day?: InputMaybe<Scalars['Int']['input']>;
  medications?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sleep_quality?: InputMaybe<Scalars['Int']['input']>;
  stress_level?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_location_preference?: InputMaybe<Scalars['String']['input']>;
};

export type User_Profile_ExtendedUpdateResponse = {
  __typename: 'user_profile_extendedUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Profile_Extended>;
};

export type User_Redeemed_Rewards = Node & {
  __typename: 'user_redeemed_rewards';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  points_spent: Scalars['Int']['output'];
  profiles?: Maybe<Profiles>;
  redeemed_at?: Maybe<Scalars['Datetime']['output']>;
  reward_id: Scalars['UUID']['output'];
  reward_value: Scalars['String']['output'];
  rewards_catalog?: Maybe<Rewards_Catalog>;
  type: Scalars['String']['output'];
  used?: Maybe<Scalars['Boolean']['output']>;
  used_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type User_Redeemed_RewardsConnection = {
  __typename: 'user_redeemed_rewardsConnection';
  edges: Array<User_Redeemed_RewardsEdge>;
  pageInfo: PageInfo;
};

export type User_Redeemed_RewardsDeleteResponse = {
  __typename: 'user_redeemed_rewardsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Redeemed_Rewards>;
};

export type User_Redeemed_RewardsEdge = {
  __typename: 'user_redeemed_rewardsEdge';
  cursor: Scalars['String']['output'];
  node: User_Redeemed_Rewards;
};

export type User_Redeemed_RewardsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_Redeemed_RewardsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_Redeemed_RewardsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_Redeemed_RewardsFilter>>;
  points_spent?: InputMaybe<IntFilter>;
  redeemed_at?: InputMaybe<DatetimeFilter>;
  reward_id?: InputMaybe<UuidFilter>;
  reward_value?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  used?: InputMaybe<BooleanFilter>;
  used_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_Redeemed_RewardsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  points_spent?: InputMaybe<Scalars['Int']['input']>;
  redeemed_at?: InputMaybe<Scalars['Datetime']['input']>;
  reward_id?: InputMaybe<Scalars['UUID']['input']>;
  reward_value?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  used?: InputMaybe<Scalars['Boolean']['input']>;
  used_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_Redeemed_RewardsInsertResponse = {
  __typename: 'user_redeemed_rewardsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Redeemed_Rewards>;
};

export type User_Redeemed_RewardsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  points_spent?: InputMaybe<OrderByDirection>;
  redeemed_at?: InputMaybe<OrderByDirection>;
  reward_id?: InputMaybe<OrderByDirection>;
  reward_value?: InputMaybe<OrderByDirection>;
  type?: InputMaybe<OrderByDirection>;
  used?: InputMaybe<OrderByDirection>;
  used_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_Redeemed_RewardsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  points_spent?: InputMaybe<Scalars['Int']['input']>;
  redeemed_at?: InputMaybe<Scalars['Datetime']['input']>;
  reward_id?: InputMaybe<Scalars['UUID']['input']>;
  reward_value?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  used?: InputMaybe<Scalars['Boolean']['input']>;
  used_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_Redeemed_RewardsUpdateResponse = {
  __typename: 'user_redeemed_rewardsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Redeemed_Rewards>;
};

export type User_Rewards = Node & {
  __typename: 'user_rewards';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  lifetime_points?: Maybe<Scalars['Int']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  points?: Maybe<Scalars['Int']['output']>;
  profiles?: Maybe<Profiles>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type User_RewardsConnection = {
  __typename: 'user_rewardsConnection';
  edges: Array<User_RewardsEdge>;
  pageInfo: PageInfo;
};

export type User_RewardsDeleteResponse = {
  __typename: 'user_rewardsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Rewards>;
};

export type User_RewardsEdge = {
  __typename: 'user_rewardsEdge';
  cursor: Scalars['String']['output'];
  node: User_Rewards;
};

export type User_RewardsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_RewardsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  lifetime_points?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_RewardsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_RewardsFilter>>;
  points?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_RewardsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  lifetime_points?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_RewardsInsertResponse = {
  __typename: 'user_rewardsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Rewards>;
};

export type User_RewardsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  lifetime_points?: InputMaybe<OrderByDirection>;
  points?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_RewardsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  lifetime_points?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_RewardsUpdateResponse = {
  __typename: 'user_rewardsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Rewards>;
};

export type User_Streaks = Node & {
  __typename: 'user_streaks';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  current_streak?: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  last_logged_date?: Maybe<Scalars['Date']['output']>;
  longest_streak?: Maybe<Scalars['Int']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  streak_start_date?: Maybe<Scalars['Date']['output']>;
  streak_type: Scalars['String']['output'];
  total_days_logged?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type User_StreaksConnection = {
  __typename: 'user_streaksConnection';
  edges: Array<User_StreaksEdge>;
  pageInfo: PageInfo;
};

export type User_StreaksDeleteResponse = {
  __typename: 'user_streaksDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Streaks>;
};

export type User_StreaksEdge = {
  __typename: 'user_streaksEdge';
  cursor: Scalars['String']['output'];
  node: User_Streaks;
};

export type User_StreaksFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_StreaksFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  current_streak?: InputMaybe<IntFilter>;
  id?: InputMaybe<UuidFilter>;
  last_logged_date?: InputMaybe<DateFilter>;
  longest_streak?: InputMaybe<IntFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_StreaksFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_StreaksFilter>>;
  streak_start_date?: InputMaybe<DateFilter>;
  streak_type?: InputMaybe<StringFilter>;
  total_days_logged?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_StreaksInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  current_streak?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  last_logged_date?: InputMaybe<Scalars['Date']['input']>;
  longest_streak?: InputMaybe<Scalars['Int']['input']>;
  streak_start_date?: InputMaybe<Scalars['Date']['input']>;
  streak_type?: InputMaybe<Scalars['String']['input']>;
  total_days_logged?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_StreaksInsertResponse = {
  __typename: 'user_streaksInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Streaks>;
};

export type User_StreaksOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  current_streak?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  last_logged_date?: InputMaybe<OrderByDirection>;
  longest_streak?: InputMaybe<OrderByDirection>;
  streak_start_date?: InputMaybe<OrderByDirection>;
  streak_type?: InputMaybe<OrderByDirection>;
  total_days_logged?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_StreaksUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  current_streak?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  last_logged_date?: InputMaybe<Scalars['Date']['input']>;
  longest_streak?: InputMaybe<Scalars['Int']['input']>;
  streak_start_date?: InputMaybe<Scalars['Date']['input']>;
  streak_type?: InputMaybe<Scalars['String']['input']>;
  total_days_logged?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_StreaksUpdateResponse = {
  __typename: 'user_streaksUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Streaks>;
};

export type User_Themes = Node & {
  __typename: 'user_themes';
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  theme_id: Scalars['String']['output'];
  unlocked_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
};

export type User_ThemesConnection = {
  __typename: 'user_themesConnection';
  edges: Array<User_ThemesEdge>;
  pageInfo: PageInfo;
};

export type User_ThemesDeleteResponse = {
  __typename: 'user_themesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Themes>;
};

export type User_ThemesEdge = {
  __typename: 'user_themesEdge';
  cursor: Scalars['String']['output'];
  node: User_Themes;
};

export type User_ThemesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_ThemesFilter>>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_ThemesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_ThemesFilter>>;
  theme_id?: InputMaybe<StringFilter>;
  unlocked_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_ThemesInsertInput = {
  theme_id?: InputMaybe<Scalars['String']['input']>;
  unlocked_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_ThemesInsertResponse = {
  __typename: 'user_themesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Themes>;
};

export type User_ThemesOrderBy = {
  theme_id?: InputMaybe<OrderByDirection>;
  unlocked_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_ThemesUpdateInput = {
  theme_id?: InputMaybe<Scalars['String']['input']>;
  unlocked_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_ThemesUpdateResponse = {
  __typename: 'user_themesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Themes>;
};

export type Voice_Meal_Logs = Node & {
  __typename: 'voice_meal_logs';
  audio_duration_seconds?: Maybe<Scalars['Int']['output']>;
  audio_storage_path?: Maybe<Scalars['String']['output']>;
  audio_url?: Maybe<Scalars['String']['output']>;
  confidence_score?: Maybe<Scalars['Float']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  daily_nutrition_logs?: Maybe<Daily_Nutrition_Logs>;
  error_message?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  meal_itemsCollection?: Maybe<Meal_ItemsConnection>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  nutrition_log_id?: Maybe<Scalars['UUID']['output']>;
  parsed_foods?: Maybe<Scalars['JSON']['output']>;
  parsed_meal_type?: Maybe<Scalars['String']['output']>;
  processed_at?: Maybe<Scalars['Datetime']['output']>;
  profiles?: Maybe<Profiles>;
  status?: Maybe<Scalars['String']['output']>;
  transcription?: Maybe<Scalars['String']['output']>;
  transcription_service?: Maybe<Scalars['String']['output']>;
  user_edited?: Maybe<Scalars['Boolean']['output']>;
  user_id: Scalars['UUID']['output'];
  user_verified?: Maybe<Scalars['Boolean']['output']>;
};


export type Voice_Meal_LogsMeal_ItemsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_ItemsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_ItemsOrderBy>>;
};

export type Voice_Meal_LogsConnection = {
  __typename: 'voice_meal_logsConnection';
  edges: Array<Voice_Meal_LogsEdge>;
  pageInfo: PageInfo;
};

export type Voice_Meal_LogsDeleteResponse = {
  __typename: 'voice_meal_logsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Voice_Meal_Logs>;
};

export type Voice_Meal_LogsEdge = {
  __typename: 'voice_meal_logsEdge';
  cursor: Scalars['String']['output'];
  node: Voice_Meal_Logs;
};

export type Voice_Meal_LogsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Voice_Meal_LogsFilter>>;
  audio_duration_seconds?: InputMaybe<IntFilter>;
  audio_storage_path?: InputMaybe<StringFilter>;
  audio_url?: InputMaybe<StringFilter>;
  confidence_score?: InputMaybe<FloatFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  error_message?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Voice_Meal_LogsFilter>;
  nutrition_log_id?: InputMaybe<UuidFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Voice_Meal_LogsFilter>>;
  parsed_meal_type?: InputMaybe<StringFilter>;
  processed_at?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StringFilter>;
  transcription?: InputMaybe<StringFilter>;
  transcription_service?: InputMaybe<StringFilter>;
  user_edited?: InputMaybe<BooleanFilter>;
  user_id?: InputMaybe<UuidFilter>;
  user_verified?: InputMaybe<BooleanFilter>;
};

export type Voice_Meal_LogsInsertInput = {
  audio_duration_seconds?: InputMaybe<Scalars['Int']['input']>;
  audio_storage_path?: InputMaybe<Scalars['String']['input']>;
  audio_url?: InputMaybe<Scalars['String']['input']>;
  confidence_score?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  nutrition_log_id?: InputMaybe<Scalars['UUID']['input']>;
  parsed_foods?: InputMaybe<Scalars['JSON']['input']>;
  parsed_meal_type?: InputMaybe<Scalars['String']['input']>;
  processed_at?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transcription?: InputMaybe<Scalars['String']['input']>;
  transcription_service?: InputMaybe<Scalars['String']['input']>;
  user_edited?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  user_verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Voice_Meal_LogsInsertResponse = {
  __typename: 'voice_meal_logsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Voice_Meal_Logs>;
};

export type Voice_Meal_LogsOrderBy = {
  audio_duration_seconds?: InputMaybe<OrderByDirection>;
  audio_storage_path?: InputMaybe<OrderByDirection>;
  audio_url?: InputMaybe<OrderByDirection>;
  confidence_score?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  error_message?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  nutrition_log_id?: InputMaybe<OrderByDirection>;
  parsed_meal_type?: InputMaybe<OrderByDirection>;
  processed_at?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  transcription?: InputMaybe<OrderByDirection>;
  transcription_service?: InputMaybe<OrderByDirection>;
  user_edited?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  user_verified?: InputMaybe<OrderByDirection>;
};

export type Voice_Meal_LogsUpdateInput = {
  audio_duration_seconds?: InputMaybe<Scalars['Int']['input']>;
  audio_storage_path?: InputMaybe<Scalars['String']['input']>;
  audio_url?: InputMaybe<Scalars['String']['input']>;
  confidence_score?: InputMaybe<Scalars['Float']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  error_message?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  nutrition_log_id?: InputMaybe<Scalars['UUID']['input']>;
  parsed_foods?: InputMaybe<Scalars['JSON']['input']>;
  parsed_meal_type?: InputMaybe<Scalars['String']['input']>;
  processed_at?: InputMaybe<Scalars['Datetime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transcription?: InputMaybe<Scalars['String']['input']>;
  transcription_service?: InputMaybe<Scalars['String']['input']>;
  user_edited?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  user_verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Voice_Meal_LogsUpdateResponse = {
  __typename: 'voice_meal_logsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Voice_Meal_Logs>;
};

export type Water_Intake_Logs = Node & {
  __typename: 'water_intake_logs';
  amount_ml: Scalars['Int']['output'];
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  log_date: Scalars['Date']['output'];
  logged_at?: Maybe<Scalars['Datetime']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  user_id: Scalars['UUID']['output'];
};

export type Water_Intake_LogsConnection = {
  __typename: 'water_intake_logsConnection';
  edges: Array<Water_Intake_LogsEdge>;
  pageInfo: PageInfo;
};

export type Water_Intake_LogsDeleteResponse = {
  __typename: 'water_intake_logsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Water_Intake_Logs>;
};

export type Water_Intake_LogsEdge = {
  __typename: 'water_intake_logsEdge';
  cursor: Scalars['String']['output'];
  node: Water_Intake_Logs;
};

export type Water_Intake_LogsFilter = {
  amount_ml?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Water_Intake_LogsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  log_date?: InputMaybe<DateFilter>;
  logged_at?: InputMaybe<DatetimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Water_Intake_LogsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Water_Intake_LogsFilter>>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Water_Intake_LogsInsertInput = {
  amount_ml?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  logged_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Water_Intake_LogsInsertResponse = {
  __typename: 'water_intake_logsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Water_Intake_Logs>;
};

export type Water_Intake_LogsOrderBy = {
  amount_ml?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  log_date?: InputMaybe<OrderByDirection>;
  logged_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Water_Intake_LogsUpdateInput = {
  amount_ml?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  logged_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Water_Intake_LogsUpdateResponse = {
  __typename: 'water_intake_logsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Water_Intake_Logs>;
};

export type Weekly_Summaries = Node & {
  __typename: 'weekly_summaries';
  avg_daily_calories?: Maybe<Scalars['Int']['output']>;
  avg_daily_carbs?: Maybe<Scalars['Float']['output']>;
  avg_daily_fats?: Maybe<Scalars['Float']['output']>;
  avg_daily_protein?: Maybe<Scalars['Float']['output']>;
  ending_weight?: Maybe<Scalars['Float']['output']>;
  generated_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  insights?: Maybe<Scalars['JSON']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  perfect_logging_days?: Maybe<Scalars['Int']['output']>;
  profiles?: Maybe<Profiles>;
  recommendations?: Maybe<Scalars['JSON']['output']>;
  starting_weight?: Maybe<Scalars['Float']['output']>;
  total_calories_burned?: Maybe<Scalars['Int']['output']>;
  total_meals_logged?: Maybe<Scalars['Int']['output']>;
  total_workout_minutes?: Maybe<Scalars['Int']['output']>;
  total_workouts?: Maybe<Scalars['Int']['output']>;
  user_id: Scalars['UUID']['output'];
  week_end_date: Scalars['Date']['output'];
  week_start_date: Scalars['Date']['output'];
  weight_change?: Maybe<Scalars['Float']['output']>;
  workout_consistency_percentage?: Maybe<Scalars['Float']['output']>;
};

export type Weekly_SummariesConnection = {
  __typename: 'weekly_summariesConnection';
  edges: Array<Weekly_SummariesEdge>;
  pageInfo: PageInfo;
};

export type Weekly_SummariesDeleteResponse = {
  __typename: 'weekly_summariesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Weekly_Summaries>;
};

export type Weekly_SummariesEdge = {
  __typename: 'weekly_summariesEdge';
  cursor: Scalars['String']['output'];
  node: Weekly_Summaries;
};

export type Weekly_SummariesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Weekly_SummariesFilter>>;
  avg_daily_calories?: InputMaybe<IntFilter>;
  avg_daily_carbs?: InputMaybe<FloatFilter>;
  avg_daily_fats?: InputMaybe<FloatFilter>;
  avg_daily_protein?: InputMaybe<FloatFilter>;
  ending_weight?: InputMaybe<FloatFilter>;
  generated_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Weekly_SummariesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Weekly_SummariesFilter>>;
  perfect_logging_days?: InputMaybe<IntFilter>;
  starting_weight?: InputMaybe<FloatFilter>;
  total_calories_burned?: InputMaybe<IntFilter>;
  total_meals_logged?: InputMaybe<IntFilter>;
  total_workout_minutes?: InputMaybe<IntFilter>;
  total_workouts?: InputMaybe<IntFilter>;
  user_id?: InputMaybe<UuidFilter>;
  week_end_date?: InputMaybe<DateFilter>;
  week_start_date?: InputMaybe<DateFilter>;
  weight_change?: InputMaybe<FloatFilter>;
  workout_consistency_percentage?: InputMaybe<FloatFilter>;
};

export type Weekly_SummariesInsertInput = {
  avg_daily_calories?: InputMaybe<Scalars['Int']['input']>;
  avg_daily_carbs?: InputMaybe<Scalars['Float']['input']>;
  avg_daily_fats?: InputMaybe<Scalars['Float']['input']>;
  avg_daily_protein?: InputMaybe<Scalars['Float']['input']>;
  ending_weight?: InputMaybe<Scalars['Float']['input']>;
  generated_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  insights?: InputMaybe<Scalars['JSON']['input']>;
  perfect_logging_days?: InputMaybe<Scalars['Int']['input']>;
  recommendations?: InputMaybe<Scalars['JSON']['input']>;
  starting_weight?: InputMaybe<Scalars['Float']['input']>;
  total_calories_burned?: InputMaybe<Scalars['Int']['input']>;
  total_meals_logged?: InputMaybe<Scalars['Int']['input']>;
  total_workout_minutes?: InputMaybe<Scalars['Int']['input']>;
  total_workouts?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  week_end_date?: InputMaybe<Scalars['Date']['input']>;
  week_start_date?: InputMaybe<Scalars['Date']['input']>;
  weight_change?: InputMaybe<Scalars['Float']['input']>;
  workout_consistency_percentage?: InputMaybe<Scalars['Float']['input']>;
};

export type Weekly_SummariesInsertResponse = {
  __typename: 'weekly_summariesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Weekly_Summaries>;
};

export type Weekly_SummariesOrderBy = {
  avg_daily_calories?: InputMaybe<OrderByDirection>;
  avg_daily_carbs?: InputMaybe<OrderByDirection>;
  avg_daily_fats?: InputMaybe<OrderByDirection>;
  avg_daily_protein?: InputMaybe<OrderByDirection>;
  ending_weight?: InputMaybe<OrderByDirection>;
  generated_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  perfect_logging_days?: InputMaybe<OrderByDirection>;
  starting_weight?: InputMaybe<OrderByDirection>;
  total_calories_burned?: InputMaybe<OrderByDirection>;
  total_meals_logged?: InputMaybe<OrderByDirection>;
  total_workout_minutes?: InputMaybe<OrderByDirection>;
  total_workouts?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  week_end_date?: InputMaybe<OrderByDirection>;
  week_start_date?: InputMaybe<OrderByDirection>;
  weight_change?: InputMaybe<OrderByDirection>;
  workout_consistency_percentage?: InputMaybe<OrderByDirection>;
};

export type Weekly_SummariesUpdateInput = {
  avg_daily_calories?: InputMaybe<Scalars['Int']['input']>;
  avg_daily_carbs?: InputMaybe<Scalars['Float']['input']>;
  avg_daily_fats?: InputMaybe<Scalars['Float']['input']>;
  avg_daily_protein?: InputMaybe<Scalars['Float']['input']>;
  ending_weight?: InputMaybe<Scalars['Float']['input']>;
  generated_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  insights?: InputMaybe<Scalars['JSON']['input']>;
  perfect_logging_days?: InputMaybe<Scalars['Int']['input']>;
  recommendations?: InputMaybe<Scalars['JSON']['input']>;
  starting_weight?: InputMaybe<Scalars['Float']['input']>;
  total_calories_burned?: InputMaybe<Scalars['Int']['input']>;
  total_meals_logged?: InputMaybe<Scalars['Int']['input']>;
  total_workout_minutes?: InputMaybe<Scalars['Int']['input']>;
  total_workouts?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  week_end_date?: InputMaybe<Scalars['Date']['input']>;
  week_start_date?: InputMaybe<Scalars['Date']['input']>;
  weight_change?: InputMaybe<Scalars['Float']['input']>;
  workout_consistency_percentage?: InputMaybe<Scalars['Float']['input']>;
};

export type Weekly_SummariesUpdateResponse = {
  __typename: 'weekly_summariesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Weekly_Summaries>;
};

export type Weight_History = Node & {
  __typename: 'weight_history';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  log_date: Scalars['Date']['output'];
  measurement_time?: Maybe<Scalars['Time']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  profiles?: Maybe<Profiles>;
  source?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['UUID']['output'];
  weight: Scalars['Float']['output'];
};

export type Weight_HistoryConnection = {
  __typename: 'weight_historyConnection';
  edges: Array<Weight_HistoryEdge>;
  pageInfo: PageInfo;
};

export type Weight_HistoryDeleteResponse = {
  __typename: 'weight_historyDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Weight_History>;
};

export type Weight_HistoryEdge = {
  __typename: 'weight_historyEdge';
  cursor: Scalars['String']['output'];
  node: Weight_History;
};

export type Weight_HistoryFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Weight_HistoryFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  log_date?: InputMaybe<DateFilter>;
  measurement_time?: InputMaybe<TimeFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Weight_HistoryFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Weight_HistoryFilter>>;
  source?: InputMaybe<StringFilter>;
  user_id?: InputMaybe<UuidFilter>;
  weight?: InputMaybe<FloatFilter>;
};

export type Weight_HistoryInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  measurement_time?: InputMaybe<Scalars['Time']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type Weight_HistoryInsertResponse = {
  __typename: 'weight_historyInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Weight_History>;
};

export type Weight_HistoryOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  log_date?: InputMaybe<OrderByDirection>;
  measurement_time?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  weight?: InputMaybe<OrderByDirection>;
};

export type Weight_HistoryUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  log_date?: InputMaybe<Scalars['Date']['input']>;
  measurement_time?: InputMaybe<Scalars['Time']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type Weight_HistoryUpdateResponse = {
  __typename: 'weight_historyUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Weight_History>;
};

export type Workout_Exercise_History = Node & {
  __typename: 'workout_exercise_history';
  completed_at?: Maybe<Scalars['Datetime']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  distance_meters?: Maybe<Scalars['Float']['output']>;
  duration_seconds?: Maybe<Scalars['Int']['output']>;
  exercise_id: Scalars['String']['output'];
  exercise_name: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  reps: Scalars['Int']['output'];
  rest_seconds?: Maybe<Scalars['Int']['output']>;
  sets: Scalars['Int']['output'];
  user_id: Scalars['UUID']['output'];
  weight_kg?: Maybe<Scalars['Float']['output']>;
};

export type Workout_Exercise_HistoryConnection = {
  __typename: 'workout_exercise_historyConnection';
  edges: Array<Workout_Exercise_HistoryEdge>;
  pageInfo: PageInfo;
};

export type Workout_Exercise_HistoryDeleteResponse = {
  __typename: 'workout_exercise_historyDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Exercise_History>;
};

export type Workout_Exercise_HistoryEdge = {
  __typename: 'workout_exercise_historyEdge';
  cursor: Scalars['String']['output'];
  node: Workout_Exercise_History;
};

export type Workout_Exercise_HistoryFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Exercise_HistoryFilter>>;
  completed_at?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  distance_meters?: InputMaybe<FloatFilter>;
  duration_seconds?: InputMaybe<IntFilter>;
  exercise_id?: InputMaybe<StringFilter>;
  exercise_name?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Exercise_HistoryFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Exercise_HistoryFilter>>;
  reps?: InputMaybe<IntFilter>;
  rest_seconds?: InputMaybe<IntFilter>;
  sets?: InputMaybe<IntFilter>;
  user_id?: InputMaybe<UuidFilter>;
  weight_kg?: InputMaybe<FloatFilter>;
};

export type Workout_Exercise_HistoryInsertInput = {
  completed_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  distance_meters?: InputMaybe<Scalars['Float']['input']>;
  duration_seconds?: InputMaybe<Scalars['Int']['input']>;
  exercise_id?: InputMaybe<Scalars['String']['input']>;
  exercise_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  reps?: InputMaybe<Scalars['Int']['input']>;
  rest_seconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weight_kg?: InputMaybe<Scalars['Float']['input']>;
};

export type Workout_Exercise_HistoryInsertResponse = {
  __typename: 'workout_exercise_historyInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Exercise_History>;
};

export type Workout_Exercise_HistoryOrderBy = {
  completed_at?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  distance_meters?: InputMaybe<OrderByDirection>;
  duration_seconds?: InputMaybe<OrderByDirection>;
  exercise_id?: InputMaybe<OrderByDirection>;
  exercise_name?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  reps?: InputMaybe<OrderByDirection>;
  rest_seconds?: InputMaybe<OrderByDirection>;
  sets?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  weight_kg?: InputMaybe<OrderByDirection>;
};

export type Workout_Exercise_HistoryUpdateInput = {
  completed_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  distance_meters?: InputMaybe<Scalars['Float']['input']>;
  duration_seconds?: InputMaybe<Scalars['Int']['input']>;
  exercise_id?: InputMaybe<Scalars['String']['input']>;
  exercise_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  reps?: InputMaybe<Scalars['Int']['input']>;
  rest_seconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weight_kg?: InputMaybe<Scalars['Float']['input']>;
};

export type Workout_Exercise_HistoryUpdateResponse = {
  __typename: 'workout_exercise_historyUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Exercise_History>;
};

export type Workout_Plan_Adherence = Node & {
  __typename: 'workout_plan_adherence';
  adherence_percentage?: Maybe<Scalars['Float']['output']>;
  ai_workout_plans?: Maybe<Ai_Workout_Plans>;
  completed_workouts?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  planned_workouts: Scalars['Int']['output'];
  profiles?: Maybe<Profiles>;
  skipped_workouts?: Maybe<Scalars['Int']['output']>;
  total_duration_minutes?: Maybe<Scalars['Int']['output']>;
  total_volume_kg?: Maybe<Scalars['Float']['output']>;
  tracking_week_start: Scalars['Date']['output'];
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_plan_id: Scalars['UUID']['output'];
};

export type Workout_Plan_AdherenceConnection = {
  __typename: 'workout_plan_adherenceConnection';
  edges: Array<Workout_Plan_AdherenceEdge>;
  pageInfo: PageInfo;
};

export type Workout_Plan_AdherenceDeleteResponse = {
  __typename: 'workout_plan_adherenceDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plan_Adherence>;
};

export type Workout_Plan_AdherenceEdge = {
  __typename: 'workout_plan_adherenceEdge';
  cursor: Scalars['String']['output'];
  node: Workout_Plan_Adherence;
};

export type Workout_Plan_AdherenceFilter = {
  adherence_percentage?: InputMaybe<FloatFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_Plan_AdherenceFilter>>;
  completed_workouts?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_Plan_AdherenceFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_Plan_AdherenceFilter>>;
  planned_workouts?: InputMaybe<IntFilter>;
  skipped_workouts?: InputMaybe<IntFilter>;
  total_duration_minutes?: InputMaybe<IntFilter>;
  total_volume_kg?: InputMaybe<FloatFilter>;
  tracking_week_start?: InputMaybe<DateFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  workout_plan_id?: InputMaybe<UuidFilter>;
};

export type Workout_Plan_AdherenceInsertInput = {
  completed_workouts?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  planned_workouts?: InputMaybe<Scalars['Int']['input']>;
  skipped_workouts?: InputMaybe<Scalars['Int']['input']>;
  total_duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  total_volume_kg?: InputMaybe<Scalars['Float']['input']>;
  tracking_week_start?: InputMaybe<Scalars['Date']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_plan_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Workout_Plan_AdherenceInsertResponse = {
  __typename: 'workout_plan_adherenceInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plan_Adherence>;
};

export type Workout_Plan_AdherenceOrderBy = {
  adherence_percentage?: InputMaybe<OrderByDirection>;
  completed_workouts?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  planned_workouts?: InputMaybe<OrderByDirection>;
  skipped_workouts?: InputMaybe<OrderByDirection>;
  total_duration_minutes?: InputMaybe<OrderByDirection>;
  total_volume_kg?: InputMaybe<OrderByDirection>;
  tracking_week_start?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  workout_plan_id?: InputMaybe<OrderByDirection>;
};

export type Workout_Plan_AdherenceUpdateInput = {
  completed_workouts?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  planned_workouts?: InputMaybe<Scalars['Int']['input']>;
  skipped_workouts?: InputMaybe<Scalars['Int']['input']>;
  total_duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  total_volume_kg?: InputMaybe<Scalars['Float']['input']>;
  tracking_week_start?: InputMaybe<Scalars['Date']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_plan_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Workout_Plan_AdherenceUpdateResponse = {
  __typename: 'workout_plan_adherenceUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Plan_Adherence>;
};

export type Workout_Sessions = Node & {
  __typename: 'workout_sessions';
  ai_workout_plans?: Maybe<Ai_Workout_Plans>;
  calories_burned?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['Datetime']['output']>;
  difficulty_rating?: Maybe<Scalars['Int']['output']>;
  duration_minutes?: Maybe<Scalars['Int']['output']>;
  energy_level?: Maybe<Scalars['Int']['output']>;
  exercise_setsCollection?: Maybe<Exercise_SetsConnection>;
  from_ai_plan?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['UUID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  mood_after?: Maybe<Scalars['String']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  plan_day_name?: Maybe<Scalars['String']['output']>;
  profiles?: Maybe<Profiles>;
  session_date: Scalars['Date']['output'];
  session_end_time?: Maybe<Scalars['Datetime']['output']>;
  session_start_time?: Maybe<Scalars['Datetime']['output']>;
  skip_reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  total_exercises?: Maybe<Scalars['Int']['output']>;
  total_reps?: Maybe<Scalars['Int']['output']>;
  total_sets?: Maybe<Scalars['Int']['output']>;
  total_volume_kg?: Maybe<Scalars['Float']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  weather?: Maybe<Scalars['String']['output']>;
  workout_name: Scalars['String']['output'];
  workout_plan_id?: Maybe<Scalars['UUID']['output']>;
  workout_type: Scalars['String']['output'];
};


export type Workout_SessionsExercise_SetsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exercise_SetsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exercise_SetsOrderBy>>;
};

export type Workout_SessionsConnection = {
  __typename: 'workout_sessionsConnection';
  edges: Array<Workout_SessionsEdge>;
  pageInfo: PageInfo;
};

export type Workout_SessionsDeleteResponse = {
  __typename: 'workout_sessionsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Sessions>;
};

export type Workout_SessionsEdge = {
  __typename: 'workout_sessionsEdge';
  cursor: Scalars['String']['output'];
  node: Workout_Sessions;
};

export type Workout_SessionsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_SessionsFilter>>;
  calories_burned?: InputMaybe<IntFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  difficulty_rating?: InputMaybe<IntFilter>;
  duration_minutes?: InputMaybe<IntFilter>;
  energy_level?: InputMaybe<IntFilter>;
  from_ai_plan?: InputMaybe<BooleanFilter>;
  id?: InputMaybe<UuidFilter>;
  location?: InputMaybe<StringFilter>;
  mood_after?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_SessionsFilter>;
  notes?: InputMaybe<StringFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_SessionsFilter>>;
  plan_day_name?: InputMaybe<StringFilter>;
  session_date?: InputMaybe<DateFilter>;
  session_end_time?: InputMaybe<DatetimeFilter>;
  session_start_time?: InputMaybe<DatetimeFilter>;
  skip_reason?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  total_exercises?: InputMaybe<IntFilter>;
  total_reps?: InputMaybe<IntFilter>;
  total_sets?: InputMaybe<IntFilter>;
  total_volume_kg?: InputMaybe<FloatFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  weather?: InputMaybe<StringFilter>;
  workout_name?: InputMaybe<StringFilter>;
  workout_plan_id?: InputMaybe<UuidFilter>;
  workout_type?: InputMaybe<StringFilter>;
};

export type Workout_SessionsInsertInput = {
  calories_burned?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  difficulty_rating?: InputMaybe<Scalars['Int']['input']>;
  energy_level?: InputMaybe<Scalars['Int']['input']>;
  from_ai_plan?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  mood_after?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  plan_day_name?: InputMaybe<Scalars['String']['input']>;
  session_date?: InputMaybe<Scalars['Date']['input']>;
  session_end_time?: InputMaybe<Scalars['Datetime']['input']>;
  session_start_time?: InputMaybe<Scalars['Datetime']['input']>;
  skip_reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total_exercises?: InputMaybe<Scalars['Int']['input']>;
  total_reps?: InputMaybe<Scalars['Int']['input']>;
  total_sets?: InputMaybe<Scalars['Int']['input']>;
  total_volume_kg?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weather?: InputMaybe<Scalars['String']['input']>;
  workout_name?: InputMaybe<Scalars['String']['input']>;
  workout_plan_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_type?: InputMaybe<Scalars['String']['input']>;
};

export type Workout_SessionsInsertResponse = {
  __typename: 'workout_sessionsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Sessions>;
};

export type Workout_SessionsOrderBy = {
  calories_burned?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  difficulty_rating?: InputMaybe<OrderByDirection>;
  duration_minutes?: InputMaybe<OrderByDirection>;
  energy_level?: InputMaybe<OrderByDirection>;
  from_ai_plan?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  location?: InputMaybe<OrderByDirection>;
  mood_after?: InputMaybe<OrderByDirection>;
  notes?: InputMaybe<OrderByDirection>;
  plan_day_name?: InputMaybe<OrderByDirection>;
  session_date?: InputMaybe<OrderByDirection>;
  session_end_time?: InputMaybe<OrderByDirection>;
  session_start_time?: InputMaybe<OrderByDirection>;
  skip_reason?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  total_exercises?: InputMaybe<OrderByDirection>;
  total_reps?: InputMaybe<OrderByDirection>;
  total_sets?: InputMaybe<OrderByDirection>;
  total_volume_kg?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  weather?: InputMaybe<OrderByDirection>;
  workout_name?: InputMaybe<OrderByDirection>;
  workout_plan_id?: InputMaybe<OrderByDirection>;
  workout_type?: InputMaybe<OrderByDirection>;
};

export type Workout_SessionsUpdateInput = {
  calories_burned?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  difficulty_rating?: InputMaybe<Scalars['Int']['input']>;
  energy_level?: InputMaybe<Scalars['Int']['input']>;
  from_ai_plan?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  mood_after?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  plan_day_name?: InputMaybe<Scalars['String']['input']>;
  session_date?: InputMaybe<Scalars['Date']['input']>;
  session_end_time?: InputMaybe<Scalars['Datetime']['input']>;
  session_start_time?: InputMaybe<Scalars['Datetime']['input']>;
  skip_reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total_exercises?: InputMaybe<Scalars['Int']['input']>;
  total_reps?: InputMaybe<Scalars['Int']['input']>;
  total_sets?: InputMaybe<Scalars['Int']['input']>;
  total_volume_kg?: InputMaybe<Scalars['Float']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  weather?: InputMaybe<Scalars['String']['input']>;
  workout_name?: InputMaybe<Scalars['String']['input']>;
  workout_plan_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_type?: InputMaybe<Scalars['String']['input']>;
};

export type Workout_SessionsUpdateResponse = {
  __typename: 'workout_sessionsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Sessions>;
};

export type Workout_Templates = Node & {
  __typename: 'workout_templates';
  created_at?: Maybe<Scalars['Datetime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty_level?: Maybe<Scalars['String']['output']>;
  estimated_duration_minutes?: Maybe<Scalars['Int']['output']>;
  exercises: Scalars['JSON']['output'];
  id: Scalars['UUID']['output'];
  is_favorite?: Maybe<Scalars['Boolean']['output']>;
  last_used_at?: Maybe<Scalars['Datetime']['output']>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  profiles?: Maybe<Profiles>;
  times_used?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['Datetime']['output']>;
  user_id: Scalars['UUID']['output'];
  workout_type?: Maybe<Scalars['String']['output']>;
};

export type Workout_TemplatesConnection = {
  __typename: 'workout_templatesConnection';
  edges: Array<Workout_TemplatesEdge>;
  pageInfo: PageInfo;
};

export type Workout_TemplatesDeleteResponse = {
  __typename: 'workout_templatesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Templates>;
};

export type Workout_TemplatesEdge = {
  __typename: 'workout_templatesEdge';
  cursor: Scalars['String']['output'];
  node: Workout_Templates;
};

export type Workout_TemplatesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Workout_TemplatesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  description?: InputMaybe<StringFilter>;
  difficulty_level?: InputMaybe<StringFilter>;
  estimated_duration_minutes?: InputMaybe<IntFilter>;
  id?: InputMaybe<UuidFilter>;
  is_favorite?: InputMaybe<BooleanFilter>;
  last_used_at?: InputMaybe<DatetimeFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Workout_TemplatesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Workout_TemplatesFilter>>;
  times_used?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
  workout_type?: InputMaybe<StringFilter>;
};

export type Workout_TemplatesInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty_level?: InputMaybe<Scalars['String']['input']>;
  estimated_duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  exercises?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['Datetime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  times_used?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_type?: InputMaybe<Scalars['String']['input']>;
};

export type Workout_TemplatesInsertResponse = {
  __typename: 'workout_templatesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Templates>;
};

export type Workout_TemplatesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  difficulty_level?: InputMaybe<OrderByDirection>;
  estimated_duration_minutes?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_favorite?: InputMaybe<OrderByDirection>;
  last_used_at?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  times_used?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
  workout_type?: InputMaybe<OrderByDirection>;
};

export type Workout_TemplatesUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty_level?: InputMaybe<Scalars['String']['input']>;
  estimated_duration_minutes?: InputMaybe<Scalars['Int']['input']>;
  exercises?: InputMaybe<Scalars['JSON']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['Datetime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  times_used?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
  workout_type?: InputMaybe<Scalars['String']['input']>;
};

export type Workout_TemplatesUpdateResponse = {
  __typename: 'workout_templatesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Workout_Templates>;
};

export type GetChallengesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['UUID']['input']>;
}>;


export type GetChallengesQuery = { __typename: 'Query', challengesCollection?: { __typename: 'challengesConnection', edges: Array<{ __typename: 'challengesEdge', node: { __typename: 'challenges', id: string, title: string, description: string, type: string, difficulty: string, points: number, requirements: any, start_date?: string | null, end_date?: string | null, is_active?: boolean | null, created_at?: string | null, updated_at?: string | null } }> } | null, challenge_participantsCollection?: { __typename: 'challenge_participantsConnection', edges: Array<{ __typename: 'challenge_participantsEdge', node: { __typename: 'challenge_participants', id: string, challenge_id: string, user_id: string, progress?: any | null, completed?: boolean | null, completion_date?: string | null, streak_count?: number | null, last_progress_date?: string | null, streak_expires_at?: string | null, streak_warning_sent?: boolean | null, created_at?: string | null } }> } | null };

export type GetUserRewardsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserRewardsQuery = { __typename: 'Query', user_rewardsCollection?: { __typename: 'user_rewardsConnection', edges: Array<{ __typename: 'user_rewardsEdge', node: { __typename: 'user_rewards', user_id: string, points?: number | null, lifetime_points?: number | null, created_at?: string | null, updated_at?: string | null } }> } | null };

export type GetRewardsCatalogQueryVariables = Exact<{
  filter?: InputMaybe<Rewards_CatalogFilter>;
}>;


export type GetRewardsCatalogQuery = { __typename: 'Query', rewards_catalogCollection?: { __typename: 'rewards_catalogConnection', edges: Array<{ __typename: 'rewards_catalogEdge', node: { __typename: 'rewards_catalog', id: string, name: string, description: string, points_cost: number, type: string, value?: string | null, tier_requirement?: string | null, stock_quantity?: number | null, is_active?: boolean | null, image_url?: string | null, created_at?: string | null, updated_at?: string | null } }> } | null };

export type GetUserRedeemedRewardsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserRedeemedRewardsQuery = { __typename: 'Query', user_redeemed_rewardsCollection?: { __typename: 'user_redeemed_rewardsConnection', edges: Array<{ __typename: 'user_redeemed_rewardsEdge', node: { __typename: 'user_redeemed_rewards', id: string, user_id: string, reward_id: string, type: string, reward_value: string, points_spent: number, redeemed_at?: string | null, used?: boolean | null, used_at?: string | null, created_at?: string | null } }> } | null };

export type GetChallengeDetailsQueryVariables = Exact<{
  challengeId: Scalars['UUID']['input'];
}>;


export type GetChallengeDetailsQuery = { __typename: 'Query', challengesCollection?: { __typename: 'challengesConnection', edges: Array<{ __typename: 'challengesEdge', node: { __typename: 'challenges', id: string, title: string, description: string, type: string, difficulty: string, points: number, requirements: any, start_date?: string | null, end_date?: string | null, is_active?: boolean | null, created_at?: string | null, updated_at?: string | null } }> } | null, challenge_participantsCollection?: { __typename: 'challenge_participantsConnection', edges: Array<{ __typename: 'challenge_participantsEdge', node: { __typename: 'challenge_participants', id: string, challenge_id: string, user_id: string, progress?: any | null, completed?: boolean | null, completion_date?: string | null, streak_count?: number | null, last_progress_date?: string | null, streak_expires_at?: string | null, created_at?: string | null } }> } | null };

export type JoinChallengeMutationVariables = Exact<{
  challengeId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
  progress: Scalars['JSON']['input'];
}>;


export type JoinChallengeMutation = { __typename: 'Mutation', insertIntochallenge_participantsCollection?: { __typename: 'challenge_participantsInsertResponse', affectedCount: number, records: Array<{ __typename: 'challenge_participants', id: string, challenge_id: string, user_id: string, progress?: any | null, completed?: boolean | null, streak_count?: number | null, created_at?: string | null }> } | null };

export type QuitChallengeMutationVariables = Exact<{
  challengeId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
}>;


export type QuitChallengeMutation = { __typename: 'Mutation', deleteFromchallenge_participantsCollection: { __typename: 'challenge_participantsDeleteResponse', affectedCount: number, records: Array<{ __typename: 'challenge_participants', id: string, challenge_id: string, user_id: string }> } };

export type UpdateChallengeProgressMutationVariables = Exact<{
  challengeId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
  progress: Scalars['JSON']['input'];
  completed: Scalars['Boolean']['input'];
  completionDate?: InputMaybe<Scalars['Datetime']['input']>;
  streakCount?: InputMaybe<Scalars['Int']['input']>;
  lastProgressDate?: InputMaybe<Scalars['Datetime']['input']>;
  streakExpiresAt?: InputMaybe<Scalars['Datetime']['input']>;
}>;


export type UpdateChallengeProgressMutation = { __typename: 'Mutation', updatechallenge_participantsCollection: { __typename: 'challenge_participantsUpdateResponse', affectedCount: number, records: Array<{ __typename: 'challenge_participants', id: string, challenge_id: string, user_id: string, progress?: any | null, completed?: boolean | null, completion_date?: string | null, streak_count?: number | null, last_progress_date?: string | null, streak_expires_at?: string | null }> } };

export type RedeemRewardMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  rewardId: Scalars['UUID']['input'];
  rewardType: Scalars['String']['input'];
  rewardValue: Scalars['String']['input'];
  pointsSpent: Scalars['Int']['input'];
}>;


export type RedeemRewardMutation = { __typename: 'Mutation', insertIntouser_redeemed_rewardsCollection?: { __typename: 'user_redeemed_rewardsInsertResponse', affectedCount: number, records: Array<{ __typename: 'user_redeemed_rewards', id: string, user_id: string, reward_id: string, type: string, reward_value: string, points_spent: number, redeemed_at?: string | null, used?: boolean | null, created_at?: string | null }> } | null };

export type GetDailyNutritionLogsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  logDate: Scalars['Date']['input'];
}>;


export type GetDailyNutritionLogsQuery = { __typename: 'Query', daily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsConnection', edges: Array<{ __typename: 'daily_nutrition_logsEdge', node: { __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date: string, meal_type: string, food_items: any, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean } } | null };

export type GetRecentNutritionLogsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecentNutritionLogsQuery = { __typename: 'Query', daily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsConnection', edges: Array<{ __typename: 'daily_nutrition_logsEdge', node: { __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date: string, meal_type: string, food_items: any, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetNutritionLogsByMealQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  logDate: Scalars['Date']['input'];
  mealType: Scalars['String']['input'];
}>;


export type GetNutritionLogsByMealQuery = { __typename: 'Query', daily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsConnection', edges: Array<{ __typename: 'daily_nutrition_logsEdge', node: { __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date: string, meal_type: string, food_items: any, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null } }> } | null };

export type LogNutritionMutationVariables = Exact<{
  input: Daily_Nutrition_LogsInsertInput;
}>;


export type LogNutritionMutation = { __typename: 'Mutation', insertIntodaily_nutrition_logsCollection?: { __typename: 'daily_nutrition_logsInsertResponse', affectedCount: number, records: Array<{ __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date: string, meal_type: string, food_items: any, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null }> } | null };

export type UpdateNutritionMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  set: Daily_Nutrition_LogsUpdateInput;
}>;


export type UpdateNutritionMutation = { __typename: 'Mutation', updatedaily_nutrition_logsCollection: { __typename: 'daily_nutrition_logsUpdateResponse', affectedCount: number, records: Array<{ __typename: 'daily_nutrition_logs', id: string, user_id: string, log_date: string, meal_type: string, food_items: any, total_calories?: number | null, total_protein?: number | null, total_carbs?: number | null, total_fats?: number | null, notes?: string | null, created_at?: string | null }> } };

export type DeleteNutritionMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type DeleteNutritionMutation = { __typename: 'Mutation', deleteFromdaily_nutrition_logsCollection: { __typename: 'daily_nutrition_logsDeleteResponse', affectedCount: number, records: Array<{ __typename: 'daily_nutrition_logs', id: string }> } };

export type GetActiveMealPlanQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetActiveMealPlanQuery = { __typename: 'Query', ai_meal_plansCollection?: { __typename: 'ai_meal_plansConnection', edges: Array<{ __typename: 'ai_meal_plansEdge', node: { __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetUserMealPlansQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserMealPlansQuery = { __typename: 'Query', ai_meal_plansCollection?: { __typename: 'ai_meal_plansConnection', edges: Array<{ __typename: 'ai_meal_plansEdge', node: { __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type CreateMealPlanMutationVariables = Exact<{
  input: Ai_Meal_PlansInsertInput;
}>;


export type CreateMealPlanMutation = { __typename: 'Mutation', insertIntoai_meal_plansCollection?: { __typename: 'ai_meal_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };

export type GetUserOnboardingStatusQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserOnboardingStatusQuery = { __typename: 'Query', profilesCollection?: { __typename: 'profilesConnection', edges: Array<{ __typename: 'profilesEdge', node: { __typename: 'profiles', id: string, email: string, onboarding_completed?: boolean | null, onboarding_step?: number | null, height?: number | null, weight?: number | null, age?: number | null, gender?: string | null, created_at?: string | null } }> } | null };

export type GetUserQuizResultsQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserQuizResultsQuery = { __typename: 'Query', quiz_resultsCollection?: { __typename: 'quiz_resultsConnection', edges: Array<{ __typename: 'quiz_resultsEdge', node: { __typename: 'quiz_results', id: string, user_id: string, answers: any, calculations?: any | null, created_at?: string | null } }> } | null };

export type SaveOnboardingDataMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  updates: ProfilesUpdateInput;
}>;


export type SaveOnboardingDataMutation = { __typename: 'Mutation', updateprofilesCollection: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, email: string, full_name?: string | null, age?: number | null, gender?: string | null, height?: number | null, weight?: number | null, target_weight?: number | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, updated_at?: string | null }> } };

export type GenerateAiMealPlanMutationVariables = Exact<{
  input: Ai_Meal_PlansInsertInput;
}>;


export type GenerateAiMealPlanMutation = { __typename: 'Mutation', insertIntoai_meal_plansCollection?: { __typename: 'ai_meal_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_meal_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, daily_calories?: number | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };

export type GenerateAiWorkoutPlanMutationVariables = Exact<{
  input: Ai_Workout_PlansInsertInput;
}>;


export type GenerateAiWorkoutPlanMutation = { __typename: 'Mutation', insertIntoai_workout_plansCollection?: { __typename: 'ai_workout_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };

export type GetUserProfileQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserProfileQuery = { __typename: 'Query', profilesCollection?: { __typename: 'profilesConnection', edges: Array<{ __typename: 'profilesEdge', node: { __typename: 'profiles', id: string, email: string, full_name?: string | null, username?: string | null, avatar_url?: string | null, age?: number | null, gender?: string | null, height?: number | null, weight?: number | null, target_weight?: number | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, created_at?: string | null, updated_at?: string | null, subscriptions?: { __typename: 'subscriptions', id: string, tier: string, status: string, stripe_customer_id?: string | null, stripe_subscription_id?: string | null, current_period_start?: string | null, current_period_end?: string | null, trial_end?: string | null, cancel_at_period_end?: boolean | null } | null } }> } | null };

export type GetProfileQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetProfileQuery = { __typename: 'Query', profilesCollection?: { __typename: 'profilesConnection', edges: Array<{ __typename: 'profilesEdge', node: { __typename: 'profiles', id: string, email: string, full_name?: string | null, username?: string | null, avatar_url?: string | null, age?: number | null, gender?: string | null, height?: number | null, weight?: number | null, target_weight?: number | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, created_at?: string | null, updated_at?: string | null } }> } | null };

export type GetUserSubscriptionQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetUserSubscriptionQuery = { __typename: 'Query', subscriptionsCollection?: { __typename: 'subscriptionsConnection', edges: Array<{ __typename: 'subscriptionsEdge', node: { __typename: 'subscriptions', id: string, user_id: string, tier: string, status: string, stripe_customer_id?: string | null, stripe_subscription_id?: string | null, stripe_price_id?: string | null, current_period_start?: string | null, current_period_end?: string | null, trial_start?: string | null, trial_end?: string | null, cancel_at_period_end?: boolean | null, canceled_at?: string | null, metadata?: any | null, created_at?: string | null, updated_at?: string | null } }> } | null };

export type UpdateUserProfileMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  age?: InputMaybe<Scalars['Int']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  targetWeight?: InputMaybe<Scalars['Float']['input']>;
  onboardingCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  onboardingStep?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateUserProfileMutation = { __typename: 'Mutation', updateprofilesCollection: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, email: string, full_name?: string | null, username?: string | null, avatar_url?: string | null, age?: number | null, gender?: string | null, height?: number | null, weight?: number | null, target_weight?: number | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, updated_at?: string | null }> } };

export type CreateUserProfileMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  email: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
  age?: InputMaybe<Scalars['Int']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  targetWeight?: InputMaybe<Scalars['Float']['input']>;
}>;


export type CreateUserProfileMutation = { __typename: 'Mutation', insertIntoprofilesCollection?: { __typename: 'profilesInsertResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, email: string, full_name?: string | null, age?: number | null, gender?: string | null, height?: number | null, weight?: number | null, target_weight?: number | null, onboarding_completed?: boolean | null, onboarding_step?: number | null, created_at?: string | null }> } | null };

export type UpdateUserAvatarMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
  avatarUrl: Scalars['String']['input'];
}>;


export type UpdateUserAvatarMutation = { __typename: 'Mutation', updateprofilesCollection: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, avatar_url?: string | null, updated_at?: string | null }> } };

export type DeleteUserAvatarMutationVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type DeleteUserAvatarMutation = { __typename: 'Mutation', updateprofilesCollection: { __typename: 'profilesUpdateResponse', affectedCount: number, records: Array<{ __typename: 'profiles', id: string, avatar_url?: string | null, updated_at?: string | null }> } };

export type GetActiveWorkoutPlanQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;


export type GetActiveWorkoutPlanQuery = { __typename: 'Query', ai_workout_plansCollection?: { __typename: 'ai_workout_plansConnection', edges: Array<{ __typename: 'ai_workout_plansEdge', node: { __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type GetUserWorkoutPlansQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserWorkoutPlansQuery = { __typename: 'Query', ai_workout_plansCollection?: { __typename: 'ai_workout_plansConnection', edges: Array<{ __typename: 'ai_workout_plansEdge', node: { __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, status?: string | null, is_active?: boolean | null, error_message?: string | null, generated_at?: string | null, created_at?: string | null, updated_at?: string | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type CreateWorkoutPlanMutationVariables = Exact<{
  input: Ai_Workout_PlansInsertInput;
}>;


export type CreateWorkoutPlanMutation = { __typename: 'Mutation', insertIntoai_workout_plansCollection?: { __typename: 'ai_workout_plansInsertResponse', affectedCount: number, records: Array<{ __typename: 'ai_workout_plans', id: string, user_id: string, quiz_result_id?: string | null, plan_data?: any | null, status?: string | null, is_active?: boolean | null, generated_at?: string | null, created_at?: string | null }> } | null };


export const GetChallengesDocument = gql`
    query GetChallenges($userId: UUID) {
  challengesCollection(filter: {is_active: {eq: true}}) {
    edges {
      node {
        id
        title
        description
        type
        difficulty
        points
        requirements
        start_date
        end_date
        is_active
        created_at
        updated_at
      }
    }
  }
  challenge_participantsCollection(filter: {user_id: {eq: $userId}}) {
    edges {
      node {
        id
        challenge_id
        user_id
        progress
        completed
        completion_date
        streak_count
        last_progress_date
        streak_expires_at
        streak_warning_sent
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetChallengesQuery__
 *
 * To run a query within a React component, call `useGetChallengesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChallengesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChallengesQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetChallengesQuery(baseOptions?: QueryHookOptions<GetChallengesQuery, GetChallengesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetChallengesQuery, GetChallengesQueryVariables>(GetChallengesDocument, options);
      }
export function useGetChallengesLazyQuery(baseOptions?: LazyQueryHookOptions<GetChallengesQuery, GetChallengesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetChallengesQuery, GetChallengesQueryVariables>(GetChallengesDocument, options);
        }
export function useGetChallengesSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetChallengesQuery, GetChallengesQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetChallengesQuery, GetChallengesQueryVariables>(GetChallengesDocument, options as any);
        }
export type GetChallengesQueryHookResult = ReturnType<typeof useGetChallengesQuery>;
export type GetChallengesLazyQueryHookResult = ReturnType<typeof useGetChallengesLazyQuery>;
export type GetChallengesSuspenseQueryHookResult = ReturnType<typeof useGetChallengesSuspenseQuery>;
export type GetChallengesQueryResult = QueryResult<GetChallengesQuery, GetChallengesQueryVariables>;
export const GetUserRewardsDocument = gql`
    query GetUserRewards($userId: UUID!) {
  user_rewardsCollection(filter: {user_id: {eq: $userId}}) {
    edges {
      node {
        user_id
        points
        lifetime_points
        created_at
        updated_at
      }
    }
  }
}
    `;

/**
 * __useGetUserRewardsQuery__
 *
 * To run a query within a React component, call `useGetUserRewardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserRewardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserRewardsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserRewardsQuery(baseOptions: QueryHookOptions<GetUserRewardsQuery, GetUserRewardsQueryVariables> & ({ variables: GetUserRewardsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserRewardsQuery, GetUserRewardsQueryVariables>(GetUserRewardsDocument, options);
      }
export function useGetUserRewardsLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserRewardsQuery, GetUserRewardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserRewardsQuery, GetUserRewardsQueryVariables>(GetUserRewardsDocument, options);
        }
export function useGetUserRewardsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserRewardsQuery, GetUserRewardsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserRewardsQuery, GetUserRewardsQueryVariables>(GetUserRewardsDocument, options as any);
        }
export type GetUserRewardsQueryHookResult = ReturnType<typeof useGetUserRewardsQuery>;
export type GetUserRewardsLazyQueryHookResult = ReturnType<typeof useGetUserRewardsLazyQuery>;
export type GetUserRewardsSuspenseQueryHookResult = ReturnType<typeof useGetUserRewardsSuspenseQuery>;
export type GetUserRewardsQueryResult = QueryResult<GetUserRewardsQuery, GetUserRewardsQueryVariables>;
export const GetRewardsCatalogDocument = gql`
    query GetRewardsCatalog($filter: rewards_catalogFilter) {
  rewards_catalogCollection(
    filter: $filter
    orderBy: [{points_cost: AscNullsLast}]
  ) {
    edges {
      node {
        id
        name
        description
        points_cost
        type
        value
        tier_requirement
        stock_quantity
        is_active
        image_url
        created_at
        updated_at
      }
    }
  }
}
    `;

/**
 * __useGetRewardsCatalogQuery__
 *
 * To run a query within a React component, call `useGetRewardsCatalogQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRewardsCatalogQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRewardsCatalogQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetRewardsCatalogQuery(baseOptions?: QueryHookOptions<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>(GetRewardsCatalogDocument, options);
      }
export function useGetRewardsCatalogLazyQuery(baseOptions?: LazyQueryHookOptions<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>(GetRewardsCatalogDocument, options);
        }
export function useGetRewardsCatalogSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>(GetRewardsCatalogDocument, options as any);
        }
export type GetRewardsCatalogQueryHookResult = ReturnType<typeof useGetRewardsCatalogQuery>;
export type GetRewardsCatalogLazyQueryHookResult = ReturnType<typeof useGetRewardsCatalogLazyQuery>;
export type GetRewardsCatalogSuspenseQueryHookResult = ReturnType<typeof useGetRewardsCatalogSuspenseQuery>;
export type GetRewardsCatalogQueryResult = QueryResult<GetRewardsCatalogQuery, GetRewardsCatalogQueryVariables>;
export const GetUserRedeemedRewardsDocument = gql`
    query GetUserRedeemedRewards($userId: UUID!) {
  user_redeemed_rewardsCollection(filter: {user_id: {eq: $userId}}) {
    edges {
      node {
        id
        user_id
        reward_id
        type
        reward_value
        points_spent
        redeemed_at
        used
        used_at
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetUserRedeemedRewardsQuery__
 *
 * To run a query within a React component, call `useGetUserRedeemedRewardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserRedeemedRewardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserRedeemedRewardsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserRedeemedRewardsQuery(baseOptions: QueryHookOptions<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables> & ({ variables: GetUserRedeemedRewardsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables>(GetUserRedeemedRewardsDocument, options);
      }
export function useGetUserRedeemedRewardsLazyQuery(baseOptions?: LazyQueryHookOptions<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables>(GetUserRedeemedRewardsDocument, options);
        }
export function useGetUserRedeemedRewardsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables>(GetUserRedeemedRewardsDocument, options as any);
        }
export type GetUserRedeemedRewardsQueryHookResult = ReturnType<typeof useGetUserRedeemedRewardsQuery>;
export type GetUserRedeemedRewardsLazyQueryHookResult = ReturnType<typeof useGetUserRedeemedRewardsLazyQuery>;
export type GetUserRedeemedRewardsSuspenseQueryHookResult = ReturnType<typeof useGetUserRedeemedRewardsSuspenseQuery>;
export type GetUserRedeemedRewardsQueryResult = QueryResult<GetUserRedeemedRewardsQuery, GetUserRedeemedRewardsQueryVariables>;
export const GetChallengeDetailsDocument = gql`
    query GetChallengeDetails($challengeId: UUID!) {
  challengesCollection(filter: {id: {eq: $challengeId}}) {
    edges {
      node {
        id
        title
        description
        type
        difficulty
        points
        requirements
        start_date
        end_date
        is_active
        created_at
        updated_at
      }
    }
  }
  challenge_participantsCollection(filter: {challenge_id: {eq: $challengeId}}) {
    edges {
      node {
        id
        challenge_id
        user_id
        progress
        completed
        completion_date
        streak_count
        last_progress_date
        streak_expires_at
        created_at
      }
    }
  }
}
    `;

/**
 * __useGetChallengeDetailsQuery__
 *
 * To run a query within a React component, call `useGetChallengeDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChallengeDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChallengeDetailsQuery({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *   },
 * });
 */
export function useGetChallengeDetailsQuery(baseOptions: QueryHookOptions<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables> & ({ variables: GetChallengeDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return useQuery<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables>(GetChallengeDetailsDocument, options);
      }
export function useGetChallengeDetailsLazyQuery(baseOptions?: LazyQueryHookOptions<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return useLazyQuery<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables>(GetChallengeDetailsDocument, options);
        }
export function useGetChallengeDetailsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables>) {
          const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return useSuspenseQuery<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables>(GetChallengeDetailsDocument, options as any);
        }
export type GetChallengeDetailsQueryHookResult = ReturnType<typeof useGetChallengeDetailsQuery>;
export type GetChallengeDetailsLazyQueryHookResult = ReturnType<typeof useGetChallengeDetailsLazyQuery>;
export type GetChallengeDetailsSuspenseQueryHookResult = ReturnType<typeof useGetChallengeDetailsSuspenseQuery>;
export type GetChallengeDetailsQueryResult = QueryResult<GetChallengeDetailsQuery, GetChallengeDetailsQueryVariables>;
export const JoinChallengeDocument = gql`
    mutation JoinChallenge($challengeId: UUID!, $userId: UUID!, $progress: JSON!) {
  insertIntochallenge_participantsCollection(
    objects: [{challenge_id: $challengeId, user_id: $userId, progress: $progress, completed: false, streak_count: 0}]
  ) {
    records {
      id
      challenge_id
      user_id
      progress
      completed
      streak_count
      created_at
    }
    affectedCount
  }
}
    `;
export type JoinChallengeMutationFn = MutationFunction<JoinChallengeMutation, JoinChallengeMutationVariables>;

/**
 * __useJoinChallengeMutation__
 *
 * To run a mutation, you first call `useJoinChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinChallengeMutation, { data, loading, error }] = useJoinChallengeMutation({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *      userId: // value for 'userId'
 *      progress: // value for 'progress'
 *   },
 * });
 */
export function useJoinChallengeMutation(baseOptions?: MutationHookOptions<JoinChallengeMutation, JoinChallengeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<JoinChallengeMutation, JoinChallengeMutationVariables>(JoinChallengeDocument, options);
      }
export type JoinChallengeMutationHookResult = ReturnType<typeof useJoinChallengeMutation>;
export type JoinChallengeMutationResult = MutationResult<JoinChallengeMutation>;
export type JoinChallengeMutationOptions = BaseMutationOptions<JoinChallengeMutation, JoinChallengeMutationVariables>;
export const QuitChallengeDocument = gql`
    mutation QuitChallenge($challengeId: UUID!, $userId: UUID!) {
  deleteFromchallenge_participantsCollection(
    filter: {challenge_id: {eq: $challengeId}, user_id: {eq: $userId}}
  ) {
    records {
      id
      challenge_id
      user_id
    }
    affectedCount
  }
}
    `;
export type QuitChallengeMutationFn = MutationFunction<QuitChallengeMutation, QuitChallengeMutationVariables>;

/**
 * __useQuitChallengeMutation__
 *
 * To run a mutation, you first call `useQuitChallengeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useQuitChallengeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [quitChallengeMutation, { data, loading, error }] = useQuitChallengeMutation({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useQuitChallengeMutation(baseOptions?: MutationHookOptions<QuitChallengeMutation, QuitChallengeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<QuitChallengeMutation, QuitChallengeMutationVariables>(QuitChallengeDocument, options);
      }
export type QuitChallengeMutationHookResult = ReturnType<typeof useQuitChallengeMutation>;
export type QuitChallengeMutationResult = MutationResult<QuitChallengeMutation>;
export type QuitChallengeMutationOptions = BaseMutationOptions<QuitChallengeMutation, QuitChallengeMutationVariables>;
export const UpdateChallengeProgressDocument = gql`
    mutation UpdateChallengeProgress($challengeId: UUID!, $userId: UUID!, $progress: JSON!, $completed: Boolean!, $completionDate: Datetime, $streakCount: Int, $lastProgressDate: Datetime, $streakExpiresAt: Datetime) {
  updatechallenge_participantsCollection(
    filter: {challenge_id: {eq: $challengeId}, user_id: {eq: $userId}}
    set: {progress: $progress, completed: $completed, completion_date: $completionDate, streak_count: $streakCount, last_progress_date: $lastProgressDate, streak_expires_at: $streakExpiresAt}
  ) {
    records {
      id
      challenge_id
      user_id
      progress
      completed
      completion_date
      streak_count
      last_progress_date
      streak_expires_at
    }
    affectedCount
  }
}
    `;
export type UpdateChallengeProgressMutationFn = MutationFunction<UpdateChallengeProgressMutation, UpdateChallengeProgressMutationVariables>;

/**
 * __useUpdateChallengeProgressMutation__
 *
 * To run a mutation, you first call `useUpdateChallengeProgressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateChallengeProgressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateChallengeProgressMutation, { data, loading, error }] = useUpdateChallengeProgressMutation({
 *   variables: {
 *      challengeId: // value for 'challengeId'
 *      userId: // value for 'userId'
 *      progress: // value for 'progress'
 *      completed: // value for 'completed'
 *      completionDate: // value for 'completionDate'
 *      streakCount: // value for 'streakCount'
 *      lastProgressDate: // value for 'lastProgressDate'
 *      streakExpiresAt: // value for 'streakExpiresAt'
 *   },
 * });
 */
export function useUpdateChallengeProgressMutation(baseOptions?: MutationHookOptions<UpdateChallengeProgressMutation, UpdateChallengeProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<UpdateChallengeProgressMutation, UpdateChallengeProgressMutationVariables>(UpdateChallengeProgressDocument, options);
      }
export type UpdateChallengeProgressMutationHookResult = ReturnType<typeof useUpdateChallengeProgressMutation>;
export type UpdateChallengeProgressMutationResult = MutationResult<UpdateChallengeProgressMutation>;
export type UpdateChallengeProgressMutationOptions = BaseMutationOptions<UpdateChallengeProgressMutation, UpdateChallengeProgressMutationVariables>;
export const RedeemRewardDocument = gql`
    mutation RedeemReward($userId: UUID!, $rewardId: UUID!, $rewardType: String!, $rewardValue: String!, $pointsSpent: Int!) {
  insertIntouser_redeemed_rewardsCollection(
    objects: [{user_id: $userId, reward_id: $rewardId, type: $rewardType, reward_value: $rewardValue, points_spent: $pointsSpent}]
  ) {
    records {
      id
      user_id
      reward_id
      type
      reward_value
      points_spent
      redeemed_at
      used
      created_at
    }
    affectedCount
  }
}
    `;
export type RedeemRewardMutationFn = MutationFunction<RedeemRewardMutation, RedeemRewardMutationVariables>;

/**
 * __useRedeemRewardMutation__
 *
 * To run a mutation, you first call `useRedeemRewardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRedeemRewardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [redeemRewardMutation, { data, loading, error }] = useRedeemRewardMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      rewardId: // value for 'rewardId'
 *      rewardType: // value for 'rewardType'
 *      rewardValue: // value for 'rewardValue'
 *      pointsSpent: // value for 'pointsSpent'
 *   },
 * });
 */
export function useRedeemRewardMutation(baseOptions?: MutationHookOptions<RedeemRewardMutation, RedeemRewardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<RedeemRewardMutation, RedeemRewardMutationVariables>(RedeemRewardDocument, options);
      }
export type RedeemRewardMutationHookResult = ReturnType<typeof useRedeemRewardMutation>;
export type RedeemRewardMutationResult = MutationResult<RedeemRewardMutation>;
export type RedeemRewardMutationOptions = BaseMutationOptions<RedeemRewardMutation, RedeemRewardMutationVariables>;
export const GetDailyNutritionLogsDocument = gql`
    query GetDailyNutritionLogs($userId: UUID!, $logDate: Date!) {
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
    query GetNutritionLogsByMeal($userId: UUID!, $logDate: Date!, $mealType: String!) {
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
export const UpdateNutritionDocument = gql`
    mutation UpdateNutrition($id: UUID!, $set: daily_nutrition_logsUpdateInput!) {
  updatedaily_nutrition_logsCollection(filter: {id: {eq: $id}}, set: $set) {
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
export type UpdateNutritionMutationFn = MutationFunction<UpdateNutritionMutation, UpdateNutritionMutationVariables>;

/**
 * __useUpdateNutritionMutation__
 *
 * To run a mutation, you first call `useUpdateNutritionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNutritionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNutritionMutation, { data, loading, error }] = useUpdateNutritionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateNutritionMutation(baseOptions?: MutationHookOptions<UpdateNutritionMutation, UpdateNutritionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<UpdateNutritionMutation, UpdateNutritionMutationVariables>(UpdateNutritionDocument, options);
      }
export type UpdateNutritionMutationHookResult = ReturnType<typeof useUpdateNutritionMutation>;
export type UpdateNutritionMutationResult = MutationResult<UpdateNutritionMutation>;
export type UpdateNutritionMutationOptions = BaseMutationOptions<UpdateNutritionMutation, UpdateNutritionMutationVariables>;
export const DeleteNutritionDocument = gql`
    mutation DeleteNutrition($id: UUID!) {
  deleteFromdaily_nutrition_logsCollection(filter: {id: {eq: $id}}) {
    records {
      id
    }
    affectedCount
  }
}
    `;
export type DeleteNutritionMutationFn = MutationFunction<DeleteNutritionMutation, DeleteNutritionMutationVariables>;

/**
 * __useDeleteNutritionMutation__
 *
 * To run a mutation, you first call `useDeleteNutritionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNutritionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNutritionMutation, { data, loading, error }] = useDeleteNutritionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteNutritionMutation(baseOptions?: MutationHookOptions<DeleteNutritionMutation, DeleteNutritionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return useMutation<DeleteNutritionMutation, DeleteNutritionMutationVariables>(DeleteNutritionDocument, options);
      }
export type DeleteNutritionMutationHookResult = ReturnType<typeof useDeleteNutritionMutation>;
export type DeleteNutritionMutationResult = MutationResult<DeleteNutritionMutation>;
export type DeleteNutritionMutationOptions = BaseMutationOptions<DeleteNutritionMutation, DeleteNutritionMutationVariables>;
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
        height
        weight
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
      height
      weight
      target_weight
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
        height
        weight
        target_weight
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
        height
        weight
        target_weight
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
    mutation UpdateUserProfile($userId: UUID!, $fullName: String, $username: String, $avatarUrl: String, $age: Int, $gender: String, $height: Float, $weight: Float, $targetWeight: Float, $onboardingCompleted: Boolean, $onboardingStep: Int) {
  updateprofilesCollection(
    filter: {id: {eq: $userId}}
    set: {full_name: $fullName, username: $username, avatar_url: $avatarUrl, age: $age, gender: $gender, height: $height, weight: $weight, target_weight: $targetWeight, onboarding_completed: $onboardingCompleted, onboarding_step: $onboardingStep}
  ) {
    records {
      id
      email
      full_name
      username
      avatar_url
      age
      gender
      height
      weight
      target_weight
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
 *      gender: // value for 'gender'
 *      height: // value for 'height'
 *      weight: // value for 'weight'
 *      targetWeight: // value for 'targetWeight'
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
    mutation CreateUserProfile($id: UUID!, $email: String!, $fullName: String, $age: Int, $gender: String, $height: Float, $weight: Float, $targetWeight: Float) {
  insertIntoprofilesCollection(
    objects: [{id: $id, email: $email, full_name: $fullName, age: $age, gender: $gender, height: $height, weight: $weight, target_weight: $targetWeight, onboarding_completed: false, onboarding_step: 0}]
  ) {
    records {
      id
      email
      full_name
      age
      gender
      height
      weight
      target_weight
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
 *      height: // value for 'height'
 *      weight: // value for 'weight'
 *      targetWeight: // value for 'targetWeight'
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