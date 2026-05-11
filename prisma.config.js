// This file is used by Prisma to configure migrations and seeding.
// We use a plain JS file to avoid dependency issues in the production container.
module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};
