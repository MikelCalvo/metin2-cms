import { defineConfig } from "drizzle-kit";

const connectionString = process.env.CMS_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set CMS_DATABASE_URL or DATABASE_URL before running Drizzle commands.");
}

export default defineConfig({
  dialect: "mysql",
  schema: "./src/lib/db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
