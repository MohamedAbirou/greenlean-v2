/**
 * Supabase Edge Function: Subscribe Newsletter
 * Handles newsletter subscription via Resend
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Store email in newsletter_subscribers table
    const { error: dbError } = await supabaseClient
      .from('newsletter_subscribers')
      .upsert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        source: 'footer_form',
        status: 'active',
      }, {
        onConflict: 'email'
      });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // 2. Send welcome email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'GreenLean <hello@greenlean.app>',
            to: [email],
            subject: 'Welcome to GreenLean Newsletter! 🌱',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GreenLean! 🌱</h1>
                  </div>

                  <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; margin-bottom: 20px;">
                      Thanks for subscribing to the GreenLean newsletter!
                    </p>

                    <p style="font-size: 16px; margin-bottom: 20px;">
                      You'll now receive:
                    </p>

                    <ul style="font-size: 16px; margin-bottom: 30px;">
                      <li>🥗 Healthy recipes and meal prep tips</li>
                      <li>💪 Workout plans and fitness advice</li>
                      <li>📊 Progress tracking strategies</li>
                      <li>🎯 Exclusive challenges and rewards</li>
                      <li>🚀 Product updates and new features</li>
                    </ul>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://greenlean.app/dashboard"
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                        Start Your Journey
                      </a>
                    </div>

                    <p style="font-size: 14px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      Not interested? <a href="{{unsubscribe_url}}" style="color: #667eea;">Unsubscribe here</a>
                    </p>
                  </div>
                </body>
              </html>
            `,
          }),
        });

        if (!resendResponse.ok) {
          console.error('Resend API error:', await resendResponse.text());
        } else {
          console.log('Welcome email sent via Resend');
        }
      } catch (resendError) {
        console.error('Failed to send welcome email:', resendError);
        // Don't fail the subscription if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed to newsletter',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to subscribe',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
