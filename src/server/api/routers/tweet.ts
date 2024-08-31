// API側のロジック
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { tweetContentSchema } from "@/validations/tweet";
import { z } from "zod";

export const tweetRouter = createTRPCRouter({
  add: protectedProcedure
    .input(tweetContentSchema)
    .mutation(async ({ ctx, input }) => {
      const { content } = input;
      const { user } = ctx.session;
      const tweet = await ctx.db.tweet.create({
        data: {
          content,
          userId: user.id,
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: true,
        },
      });
      return tweet;
    }),
  getAllByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.tweet.findMany({
        where: {
          userId: input.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: true,
        },
      });
    }),
  getAll: publicProcedure
    .input(z.object({ cursor: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      const take = 10;
      const { cursor } = input;
      const tweets = await ctx.db.tweet.findMany({
        take: take + 1,
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (tweets.length > take) {
        const nextTweet = tweets.pop();
        nextCursor = nextTweet?.id;
      }
      return {
        tweets,
        nextCursor,
      };
    }),
  getByFollowing: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { following: true },
    });
    return ctx.db.tweet.findMany({
      where: {
        userId: { in: user?.following.map((follow) => follow.targetId) },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        likes: true,
      },
    });
  }),
});
