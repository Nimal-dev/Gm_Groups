import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Dashboard</h2>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <Skeleton className="h-4 w-[100px]" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-3 w-[80px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart/Table Area Skeleton */}
                <Card className="col-span-4 glass-card">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-[140px]" /></CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="space-y-2">
                            <Skeleton className="h-[300px] w-full" />
                        </div>
                    </CardContent>
                </Card>

                {/* Side Panel/Recent Activity Skeleton */}
                <Card className="col-span-3 glass-card">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-[120px]" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="ml-4 space-y-1">
                                        <Skeleton className="h-4 w-[120px]" />
                                        <Skeleton className="h-3 w-[80px]" />
                                    </div>
                                    <Skeleton className="ml-auto h-4 w-[40px]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
