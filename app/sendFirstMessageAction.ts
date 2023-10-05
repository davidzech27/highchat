"use server"
import { cookies } from "next/headers"
// import { revalidatePath } from "next/cache"
import { z } from "zod"
import { zact } from "zact/server"
import { sql } from "drizzle-orm"
import Pusher from "pusher"

import db from "~/database/db"
import { user, message } from "~/database/schema"
import env from "~/env.mjs"

const sendFirstMessageAction = zact(z.object({ content: z.string() }))(
	async ({ content }) => {
		// revalidatePath("/")

		const [userId, id] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(user)
				.then(([row]) => row?.count),
			db
				.select({ count: sql<number>`count(*)` })
				.from(message)
				.then(([row]) => row?.count),
		])

		if (userId === undefined || id === undefined)
			throw new Error("Failed counting number of users or messages")

		cookies().set("user_id", userId?.toString(), {
			httpOnly: true,
			sameSite: true,
			expires: new Date().valueOf() + 1000 * 60 * 60 * 24 * 400,
			secure: env.NODE_ENV === "production",
		})

		const sentAt = new Date()

		new Pusher({
			appId: env.SOKETI_APP_ID,
			key: env.NEXT_PUBLIC_SOKETI_APP_KEY,
			secret: env.SOKETI_APP_SECRET,
			useTLS: true,
			host: env.NEXT_PUBLIC_SOKETI_HOST,
			port: env.NEXT_PUBLIC_SOKETI_PORT.toString(),
		}).trigger("chat", "message", {
			id,
			userId,
			content,
			sentAt,
		})

		await Promise.all([
			db.insert(user).values({
				id: userId,
				createdAt: new Date(),
			}),
			db.insert(message).values({
				id,
				userId,
				content,
				sentAt,
			}),
		])
	}
)

export default sendFirstMessageAction
