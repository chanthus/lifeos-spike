import { db } from './client';
import { posts } from './schema';

/**
 * Seed database with example data
 */
async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create example posts
    await db.insert(posts).values([
      {
        title: 'Welcome',
        slug: 'welcome',
        content: 'This is an example blog post.',
        status: 'published',
        createdBy: null,
        updatedBy: null,
        publishedAt: new Date(),
      },
      {
        title: 'Getting Started',
        slug: 'getting-started',
        content: 'Here is how to get started.',
        status: 'published',
        createdBy: null,
        updatedBy: null,
        publishedAt: new Date(),
      },
    ]);

    console.log('✅ Created posts');
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  void seed();
}

export { seed };
