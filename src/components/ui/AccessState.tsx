import { Link } from '@tanstack/react-router';
import { Card } from './Card';
import { Button } from './Button';

interface AccessStateProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  icon?: string;
}

export function AccessState({
  title,
  description,
  buttonText = 'Đăng nhập ngay',
  buttonLink = '/login',
  icon = '🔒',
}: AccessStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full text-center" padding="lg">
        <div className="text-5xl mb-4">{icon}</div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 mt-2 mb-6">{description}</p>
        <Link to={buttonLink as any}>
          <Button className="w-full">{buttonText}</Button>
        </Link>
      </Card>
    </div>
  );
}
