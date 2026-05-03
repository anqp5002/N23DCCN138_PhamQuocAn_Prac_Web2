'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch (err: any) {
      console.error(err.response?.data?.error || err.message);
      toast.error('Không thể tải danh sách bài viết!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author) return toast.error('Vui lòng điền đủ thông tin');

    try {
      toast.loading('Đang lưu...', { id: 'create' });
      await api.post('/api/posts', { title, content, author });
      toast.success('Đăng bài thành công!', { id: 'create' });
      setTitle('');
      setContent('');
      setAuthor('');
      fetchPosts();
    } catch (err: any) {
      console.error(err.response?.data?.error || err.message);
      toast.error('Lỗi đăng bài!', { id: 'create' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;

    // 1. Lưu state hiện tại để rollback nếu lỗi
    const previousPosts = [...posts];

    // 2. Optimistic update (Cập nhật state NGAY LẬP TỨC)
    setPosts(prev => prev.filter(p => p.id !== id));

    try {
      // 3. Gọi API xoá
      await api.delete(`/api/posts/${id}`);
      toast.success('Đã xoá bài viết');
    } catch (err: any) {
      console.error(err.response?.data?.error || err.message);
      // 4. Rollback nếu lỗi
      setPosts(previousPosts);
      toast.error('Xoá thất bại, thử lại!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Blog</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="font-semibold text-lg border-b pb-2">Tạo bài viết mới</h2>
        <input 
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Tiêu đề" 
        />
        <textarea 
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Nội dung" 
          rows={4}
        />
        <input 
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          placeholder="Tác giả" 
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full font-medium" 
          type="submit"
        >
          Đăng bài
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Danh sách bài viết ({posts.length})</h2>
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Đang tải...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center bg-white p-8 rounded border shadow-sm">Chưa có bài viết nào.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <div key={p.id} className="bg-white p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{p.title}</h3>
                  <button 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors" 
                    onClick={() => handleDelete(p.id)}
                    title="Xoá bài viết"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{p.content}</p>
                <div className="mt-3 pt-3 border-t text-sm text-gray-500 flex justify-between">
                  <span>Bởi: <span className="font-medium text-gray-700">{p.author}</span></span>
                  {p.createdAt && (
                    <span>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
