'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react-native';
import {
  Text,
  Card,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  Badge,
  Skeleton,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@project/ui';
import { trpc } from '../../lib/trpc';
import type { RouterOutput } from '@project/backend/client';

type Post = RouterOutput['posts']['list']['items'][number];
type PostStatus = Post['status'];

interface PostFormData {
  title: string;
  content: string;
  slug: string;
  status: PostStatus;
}

interface EditingPost extends PostFormData {
  id: string;
}

export default function PostsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<EditingPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    slug: '',
    status: 'draft',
  });
  const [formErrors, setFormErrors] = useState<Partial<PostFormData>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'default' | 'destructive';
    message: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.posts.list.useQuery({});

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      void utils.posts.list.invalidate();
      resetForm();
      setIsCreateDialogOpen(false);
      showFeedback('default', 'Post created successfully');
    },
    onError: (err) => {
      showFeedback('destructive', `Error creating post: ${err.message}`);
    },
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      void utils.posts.list.invalidate();
      resetForm();
      setEditingPost(null);
      showFeedback('default', 'Post updated successfully');
    },
    onError: (err) => {
      showFeedback('destructive', `Error updating post: ${err.message}`);
    },
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      void utils.posts.list.invalidate();
      setDeleteId(null);
      showFeedback('default', 'Post deleted successfully');
    },
    onError: (err) => {
      showFeedback('destructive', `Error deleting post: ${err.message}`);
    },
  });

  const showFeedback = (type: 'default' | 'destructive', message: string) => {
    setFeedbackMessage({ type, message });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      slug: '',
      status: 'draft',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<PostFormData> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (formData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      errors.slug = 'Slug must be lowercase with hyphens only';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingPost) {
      updateMutation.mutate({
        id: editingPost.id,
        data: {
          title: formData.title,
          content: formData.content,
          slug: formData.slug || undefined,
          status: formData.status,
        },
      });
    } else {
      createMutation.mutate({
        title: formData.title,
        content: formData.content,
        slug: formData.slug,
        status: formData.status,
      });
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost({
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
    });
    setFormData({
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
    });
    setIsCreateDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    resetForm();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        prev.slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 text-left">
            <Text
              variant="h1"
              className="text-3xl font-bold text-gray-900 block text-left"
            >
              Posts Management
            </Text>
            <Text
              variant="default"
              className="text-gray-600 mt-2 block text-left"
            >
              Create, edit, and manage all blog posts
            </Text>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onPress={() => {
                  setIsCreateDialogOpen(true);
                  setEditingPost(null);
                  resetForm();
                }}
                variant="default"
                className="bg-blue-600 ml-4"
              >
                <Text className="font-medium">Create Post</Text>
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent className="sm:max-w-3xl min-w-[500px]">
                <DialogTitle className="text-xl font-semibold">
                  Create New Post
                </DialogTitle>

                <div className="mt-6 mb-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Title *
                    </Label>
                    <Input
                      placeholder="Enter post title"
                      value={formData.title}
                      onChangeText={handleTitleChange}
                      className="mt-1"
                    />
                    {formErrors.title && (
                      <Text variant="small" className="text-red-500 mt-1">
                        {formErrors.title}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Slug
                    </Label>
                    <Input
                      placeholder="auto-generated-from-title"
                      value={formData.slug}
                      onChangeText={(text) => {
                        setFormData((prev) => ({ ...prev, slug: text }));
                      }}
                      className="mt-1"
                    />
                    {formErrors.slug && (
                      <Text variant="small" className="text-red-500 mt-1">
                        {formErrors.slug}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Content *
                    </Label>
                    <Textarea
                      placeholder="Enter post content"
                      value={formData.content}
                      onChangeText={(text) => {
                        setFormData((prev) => ({ ...prev, content: text }));
                      }}
                      className="min-h-[200px] mt-1"
                    />
                    {formErrors.content && (
                      <Text variant="small" className="text-red-500 mt-1">
                        {formErrors.content}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Status
                    </Label>
                    <Select
                      value={{
                        value: formData.status,
                        label:
                          formData.status === 'draft' ? 'Draft' : 'Published',
                      }}
                      onValueChange={(option) => {
                        if (option) {
                          setFormData((prev) => ({
                            ...prev,
                            status: option.value as PostStatus,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="draft" label="Draft">
                          Draft
                        </SelectItem>
                        <SelectItem value="published" label="Published">
                          Published
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onPress={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    variant="default"
                    onPress={handleSubmit}
                    disabled={createMutation.isPending}
                    className="bg-blue-600"
                  >
                    <Text>
                      {createMutation.isPending ? 'Creating...' : 'Create Post'}
                    </Text>
                  </Button>
                </div>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </div>

        {feedbackMessage && (
          <Alert
            variant={feedbackMessage.type}
            icon={feedbackMessage.type === 'default' ? CheckCircle : XCircle}
            className="mb-6"
          >
            <AlertTitle>
              {feedbackMessage.type === 'default' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{feedbackMessage.message}</AlertDescription>
          </Alert>
        )}

        {editingPost && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setEditingPost(null);
            }}
          >
            <DialogPortal>
              <DialogOverlay />
              <DialogContent className="sm:max-w-3xl min-w-[500px]">
                <DialogTitle className="text-xl font-semibold">
                  Edit Post
                </DialogTitle>

                <div className="mt-6 mb-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Title *
                    </Label>
                    <Input
                      placeholder="Enter post title"
                      value={formData.title}
                      onChangeText={handleTitleChange}
                      className="mt-1"
                    />
                    {formErrors.title && (
                      <Text variant="small" className="text-red-500 mt-1">
                        {formErrors.title}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Slug
                    </Label>
                    <Input
                      placeholder="auto-generated-from-title"
                      value={formData.slug}
                      onChangeText={(text) => {
                        setFormData((prev) => ({ ...prev, slug: text }));
                      }}
                      className="mt-1"
                    />
                    {formErrors.slug && (
                      <Text variant="small" className="text-red-500 mt-1">
                        {formErrors.slug}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Content *
                    </Label>
                    <Textarea
                      placeholder="Enter post content"
                      value={formData.content}
                      onChangeText={(text) => {
                        setFormData((prev) => ({ ...prev, content: text }));
                      }}
                      className="min-h-[200px] mt-1"
                    />
                    {formErrors.content && (
                      <Text variant="small" className="text-red-500 mt-1">
                        {formErrors.content}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Status
                    </Label>
                    <Select
                      value={{
                        value: formData.status,
                        label:
                          formData.status === 'draft' ? 'Draft' : 'Published',
                      }}
                      onValueChange={(option) => {
                        if (option) {
                          setFormData((prev) => ({
                            ...prev,
                            status: option.value as PostStatus,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="draft" label="Draft">
                          Draft
                        </SelectItem>
                        <SelectItem value="published" label="Published">
                          Published
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onPress={handleCancelEdit}>
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    variant="default"
                    onPress={handleSubmit}
                    disabled={updateMutation.isPending}
                    className="bg-blue-600"
                  >
                    <Text>
                      {updateMutation.isPending ? 'Updating...' : 'Update Post'}
                    </Text>
                  </Button>
                </div>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        )}

        <Card className="bg-white border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="p-6 flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && (
            <div className="p-6">
              <Alert variant="destructive" icon={XCircle}>
                <AlertTitle>Error Loading Posts</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !error && data?.items.length === 0 && (
            <div className="p-12 text-center">
              <Text className="text-6xl mb-4">📭</Text>
              <Text variant="h3" className="text-gray-900 mb-2">
                No posts yet
              </Text>
              <Text className="text-gray-600 mb-6">
                Get started by creating your first post
              </Text>
              <Button
                variant="default"
                onPress={() => {
                  setIsCreateDialogOpen(true);
                  setEditingPost(null);
                  resetForm();
                }}
                className="bg-blue-600"
              >
                <Text>Create First Post</Text>
              </Button>
            </div>
          )}

          {!isLoading && !error && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Text className="font-medium text-gray-900">
                          {post.title}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            post.status === 'published'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          <Text className="text-xs">
                            {post.status === 'published'
                              ? 'Published'
                              : 'Draft'}
                          </Text>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="small" className="text-gray-600">
                          {new Date(post.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            onPress={() => {
                              handleEdit(post);
                            }}
                            variant="outline"
                            className="px-3 py-1.5"
                          >
                            <Text>Edit</Text>
                          </Button>
                          <Button
                            onPress={() => {
                              setDeleteId(post.id);
                            }}
                            variant="outline"
                            className="px-3 py-1.5 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Text>Delete</Text>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <AlertDialog
          open={!!deleteId}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteId(null);
            }
          }}
        >
          <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogContent>
              <AlertDialogTitle className="text-xl font-semibold">
                Delete Post?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 mt-2">
                This action cannot be undone. The post will be permanently
                deleted.
              </AlertDialogDescription>
              <div className="flex justify-end gap-3 mt-6">
                <AlertDialogCancel asChild>
                  <Button variant="outline">
                    <Text>Cancel</Text>
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="default"
                    onPress={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600"
                  >
                    <Text>
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Text>
                  </Button>
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </div>
    </main>
  );
}
