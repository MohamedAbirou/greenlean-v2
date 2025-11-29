/**
 * Auth Callback Page
 * Handles email verification and auto-login
 */

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'checking' | 'error'>('verifying');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after email confirmation
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error during auth callback:', sessionError);
          setStatus('error');
          toast.error('Failed to confirm your email. Please try again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const user = sessionData?.session?.user;
        if (!user) {
          setStatus('error');
          toast.error('No user session found. Please try signing in.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Email verified! User is now logged in automatically
        setStatus('checking');

        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Error loading profile. Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // Decide where to redirect based on onboarding status
        if (!profile || !profile.onboarding_completed) {
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
