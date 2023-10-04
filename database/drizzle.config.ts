import type { Config } from "drizzle-kit"
import "dotenv/config"
import { join } from "path"
import { z } from "zod"

export default {
	schema: join(__dirname, "schema.ts"),
	dbCredentials: {
		url: z.string().url().parse(process.env.DATABASE_URL),
		authToken: z.string().parse(process.env.DATABASE_AUTH_TOKEN),
	},
	driver: "turso",
} satisfies Config
