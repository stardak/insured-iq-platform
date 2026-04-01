import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env is used instead of the strict env() helper so that
    // `prisma generate` works without a DATABASE_URL (it doesn't need one).
    // Commands that require a connection (migrate, db push) will fail
    // explicitly if the var is missing.
    url: process.env.DATABASE_URL ?? "",
  },
});
