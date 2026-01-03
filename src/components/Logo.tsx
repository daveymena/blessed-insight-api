import { cn } from '@/lib/utils';
import { memo } from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo = memo(({ className, size = 100 }: LogoProps) => {
    return (
        <div
            className={cn("relative flex items-center justify-center overflow-hidden", className)}
            style={{ width: size, height: size }}
        >
            <img
                src="/icon-192.png"
                alt="Blessed Insight Logo"
                className="w-full h-full object-contain"
            />
        </div>
    );
});
