import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { getWikiPageBySlug, updateWikiPageFn } from '../../server/functions/wiki';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSessionUser } from '../../server/functions/auth';
import { Button, Input, Textarea, Card, CardHeader, Alert, LoadingState, Badge } from '../../components';

function WikiEditPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user from session cookies
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60 * 1000,
  });

  const user = authData?.success ? authData.data : null;

  const { data, isLoading } = useQuery({
    queryKey: ['wiki-page', slug],
    queryFn: () => getWikiPageBySlug({ data: { slug } }),
    enabled: !!user, // Only fetch when user is authenticated
  });

  useEffect(() => {
    if (data?.success && data.data) {
      setTitle(data.data.title);
      setContent(data.data.contentMarkdown);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.data?.id || !user) return;

    setError('');
    setLoading(true);

    try {
      const result = await updateWikiPageFn({
        data: {
          id: data.data.id,
          title,
          contentMarkdown: content,
          changeSummary: changeSummary || 'Cập nhật nội dung',
          editorId: user.id,
          userRole: user.role,
        },
      });

      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
        queryClient.invalidateQueries({ queryKey: ['wiki-page', slug] });
        navigate({ to: '/wiki/$slug', params: { slug: result.data.slug } });
      } else {
        setError(result.error || 'Không thể cập nhật bài viết');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // Show auth loading state
  if (authLoading) {
    return <LoadingState text="Đang kiểm tra quyền truy cập..." />;
  }

  // Show access denied if not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu đăng nhập</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Vui lòng đăng nhập để chỉnh sửa bài viết Wiki.
          </p>
          <Link to="/login">
            <Button className="w-full">Đăng nhập ngay</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState text="Đang tải bài viết..." />;
  }

  if (!data?.success || !data.data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy trang</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Bài viết wiki bạn muốn chỉnh sửa không tồn tại.
          </p>
          <Link to="/wiki">
            <Button className="w-full">⟵ Quay lại danh sách Wiki</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">Sửa</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa bài viết</h1>
              <p className="text-slate-500">{data.data.title}</p>
            </div>
          </div>
          <Badge variant="info" size="sm">
            Đang chỉnh sửa
          </Badge>
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
          />

          <Textarea
            label="Nội dung (Markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={20}
            className="font-mono text-sm"
            placeholder="Viết nội dung bằng Markdown..."
          />

          <Input
            label="Tóm tắt thay đổi"
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="Mô tả ngắn gọn những thay đổi của bạn..."
            helperText="Giúp người khác hiểu bạn đã thay đổi gì"
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: '/wiki/$slug', params: { slug } })}
            >
              ⟵ Hủy bỏ
            </Button>
            <div className="flex gap-3">
              <Link to="/wiki/$slug" params={{ slug }}>
                <Button variant="outline">
                  Xem trước
                </Button>
              </Link>
              <Button
                type="submit"
                isLoading={loading}
              >
                {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/wiki/edit/$slug')({
  component: WikiEditPage,
});
