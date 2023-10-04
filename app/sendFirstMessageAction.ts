"use server";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/database.types";
import { z } from "zod";
import { zact } from "zact/server";
import { revalidatePath } from "next/cache";

const sendFirstMessageAction = zact(z.object({ content: z.string() }))(
  async ({ content }) => {
    const supabase = createServerActionClient<Database>(
      { cookies },
      {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    );

    const userId = await supabase
      .from("user")
      .insert({
        id:
          (
            await supabase
              .from("user")
              .select("*", { count: "exact", head: true })
          ).count ?? -1,
      })
      .select()
      .then(({ data }) => {
        const user = data?.[0];

        if (user === undefined) throw new Error("Failed to create user");

        cookies().set("user_id", user.id.toString());

        return user.id;
      });

    await supabase
      .from("message")
      .select("*", { count: "exact", head: true })
      .then(({ count }) =>
        Promise.all([
          supabase.from("message").insert({
            id: count ?? -1,
            user_id: userId,
            content,
          }),
          supabase.realtime
            .channel("message")
            .subscribe()
            .send({
              type: "message",
              id: count ?? -1,
              user_id: userId,
              content,
            }),
        ])
      );

    revalidatePath("/");
  }
);

export default sendFirstMessageAction;
