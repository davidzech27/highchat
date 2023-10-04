"use client";
import { useState } from "react";

import sendFirstMessageAction from "./sendFirstMessageAction";

export default function Landing() {
  const [messageInput, setMessageInput] = useState("");

  const disabled = messageInput === "";

  const onSubmit = () => {
    if (disabled) return;

    sendFirstMessageAction({ content: messageInput });
  };

  return (
    <main className="flex bg-primary justify-center items-center flex-col h-screen">
      <h1 className="text-secondary text-5xl font-bold">
        send a message to your high school
      </h1>

      <div className="py-4" />

      <form onSubmit={onSubmit} className="flex space-x-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          aria-required
          aria-aria-label="send a message to your high school"
          placeholder="hey"
          className="rounded-lg font-medium placeholder:select-none placeholder:text-white/50 placeholder:font-light py-2 text-lg px-3 outline-0 focus:bg-white/30 transition text-white focus:placeholder:text-white/60 border-white border bg-white/20"
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
