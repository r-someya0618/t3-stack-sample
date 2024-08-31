import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const tweetLikeRouter = createTRPCRouter({
  likeOrUnlike: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tweet = await ctx.db.tweet.findUnique({
        where: { id: input.tweetId },
        include: { likes: true },
      });
      if (!tweet) throw new TRPCError({ code: "BAD_REQUEST" });
      const like = tweet.likes.find(
        (like) => like.userId === ctx.session.user.id,
      );
      const liked = !!like;
      if (liked) {
        const res = await ctx.db.tweetLike.delete({
          where: { id: like.id },
        });
        return res;
      } else {
        const res = await ctx.db.tweetLike.create({
          data: { tweetId: tweet.id, userId: ctx.session.user.id },
        });
        return res;
      }
    }),
});
