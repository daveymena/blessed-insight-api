import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: number;
}

export function Logo({ className, size = 100 }: LogoProps) {
    return (
        <div
            className={cn("relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/20", className)}
            style={{ width: size, height: size }}
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            {/* Minimal SVG Icon representing the open bible and eye Insight */}
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[70%] h-[70%] text-white drop-shadow-md"
            >
                {/* Book Base */}
                <path
                    d="M10 25C10 22.2386 12.2386 20 15 20H48V80H15C12.2386 80 10 77.7614 10 75V25Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                />
                <path
                    d="M90 25C90 22.2386 87.7614 20 85 20H52V80H85C87.7614 80 90 77.7614 90 75V25Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                />

                {/* Book Pages */}
                <path
                    d="M15 25C15 22.2386 17.2386 20 20 20H48V75H20C17.2386 75 15 77.2386 15 80H15C15 77.2386 17.2386 75 20 75H48V80H20C17.2386 80 15 77.7614 15 75V25Z"
                    fill="white"
                />
                <path
                    d="M85 25C85 22.2386 82.7614 20 80 20H52V75H80C82.7614 75 85 77.2386 85 80H85C85 77.2386 82.7614 75 80 75H52V80H80C82.7614 80 85 77.7614 85 75V25Z"
                    fill="white"
                />

                {/* Insight Symbol (Stylized Eye/Spark) */}
                <circle cx="50" cy="45" r="12" fill="currentColor" fillOpacity="0.15" />
                <path
                    d="M50 30C40 30 32 45 32 45C32 45 40 60 50 60C60 60 68 45 68 45C68 45 60 30 50 30Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-amber-200"
                />
                <circle cx="50" cy="45" r="6" fill="currentColor" className="text-amber-400" />

                {/* Radiating Rays */}
                <path d="M50 20V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-200" />
                <path d="M50 75V70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-200" />
                <path d="M25 45H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-200" />
                <path d="M80 45H75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-200" />
            </svg>
        </div>
    );
}
