import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { Project } from '@/models';

// POST /api/projects/[id]/collaborators - Add collaborator
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const project = await Project.findOne({ id });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Only owner can add collaborators
    if (project.userId !== session.user.email) {
      return NextResponse.json({ error: 'Only project owner can add collaborators' }, { status: 403 });
    }

    // Initialize collaborators array if it doesn't exist
    if (!project.collaborators) {
      project.collaborators = [];
    }

    // Check if already a collaborator
    if (project.collaborators.includes(email)) {
      return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
    }

    // Can't add owner as collaborator
    if (email === project.userId) {
      return NextResponse.json({ error: 'Owner is already a collaborator' }, { status: 400 });
    }

    project.collaborators.push(email);
    project.updatedAt = new Date();

    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    return NextResponse.json({ error: 'Failed to add collaborator' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/collaborators - Remove collaborator
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const project = await Project.findOne({ id });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Only owner can remove collaborators
    if (project.userId !== session.user.email) {
      return NextResponse.json({ error: 'Only project owner can remove collaborators' }, { status: 403 });
    }

    if (!project.collaborators) {
      return NextResponse.json({ error: 'No collaborators found' }, { status: 400 });
    }

    project.collaborators = project.collaborators.filter((c: string) => c !== email);
    project.updatedAt = new Date();

    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 });
  }
}
