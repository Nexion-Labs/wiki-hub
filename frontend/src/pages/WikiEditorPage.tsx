import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wikiApi } from '../api/wiki.api';
import { useAuth } from '../contexts/AuthContext';

export const WikiEditorPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageId, setPageId] = useState('');

  useEffect(() => {
    if (slug) {
      loadPage();
    }
  }, [slug]);

  const loadPage = async () => {
    if (!slug) return;
    try {
      const response = await wikiApi.getPage(slug);
      const page = response.data.data;
      setTitle(page.title);
      setContent(page.contentMarkdown);
      setIsPublished(page.isPublished);
      setPageId(page.id);
      setIsEditMode(true);
    } catch (error) {
      console.error('Failed to load page:', error);
      setError('Failed to load page');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        await wikiApi.updatePage(pageId, {
          title,
          contentMarkdown: content,
          isPublished,
        });
      } else {
        await wikiApi.createPage({
          title,
          contentMarkdown: content,
          isPublished,
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8">Please login to create/edit pages</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Page' : 'New Page'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content (Markdown)
            </label>
            <textarea
              id="content"
              required
              rows={20}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Heading&#10;&#10;Write your content in **Markdown**..."
            />
          </div>

          <div className="flex items-center">
            <input
              id="published"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Page' : 'Create Page'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
