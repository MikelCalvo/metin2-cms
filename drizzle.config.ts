import { defineConfig } from "drizzle-kit";

const connectionString = process.env.CMS_DATABASE_URL;

if (!connectionString) {
  throw new Error("Set CMS_DATABASE_URL before running Drizzle commands.");
}

export default defineConfig({
  dialect: "mysql",
  schema: "./src/lib/db/schema/cms.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
});
