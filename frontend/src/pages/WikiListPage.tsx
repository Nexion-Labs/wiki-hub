import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wikiApi, type WikiPage } from '../api/wiki.api';
import { useAuth } from '../contexts/AuthContext';

export const WikiListPage = () => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadPages();
  }, [search]);

  const loadPages = async () => {
    try {
      const response = await wikiApi.getPages({ search: search || undefined });
      setPages(response.data.data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wiki Pages</h1>
              <p className="mt-2 text-gray-600">Browse and search wiki articles</p>
            </div>
            {user && (
              <Link
                to="/wiki/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                New Page
              </Link>
            )}
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No pages found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                to={`/wiki/${page.slug}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {page.title}
                </h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Views: {page.viewCount}</p>
                  <p>
                    Updated:{' '}
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
