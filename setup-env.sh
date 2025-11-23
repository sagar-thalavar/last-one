#!/bin/bash
# Bash script to create .env file
# Run this with: bash setup-env.sh

cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="/JXdvtlBnawNg+eO6gneFzoR3l/k7F9sUvogD8vayvA="
NEXTAUTH_URL="http://localhost:3000"
EOF

echo ".env file created successfully!"
echo ""
echo "DATABASE_URL Explanation:"
echo "  - For SQLite, this is just a file path"
echo "  - 'file:./dev.db' means the database will be created as 'dev.db' in the project root"
echo "  - When you run 'npx prisma db push', Prisma will create this file automatically"
echo "  - No database server needed - SQLite is a file-based database!"

