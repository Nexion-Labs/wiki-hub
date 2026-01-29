// Simple markdown to HTML conversion for storage
// In production, you'd use a library like marked or markdown-it
export const markdownToHtml = (markdown: string): string => {
  // Basic conversion - replace with proper library in production
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  return html;
};

export const sanitizeMarkdown = (markdown: string): string => {
  // Remove potentially dangerous HTML/JS
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
};
