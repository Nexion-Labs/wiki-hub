import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
        // Custom heading renderer with anchor links
        h1: ({ node, ...props }) => (
          <h1 className="text-4xl font-bold mt-8 mb-4 text-slate-900 border-b-2 border-slate-200 pb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-3xl font-bold mt-6 mb-3 text-slate-900" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-2xl font-semibold mt-5 mb-2 text-slate-800" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-xl font-semibold mt-4 mb-2 text-slate-800" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h5 className="text-lg font-semibold mt-3 mb-2 text-slate-700" {...props} />
        ),
        h6: ({ node, ...props }) => (
          <h6 className="text-base font-semibold mt-2 mb-1 text-slate-700" {...props} />
        ),

        // Paragraph
        p: ({ node, ...props }) => (
          <p className="mb-4 leading-7 text-slate-700" {...props} />
        ),

        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            target={props.href?.startsWith('http') ? '_blank' : undefined}
            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props}
          />
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 ml-4 text-slate-700" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 ml-4 text-slate-700" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-7" {...props} />
        ),

        // Blockquote
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-emerald-500 bg-emerald-50 pl-4 py-2 my-4 italic text-slate-700"
            {...props}
          />
        ),

        // Code blocks
        code: ({ node, inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={`block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono ${className || ''}`}
              {...props}
            >
              {children}
            </code>
          );
        },

        // Pre (wrapper for code blocks)
        pre: ({ node, ...props }) => (
          <pre className="my-4 overflow-hidden rounded-lg" {...props} />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-slate-200 border border-slate-200" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-slate-50" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="bg-white divide-y divide-slate-200" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-slate-50" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-3 text-sm text-slate-700" {...props} />
        ),

        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="my-8 border-t-2 border-slate-200" {...props} />
        ),

        // Images
        img: ({ node, ...props }) => (
          <img
            className="max-w-full h-auto rounded-lg shadow-md my-4"
            loading="lazy"
            {...props}
          />
        ),

        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-slate-900" {...props} />
        ),

        // Emphasis/Italic
        em: ({ node, ...props }) => (
          <em className="italic text-slate-700" {...props} />
        ),

        // Strikethrough
        del: ({ node, ...props }) => (
          <del className="line-through text-slate-500" {...props} />
        ),

        // Task list items (GFM)
        input: ({ node, ...props }: any) => {
          if (props.type === 'checkbox') {
            return (
              <input
                type="checkbox"
                className="mr-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                disabled
                {...props}
              />
            );
          }
          return <input {...props} />;
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
