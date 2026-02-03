import { getLevelConfig } from '@/lib/levelUtils';

interface LevelBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
    const config = getLevelConfig(level);

    // Scale factors
    const sizeClasses = {
        sm: {
            circle: 'w-10 h-10 text-lg border-2',
            banner: 'text-[8px] px-2 py-0.5 -bottom-2',
            container: 'w-16'
        },
        md: {
            circle: 'w-16 h-16 text-3xl border-4',
            banner: 'text-[10px] px-3 py-1 -bottom-3',
            container: 'w-24'
        },
        lg: {
            circle: 'w-24 h-24 text-5xl border-[6px]',
            banner: 'text-xs px-4 py-1.5 -bottom-4',
            container: 'w-32'
        }
    };

    const s = sizeClasses[size];

    return (
        <div className={`relative flex flex-col items-center justify-center ${s.container}`}>
            {/* Main Circle */}
            <div className={`
                flex items-center justify-center rounded-full bg-black 
                font-bold text-white font-mono z-10
                ${s.circle} 
                ${config.color.replace('bg-', 'border-')}
                ${config.glowColor} shadow-[0_0_15px_rgba(0,0,0,0.5)]
            `}>
                <div className="flex flex-col items-center leading-none">
                    {size !== 'sm' && <span className="text-[8px] uppercase opacity-60 mb-0.5">Level</span>}
                    <span>{level}</span>
                </div>
            </div>

            {/* Bottom Banner */}
            <div className={`
                absolute z-20 rounded-full font-bold uppercase tracking-wider text-black
                ${s.banner}
                ${config.color}
                shadow-lg
            `}>
                {config.title}
            </div>
        </div>
    );
}
