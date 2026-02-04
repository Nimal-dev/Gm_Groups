import React from 'react';

// Common decoration props
interface DecorationProps {
    className?: string;
    color?: string;
}

export const CrossedSwords = ({ className = '', color = 'currentColor' }: DecorationProps) => (
    <svg
        viewBox="0 0 100 100"
        className={`absolute w-[180%] h-[180%] -z-10 opacity-80 ${className}`}
        style={{ color }}
    >
        <defs>
            <linearGradient id="swordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        {/* Sword 1 */}
        <path
            d="M 20 80 L 80 20 M 25 75 L 75 25"
            stroke="url(#swordGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
        />
        <path
            d="M 20 80 L 30 90 M 80 20 L 90 10"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.5"
        />
        {/* Handle 1 */}
        <path d="M 15 85 L 25 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M 10 80 L 30 100" stroke="currentColor" strokeWidth="1" />

        {/* Sword 2 */}
        <path
            d="M 80 80 L 20 20 M 75 75 L 25 25"
            stroke="url(#swordGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
        />
        {/* Handle 2 */}
        <path d="M 85 85 L 75 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M 90 80 L 70 100" stroke="currentColor" strokeWidth="1" />
    </svg>
);

export const AngelWings = ({ className = '', color = 'currentColor' }: DecorationProps) => (
    <svg
        viewBox="0 0 200 100"
        className={`absolute w-[220%] h-[220%] -z-10 -top-[20%] ${className}`}
        style={{ color }}
    >
        <filter id="wingGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        {/* Left Wing */}
        <path
            d="M 100 50 Q 60 10 30 30 T 10 80 Q 40 70 60 80 T 100 50"
            fill="currentColor"
            opacity="0.3"
            filter="url(#wingGlow)"
        />
        <path
            d="M 100 50 Q 60 20 40 40 T 25 70 Q 50 60 70 70 T 100 50"
            fill="currentColor"
            opacity="0.6"
        />
        {/* Right Wing */}
        <path
            d="M 100 50 Q 140 10 170 30 T 190 80 Q 160 70 140 80 T 100 50"
            fill="currentColor"
            opacity="0.3"
            filter="url(#wingGlow)"
        />
        <path
            d="M 100 50 Q 140 20 160 40 T 175 70 Q 150 60 130 70 T 100 50"
            fill="currentColor"
            opacity="0.6"
        />
    </svg>
);

export const MasterWings = ({ className = '' }: DecorationProps) => (
    <div className={`absolute w-full h-full flex items-center justify-center -z-10 ${className}`}>
        <CrossedSwords className="active-swords animate-pulse" />
        <AngelWings className="fire-wings animate-level-fire opacity-80" />
    </div>
);
