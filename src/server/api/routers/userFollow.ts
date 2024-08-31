import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userFollowRouter = createTRPCRouter({
  followOrUnfollow: protectedProcedure
    .input(z.object({ targetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const targetId = input.targetId;
      if (userId === targetId) throw new TRPCError({ code: "BAD_REQUEST" });
      const follow = await ctx.db.userFollow.findFirst({
        where: { userId, targetId },
      });
      if (!follow) {
        return ctx.db.userFollow.create({
          data: { userId, targetId },
          select: {
            id: true,
            userId: true,
            target: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });
      }
      return ctx.db.userFollow.delete({
        where: { id: follow.id },
        select: {
          id: true,
          userId: true,
          target: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),
});
