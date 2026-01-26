import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wikiApi, type WikiPage } from '../api/wiki.api';
import { useAuth } from '../contexts/AuthContext';

export const WikiViewPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (slug) {
      loadPage();
    }
  }, [slug]);

  const loadPage = async () => {
    if (!slug) return;
    try {
      const response = await wikiApi.getPage(slug);
      setPage(response.data.data);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
              <div className="text-sm text-gray-500">
                <span>Views: {page.viewCount}</span>
                <span className="mx-2">•</span>
                <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            {user && (
              <Link
                to={`/wiki/edit/${page.slug}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </Link>
            )}
          </div>

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link to="/" className="text-blue-600 hover:underline">
              ← Back to all pages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
