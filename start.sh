#!/bin/sh
echo "Pushing database schema..."
npx prisma db push
echo "Starting application..."
exec node server.js
