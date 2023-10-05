import { cookies } from "next/headers"

import db from "~/database/db"
import { message } from "~/database/schema"
import Landing from "./Landing"
import Chat from "./Chat"

// export const runtime = "edge"

export default async function Index() {
	const userIdString = cookies().get("user_id")?.value

	const userId = userIdString !== undefined ? Number(userIdString) : undefined

	if (userId === undefined) return <Landing />

	const messages = await db.select().from(message)

	return (
		<Chat
			userId={userId}
			initialMessages={messages}
			initialMessagesSent={
				messages.filter((message) => message.userId === userId).length
			}
		/>
	)
}
