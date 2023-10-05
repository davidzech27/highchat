import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
// import { createClient } from "@libsql/client/web"

import env from "~/env.mjs"

const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.DATABASE_AUTH_TOKEN,
})

const db = drizzle(client)

export default db
