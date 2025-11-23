# One Last - Life Balance Tracker

A comprehensive application to help users balance College, Work, and Life activities with intelligent tracking, analytics, and personalized recommendations.

## Features

- **Three Module System**: Track tasks across College, Work, and Life
- **Balance Score**: Single metric to track overall equilibrium
- **Time Tracking**: Real-time session tracking with module and task selection
- **Analytics & Visualizations**: Weekly, monthly, and custom date range insights
- **Personalized Recommendations**: AI-powered suggestions for better balance
- **Export Options**: CSV/JSON reports for mentors and self-review
- **GitHub OAuth**: Sign in with GitHub or email/password
- **Calendar View**: Color-coded monthly calendar with task deadlines

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Create a `.env` file with:
```
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your_github_client_id" (optional)
GITHUB_CLIENT_SECRET="your_github_client_secret" (optional)
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM) - supports SQLite for development
- **Authentication**: NextAuth.js (Email/Password + GitHub OAuth)
- **Charts**: Recharts
- **Export**: CSV/JSON
