#!/bin/sh
echo "--- STARTUP SCRIPT ---"
echo "DATABASE_URL is set: $(if [ -n "$DATABASE_URL" ]; then echo YES; else echo NO; fi)"

echo "Pushing database schema..."
npx prisma db push --accept-data-loss || echo "WARNING: prisma db push failed"

echo "Seeding admin user..."
NODE_PATH=/seed/node_modules node seed-prod.js || echo "WARNING: Seed script failed"

echo "Starting application..."
exec node server.js
