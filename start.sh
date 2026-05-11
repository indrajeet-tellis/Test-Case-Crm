#!/bin/sh
echo "Pushing database schema..."
npx prisma db push
echo "Seeding database..."
npx prisma db seed
echo "Starting application..."
exec node server.js
