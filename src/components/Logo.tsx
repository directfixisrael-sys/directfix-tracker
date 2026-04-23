import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import logoLight from '@/assets/logo-directfix.png';
import logoDark from '@/assets/logo-directfix-dark.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', clickable = true, className }: LogoProps) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const heightClasses = {
    sm: 'h-12 sm:h-14',
    md: 'h-16 sm:h-20',
    lg: 'h-24 sm:h-28',
  };

  const src = resolvedTheme === 'dark' ? logoDark : logoLight;

  return (
    <div
      className={cn(
        'flex items-center select-none',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={clickable ? () => navigate('/') : undefined}
      role={clickable ? 'button' : undefined}
      aria-label="DirectFix - דיירקט פיקס"
    >
      <img
        src={src}
        alt="DirectFix - דיירקט פיקס"
        className={cn('w-auto object-contain', heightClasses[size])}
        draggable={false}
      />
    </div>
  );
};

export default Logo;
