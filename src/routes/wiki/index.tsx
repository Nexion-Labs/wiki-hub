import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { listWikiPages } from '../../server/functions/wiki';
import { Button, Input, Card, Badge, LoadingState, EmptyState } from '../../components';
import { SearchIcon, ClockIcon, ChevronRightIcon } from '../../components/icons';

function WikiListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha'>('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['wiki-pages'],
    queryFn: () => listWikiPages({ data: {} }),
  });

  const pages = (data as { success: boolean; data: any[] })?.success ? (data as { success: boolean; data: any[] }).data : [];

  const filteredPages = useMemo(() => {
    if (!pages) return [];

    let result = [...pages];

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((page: any) =>
        page.title.toLowerCase().includes(term) ||
        page.slug.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a: any, b: any) => {
      if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [pages, searchTerm, sortBy]);

  if (isLoading) {
    return <LoadingState text="Đang tải danh sách bài viết..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Wiki Pages</h1>
          <p className="text-slate-500 mt-1">
            Tổng cộng {pages?.length || 0} bài viết
          </p>
        </div>
        <Link to="/wiki/new">
          <Button>
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="md" className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          {(['newest', 'oldest', 'alpha'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${sortBy === sort
                ? 'bg-emerald-100 text-emerald-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {sort === 'newest' && 'Mới nhất'}
              {sort === 'oldest' && 'Cũ nhất'}
              {sort === 'alpha' && 'A-Z'}
            </button>
          ))}
        </div>
      </Card>

      {/* Pages List */}
      {filteredPages.length > 0 ? (
        <div className="grid gap-4">
          {filteredPages.map((page: any) => (
            <Link
              key={page.id}
              to="/wiki/$slug"
              params={{ slug: page.slug }}
              className="block"
            >
              <Card
                className="hover:shadow-md hover:border-emerald-200 transition-all group"
                padding="md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                      {page.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(page.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                      {page.isPublished ? (
                        <Badge variant="success" size="sm">Đã xuất bản</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Bản nháp</Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <ChevronRightIcon className="w-5 h-5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="📝"
            title={searchTerm ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
            description={
              searchTerm
                ? `Không có bài viết nào phù hợp với "${searchTerm}"`
                : 'Hãy tạo bài viết đầu tiên của bạn!'
            }
            action={
              !searchTerm && (
                <Link to="/wiki/new">
                  <Button>Tạo bài viết mới</Button>
                </Link>
              )
            }
          />
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute('/wiki/')({
  component: WikiListPage,
});
