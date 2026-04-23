import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/logo-directfix.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', clickable = true, className }: LogoProps) => {
  const navigate = useNavigate();

  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

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
        src={logoImg}
        alt="DirectFix - דיירקט פיקס"
        className={cn('w-auto object-contain', heightClasses[size])}
        draggable={false}
      />
    </div>
  );
};

export default Logo;
