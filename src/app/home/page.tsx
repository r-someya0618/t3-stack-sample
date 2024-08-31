"use client";
import { useSession } from "next-auth/react";
import produce from "immer";
import { api } from "@/trpc/react";
import { DefaultLayout } from "@/app/_components/DefaultLayout";
import { TweetList } from "@/app/_components/TweetList";

export default function Home() {
  const { data: session } = useSession();
  const { data: tweets = [], isLoading } = api.tweet.getByFollowing.useQuery();
  const tweetLikeLikeOrUnlikeMutation =
    api.tweetLike.likeOrUnlike.useMutation();
  const utils = api.useUtils();

  function handleLikeClick(tweetId: string) {
    if (!session) {
      alert("ログインしてください。");
      return;
    }
    tweetLikeLikeOrUnlikeMutation.mutate(
      { tweetId },
      {
        onSuccess(data) {
          utils.tweet.getByFollowing.setData(undefined, (old) =>
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

  return (
    <DefaultLayout session={session}>
      <TweetList
        tweets={tweets}
        isLoading={isLoading}
        handleLikeClick={handleLikeClick}
        currentUserId={session?.user.id}
      />
    </DefaultLayout>
  );
}
