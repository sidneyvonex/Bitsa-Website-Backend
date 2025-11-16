import  "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./Src/drizzle/schema.ts",
    out: "./Src/drizzle/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
    verbose: true,
    strict: true,
});