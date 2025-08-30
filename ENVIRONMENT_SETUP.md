# Environment Variables Setup

This project requires environment variables to connect to external services. Follow these steps to set them up:

## Step 1: Create Environment File

1. Copy `.env.local.example` to `.env.local`:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Or create `.env.local` manually in the root directory

## Step 2: Required Environment Variables

### Supabase Configuration (Required)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Key (anon public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## Step 3: Optional Environment Variables

### WhatsApp Integration (Optional)

Set a default WhatsApp business phone number:

\`\`\`env
WHATSAPP_PHONE_NUMBER=8801902637437
\`\`\`

**Note:** This can be overridden through the admin panel WhatsApp settings. Use international format with country code (e.g., 880 for Bangladesh).

### Vercel Analytics (Optional)

Automatically configured when deployed to Vercel. For custom configurations:

\`\`\`env
VERCEL_ANALYTICS_ID=your-analytics-id
\`\`\`

## Step 4: Restart Development Server

After adding environment variables, restart your development server:

\`\`\`bash
npm run dev
\`\`\`

## Alternative: Add via Vercel Project Settings

If you're using Vercel, you can also add environment variables through the Project Settings:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add the required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `WHATSAPP_PHONE_NUMBER` (optional)

## Future Integrations

The `.env.local.example` file includes placeholders for future integrations:

- **Email Services** (SMTP, SendGrid, Resend) - for order confirmations
- **Payment Gateways** (Stripe, bKash, Nagad) - for online payments
- **Image Storage** (Cloudinary, Imgur) - for direct API integration
- **SMS Services** (Twilio, Vonage) - for order notifications

## Important Notes

- `.env.local` is already in `.gitignore` and won't be committed to version control
- Supabase variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- Never commit your actual API keys to version control
- The app includes graceful degradation and will show mock data if Supabase isn't configured

## Verification

### Supabase Connection
If configured correctly, your app should connect to Supabase and display real product data. If not configured, it will show placeholder content without errors.

### WhatsApp Integration
- The WhatsApp float button will use the configured phone number
- Admin panel allows overriding the phone number through database settings
- Test the integration using the test button in admin panel

## Troubleshooting

### Common Issues:

1. **Supabase connection fails:**
   - Verify URL format: `https://your-project-id.supabase.co`
   - Check that API key is the "anon public" key, not the service role key
   - Ensure no trailing spaces in environment variables

2. **WhatsApp button not working:**
   - Verify phone number format includes country code
   - Test the number manually by opening WhatsApp web
   - Check admin panel WhatsApp settings

3. **Environment variables not loading:**
   - Restart development server after changes
   - Verify `.env.local` is in the root directory (same level as `package.json`)
   - Check for typos in variable names

### Getting Help:

- Check the browser console for error messages
- Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
- Review Supabase project settings and RLS policies
