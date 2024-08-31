// API側のロジック
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          name: true,
          image: true,
          followers: {
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
          },
          following: {
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
            },
          },
        },
      });
    }),
});
