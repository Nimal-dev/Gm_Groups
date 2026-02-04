export type LevelConfig = {
    title: string;
    color: string;
    textColor: string;
    glowColor: string;
    shadowColor: string;
    shape: 'circle' | 'square' | 'hexagon' | 'octagon' | 'shield' | 'star';
    decoration: 'none' | 'swords' | 'wings' | 'elite_wings' | 'master_wings';
};

export function getLevelConfig(level: number): LevelConfig {
    if (level < 3) {
        return {
            title: "STAFF ELITE",
            color: "bg-yellow-500",
            textColor: "text-yellow-500",
            glowColor: "shadow-yellow-500/50",
            shadowColor: "rgba(234, 179, 8, 1)",
            shape: 'circle',
            decoration: 'none'
        };
    }
    if (level < 5) {
        return {
            title: "NOVICE",
            color: "bg-green-500",
            textColor: "text-green-500",
            glowColor: "shadow-green-500/50",
            shadowColor: "rgba(34, 197, 94, 1)",
            shape: 'square',
            decoration: 'none'
        };
    }
    if (level < 10) {
        return {
            title: "CLUB MEMBER",
            color: "bg-blue-500",
            textColor: "text-blue-500",
            glowColor: "shadow-blue-500/50",
            shadowColor: "rgba(59, 130, 246, 1)",
            shape: 'hexagon',
            decoration: 'none'
        };
    }
    if (level < 25) {
        return {
            title: "SPECIALIST",
            color: "bg-purple-500",
            textColor: "text-purple-500",
            glowColor: "shadow-purple-500/50",
            shadowColor: "rgba(168, 85, 247, 1)",
            shape: 'octagon',
            decoration: 'swords'
        };
    }
    if (level < 50) {
        return {
            title: "ELITE",
            color: "bg-red-600",
            textColor: "text-red-500",
            glowColor: "shadow-red-500/50",
            shadowColor: "rgba(220, 38, 38, 1)",
            shape: 'shield',
            decoration: 'wings'
        };
    }
    return {
        title: "MASTER",
        color: "bg-amber-400",
        textColor: "text-amber-400",
        glowColor: "shadow-amber-400/50",
        shadowColor: "rgba(251, 191, 36, 1)",
        shape: 'star',
        decoration: 'master_wings'
    };
}
