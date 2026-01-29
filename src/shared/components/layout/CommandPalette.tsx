/**
 * Command Palette Component (⌘K)
 * Power user feature for quick navigation and actions
 */

import { useTheme } from '@/core/providers/ThemeProvider';
import { useAuth } from '@/features/auth';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command';
import {
  Apple,
  CreditCard,
  Dumbbell,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Pizza,
  Settings,
  Sun,
  TrendingUp,
  Trophy,
  User
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
  keywords: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  // Global keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const runCommand = useCallback((commandAction: () => void) => {
    commandAction();
    onOpenChange(false);
  }, [onOpenChange]);

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Go to Home',
      icon: Home,
      action: () => runCommand(() => navigate('/')),
      category: 'navigation',
      keywords: ['home', 'landing'],
    },
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      icon: LayoutDashboard,
      action: () => runCommand(() => navigate('/dashboard')),
      category: 'navigation',
      keywords: ['dashboard', 'overview'],
    },
    {
      id: 'nav-diet',
      title: 'View Meal Plan',
      icon: Pizza,
      action: () => runCommand(() => navigate('/plans')),
      category: 'navigation',
      keywords: ['diet', 'meal', 'food', 'nutrition'],
    },
    {
      id: 'nav-workout',
      title: 'View Workout Plan',
      icon: Dumbbell,
      action: () => runCommand(() => navigate('/plans')),
      category: 'navigation',
      keywords: ['workout', 'exercise', 'training'],
    },
    {
      id: 'nav-challenges',
      title: 'View Challenges',
      icon: Trophy,
      action: () => runCommand(() => navigate('/challenges')),
      category: 'navigation',
      keywords: ['challenges', 'compete', 'rewards'],
    },
    {
      id: 'nav-profile',
      title: 'View Profile',
      icon: User,
      action: () => runCommand(() => navigate('/profile')),
      category: 'navigation',
      keywords: ['profile', 'account', 'me'],
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      icon: Settings,
      action: () => runCommand(() => navigate('/settings')),
      category: 'navigation',
      keywords: ['settings', 'preferences', 'config'],
    },

    // Quick Actions
    {
      id: 'action-log-meal',
      title: 'Log Meal',
      description: 'Quick add a meal to your diary',
      icon: Apple,
      action: () => runCommand(() => navigate('/dashboard/log-meal')),
      category: 'actions',
      keywords: ['log', 'meal', 'food', 'eat', 'nutrition'],
    },
    {
      id: 'action-log-workout',
      title: 'Log Workout',
      description: 'Record your completed workout',
      icon: Dumbbell,
      action: () => runCommand(() => navigate('/dashboard/log-workout')),
      category: 'actions',
      keywords: ['log', 'workout', 'exercise', 'train'],
    },
    {
      id: 'action-view-progress',
      title: 'View Progress',
      description: 'See your fitness journey',
      icon: TrendingUp,
      action: () => runCommand(() => navigate('/dashboard?tab=progress')),
      category: 'actions',
      keywords: ['progress', 'stats', 'weight', 'measurements'],
    },
    // {
    //   id: 'action-generate-plan',
    //   title: 'Generate New Meal Plan',
    //   description: 'Create a fresh meal plan with AI',
    //   icon: Calendar,
    //   action: () => runCommand(() => navigate('/quiz?action=generate-meal-plan')),
    //   category: 'actions',
    //   keywords: ['generate', 'plan', 'meal', 'ai', 'create'],
    // },

    // Settings
    {
      id: 'settings-theme-toggle',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark')),
      category: 'settings',
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
    {
      id: 'settings-billing',
      title: 'Billing & Subscription',
      description: 'Manage subscription and payment',
      icon: CreditCard,
      action: () => runCommand(() => navigate('/settings')),
      category: 'settings',
      keywords: ['billing', 'subscription', 'payment', 'upgrade'],
    },
    // {
    //   id: 'settings-help',
    //   title: 'Help & Support',
    //   description: 'Get help or contact support',
    //   icon: HelpCircle,
    //   action: () => runCommand(() => navigate('/help')),
    //   category: 'settings',
    //   keywords: ['help', 'support', 'faq', 'contact'],
    // },
  ];

  // Add sign out only if user is logged in
  if (user) {
    commands.push({
      id: 'settings-logout',
      title: 'Sign Out',
      icon: LogOut,
      action: () => runCommand(() => signOut()),
      category: 'settings',
      keywords: ['logout', 'sign out', 'exit'],
    });
  }

  const navigationCommands = commands.filter((c) => c.category === 'navigation');
  const actionCommands = commands.filter((c) => c.category === 'actions');
  const settingsCommands = commands.filter((c) => c.category === 'settings');

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command loop={true}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {navigationCommands.length > 0 && (
            <>
              <CommandGroup heading="Navigation">
                {navigationCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={command.action}
                    onClick={command.action}
                    className="cursor-pointer"
                  >
                    <command.icon className="mr-2 h-4 w-4" />
                    <span>{command.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {actionCommands.length > 0 && (
            <>
              <CommandGroup heading="Quick Actions">
                {actionCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={command.action}
                    onClick={command.action}
                    className="cursor-pointer"
                  >
                    <command.icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{command.title}</span>
                      {command.description && (
                        <span className="text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {settingsCommands.length > 0 && (
            <CommandGroup heading="Settings">
              {settingsCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={command.action}
                  onClick={command.action}
                  className="cursor-pointer"
                >
                  <command.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{command.title}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">
                        {command.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
