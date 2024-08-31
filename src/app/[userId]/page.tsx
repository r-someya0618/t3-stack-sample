"use client";
import { useSession } from "next-auth/react";
import Error from "next/error";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DefaultLayout } from "@/app/_components/DefaultLayout";
import { UserIcon } from "@/app/_components/UserIcon";
import { api } from "@/trpc/react";
import {
  tweetContentSchema,
  type TweetContentSchema,
} from "@/validations/tweet";
import { useParams } from "next/navigation";
import { TweetList } from "@/app/_components/TweetList";
import produce from "immer";
import Link from "next/link";

export default function UserIdIndex() {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm({
    resolver: zodResolver(tweetContentSchema),
    defaultValues: { content: "" },
  });
  const params = useParams();
  const userId = String(params.userId);
  const { data: user, isLoading: isLoadingUser } =
    api.user.getByUserId.useQuery({
      userId,
    });
  const tweetAddMutation = api.tweet.add.useMutation();
  const { data: tweets = [], isLoading: isLoadingTweets } =
    api.tweet.getAllByUserId.useQuery({ userId });
  const utils = api.useUtils();
  const tweetLikeLikeOrUnlikeMutation =
    api.tweetLike.likeOrUnlike.useMutation();
  const userFollowFollowOrUnfollowMutation =
    api.userFollow.followOrUnfollow.useMutation();

  if (isLoadingUser)
    return (
      <DefaultLayout session={session}>
        <div>Loading...</div>
      </DefaultLayout>
    );

  if (!user) {
    return <Error statusCode={404} />;
  }

  function onSubmit({ content }: TweetContentSchema) {
    if (tweetAddMutation.isPending) return;
    tweetAddMutation.mutate(
      { content },
      {
        onSuccess(data) {
          utils.tweet.getAllByUserId.setData({ userId: data.userId }, [
            data,
            ...tweets,
          ]);
        },
      },
    );
    reset();
  }

  function handleLikeClick(tweetId: string) {
    if (!session) {
      alert("ログインしてください。");
      return;
    }
    if (tweetLikeLikeOrUnlikeMutation.isPending) return;
    tweetLikeLikeOrUnlikeMutation.mutate(
      { tweetId },
      {
        onSuccess(data) {
          utils.tweet.getAllByUserId.setData({ userId }, (old) =>
            produce(old, (draft) => {
              const tweet = draft?.find((t) => t.id === tweetId);
              if (!tweet) return draft;
              const likeIndex = tweet.likes.findIndex(
                (like) => like.userId === data.userId,
              );
              if (likeIndex === -1) {
                tweet.likes.push(data);
              } else {
                tweet.likes.splice(likeIndex, 1);
              }
            }),
          );
        },
      },
    );
  }

  function handleFollow() {
    if (userFollowFollowOrUnfollowMutation.isPending) return;
    userFollowFollowOrUnfollowMutation.mutate(
      { targetId: userId },
      {
        onSuccess(data) {
          utils.user.getByUserId.setData({ userId }, (old) => {
            const followIndex =
              old?.followers.findIndex(
                (follower: { userId: string | undefined }) =>
                  follower.userId === session?.user.id,
              ) ?? -1;
            if (followIndex === -1) {
              return produce(old, (draft) => {
                draft?.followers.push(data);
              });
            }
            return produce(old, (draft) => {
              draft?.followers.splice(followIndex, 1);
            });
          });
        },
      },
    );
  }
  return (
    <DefaultLayout session={session}>
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="h-24 w-24">
            <UserIcon {...user} />
          </div>
          {session && userId !== session?.user.id && (
            <button
              className="rounded-full bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:bg-gray-200"
              onClick={handleFollow}
              disabled={userFollowFollowOrUnfollowMutation.isPending}
            >
              {!user?.followers.find(
                (follower) => follower.userId === session?.user.id,
              )
                ? "フォロー"
                : "フォロー解除"}
            </button>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{user?.name ?? "no name"}</h1>
          <div className="text-slate-700">@{user?.id ?? "---"}</div>
        </div>
        <div className="mt-3 flex gap-3 text-sm">
          <Link href={`/${userId}/following`}>
            <span className="font-bold">{user.following.length}</span>{" "}
            フォロー中
          </Link>
          <Link href={`/${userId}/followers`}>
            <span className="font-bold">{user.followers.length}</span>{" "}
            フォロワー
          </Link>
        </div>
      </div>
      <div className="mt-4">
        {userId === session?.user.id && (
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="flex flex-col items-end gap-2"
          >
            <textarea
              {...register("content")}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-slate-900"
              placeholder="いまどうしてる？"
              minLength={1}
              maxLength={140}
            ></textarea>
            <button
              className="rounded-full bg-sky-500 px-5 py-3 text-white disabled:opacity-50"
              disabled={!isValid || tweetAddMutation.isPending}
            >
              ツイートする
            </button>
          </form>
        )}
        <div>
          <h2 className="mb-2 font-bold">ツイート</h2>
          <TweetList
            tweets={tweets}
            isLoading={isLoadingTweets}
            handleLikeClick={handleLikeClick}
            currentUserId={session?.user.id}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
