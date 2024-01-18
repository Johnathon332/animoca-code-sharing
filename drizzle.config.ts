// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/drizzle/schema",
  out: "./migrations",
} satisfies Config;
