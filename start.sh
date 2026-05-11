#!/bin/sh
echo "--- STARTUP SCRIPT ---"
echo "DATABASE_URL is set: $(if [ -n "$DATABASE_URL" ]; then echo "YES"; else echo "NO"; fi)"

echo "Pushing database schema..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
  echo "WARNING: prisma db push failed, continuing..."
fi

echo "Seeding database..."
npx prisma db seed || echo "WARNING: Seeding failed or already seeded, continuing..."

echo "Starting application..."
exec node server.js
