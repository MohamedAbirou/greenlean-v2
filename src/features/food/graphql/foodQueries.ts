/**
 * Food GraphQL Queries and Mutations - UPDATED
 * Fixed to match actual database schema
 */

import { gql } from '@apollo/client';

// ============================================================================
// MEAL TEMPLATES QUERIES
// ============================================================================

/**
 * Get all meal templates for a user
 * Sorted by use_count (most used first) and created_at (newest first)
 */
export const GET_USER_MEAL_TEMPLATES = gql`
  query GetUserMealTemplates($userId: UUID!) {
    meal_templatesCollection(
      filter: { user_id: { eq: $userId } }
      orderBy: [
        { use_count: DescNullsLast }
        { created_at: DescNullsLast }
      ]
    ) {
      edges {
        node {
          id
          user_id
          name
          description
          foods
          total_calories
          total_protein
          total_carbs
          total_fats
          meal_type
          is_favorite
          use_count
          last_used_at
          created_at
          updated_at
        }
      }
    }
  }
`;

/**
 * Get favorite templates only
 */
export const GET_FAVORITE_TEMPLATES = gql`
  query GetFavoriteTemplates($userId: UUID!) {
    meal_templatesCollection(
      filter: { 
        user_id: { eq: $userId }
        is_favorite: { eq: true }
      }
      orderBy: [{ use_count: DescNullsLast }]
    ) {
      edges {
        node {
          id
          name
          description
          foods
          total_calories
          total_protein
          total_carbs
          total_fats
          meal_type
          is_favorite
          use_count
          created_at
        }
      }
    }
  }
`;

/**
 * Get templates by meal type
 */
export const GET_TEMPLATES_BY_MEAL_TYPE = gql`
  query GetTemplatesByMealType($userId: UUID!, $mealType: String!) {
    meal_templatesCollection(
      filter: { 
        user_id: { eq: $userId }
        meal_type: { eq: $mealType }
      }
      orderBy: [{ use_count: DescNullsLast }]
    ) {
      edges {
        node {
          id
          name
          description
          foods
          total_calories
          total_protein
          total_carbs
          total_fats
          meal_type
          is_favorite
          use_count
          created_at
        }
      }
    }
  }
`;

// ============================================================================
// MEAL TEMPLATES MUTATIONS
// ============================================================================

/**
 * Create a new meal template
 */
export const CREATE_MEAL_TEMPLATE = gql`
  mutation CreateMealTemplate(
    $userId: UUID!
    $name: String!
    $description: String
    $foods: JSON!
    $totalCalories: Float!
    $totalProtein: Float!
    $totalCarbs: Float!
    $totalFat: Float!
    $mealType: String
  ) {
    insertIntomeal_templatesCollection(
      objects: [{
        user_id: $userId
        name: $name
        description: $description
        foods: $foods
        total_calories: $totalCalories
        total_protein: $totalProtein
        total_carbs: $totalCarbs
        total_fats: $totalFat
        meal_type: $mealType
        is_favorite: false
        use_count: 0
      }]
    ) {
      affectedCount
      records {
        id
        name
        created_at
      }
    }
  }
`;

/**
 * Update template name/description
 */
export const UPDATE_MEAL_TEMPLATE = gql`
  mutation UpdateMealTemplate(
    $id: UUID!
    $name: String
    $description: String
  ) {
    updatemeal_templatesCollection(
      filter: { id: { eq: $id } }
      set: {
        name: $name
        description: $description
      }
    ) {
      affectedCount
      records {
        id
        name
        description
        updated_at
      }
    }
  }
`;

/**
 * Delete a meal template
 */
export const DELETE_MEAL_TEMPLATE = gql`
  mutation DeleteMealTemplate($id: UUID!) {
    deleteFrommeal_templatesCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`;

/**
 * Toggle favorite status
 */
export const TOGGLE_TEMPLATE_FAVORITE = gql`
  mutation ToggleTemplateFavorite($id: UUID!, $isFavorite: Boolean!) {
    updatemeal_templatesCollection(
      filter: { id: { eq: $id } }
      set: { is_favorite: $isFavorite }
    ) {
      affectedCount
      records {
        id
        is_favorite
      }
    }
  }
`;

/**
 * Increment template use count and update last_used_at
 */
export const INCREMENT_TEMPLATE_USE = gql`
  mutation IncrementTemplateUse($id: UUID!, $currentCount: Int!) {
    updatemeal_templatesCollection(
      filter: { id: { eq: $id } }
      set: { 
        use_count: $currentCount
        last_used_at: "now()"
      }
    ) {
      affectedCount
      records {
        id
        use_count
        last_used_at
      }
    }
  }
`;