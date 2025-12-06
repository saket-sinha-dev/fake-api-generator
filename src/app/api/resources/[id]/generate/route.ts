/**
 * Resource Data Generation API Route
 * 
 * Refactored to follow SOLID principles:
 * - Uses ResourceService for data generation
 * - Business logic extracted from route
 * - Cleaner, more maintainable code
 */

import { NextResponse } from 'next/server';
import { getResourceService } from '@/container/Container';
import { logger } from '@/lib/logger';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { count = 10 } = await request.json();

        const resourceService = getResourceService();
        const result = await resourceService.generateData(id, count);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.statusCode });
        }

        return NextResponse.json({ 
            success: true, 
            count: result.data?.length || 0, 
            data: result.data 
        });
    } catch (error) {
        logger.error('Error generating data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
