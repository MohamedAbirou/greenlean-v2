/**
 * GraphQL-based Profile Hook
 * Replaces useProfile with Apollo Client GraphQL queries
 */

import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserAvatarMutation,
  useDeleteUserAvatarMutation,
} from '@/generated/graphql';
import { supabase } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';

export const useProfileGraphQL = (userId: string | undefined) => {
  // Fetch profile with subscription data
  const {
    data: profileData,
    loading: isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery({
    variables: { userId: userId! },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  // Update profile mutation
  const [updateProfileMutation, { loading: isUpdating }] =
    useUpdateUserProfileMutation({
      refetchQueries: ['GetUserProfile'],
    });

  // Update avatar mutation (GraphQL - only updates DB)
  const [updateAvatarUrlMutation] = useUpdateUserAvatarMutation({
    refetchQueries: ['GetUserProfile'],
  });

  // Delete avatar mutation (GraphQL - only updates DB)
  const [deleteAvatarUrlMutation] = useDeleteUserAvatarMutation({
    refetchQueries: ['GetUserProfile'],
  });

  // Extract profile from GraphQL response
  const profile = profileData?.profilesCollection?.edges?.[0]?.node ?? null;

  /**
   * Update profile
   */
  const updateProfile = async (updates: Record<string, any>) => {
    if (!userId) throw new Error('User ID is required');

    await updateProfileMutation({
      variables: {
        userId,
        fullName: updates.full_name,
        username: updates.username,
        avatarUrl: updates.avatar_url,
        age: updates.age,
        dateOfBirth: updates.date_of_birth,
        gender: updates.gender,
        country: updates.country,
        heightCm: updates.height_cm,
        weightKg: updates.weight_kg,
        targetWeightKg: updates.target_weight_kg,
        unitSystem: updates.unit_system,
        occupationActivity: updates.occupation_activity,
        onboardingCompleted: updates.onboarding_completed,
        onboardingStep: updates.onboarding_step,
      },
    });
  };

  /**
   * Upload avatar to Supabase Storage and update profile
   * Storage operations can't be done via GraphQL, so we use Supabase client
   */
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!userId) throw new Error('User ID is required');

    // Compress the image
    const options = {
      maxSizeMB: 0.1, // 100KB max
      maxWidthOrHeight: 400,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // Upload to Supabase Storage
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, compressedFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Update profile with new avatar URL using GraphQL
    await updateAvatarUrlMutation({
      variables: {
        userId,
        avatarUrl: data.publicUrl,
      },
    });

    return data.publicUrl;
  };

  /**
   * Delete avatar from Storage and update profile
   */
  const deleteAvatar = async (avatarUrl: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    // Delete from Supabase Storage
    const path = avatarUrl.split('/avatars/')[1];
    if (path) {
      await supabase.storage.from('avatars').remove([`avatars/${path}`]);
    }

    // Update profile to remove avatar URL using GraphQL
    await deleteAvatarUrlMutation({
      variables: {
        userId,
      },
    });
  };

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dob: string | Date): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Calculate date of birth from age
   */
  const calculateDOB = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${birthYear}-${month}-${day}`;
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile,
    isUpdating,
    uploadAvatar,
    deleteAvatar,
    calculateAge,
    calculateDOB,
  };
};
