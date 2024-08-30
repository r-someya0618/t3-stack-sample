import { z } from "zod";

export const tweetContentSchema = z.object({
  content: z.string().min(1).max(140),
});
export type TweetContentSchema = z.infer<typeof tweetContentSchema>;
