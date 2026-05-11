#!/bin/sh
set -e

echo "--- STARTUP SCRIPT ---"
echo "DATABASE_URL is set: $(if [ -n "$DATABASE_URL" ]; then echo "YES"; else echo "NO"; fi)"

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
exec node server.js
