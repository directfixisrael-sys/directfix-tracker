import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', clickable = true, className }: LogoProps) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const badgeSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 select-none",
        clickable && "cursor-pointer",
        className
      )}
      onClick={clickable ? () => navigate('/') : undefined}>
      
      <div className={cn(
        "bg-primary rounded-xl flex items-center justify-center shadow-md border-2 border-foreground/10",
        badgeSizes[size]
      )}>
        <Wrench className={cn("text-primary-foreground", iconSizes[size])} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn(
          "font-extrabold tracking-tight text-foreground",
          sizeClasses[size]
        )}
        style={{ fontFamily: "'Rubik', sans-serif" }}>
          
          direct<span className="text-primary">fix</span>
        </span>
      </div>
    </div>);

};

export default Logo;