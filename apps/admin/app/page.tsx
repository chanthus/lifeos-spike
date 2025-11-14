'use client';

import { Text, Button, Card } from '@project/ui';
import { APP_NAME } from '@project/shared/constants';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Text variant="h1" className="text-2xl font-semibold text-gray-900">
            {APP_NAME} Admin
          </Text>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Text
            variant="h2"
            className="text-3xl font-bold text-gray-900 mb-2 block"
          >
            Dashboard
          </Text>
          <Text className="text-gray-600 block">
            Manage your content and settings
          </Text>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Posts Card */}
          <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Text className="text-2xl">📝</Text>
                </div>
                <Text
                  variant="h3"
                  className="text-xl font-semibold text-gray-900 mb-2 block"
                >
                  Posts
                </Text>
                <Text className="text-gray-600 text-sm mb-4 block">
                  Create, edit, and manage your blog posts
                </Text>
              </div>
              <Link href="/posts" className="mt-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Text className="text-white font-medium">Manage Posts</Text>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Users Card (Coming Soon) */}
          <Card className="p-6 bg-white border border-gray-200 opacity-60">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Text className="text-2xl">👥</Text>
                </div>
                <Text
                  variant="h3"
                  className="text-xl font-semibold text-gray-900 mb-2 block"
                >
                  Users
                </Text>
                <Text className="text-gray-600 text-sm mb-4 block">
                  Manage user accounts and permissions
                </Text>
              </div>
              <Button disabled className="w-full mt-auto bg-gray-200">
                <Text className="text-gray-500 font-medium">Coming Soon</Text>
              </Button>
            </div>
          </Card>

          {/* Settings Card (Coming Soon) */}
          <Card className="p-6 bg-white border border-gray-200 opacity-60">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Text className="text-2xl">⚙️</Text>
                </div>
                <Text
                  variant="h3"
                  className="text-xl font-semibold text-gray-900 mb-2 block"
                >
                  Settings
                </Text>
                <Text className="text-gray-600 text-sm mb-4 block">
                  Configure application settings
                </Text>
              </div>
              <Button disabled className="w-full mt-auto bg-gray-200">
                <Text className="text-gray-500 font-medium">Coming Soon</Text>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
