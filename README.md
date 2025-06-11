# Marketing Automator

A comprehensive marketing automation platform that integrates Canva, Notion, GitHub, Mailchimp, and OpenAI to streamline campaign creation and distribution.

## Features

- **Multi-Service Integration**: Connect Canva, Notion, GitHub, Mailchimp, and OpenAI in one platform
- **Automated Campaign Creation**: Generate marketing campaigns from Canva designs
- **AI-Powered Content**: Use OpenAI to generate optimized email and landing page content
- **Multi-Channel Distribution**: Distribute campaigns to email, Notion databases, and GitHub Pages
- **Secure Authentication**: Built on Supabase with row-level security
- **Modern UI**: Clean, responsive interface built with Next.js and Shadcn UI

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend**: Supabase (Auth & Database)
- **AI**: OpenAI GPT-4 via Vercel AI SDK
- **Integrations**: Canva OAuth 2.0, Notion API, GitHub API, Mailchimp API v3

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   NEXT_PUBLIC_CANVA_CLIENT_ID=your-canva-client-id
   CANVA_CLIENT_SECRET=your-canva-secret
   CANVA_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback/canva
   
   NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
   ```

4. Run database migrations:
   ```bash
   npx supabase db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (use 127.0.0.1, not localhost)

## Usage

1. **Register/Login**: Create an account or sign in
2. **Connect Services**: Go to Settings and connect your integrations:
   - Notion: Add your Integration Token
   - GitHub: Add username and Personal Access Token
   - Mailchimp: Add API key and server prefix
   - OpenAI: Add your API key
   - Canva: Connect via OAuth
3. **Create Campaigns**: Select Canva designs from the dashboard and distribute to multiple channels

## Project Structure

```
/app              # Next.js App Router pages
/app/src          # Source code
  /components     # UI components
  /contexts       # React contexts
  /hooks          # Custom hooks
  /lib            # Utilities and configs
  /services       # API service layers
/supabase         # Database migrations
/components       # Shadcn UI components
```

## Security

- All API keys are stored securely in Supabase
- Row Level Security (RLS) enabled on all tables
- OAuth 2.0 with PKCE for Canva integration
- Server-side only API calls

## License

MIT