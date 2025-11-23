# Environment Setup Guide

## Creating the .env File

Since `.env` files are typically gitignored for security, you need to create it manually:

1. **Copy the example file:**
   ```bash
   # On Windows (PowerShell)
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

2. **Or create it manually:**
   Create a new file named `.env` in the root directory with this content:

   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="/JXdvtlBnawNg+eO6gneFzoR3l/k7F9sUvogD8vayvA="
   NEXTAUTH_URL="http://localhost:3000"
   ```

## Understanding DATABASE_URL

For **SQLite** (which we're using), the DATABASE_URL is simply a file path:

- **Format**: `file:./dev.db`
- **Meaning**: 
  - `file:` tells Prisma it's a SQLite database
  - `./dev.db` is the relative path where the database file will be created
  - The database file will be created in your project root directory

### How it works:
1. When you run `npx prisma db push`, Prisma will create a file called `dev.db` in your project root
2. This is a SQLite database file - it's a single file that contains all your data
3. No separate database server needed!

### If you want to use a different location:
- `file:./data/dev.db` - creates it in a `data` folder
- `file:./prisma/dev.db` - creates it in the `prisma` folder
- `file:C:/Users/Sagar/databases/one-last.db` - absolute path (Windows)
- `file:/home/user/databases/one-last.db` - absolute path (Linux/Mac)

### For production (PostgreSQL/MySQL):
If you later want to use a real database server, the URL format changes:
- PostgreSQL: `postgresql://user:password@localhost:5432/dbname`
- MySQL: `mysql://user:password@localhost:3306/dbname`

But for now, SQLite is perfect for development!

## Next Steps

After creating the `.env` file:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Create the database:**
   ```bash
   npx prisma db push
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

The database file (`dev.db`) will be automatically created when you run `npx prisma db push`.

