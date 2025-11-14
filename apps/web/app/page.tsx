'use client';

import { Text, Card, Badge, Skeleton } from '@project/ui';
import { trpc } from '../lib/trpc';
import Link from 'next/link';
import type { RouterOutput } from '@project/backend/client';

type Post = RouterOutput['posts']['list']['items'][number];

function PostCard({ post }: { post: Post }) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Draft';

  const excerpt =
    post.content.length > 120
      ? post.content.substring(0, 120) + '...'
      : post.content;

  return (
    <Link href={`/posts/${post.id}`} className="block no-underline group">
      <Card className="border border-gray-200 hover:border-gray-400 transition-colors p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant={post.status === 'published' ? 'default' : 'secondary'}
          >
            <Text className="text-xs">{post.status}</Text>
          </Badge>
          <Text className="text-sm text-gray-500">{publishedDate}</Text>
        </div>
        <Text className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </Text>
        <Text className="text-sm text-gray-600 line-clamp-2">{excerpt}</Text>
      </Card>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-6" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-gray-200 p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data, isLoading, error } = trpc.posts.list.useQuery({});

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Text className="text-3xl font-bold text-gray-900 mb-4 block">
            Welcome to the Blog
          </Text>
          <Card className="border border-red-200 bg-red-50 p-6">
            <Text className="text-red-900 font-semibold mb-2 block">
              Error loading posts
            </Text>
            <Text className="text-red-700 block">{error.message}</Text>
          </Card>
        </div>
      </main>
    );
  }

  const posts = data?.items ?? [];
  const recentPosts = posts.slice(0, 5);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <Text className="text-3xl font-bold text-gray-900 mb-4 block">
            Welcome to the Blog
          </Text>
          <Text className="text-lg text-gray-600 block">
            A simple example showing tRPC integration with Next.js
          </Text>
        </div>

        {recentPosts.length > 0 ? (
          <div>
            <Text className="text-xl font-semibold text-gray-900 mb-6 block">
              Latest Posts
            </Text>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/posts"
                className="text-blue-600 hover:text-blue-700 text-sm no-underline hover:underline"
              >
                View all posts →
              </Link>
            </div>
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 p-12 text-center">
            <Text className="text-xl font-semibold text-gray-900 mb-2 block">
              No posts yet
            </Text>
            <Text className="text-gray-600 block">Check back soon!</Text>
          </Card>
        )}
      </div>
    </main>
  );
}
