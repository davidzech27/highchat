"use client";
import { useState } from "react";

import sendMessageAction from "./sendMessageAction";

interface Props {
  userId: number;
  initialMessages: {
    id: number;
    userId: number;
    content: string;
    sentAt: Date;
  }[];
  initialMessagesSent: number;
}

export default function Landing({
  userId,
  initialMessages,
  initialMessagesSent,
}: Props) {
  const [messageInput, setMessageInput] = useState("");

  const [messages, setMessages] = useState(initialMessages);

  const [messagesSent, setMessagesSent] = useState(initialMessagesSent);

  const [optimisticMessages, setOptimisticMessages] = useState(0);

  const disabled = messageInput === "";

  const onSubmit = async () => {
    if (disabled) return;

    setMessageInput("");

    setMessagesSent((prev) => prev + 1);

    const optimisticId = optimisticMessages * -1 - 1;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: optimisticId, userId, content: messageInput, sentAt: new Date() },
    ]);

    setOptimisticMessages((prev) => prev + 1);

    const createdMessage = await sendMessageAction({ content: messageInput });

    setOptimisticMessages((prev) => prev - 1);

    setMessages((prevMessages) => {
      const optimisticIndex = prevMessages.findIndex(
        (message) => message.id === optimisticId
      );

      const optimisticMessage = prevMessages[optimisticIndex];

      if (optimisticMessage === undefined) return prevMessages;

      return [
        ...prevMessages.slice(0, optimisticIndex),
        { ...optimisticMessage, id: createdMessage.id },
        ...prevMessages.slice(optimisticIndex + 1),
      ];
    });
  };

  return (
    <main className="flex bg-primary p-6 flex-col h-screen space-y-3">
      <div className="flex justify-between">
        <span className="text-2xl text-secondary font-bold leading-none">
          user #{userId + 1}
        </span>

        <span className="text-2xl text-secondary font-bold leading-none">
          sent {messagesSent}
        </span>
      </div>

      <div
        className="flex-1 rounded-lg border-white border p-3 space-y-3"
        aria-live="assertive"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="rounded-lg border border-white bg-white/20 p-3 flex flex-col space-y-3"
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

            <p className="font-medium text-white">{message.content}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSubmit();
        }}
        className="flex space-x-3 w-full"
      >
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          aria-required
          aria-aria-label="send a message to your high school"
          placeholder="hey"
          className="rounded-lg w-full font-medium placeholder:select-none placeholder:text-white/50 placeholder:font-light py-2 text-lg px-3 outline-0 focus:bg-white/30 transition text-white focus:placeholder:text-white/60 border-white border bg-white/20"
        />

        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg select-none disabled:opacity-50 disabled:pointer-events-none text-lg px-4 font-bold focus-visible:bg-white/30 hover:bg-white/30 transition text-white border-white border bg-white/20"
        >
          send
        </button>
      </form>
    </main>
  );
}
