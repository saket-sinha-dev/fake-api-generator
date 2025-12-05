import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { Project } from '@/models';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const project = await Project.findOne({ id });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Only owner can delete
        if (project.userId !== session.user.email) {
            return NextResponse.json({ error: 'Only project owner can delete' }, { status: 403 });
        }

        await Project.deleteOne({ id });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
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
        await connectDB();

        const project = await Project.findOne({ id });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const userEmail = session.user.email;

        // Check if user has access (owner or collaborator)
        const hasAccess = project.userId === userEmail || 
                         (project.collaborators && project.collaborators.includes(userEmail));

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const updatedProject = await Project.findOneAndUpdate(
            { id },
            { ...body, updatedAt: new Date() },
            { new: true }
        );

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
