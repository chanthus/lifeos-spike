'use client';

import { useParams } from 'next/navigation';
import { Card, Text, Badge, Skeleton } from '@project/ui';
import { trpc } from '../../../lib/trpc';
import Link from 'next/link';

function LoadingState() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Skeleton className="h-6 w-24 mb-8" />
        <Card className="border border-gray-200 p-8">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const {
    data: post,
    isLoading,
    error,
  } = trpc.posts.get.useQuery({ id: postId });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href="/posts"
            className="inline-block text-blue-600 hover:text-blue-700 mb-8 no-underline hover:underline"
          >
            ← Back to posts
          </Link>
          <Card className="border border-red-200 bg-red-50 p-8 text-center">
            <Text className="text-xl font-bold text-red-900 mb-2">
              Error loading post
            </Text>
            <Text className="text-red-700">{error.message}</Text>
          </Card>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href="/posts"
            className="inline-block text-blue-600 hover:text-blue-700 mb-8 no-underline hover:underline"
          >
            ← Back to posts
          </Link>
          <Card className="border-2 border-dashed border-gray-300 p-12 text-center">
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              Post not found
            </Text>
            <Text className="text-gray-600">
              This post doesn&apos;t exist or has been removed
            </Text>
          </Card>
        </div>
      </main>
    );
  }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/posts"
          className="inline-block text-blue-600 hover:text-blue-700 mb-8 no-underline hover:underline"
        >
          ← Back to posts
        </Link>

        <article>
          <Card className="border border-gray-200 p-8">
            <div className="mb-6">
              <Badge
                variant={post.status === 'published' ? 'default' : 'secondary'}
              >
                <Text className="text-xs">{post.status}</Text>
              </Badge>
            </div>

            <Text className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </Text>

            <Text className="text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
              {publishedDate}
            </Text>

            <div className="prose max-w-none">
              <Text className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </Text>
            </div>
          </Card>
        </article>
      </div>
    </main>
  );
}
