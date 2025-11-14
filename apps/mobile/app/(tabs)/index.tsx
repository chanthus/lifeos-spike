import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@project/ui';
import { APP_NAME } from '@project/shared';
import { trpc } from '../../lib/trpc';

export default function HomeScreen() {
  const { data: posts } = trpc.posts.list.useQuery({});

  const totalPosts = posts?.items.length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-6" edges={['top']}>
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to {APP_NAME}
        </Text>
        <Text className="text-base text-gray-600 leading-6">
          A full-stack TypeScript template showcasing React Native, Expo, tRPC,
          and cross-platform development patterns.
        </Text>
      </View>

      <Card className="p-6 bg-white">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          Template Features
        </Text>
        <Text className="text-sm text-gray-600 leading-5 mb-4">
          This mobile app demonstrates basic React Native patterns with tRPC
          integration. Check out the Posts tab to see a FlatList example with
          type-safe API calls.
        </Text>

        <View className="border-t border-gray-200 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Total Posts</Text>
            <Text className="text-2xl font-bold text-blue-600">
              {totalPosts}
            </Text>
          </View>
        </View>
      </Card>

      <View className="mt-6">
        <Text className="text-xs text-gray-500 text-center">
          Built with React Native, Expo, NativeWind, and tRPC
        </Text>
      </View>
    </SafeAreaView>
  );
}
