/**
 * Project Detail API Route
 * 
 * Refactored to follow SOLID principles:
 * - Uses ProjectService for business logic
 * - Cleaner separation between HTTP and business logic
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProjectService } from '@/container/Container';
import { logger } from '@/lib/logger';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const projectService = getProjectService();
        
        const result = await projectService.deleteProject(id, session.user.email);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.statusCode });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        
        const projectService = getProjectService();
        const result = await projectService.updateProject(id, session.user.email, body);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.statusCode });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        logger.error('Error updating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
