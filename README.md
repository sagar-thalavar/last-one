# One Last - Life Balance Tracker

A comprehensive application to help users balance College, Work, and Life activities with intelligent tracking, analytics, and personalized recommendations.

## Features

- **Three Module System**: Track tasks across College, Work, and Life
- **Balance Score**: Single metric to track overall equilibrium
- **Time Tracking**: Manual and automatic logging of activities
- **Analytics & Visualizations**: Weekly and monthly insights
- **Personalized Recommendations**: AI-powered suggestions for better balance
- **Export Options**: CSV/PDF reports for mentors and self-review

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
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Export**: jsPDF

