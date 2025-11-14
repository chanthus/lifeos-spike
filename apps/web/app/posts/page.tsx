'use client';

import { Card, Text, Badge, Skeleton } from '@project/ui';
import { trpc } from '../../lib/trpc';
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
    post.content.length > 150
      ? post.content.substring(0, 150) + '...'
      : post.content;

  return (
    <Link href={`/posts/${post.id}`} className="block no-underline group">
      <Card className="border border-gray-200 hover:border-gray-400 transition-colors p-6 h-full">
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
        <Text className="text-sm text-gray-600 line-clamp-3">{excerpt}</Text>
      </Card>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <Skeleton className="h-6 w-24 mb-6" />
          <Skeleton className="h-10 w-48 mb-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-gray-200 p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PostsPage() {
  const { data, isLoading, error } = trpc.posts.list.useQuery({});

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-block text-blue-600 hover:text-blue-700 mb-6 no-underline hover:underline"
          >
            ← Back to home
          </Link>
          <div className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 block">
              All Posts
            </Text>
          </div>
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

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-block text-blue-600 hover:text-blue-700 mb-6 no-underline hover:underline"
        >
          ← Back to home
        </Link>

        <div className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 block mb-2">
            All Posts
          </Text>
          <Text className="text-gray-600 block">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
          </Text>
        </div>

        {posts.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 p-12 text-center">
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </Text>
            <Text className="text-gray-600">Check back soon!</Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
