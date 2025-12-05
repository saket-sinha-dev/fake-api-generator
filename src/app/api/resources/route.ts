import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Resource } from '@/models';

export async function GET() {
    try {
        await connectDB();
        const resources = await Resource.find().lean();
        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, fields, projectId } = body;

        if (!name || !fields || !projectId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        // Check for duplicate name
        const exists = await Resource.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        if (exists) {
            return NextResponse.json({ error: 'Resource already exists' }, { status: 409 });
        }

        const newResource = await Resource.create({
            id: crypto.randomUUID(),
            name: name.toLowerCase(),
            fields,
            projectId,
        });

        return NextResponse.json(newResource, { status: 201 });
    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
