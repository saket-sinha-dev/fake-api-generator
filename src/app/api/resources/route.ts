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
        let { name, fields, projectId } = body;

        console.log('📥 Received body:', JSON.stringify(body, null, 2));
        console.log('📝 Fields type:', typeof fields);
        console.log('📝 Fields is array?', Array.isArray(fields));
        console.log('📝 Fields value:', fields);

        if (!name || !fields || !projectId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Parse fields if it's a string
        if (typeof fields === 'string') {
            try {
                fields = JSON.parse(fields);
            } catch (e) {
                return NextResponse.json({ error: 'Invalid fields format' }, { status: 400 });
            }
        }

        // Ensure fields is an array
        if (!Array.isArray(fields)) {
            console.error('❌ Fields is not an array:', fields);
            return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 });
        }

        console.log('✅ Fields after processing:', fields);

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
