/**
 * Auth Callback Page
 * Handles email verification and auto-login
 */

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'checking' | 'error'>('verifying');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session from URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error during auth callback:', sessionError);
          setStatus('error');
          toast.error('Failed to confirm your email. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!session) {
          console.log('No session found');
          navigate('/login');
          return;
        }

        const user = session.user;

        if (!user) {
          setStatus('error');
          toast.error('No user session found. Please try signing in.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Email verified! User is now logged in automatically
        setStatus('checking');

        // Check if this is a Google OAuth user with a profile picture
        if (user.app_metadata.provider === 'google' && user.user_metadata.avatar_url) {
          console.log('Google OAuth user detected with avatar:', user.user_metadata.avatar_url);

          // Check current profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', user.id)
            .single();

          // Only update if profile doesn't have an avatar yet
          if (!profile?.avatar_url) {
            console.log('Syncing Google profile picture...');

            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                avatar_url: user.user_metadata.avatar_url,
                full_name: user.user_metadata.full_name || profile?.full_name,
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Failed to sync Google avatar:', updateError);
            } else {
              console.log('✅ Google profile picture synced successfully');
            }
          }
        }

        // Initialize user_rewards if needed
        const { data: existing } = await supabase
          .from('user_rewards')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('user_rewards').insert({
            user_id: user.id,
            points: 0,
            lifetime_points: 0,
          });
          console.log('✅ user_rewards record created');
        }

        // Check onboarding status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Error loading profile. Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // Decide where to redirect based on onboarding status
        if (!profileData || !profileData.onboarding_completed) {
          toast.success('Email confirmed! Let\'s complete your profile setup.');
          setTimeout(() => navigate('/onboarding'), 1000);
        } else {
          toast.success('Welcome back! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setStatus('error');
        toast.error('An unexpected error occurred. Please try signing in.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        {/* Loading Spinner */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>

        {/* Status Messages */}
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          {status === 'verifying' && 'Verifying Your Email'}
          {status === 'checking' && 'Setting Up Your Account'}
          {status === 'error' && 'Something Went Wrong'}
        </h2>
        <p className="text-muted-foreground">
          {status === 'verifying' && 'Please wait while we confirm your email address...'}
          {status === 'checking' && 'Almost done! Setting things up for you...'}
          {status === 'error' && 'Redirecting you to try again...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
