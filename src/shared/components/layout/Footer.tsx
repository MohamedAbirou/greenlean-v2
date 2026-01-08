/**
 * GreenLean Footer V2 - Complete Redesign
 * Modern footer with newsletter, social links, and comprehensive navigation
 */

import { supabase } from '@/lib/supabase';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Facebook, Github, Heart, Instagram, Leaf, Twitter } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const footerLinks = {
  product: [
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profile', href: '/profile' },
  ],
  features: [
    { name: 'Challenges', href: '/challenges' },
    { name: 'Progress Tracking', href: '/profile' },
    { name: 'AI Plans', href: '/plans' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/greenlean', color: '#1DA1F2' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/greenlean', color: '#E4405F' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/greenlean', color: '#1877F2' },
  { name: 'GitHub', icon: Github, href: 'https://github.com/MohamedAbirou/greenlean-v2', color: '#333' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email },
      });

      if (error) throw error;

      toast.success("Subscribed! Check your email for confirmation.");
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Top Section - Newsletter */}
        <div className="mb-12 pb-12 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay updated</h3>
              <p className="text-muted-foreground">
                Get the latest health tips, recipes, and workout plans delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-foreground/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-foreground/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Features</h4>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-foreground/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-foreground/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright & Social */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GreenLean. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground mr-2">
              Made with <Heart className="w-4 h-4 inline text-error fill-error" /> by the GreenLean team
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
