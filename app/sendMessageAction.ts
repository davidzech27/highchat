"use server"
import { cookies } from "next/headers"
import { z } from "zod"
import { zact } from "zact/server"
import { sql } from "drizzle-orm"
import Pusher from "pusher"

import db from "~/database/db"
import { message } from "~/database/schema"
import env from "~/env.mjs"

const sendMessageAction = zact(z.object({ content: z.string() }))(
	async ({ content }) => {
		const userIdString = cookies().get("user_id")?.value

		const userId =
			userIdString !== undefined ? Number(userIdString) : undefined

		if (userId === undefined) throw new Error("Unauthenticated")

		const id = (
			await db.select({ count: sql<number>`count(*)` }).from(message)
		)[0]?.count

		if (id === undefined)
			throw new Error("Failed counting number of messages")

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

		await db.insert(message).values({
			id,
			userId,
			content,
			sentAt,
		})

		return {
			id,
		}
	}
)

export default sendMessageAction
