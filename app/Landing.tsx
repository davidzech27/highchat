"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import sendFirstMessageAction from "./sendFirstMessageAction"
import env from "~/env.mjs"

interface Props {
initialUserCount: number
}

export default function Landing({initialUserCount}: Props) {
	const [messageInput, setMessageInput] = useState("")

	const [submitted, setSubmitted] = useState(false)

	const disabled = messageInput === "" || submitted

	const router = useRouter()

	const onSubmit = async () => {
		if (disabled) return

		setSubmitted(true)

		await sendFirstMessageAction({
			content: messageInput,
		})

		router.refresh()
	}

	const [userCount, setUserCount] = useState(initialUserCount)

	useEffect(() => {
		const channelPromise = import("pusher-js").then(({ default: Pusher }) =>
			new Pusher(env.NEXT_PUBLIC_SOKETI_APP_KEY, {
				wsHost: env.NEXT_PUBLIC_SOKETI_HOST,
				wsPort: env.NEXT_PUBLIC_SOKETI_PORT,
				wssPort: env.NEXT_PUBLIC_SOKETI_PORT,
				forceTLS: true,
				disableStats: true,
				enabledTransports: ["ws", "wss"],
			})
				.subscribe("chat")
				.bind("message", (message: unknown) => {
					if (typeof message === "object" && message !== null && "firstMessage" in message)
						setUserCount((prev) => prev + 1)



				})
		)

		return () => {
			channelPromise.then((channel) => channel.unsubscribe())
		}
	}, [])


	return (
		<main className="flex h-screen flex-col items-center justify-center bg-primary">
			<h1 className="text-5xl font-bold text-secondary">
				send a message to your high school
			</h1>

			<div className="py-4" />

			<form
				onSubmit={(e) => {
					e.preventDefault()

					onSubmit()
				}}
				className="flex space-x-2"
			>
				<input
					type="text"
					value={messageInput}
					onChange={(e) => setMessageInput(e.target.value)}
					aria-required
					aria-label="send a message to your high school"
					placeholder="hey"
					className="rounded-lg border border-white bg-white/20 px-3 py-2 text-lg font-medium text-white outline-0 transition placeholder:select-none placeholder:font-light placeholder:text-white/50 focus:bg-white/30 focus:placeholder:text-white/60"
				/>

				<button
					type="submit"
					disabled={disabled}
					className="select-none rounded-lg border border-white bg-white/20 px-4 text-lg font-bold text-white transition hover:bg-white/30 focus-visible:bg-white/30 disabled:pointer-events-none disabled:opacity-50"
				>
					send
				</button>
			</form>


			<div className="py-4" />


			<h1 className="text-5xl font-bold text-secondary">
				{userCount} already here
			</h1>

		</main>
	)
}
