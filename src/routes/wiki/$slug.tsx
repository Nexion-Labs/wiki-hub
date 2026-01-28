import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getWikiPageBySlug } from '../../server/functions/wiki';
import { Button, Card, LoadingState, Badge } from '../../components';

function WikiViewPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['wiki-page', slug],
    queryFn: () => getWikiPageBySlug({ data: { slug } }),
  });

  if (isLoading) {
    return <LoadingState text="Đang tải bài viết..." />;
  }

  if (!(data as any)?.success || !(data as any).data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy trang</h1>
          <p className="text-slate-500 mt-2 mb-6">
            Bài viết wiki bạn yêu cầu không tồn tại hoặc đã bị xóa.
          </p>
          <Link to="/wiki">
            <Button className="w-full">⟵ Quay lại danh sách Wiki</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const page = (data as any).data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-slate-500 hover:text-slate-700">🏠 Trang chủ</Link>
          <span className="text-slate-400">/</span>
          <Link to="/wiki" className="text-slate-500 hover:text-slate-700">📚 Wiki</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{page.title}</span>
        </div>
        <Link to="/wiki/edit/$slug" params={{ slug: page.slug }}>
          <Button variant="outline" size="sm">
            Chỉnh sửa
          </Button>
        </Link>
      </div>

      {/* Article Card */}
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-emerald-100">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cập nhật: {new Date(page.updatedAt).toLocaleDateString('vi-VN')}
            </span>
            {page.author && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {page.author.username || 'Ẩn danh'}
              </span>
            )}
            <Badge
              variant={page.isPublished ? 'success' : 'default'}
              className="bg-white/20 border-white/30 text-white"
            >
              {page.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <article
            className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>📅 Tạo lúc: {new Date(page.createdAt).toLocaleDateString('vi-VN')}</span>
            {page.version && <span>📌 Phiên bản: {page.version}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Sao chép link
            </Button>
            <Button variant="ghost" size="sm">
              Chia sẻ
            </Button>
          </div>
        </div>
      </Card>

      {/* Back Link */}
      <div className="text-center pt-4">
        <Link to="/wiki" className="text-emerald-600 hover:text-emerald-700 font-medium">
          ⟵ Quay lại danh sách bài viết
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/wiki/$slug')({
  component: WikiViewPage,
});
