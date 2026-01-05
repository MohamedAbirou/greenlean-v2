/**
 * Food GraphQL Queries and Mutations
 */

import { gql } from '@apollo/client';

// Meal Templates
export const GET_USER_MEAL_TEMPLATES = gql`
  query GetUserMealTemplates($userId: UUID!) {
    meal_templatesCollection(
      filter: { user_id: { eq: $userId } }
      orderBy: [{ use_count: DescNullsLast }]
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
          total_fat
          meal_type
          is_favorite
          use_count
          created_at
          updated_at
        }
      }
    }
  }
`;

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
        total_fat: $totalFat
        meal_type: $mealType
        is_favorite: false
        use_count: 0
      }]
    ) {
      affectedCount
      records {
        id
        name
      }
    }
  }
`;

export const DELETE_MEAL_TEMPLATE = gql`
  mutation DeleteMealTemplate($id: UUID!) {
    deleteFrommeal_templatesCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`;

export const TOGGLE_TEMPLATE_FAVORITE = gql`
  mutation ToggleTemplateFavorite($id: UUID!, $isFavorite: Boolean!) {
    updatemeal_templatesCollection(
      filter: { id: { eq: $id } }
      set: { is_favorite: $isFavorite }
    ) {
      affectedCount
    }
  }
`;

export const INCREMENT_TEMPLATE_USE = gql`
  mutation IncrementTemplateUse($id: UUID!, $currentCount: Int!) {
    updatemeal_templatesCollection(
      filter: { id: { eq: $id } }
      set: { use_count: $currentCount }
    ) {
      affectedCount
    }
  }
`;