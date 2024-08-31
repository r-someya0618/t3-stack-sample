"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import Error from "next/error";
import { useSession } from "next-auth/react";

import { DefaultLayout } from "@/app/_components/DefaultLayout";
import { UserIcon } from "@/app/_components/UserIcon";
import { api } from "@/trpc/react";

export default function UserIdFollowing() {
  const params = useParams();
  const userId = String(params.userId);
  const { data: session } = useSession();
  const { data: user, isLoading: isLoadingUser } =
    api.user.getByUserId.useQuery({ userId });

  if (isLoadingUser) {
    return (
      <DefaultLayout session={session}>
        <div>Loading...</div>
      </DefaultLayout>
    );
  }
  if (!user) {
    return <Error statusCode={404} />;
  }

  return (
    <DefaultLayout session={session}>
      <div>
        <div className="border p-4 font-bold">
          {user.name ?? "no name"}さんのフォロー一覧
        </div>
        {user.following.map((followingUser) => (
          <div
            key={followingUser.id}
            className="flex justify-between border p-4"
          >
            <div className="flex gap-2">
              <div className="h-12 w-12 shrink-0">
                <UserIcon {...followingUser.target} />
              </div>
              <div>
                <div className="font-bold">
                  <Link
                    href={`/${followingUser.target.id}`}
                    className="hover:underline"
                  >
                    {followingUser.target.name ?? "no name"}
                  </Link>
                  <div className="text-sm text-slate-600">
                    @{followingUser.target.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {user.following.length === 0 && (
          <div className="p-4">フォローしているユーザーはいません。</div>
        )}
      </div>
    </DefaultLayout>
  );
}
