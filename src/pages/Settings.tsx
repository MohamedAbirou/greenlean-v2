/**
 * Settings Page - Complete Account Management
 * Tabs: Account, Profile, Billing, Preferences, Notifications, Privacy
 */

import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Palette,
  Settings as SettingsIcon,
  Shield,
  Ticket,
  User,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Tab components
import { AvatarCustomizer, CouponManager, ThemeSelector } from '@/features/rewards';
import { AccountTab } from '@/features/settings/components/AccountTab';
import { BillingTab } from '@/features/settings/components/BillingTab';
import { NotificationsTab } from '@/features/settings/components/NotificationsTab';
import { PreferencesTab } from '@/features/settings/components/PreferencesTab';
import { PrivacyTab } from '@/features/settings/components/PrivacyTab';
import { ProfileTab } from '@/features/settings/components/ProfileTab';

const TABS = [
  { value: 'account', label: 'Account', icon: User },
  { value: 'profile', label: 'Profile', icon: UserCircle },
  { value: 'billing', label: 'Billing', icon: CreditCard },
  { value: 'preferences', label: 'Preferences', icon: SettingsIcon },
  { value: 'appearance', label: 'Appearance', icon: Palette },
  { value: 'coupons', label: 'Coupons', icon: Ticket },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'privacy', label: 'Privacy', icon: Shield },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access settings</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, subscription, and preferences
          </p>
        </motion.div>

        {/* Desktop: Side-by-side layout */}
        <div className="hidden md:grid md:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar */}
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all text-left
                    ${isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div>
            {activeTab === 'account' && <AccountTab />}
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'billing' && <BillingTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'appearance' && (
              <Card className="p-0">
                <CardContent className="py-6 space-y-8">
                  <ThemeSelector />

                  <hr className="border-border" />

                  <AvatarCustomizer />
                </CardContent>
              </Card>
            )}
            {activeTab === 'coupons' && (
              <Card className="p-0">
                <CardContent className="py-6">
                  <CouponManager />
                </CardContent>
              </Card>
            )}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
          </div>
        </div>

        {/* Mobile: Tabs layout */}
        <div className="md:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 mt-2">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="account">
                <AccountTab />
              </TabsContent>
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="billing">
                <BillingTab />
              </TabsContent>
              <TabsContent value="preferences">
                <PreferencesTab />
              </TabsContent>
              <TabsContent value="appearance">
                <Card className="p-0">
                  <CardContent className="py-6 space-y-8">
                    <ThemeSelector />

                    <hr className="border-border" />

                    <AvatarCustomizer />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="coupons">
                <Card className="p-0">
                  <CardContent className="py-6">
                    <CouponManager />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsTab />
              </TabsContent>
              <TabsContent value="privacy">
                <PrivacyTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
