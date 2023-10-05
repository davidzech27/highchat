"use client"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"

import env from "~/env.mjs"
import sendMessageAction from "./sendMessageAction"

interface Props {
	userId: number
	initialMessages: {
		id: number
		userId: number
		content: string
		sentAt: Date
	}[]
	initialMessagesSent: number
}

const messageSchema = z.object({
	id: z.number(),
	userId: z.number(),
	content: z.string(),
	sentAt: z.coerce.date(),
})

export default function Chat({
	userId,
	initialMessages,
	initialMessagesSent,
}: Props) {
	const [messageInput, setMessageInput] = useState("")

	const [messages, setMessages] = useState(initialMessages)

	const [messagesSent, setMessagesSent] = useState(initialMessagesSent)

	const [optimisticMessages, setOptimisticMessages] = useState(0)

	const disabled = messageInput === ""

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
					const messageParsed = messageSchema.safeParse(message)

					if (messageParsed.success) {
						setMessages((prevMessages) => {
							if (
								prevMessages.find(
									(message) =>
										message.id === messageParsed.data.id
								) !== undefined
							)
								return prevMessages

							setMessagesSent((prev) => prev + 1)

							return [...prevMessages, messageParsed.data]
						})
					}
				})
		)

		return () => {
			channelPromise.then((channel) => channel.unsubscribe())
		}
	}, [])

	const onSubmit = async () => {
		if (disabled) return

		setMessageInput("")

		setMessagesSent((prev) => prev + 1)

		const optimisticId = optimisticMessages * -1 - 1

		const sentAt = new Date()

		setMessages((prevMessages) => [
			...prevMessages,
			{
				id: optimisticId,
				userId,
				content: messageInput,
				sentAt,
			},
		])

		setOptimisticMessages((prev) => prev + 1)

		const createdMessage = await sendMessageAction({
			content: messageInput,
		})

		setOptimisticMessages((prev) => prev - 1)

		setMessages((prevMessages) => {
			const optimisticIndex = prevMessages.findIndex(
				(message) => message.id === optimisticId
			)

			const optimisticMessage = prevMessages[optimisticIndex]

			if (optimisticMessage === undefined) return prevMessages

			return [
				...prevMessages.slice(0, optimisticIndex),
				{ ...optimisticMessage, id: createdMessage.id },
				...prevMessages.slice(optimisticIndex + 1),
			]
		})
	}

	const scrollerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollerRef.current !== null) {
			scrollerRef.current.scrollTop =
				scrollerRef.current.scrollHeight -
				scrollerRef.current.clientHeight
		}
	}, [])

	useEffect(() => {
		if (
			scrollerRef.current !== null &&
			Math.abs(
				scrollerRef.current.scrollTop +
					scrollerRef.current.clientHeight -
					scrollerRef.current.scrollHeight
			) < 100
		) {
			scrollerRef.current.scrollTop =
				scrollerRef.current.scrollHeight -
				scrollerRef.current.clientHeight
		}
	}, [messages])

	return (
		<main className="flex h-screen flex-col space-y-3 bg-primary p-6">
			<div className="flex justify-between">
				<span className="text-2xl font-bold leading-none text-secondary">
					#{userId + 1}
				</span>

				<span className="text-2xl font-bold leading-none text-secondary">
					{messagesSent}
				</span>
			</div>

			<div
				ref={scrollerRef}
				className="flex-1 space-y-3 overflow-y-scroll rounded-lg border border-white p-3"
				aria-live="assertive"
			>
				{messages.map((message) => (
					<div
						key={message.id}
						className="flex flex-col space-y-3 rounded-lg border border-white bg-white/20 p-3"
					>
						<div className="flex justify-between">
							<span className="text-lg font-bold leading-none text-secondary">
								#{message.userId + 1}
							</span>

							{message.id >= 0 && (
								<span className="text-lg font-bold leading-none text-secondary">
									{message.id + 1}
								</span>
							)}
						</div>

						<p className="break-words font-medium text-white">
							{message.content}
						</p>
					</div>
				))}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault()

					onSubmit()
				}}
				className="flex w-full space-x-3"
			>
				<input
					type="text"
					value={messageInput}
					onChange={(e) => setMessageInput(e.target.value)}
					aria-required
					aria-label="send a message to your high school"
					placeholder="hey"
					className="w-full rounded-lg border border-white bg-white/20 px-3 py-2 text-lg font-medium text-white outline-0 transition placeholder:select-none placeholder:font-light placeholder:text-white/50 focus:bg-white/30 focus:placeholder:text-white/60"
				/>

				<button
					type="submit"
					disabled={disabled}
					className="select-none rounded-lg border border-white bg-white/20 px-4 text-lg font-bold text-white transition hover:bg-white/30 focus-visible:bg-white/30 disabled:pointer-events-none disabled:opacity-50"
				>
					send
				</button>
			</form>
		</main>
	)
}
