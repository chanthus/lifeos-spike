import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../../trpc';
import {
  listPostsSchema,
  getPostSchema,
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
} from './posts.schema';

export const postsRouter = router({
  list: publicProcedure.input(listPostsSchema).query(async ({ ctx, input }) => {
    return ctx.services.posts.listPosts(input, ctx.db);
  }),

  get: publicProcedure.input(getPostSchema).query(async ({ ctx, input }) => {
    const post = await ctx.services.posts.getPost(input.id, ctx.db);

    if (!post) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post not found',
      });
    }

    return post;
  }),

  create: publicProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.posts.createPost(input, ctx.db);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('slug already exists')
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message,
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post',
        });
      }
    }),

  update: publicProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.services.posts.updatePost(
          input.id,
          input.data,
          ctx.db
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('slug already exists')
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: error.message,
          });
        }
        if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post',
        });
      }
    }),

  delete: publicProcedure
    .input(deletePostSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.services.posts.deletePost(input.id, ctx.db);
      return { success: true };
    }),
});
