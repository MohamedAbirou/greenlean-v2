/**
 * GreenLean Navbar V2 - Complete Redesign
 * Premium UX with glassmorphism, command palette, and modern interactions
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BookOpenText,
  Crown,
  HelpCircle,
  Home,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Tags,
  Trophy,
  User,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useTheme } from '@/core/providers/ThemeProvider';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/shared/components/NotificationCenter';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { UserAvatar } from '../ui/UserAvatar';

interface NavbarProps {
  onCommandPaletteOpen?: () => void;
}

interface Profile {
  avatar_url: string | null;
  avatar_frame: string | null;
  full_name: string | null;
  username: string | null;
}

interface Subscription {
  tier: 'free' | 'pro' | 'premium';
  status: string;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plans', href: '/plans', icon: BookOpenText },
  { name: 'Challenges', href: '/challenges', icon: Trophy },
  { name: 'Pricing', href: '/pricing', icon: Tags },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export function Navbar({ onCommandPaletteOpen }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Glassmorphism effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile and subscription
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, avatar_frame, full_name, username')
          .eq('id', user.id)
          .single();

        setProfile(profileData);

        // Fetch subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('tier, status')
          .eq('user_id', user.id)
          .single();

        setSubscription(subscriptionData || { tier: 'free', status: 'active' });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'premium';
  const isPremium = subscription?.tier === 'premium';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={false}
        style={{
          backdropFilter: isScrolled ? 'blur(8px)' : 'blur(0px)',
          WebkitBackdropFilter: isScrolled ? 'blur(8px)' : 'blur(0px)',
        }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300',
          isScrolled
            ? 'bg-background/80 shadow-lg border-border/50'
            : 'bg-background/80 border-border/50'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <Leaf className='text-primary' />
                </div>
              </motion.div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary">
                  GreenLean
                </span>
                {isPremium && (
                  <Badge variant="accent" className='hidden md:flex'>
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'relative text-foreground',
                        isActive && 'text-primary-600 dark:text-primary-400'
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1">
              {/* Command Palette Trigger (Desktop) */}
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCommandPaletteOpen}
                  className="hidden lg:flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">Search...</span>
                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 text-xs font-medium text-card-foreground bg-card">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              )}

              {/* Notifications */}
              {user && <NotificationCenter />}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 gap-2 px-2">
                      <UserAvatar
                        src={profile?.avatar_url}
                        fallback={getInitials()}
                        frameId={profile?.avatar_frame || 'default'}
                        username={profile?.username}
                        size="sm"
                        showFrame={true}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {profile?.full_name || profile?.username || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                        {(subscription && subscription.tier !== 'free') && (
                          <Badge
                            variant={isPremium ? 'accent' : isPro ? 'tip' : 'outline'}
                            className="w-fit mt-1"
                          >
                            {subscription.tier === 'pro' ? (
                              <>
                                <Zap className="w-3 h-3 mr-1" />
                                Pro
                              </>
                            ) : (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/notifications" className="cursor-pointer">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {!isPro && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/pricing"
                            className="cursor-pointer text-primary-600 dark:text-primary-400"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Pro
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/help" className="cursor-pointer">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help & Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
            >
              <div className="px-4 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start',
                          isActive && 'bg-primary/20 text-primary'
                        )}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                {!user && (
                  <div className="pt-4 flex flex-col space-y-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
}
