export type LevelConfig = {
    title: string;
    color: string;
    textColor: string;
    glowColor: string;
};

export function getLevelConfig(level: number): LevelConfig {
    if (level < 3) {
        return {
            title: "STAFF ELITE",
            color: "bg-yellow-500",
            textColor: "text-yellow-500",
            glowColor: "shadow-yellow-500/50"
        };
    }
    if (level < 5) {
        return {
            title: "NOVICE",
            color: "bg-green-500",
            textColor: "text-green-500",
            glowColor: "shadow-green-500/50"
        };
    }
    if (level < 10) {
        return {
            title: "CLUB MEMBER",
            color: "bg-blue-500",
            textColor: "text-blue-500",
            glowColor: "shadow-blue-500/50"
        };
    }
    if (level < 25) {
        return {
            title: "SPECIALIST",
            color: "bg-purple-500",
            textColor: "text-purple-500",
            glowColor: "shadow-purple-500/50"
        };
    }
    if (level < 50) {
        return {
            title: "ELITE",
            color: "bg-red-600",
            textColor: "text-red-500",
            glowColor: "shadow-red-500/50"
        };
    }
    return {
        title: "MASTER",
        color: "bg-amber-400",
        textColor: "text-amber-400",
        glowColor: "shadow-amber-400/50"
    };
}
