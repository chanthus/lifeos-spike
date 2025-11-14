import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text } from '@project/ui';
import { FileText } from 'lucide-react-native';
import { trpc } from '../../lib/trpc';
import type { RouterOutput } from '@project/backend/client';
import { memo, useCallback, useState } from 'react';

type Post = RouterOutput['posts']['list']['items'][number];

const PostItem = memo(({ post }: { post: Post }) => {
  return (
    <Card className="p-4 bg-white mb-3">
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        {post.title}
      </Text>
      <Text className="text-sm text-gray-600 leading-5 mb-3" numberOfLines={2}>
        {post.content}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        <View
          className={`px-2 py-1 rounded ${
            post.status === 'published' ? 'bg-green-100' : 'bg-orange-100'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              post.status === 'published' ? 'text-green-700' : 'text-orange-700'
            }`}
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Text>
        </View>
      </View>
    </Card>
  );
});

PostItem.displayName = 'PostItem';

function LoadingState() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-sm text-gray-600 mt-2">Loading posts...</Text>
    </View>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-6">
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Error loading posts
      </Text>
      <Text className="text-sm text-gray-600 text-center">{message}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-6">
      <View className="bg-gray-100 p-4 rounded-full mb-4">
        <FileText size={32} color="#9ca3af" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        No posts yet
      </Text>
      <Text className="text-sm text-gray-600 text-center">
        Posts will appear here when they are created.
      </Text>
    </View>
  );
}

export default function PostsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = trpc.posts.list.useQuery({});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostItem post={item} />,
    []
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const ListHeaderComponent = useCallback(
    () => (
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">All Posts</Text>
        <Text className="text-sm text-gray-600">
          Showing {data?.items.length ?? 0} post
          {(data?.items.length ?? 0) !== 1 ? 's' : ''}
        </Text>
      </View>
    ),
    [data?.items.length]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!data?.items || data.items.length === 0) {
    return <EmptyState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <FlatList
        data={data.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerClassName="p-4"
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}
