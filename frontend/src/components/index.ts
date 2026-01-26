/**
 * Centralized component exports
 * Following Vercel React Best Practices:
 * - bundle-barrel-imports: Direct imports available, but barrel file provided for convenience
 *
 * NOTE: When importing these components, prefer direct imports for better tree-shaking:
 * ✅ import { Badge } from '@/components/Badge'
 * ⚠️ import { Badge } from '@/components' (works but may increase bundle size)
 */

export { Badge } from './Badge';
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { Textarea } from './Textarea';
export { Navbar } from './Navbar';
export { StatCard, Icons } from './StatCard';
