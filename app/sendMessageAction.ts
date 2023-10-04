"use server";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import { z } from "zod";
import { zact } from "zact/server";

const sendMessageAction = zact(z.object({ content: z.string() }))(
  async ({ content }) => {
    const supabase = createServerActionClient<Database>(
      { cookies },
      {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    );

    const userIdString = cookies().get("user_id")?.value;

    const userId =
      userIdString !== undefined ? Number(userIdString) : undefined;

    if (userId === undefined) throw new Error("Unauthenticated");

    const [id] = await Promise.all([
      supabase
        .from("message")
        .select("*", { count: "exact", head: true })
        .then(async ({ count }) => {
          const id = count ?? -1;

          await supabase
            .from("message")
            .insert({ id, user_id: userId, content });

          return id;
        }),
      supabase.realtime
        .channel("message")
        .subscribe()
        .send({ type: "message", userId, content }),
    ]);

    return {
      id,
    };
  }
);

export default sendMessageAction;
