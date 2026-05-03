'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiMessageSquare, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
}

function PostItem({ post }: { post: Post }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['comments', post.id],
    queryFn: () => api.get(`/api/posts/${post.id}/comments`).then(r => r.data),
    enabled: showComments
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/posts/${id}`),
    onMutate: async (id: number) => {
      // Cancel bất kỳ refetch nào đang chạy
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      // Lưu snapshot trước khi thay đổi
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);
      // Optimistic update: xoá khỏi UI ngay lập tức
      queryClient.setQueryData<Post[]>(['posts'], (old) =>
        old ? old.filter(p => p.id !== id) : []
      );
      return { previousPosts };
    },
    onSuccess: () => {
      toast.success('Đã xoá bài viết');
    },
    onError: (_err, _id, context) => {
      // Rollback: gọi lại dữ liệu cũ nếu xoá thất bại
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Xoá thất bại, thử lại!');
    },
    onSettled: () => {
      // Đồng bộ lại với server
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: {id: number, title: string, content: string}) => api.put(`/api/posts/${data.id}`, {title: data.title, content: data.content}),
    onSuccess: () => {
      toast.success('Cập nhật thành công!');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => toast.error('Cập nhật thất bại!')
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: {postId: number, author: string, content: string}) => api.post(`/api/posts/${data.postId}/comments`, {author: data.author, content: data.content}),
    onSuccess: () => {
      toast.success('Đã gửi bình luận');
      setCommentAuthor('');
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/comments/${id}`),
    onSuccess: () => {
      toast.success('Đã xoá bình luận');
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
    }
  });

  return (
    <div className="p-4 border rounded-lg mb-4 shadow-sm bg-white">
      {isEditing ? (
        <div className="space-y-2 mb-4">
          <input className="w-full border p-2 rounded" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <textarea className="w-full border p-2 rounded" value={editContent} onChange={e => setEditContent(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({id: post.id, title: editTitle, content: editContent})}>Lưu</button>
            <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setIsEditing(false)}>Huỷ</button>
          </div>
        </div>
      ) : (
        <div className="mb-2">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">{post.title}</h3>
            <div className="flex gap-2">
              <button className="text-blue-500 hover:text-blue-700" onClick={() => setIsEditing(true)}><FiEdit2 /></button>
              <button className="text-red-500 hover:text-red-700" disabled={deleteMutation.isPending} onClick={() => { if(confirm('Chắc chắn xoá bài?')) deleteMutation.mutate(post.id) }}><FiTrash2 /></button>
            </div>
          </div>
          <p className="text-gray-700 mt-1">{post.content}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Bởi: {post.author}</span>
            <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => setShowComments(!showComments)}>
              <FiMessageSquare /> {showComments ? 'Ẩn bình luận' : 'Bình luận'}
            </button>
          </div>
        </div>
      )}

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-sm mb-3">Bình luận ({comments.length})</h4>
          
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {isLoadingComments ? <p className="text-xs text-gray-400">Đang tải...</p> : comments.map(c => (
              <div key={c.id} className="bg-gray-50 p-2 rounded text-sm group flex justify-between">
                <div>
                  <span className="font-medium">{c.author}: </span>
                  <span>{c.content}</span>
                </div>
                <button className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { if(confirm('Xoá bình luận?')) deleteCommentMutation.mutate(c.id) }}><FiTrash2 size={14}/></button>
              </div>
            ))}
            {comments.length === 0 && !isLoadingComments && <p className="text-xs text-gray-400">Chưa có bình luận nào.</p>}
          </div>

          <div className="flex gap-2">
            <input className="border p-1 text-sm rounded w-1/4" placeholder="Tên" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} />
            <input className="border p-1 text-sm rounded flex-1" placeholder="Nội dung..." value={commentContent} onChange={e => setCommentContent(e.target.value)} />
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50" disabled={addCommentMutation.isPending || !commentAuthor || !commentContent} onClick={() => addCommentMutation.mutate({postId: post.id, author: commentAuthor, content: commentContent})}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: () => api.get('/api/posts').then(r => r.data)
  });

  const createMutation = useMutation({
    mutationFn: (newPost: {title: string, content: string, author: string}) => api.post('/api/posts', newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTitle('');
      setContent('');
      setAuthor('');
    },
    onError: () => toast.error('Có lỗi xảy ra!')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author) return toast.error('Vui lòng điền đủ thông tin');

    toast.promise(
      createMutation.mutateAsync({ title, content, author }),
      {
        loading: 'Đang lưu...',
        success: 'Đăng bài thành công!',
        error: 'Lỗi đăng bài!',
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Blog</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg border-b pb-2">Tạo bài viết mới</h2>
        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
        <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung" />
        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Tác giả" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full" type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Danh sách bài viết ({posts.length})</h2>
        {isLoading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : (
          posts.map((p) => <PostItem key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}
