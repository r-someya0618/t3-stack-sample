import Link from "next/link";
import { UserIcon } from "@/app/_components/UserIcon";
import { type RouterOutputs } from "@/trpc/react";

type Props = {
  tweets: RouterOutputs["tweet"]["getAllByUserId"];
  isLoading: boolean;
};

export const TweetList = ({ isLoading, tweets }: Props) => {
  if (isLoading) return <div>Loading...</div>;
  if (tweets.length === 0) return <div>ツイートはありません。</div>;
  return (
    <>
      {tweets.map((tweet) => {
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
            </div>
          </div>
        );
      })}
    </>
  );
};
