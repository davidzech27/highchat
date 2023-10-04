import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { type Database } from "@/database.types";

import Landing from "./Landing";
import Chat from "./Chat";

export default async function Index() {
  const userIdString = cookies().get("user_id")?.value;

  const userId = userIdString !== undefined ? Number(userIdString) : undefined;

  if (userId === undefined) return <Landing />;

  const supabase = createServerComponentClient<Database>(
    { cookies },
    {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  );

  const messages = ((await supabase.from("message").select()).data ?? []).map(
    ({ id, user_id, content, sent_at }) => ({
      id,
      userId: user_id,
      content,
      sentAt: new Date(sent_at),
    })
  );

  return (
    <Chat
      userId={userId}
      initialMessages={messages}
      initialMessagesSent={
        messages.filter((message) => message.userId === userId).length
      }
    />
  );
}
