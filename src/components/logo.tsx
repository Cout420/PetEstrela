import Link from 'next/link';
import { PawIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2 text-lg font-bold tracking-tight text-secondary-foreground',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary p-1">
        <PawIcon className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="flex flex-col font-headline leading-tight">
        <span className="text-sm">PET ESTRELA</span>
        <span className="text-xs font-normal text-muted-foreground">
          CREMATÓRIO
        </span>
      </div>
    </Link>
  );
};

export default Logo;
