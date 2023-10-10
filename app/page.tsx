import { cookies } from "next/headers"
import { sql } from "drizzle-orm"

import db from "~/database/db"
import { message, user } from "~/database/schema"
import Landing from "./Landing"
import Chat from "./Chat"

// export const runtime = "edge"

export default async function Index() {
	const userIdString = cookies().get("user_id")?.value

	const userId = userIdString !== undefined ? Number(userIdString) : undefined

	if (userId === undefined) {
		const userCount = await db
			.select({ count: sql<number>`count(*)` })
			.from(user)
			.then(([row]) => row?.count ?? 0)

		return <Landing initialUserCount={userCount} />
	}

	const messages = await db.select().from(message)

	return (
		<Chat
			userId={userId}
			initialMessages={messages}
			initialMessagesSent={
				messages.filter((message) => message.userId === userId).length
			}
			initialEndDate={
				new Date(
					new Date().valueOf() +
						1000 * 60 * 60 * 24 * 365 -
						(messages.length * 1000 * 60 +
							new Set(messages.map(({ userId }) => userId)).size *
								1000 *
								60 *
								60 *
								8)
				)
			}
		/>
	)
}
