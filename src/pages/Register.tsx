/**
 * Register Page V2 - Premium SaaS Design
 * Simple registration - just email & password
 * Onboarding handles the rest
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, Eye, EyeOff, Inbox, Leaf, Lock, Mail, Sparkles, User } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const features = [
  'AI-powered meal plans',
  'Custom workout routines',
  'Progress tracking',
  'Community challenges',
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp, user, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      const result = await signUp({
        email,
        password,
        fullName: fullName.trim() || 'User',
        username
      });

      if (result.success) {
        setEmailSent(true);
      } else {
        toast.error(result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.');
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form or Email Verification Message */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <AnimatePresence mode="wait">
          {!emailSent ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              {/* Logo */}
              <div className="text-center mb-8">
                <Link to="/">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
                    <Leaf className="w-8 h-8 text-primary-foreground" />
                  </div>
                </Link>
                <h1 className="text-3xl font-bold mb-2">Join GreenLean</h1>
                <p className="text-muted-foreground">Start your personalized health journey today</p>
              </div>

              {/* Register Card */}
              <Card className="shadow-xl">
                <CardHeader>
                  <Button
                    onClick={handleGoogle}
                    size="sm"
                    className='bg-white hover:bg-primary-50 text-black mb-3'
                  >
                    <img src="/images/Google__G__logo.svg.png" alt="" className="w-5 h-5" />
                    Sign up with Google
                  </Button>
                </CardHeader>
                <CardContent className='px-0 md:px-6'>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Field (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          required
                          disabled={loading}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 py-2">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-primary hover:text-primary/80 font-semibold"
                    >
                      Sign in
                    </button>
                  </div>
                </CardFooter>
              </Card>

              {/* Trust Badge */}
              <div className="mt-6 text-center">
                <Badge variant="outline" className="badge-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Join 50,000+ users transforming their health
                </Badge>
              </div>
            </motion.div>
          ) : (
            /* Email Verification Success Message */
            <motion.div
              key="email-sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="shadow-xl border-2 border-primary/20">
                <CardContent className="pt-8 pb-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                  >
                    <Inbox className="w-10 h-10 text-primary" />
                  </motion.div>

                  <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
                  <p className="text-muted-foreground mb-6">
                    We've sent a verification link to
                  </p>
                  <p className="text-foreground font-semibold mb-6 break-all px-4">
                    {email}
                  </p>

                  <div className="bg-primary/5 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3 text-left">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">What's next?</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>1. Click the verification link in your email</li>
                          <li>2. You'll be automatically signed in</li>
                          <li>3. Complete your profile setup</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Didn't receive the email? Check your spam folder or
                  </p>

                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Try Again
                  </Button>

                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/login')}
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      Already verified? Sign in →
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side - Features Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero-light dark:bg-gradient-hero-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Transform Your Health
            <br />
            <span className="text-gradient">With AI Guidance</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get started in minutes with personalized AI-powered meal plans, fitness guidance, and expert support.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl glass"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-foreground font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { label: 'Active Users', value: '50K+' },
              { label: 'Success Rate', value: '94%' },
              { label: 'Avg. Weight Loss', value: '12kg' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
