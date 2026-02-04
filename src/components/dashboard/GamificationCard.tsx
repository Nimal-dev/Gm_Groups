'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Medal, Award } from 'lucide-react';
import { getLevelConfig } from '@/lib/levelUtils';
import { CrossedSwords, AngelWings, MasterWings } from './LevelDecorations';

interface GamificationCardProps {
    user: {
        username: string;
        xp: number;
        level: number;
        achievements?: {
            id: string;
            title: string;
            unlockedAt: Date;
            icon?: string;
        }[];
    };
}

export function GamificationCard({ user }: GamificationCardProps) {
    // Level Logic: Level = floor(sqrt(XP) * 0.1) + 1
    // XP for current level start: ( (Level-1) / 0.1 )^2
    // XP for next level start: ( Level / 0.1 )^2
    const currentLevel = user.level || 1;
    const currentXp = user.xp || 0;

    const config = getLevelConfig(currentLevel);
    const isClipShape = ['hexagon', 'octagon', 'shield', 'star'].includes(config.shape);

    const dynamicStyle = {
        '--level-glow-color': config.shadowColor,
        '--level-intensity': `${20 + (currentLevel * 2)}px`,
    } as React.CSSProperties;

    const getXpForLevel = (lvl: number) => Math.pow((lvl - 1) * 10, 2);

    const startXp = getXpForLevel(currentLevel);
    const nextXp = getXpForLevel(currentLevel + 1);

    const xpNeeded = nextXp - startXp;
    const xpProgress = currentXp - startXp;
    const percentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

    const renderDecoration = () => {
        const props = { className: 'scale-125', color: config.textColor.replace('text-', '') };
        switch (config.decoration) {
            case 'swords': return <CrossedSwords {...props} />;
            case 'wings': return <AngelWings {...props} />;
            case 'master_wings': return <MasterWings {...props} />;
            default: return null;
        }
    };

    return (
        <Card className="glass-card mb-6 border-accent/20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trophy className="w-32 h-32" />
            </div>

            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Level Badge */}
                    <div className="relative group flex justify-center items-center w-32 h-32" style={dynamicStyle}>

                        {renderDecoration()}

                        <div className={`
                            w-24 h-24 flex items-center justify-center 
                            bg-black
                            ${config.color}
                            shape-${config.shape}
                            ${isClipShape ? 'shadow-none drop-shadow-lg' : 'animate-level-fire rounded-full'}
                        `}
                            style={isClipShape ? { filter: `drop-shadow(0 0 ${10 + (currentLevel * 0.5)}px ${config.shadowColor})` } : {}}
                        >
                            <div className={`
                                w-20 h-20 flex flex-col items-center justify-center 
                                bg-black border-4 
                                ${config.color.replace('bg-', 'border-')}/50
                                shape-${config.shape}
                                ${!isClipShape && 'rounded-full'}
                                ${config.shape === 'star' ? 'pt-2 pb-1' : ''} 
                            `}>
                                <span className={`text-[10px] uppercase text-muted-foreground font-bold tracking-widest ${config.shape === 'star' ? 'text-[8px] -mt-1' : ''}`}>Level</span>
                                <span className={`font-black text-white leading-none ${config.shape === 'star' ? 'text-2xl' : 'text-4xl'}`}>{currentLevel}</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 w-full text-center z-20">
                            <Badge className={`${config.color} text-black hover:brightness-110 border-0 font-bold px-2 py-0.5 text-[10px]`}>
                                {config.title}
                            </Badge>
                        </div>
                    </div>

                    {/* Stats & Progress */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-2xl font-bold">{user.username}</h3>
                                <p className="text-sm text-accent flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-accent" /> Total XP: {currentXp.toLocaleString('en-US')}
                                </p>
                            </div>
                            <div className="text-right text-xs font-mono text-muted-foreground">
                                {Math.floor(xpProgress)} / {xpNeeded} XP to Level {currentLevel + 1}
                            </div>
                        </div>

                        <div className="relative h-4 w-full bg-secondary/50 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Recent Achievements Preview */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {user.achievements && user.achievements.length > 0 ? (
                                user.achievements.slice(-5).map((ach) => (
                                    <div key={ach.id} className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 shrink-0" title={new Date(ach.unlockedAt).toLocaleDateString('en-GB')}>
                                        <Medal className="w-4 h-4 text-yellow-400" />
                                        <span className="text-xs font-medium">{ach.title}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                                    <Award className="w-4 h-4 opacity-50" /> No achievements yet. Keep working!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
