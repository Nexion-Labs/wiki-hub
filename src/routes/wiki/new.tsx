import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { createWikiPageFn } from '../../server/functions/wiki';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getSessionUser } from '../../server/functions/auth';
import { Button, Input, Textarea, Card, CardHeader, Alert, LoadingState } from '../../components';

function WikiNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user from session cookies
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000,
  });

  const user = authData?.success ? authData.data : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Bạn cần đăng nhập để tạo bài viết');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const result = await createWikiPageFn({
        data: {
          title,
          contentMarkdown: content,
          isPublished: true,
          authorId: user.id,
        },
      });

      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
        navigate({ to: '/wiki/$slug', params: { slug: result.data.slug } });
      } else {
        setError(result.error || 'Không thể tạo bài viết');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return <LoadingState text="Đang tải..." />;
  }

  // Show access denied if not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu đăng nhập</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Vui lòng đăng nhập để tạo bài viết Wiki mới.
          </p>
          <Link to="/login">
            <Button className="w-full">Đăng nhập ngay</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">✏️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tạo bài viết mới</h1>
            <p className="text-slate-500">Viết và chia sẻ kiến thức với mọi người</p>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Tiêu đề"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Nhập tiêu đề bài viết..."
            helperText="Tiêu đề nên ngắn gọn và mô tả rõ nội dung"
          />

          <Textarea
            label="Nội dung (Markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={20}
            className="font-mono text-sm"
            placeholder="Viết nội dung bằng Markdown...

# Tiêu đề H1
## Tiêu đề H2

**In đậm** và *in nghiêng*

- Danh sách
- Các mục

```code
Khối code
```"
            helperText="Hỗ trợ cú pháp Markdown đầy đủ"
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: '/wiki' })}
            >
              ← Quay lại
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Preview functionality could be added here
                }}
              >
                👁️ Xem trước
              </Button>
              <Button
                type="submit"
                isLoading={loading}
              >
                {loading ? 'Đang tạo...' : '📤 Xuất bản'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/wiki/new')({
  component: WikiNewPage,
});
