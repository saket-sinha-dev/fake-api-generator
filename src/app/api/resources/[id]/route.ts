import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Resource } from '@/models';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();

        const result = await Resource.deleteOne({ id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        // Parse fields if it's a string
        if (body.fields && typeof body.fields === 'string') {
            try {
                body.fields = JSON.parse(body.fields);
            } catch (e) {
                return NextResponse.json({ error: 'Invalid fields format' }, { status: 400 });
            }
        }
        
        await connectDB();

        const updatedResource = await Resource.findOneAndUpdate(
            { id },
            { ...body, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedResource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        return NextResponse.json(updatedResource);
    } catch (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
