import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { API } from '@/models';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();

        const result = await API.deleteOne({ id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'API not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        await connectDB();

        const updatedApi = await API.findOneAndUpdate(
            { id },
            { ...body, updatedAt: new Date() },
            { new: true }
        ).lean();

        if (!updatedApi) {
            return NextResponse.json({ error: 'API not found' }, { status: 404 });
        }

        // Ensure queryParams is always an array
        const normalizedApi = {
            ...updatedApi,
            queryParams: Array.isArray(updatedApi.queryParams) ? updatedApi.queryParams : []
        };

        return NextResponse.json(normalizedApi);
    } catch (error) {
        console.error('Error updating API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
