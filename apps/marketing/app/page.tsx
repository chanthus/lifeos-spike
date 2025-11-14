'use client';

import { View } from 'react-native';
import { Button, Text, Card, Icon } from '@project/ui';
import { APP_NAME } from '@project/shared/constants';
import { Code2, Layers, Package, ArrowRight } from 'lucide-react-native';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <View className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <View className="pt-24 pb-20 sm:pt-32 sm:pb-24">
          <View className="text-center">
            <Text className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight text-center">
              Full-Stack TypeScript Template
            </Text>

            <Text className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed text-center">
              Production-ready monorepo with tRPC, Drizzle ORM, React Native,
              and Next.js. Type-safe from database to UI across web and mobile.
            </Text>

            <View className="flex flex-row justify-center">
              <Button
                variant="default"
                className="px-8 py-4 bg-blue-600 rounded-lg"
              >
                <View className="flex flex-row items-center gap-2">
                  <Text className="text-white font-semibold">Get Started</Text>
                  <Icon as={ArrowRight} size={18} className="text-white" />
                </View>
              </Button>
            </View>
          </View>
        </View>

        <View className="py-20">
          <View className="text-center mb-16">
            <Text className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
              What&apos;s Included
            </Text>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build production-ready full-stack
              applications
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white border border-gray-200 rounded-lg">
              <View className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Icon as={Code2} size={24} className="text-blue-600" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Type-Safe APIs
              </Text>
              <Text className="text-gray-600 leading-relaxed">
                End-to-end type safety with tRPC. Share types between frontend
                and backend without duplication.
              </Text>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 rounded-lg">
              <View className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Icon as={Layers} size={24} className="text-blue-600" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Shared UI Library
              </Text>
              <Text className="text-gray-600 leading-relaxed">
                Cross-platform components with NativeWind v4. Build once, run on
                web and mobile.
              </Text>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 rounded-lg">
              <View className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <Icon as={Package} size={24} className="text-blue-600" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Monorepo Setup
              </Text>
              <Text className="text-gray-600 leading-relaxed">
                Organized workspace with pnpm and Turborepo. Multiple apps
                sharing packages efficiently.
              </Text>
            </Card>
          </View>
        </View>

        <View className="py-12 border-t border-gray-200">
          <Text className="text-center text-gray-600">
            © 2025 {APP_NAME}. All rights reserved.
          </Text>
        </View>
      </View>
    </main>
  );
}
