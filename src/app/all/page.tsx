"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useInView } from "react-intersection-observer";
import { DefaultLayout } from "@/app/_components/DefaultLayout";
import { TweetList } from "@/app/_components/TweetList";
import { api } from "@/trpc/react";
import produce from "immer";

export default function All() {
  const { data: session } = useSession();
  const {
    data: tweetData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.tweet.getAll.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const tweets = tweetData?.pages.flatMap((o) => [...o.tweets]) ?? [];
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tweetLikeLikeOrUnlikeMutation =
    api.tweetLike.likeOrUnlike.useMutation();
  const utils = api.useUtils();

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
          utils.tweet.getAll.setInfiniteData({}, (old) =>
            produce(old, (draft) => {
              const tweet = draft?.pages
                .flatMap((o) => [...o.tweets])
                .find((t) => t?.id === tweetId);
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
      {isFetchingNextPage && <div className="loading">Loading...</div>}
      <div ref={ref}></div>
    </DefaultLayout>
  );
}
