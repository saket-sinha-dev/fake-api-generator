import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { Project } from '@/models';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const userEmail = session.user.email;

        // Find projects: user owns OR is a collaborator on
        const projects = await Project.find({
            $or: [
                { userId: userEmail },
                { collaborators: userEmail }
            ]
        }).lean();

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        await connectDB();

        // Check for duplicate name for this user
        const exists = await Project.findOne({ 
            userId: session.user.email,
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (exists) {
            return NextResponse.json({ error: 'Project already exists' }, { status: 409 });
        }

        const newProject = await Project.create({
            id: crypto.randomUUID(),
            name,
            description: description || '',
            userId: session.user.email,
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
