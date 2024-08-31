import Link from "next/link";
import cn from "classnames";
import { UserIcon } from "@/app/_components/UserIcon";
import { type RouterOutputs } from "@/trpc/react";

type Props = {
  tweets: RouterOutputs["tweet"]["getAllByUserId"];
  isLoading: boolean;
  handleLikeClick: (tweetId: string) => void;
  currentUserId?: string | undefined;
};

export const TweetList = ({
  isLoading,
  tweets,
  handleLikeClick,
  currentUserId,
}: Props) => {
  if (isLoading) return <div>Loading...</div>;
  if (tweets.length === 0) return <div>ツイートはありません。</div>;
  return (
    <>
      {tweets.map((tweet) => {
        const likedByMe = !!tweet.likes.find(
          (like) => like.userId === currentUserId,
        );
        return (
          <div key={tweet.id} className="flex gap-2 border p-4">
            <div className="h-12 w-12 shrink-0">
              <UserIcon {...tweet.from} />
            </div>
            <div>
              <div className="font-bold">
                <Link href={`/${tweet.userId}`} className="hover:underline">
                  {tweet.from.name ?? "no name"} /{" "}
                </Link>
                <span className="text-sm text-slate-700">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(tweet.createdAt)}
                </span>
              </div>
              <p>{tweet.content}</p>
              <div
                className={cn(
                  "mt-3 flex gap-1 hover:text-red-500",
                  likedByMe && "text-red-500",
                )}
              >
                <button onClick={() => handleLikeClick(tweet.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={likedByMe ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>
                <div>{tweet.likes.length}</div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
