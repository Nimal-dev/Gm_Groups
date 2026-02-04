import { getLevelConfig } from '@/lib/levelUtils';
import { CrossedSwords, AngelWings, MasterWings } from './LevelDecorations';

interface LevelBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
    const config = getLevelConfig(level);
    const isClipShape = ['hexagon', 'octagon', 'shield', 'star'].includes(config.shape);

    // Dynamic styles for the fire effect
    const dynamicStyle = {
        '--level-glow-color': config.shadowColor,
        '--level-intensity': `${20 + (level * 2)}px`,
    } as React.CSSProperties;

    // Scale factors
    const sizeClasses = {
        sm: {
            circle: 'w-10 h-10 text-lg border-2',
            banner: 'text-[8px] px-2 py-0.5 -bottom-2',
            container: 'w-16',
            deco: 'scale-75'
        },
        md: {
            circle: 'w-16 h-16 text-3xl border-4',
            banner: 'text-[10px] px-3 py-1 -bottom-3',
            container: 'w-24',
            deco: 'scale-100'
        },
        lg: {
            circle: 'w-24 h-24 text-5xl border-[6px]',
            banner: 'text-xs px-4 py-1.5 -bottom-4',
            container: 'w-32',
            deco: 'scale-125'
        }
    };

    const s = sizeClasses[size];

    const renderDecoration = () => {
        const props = { className: s.deco, color: config.textColor.replace('text-', '') }; // Simple color fallback
        switch (config.decoration) {
            case 'swords': return <CrossedSwords {...props} />;
            case 'wings': return <AngelWings {...props} />;
            case 'master_wings': return <MasterWings {...props} />;
            default: return null;
        }
    };

    return (
        <div
            className={`relative flex flex-col items-center justify-center ${s.container}`}
            style={dynamicStyle}
        >
            {/* Decoration Behind */}
            {renderDecoration()}

            {/* Main Badge */}
            <div className={`
                flex items-center justify-center 
                font-bold font-mono z-10
                ${s.circle} 
                shape-${config.shape}
                ${isClipShape ? 'shadow-none drop-shadow-md' : 'animate-level-fire'}
                ${config.shape === 'star'
                    ? 'scale-125 bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 border-yellow-200/50 text-black'
                    : `bg-black text-white ${config.color.replace('bg-', 'border-')}`
                }
            `}
                style={isClipShape ? { filter: `drop-shadow(0 0 ${10 + (level * 0.5)}px ${config.shadowColor})` } : {}}
            >
                <div className={`flex flex-col items-center leading-none ${config.shape === 'star' ? 'scale-75 mt-1' : ''}`}>
                    {size !== 'sm' && <span className={`text-[8px] uppercase mb-0.5 ${config.shape === 'star' ? 'text-black/60' : 'opacity-60'}`}>Level</span>}
                    <span>{level}</span>
                </div>
            </div>

            {/* Bottom Banner */}
            <div className={`
                absolute z-20 rounded-full font-bold uppercase tracking-wider
                ${config.title === 'MASTER' ? 'text-white' : 'text-black'}
                ${s.banner}
                ${config.color}
                shadow-lg
            `}>
                {config.title}
            </div>
        </div>
    );
}
