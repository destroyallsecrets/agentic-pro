import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const artifactsDir = path.join(process.cwd(), 'public', 'artifacts');

    // Vercel Environment Check
    if (process.env.VERCEL === '1') {
        return NextResponse.json([]);
    }

    try {
        if (!fs.existsSync(artifactsDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(artifactsDir).map(file => {
            const stats = fs.statSync(path.join(artifactsDir, file));
            return {
                name: file,
                size: `${(stats.size / 1024).toFixed(1)}kb`,
                lastModified: stats.mtime
            };
        });

        return NextResponse.json(files);
    } catch (error) {
        console.warn("Artifact Bridge: FS Access Error", error);
        return NextResponse.json([]);
    }
}
