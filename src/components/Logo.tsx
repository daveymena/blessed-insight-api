import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 100 }: LogoProps) {
    return (
        <div
            className={cn("relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#1a1a2e] shadow-lg shadow-blue-900/20", className)}
            style={{ width: size, height: size }}
        >
            <img
                src="/icon-192.png"
                alt="Blessed Insight Logo"
                className="w-full h-full object-cover"
            />
        </div>
    );
}
