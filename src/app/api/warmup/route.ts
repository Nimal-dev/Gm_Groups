import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ status: 'ready' }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}
