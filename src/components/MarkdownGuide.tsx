import { useState } from 'react';
import { Card } from './ui/Card';
import { MarkdownRenderer } from './MarkdownRenderer';

export function MarkdownGuide() {
  const [activeTab, setActiveTab] = useState<'guide' | 'preview'>('guide');

  const markdownExamples = `# Heading 1
## Heading 2
### Heading 3

## Text Formatting

**Bold text** and *italic text*

~~Strikethrough~~

## Links

[Link text](https://example.com)

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

### Task List
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Code

Inline \`code\` with backticks

\`\`\`javascript
// Code block with syntax highlighting
function hello() {
  console.log('Hello, World!');
}
\`\`\`

\`\`\`python
# Python example
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

## Blockquote

> This is a blockquote
> It can span multiple lines

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More data|
| Row 2    | Data     | More data|
| Row 3    | Data     | More data|

## Images

![Alt text](https://via.placeholder.com/400x200)

## Horizontal Rule

---

## Combining Elements

You can combine different elements:

1. **Bold item** with *italic*
2. [Link in a list](https://example.com)
3. \`code in a list\`

> **Note:** You can use formatting inside blockquotes too!

### Complex Example

Here's a more complex example:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
};
\`\`\`

That's how you write TypeScript code! ✨
`;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-slate-200 flex">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'guide'
              ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📖 Markdown Guide
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          👁️ Preview
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'guide' ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                📝 Hướng dẫn sử dụng Markdown
              </h2>
              <p className="text-slate-600 mb-6">
                Markdown là một ngôn ngữ đánh dấu văn bản đơn giản. Dưới đây là các cú pháp cơ bản:
              </p>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-slate-100 text-sm font-mono whitespace-pre-wrap">
                {markdownExamples}
              </pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Sử dụng heading (# ## ###) để tổ chức nội dung</li>
                <li>Code blocks hỗ trợ syntax highlighting cho nhiều ngôn ngữ</li>
                <li>Tables tự động căn chỉnh và responsive</li>
                <li>Task lists giúp tạo checklist dễ dàng</li>
                <li>Images tự động resize và có shadow effect</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              👁️ Preview của các ví dụ
            </h2>
            <div className="border border-slate-200 rounded-lg p-6 bg-white">
              <MarkdownRenderer content={markdownExamples} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
