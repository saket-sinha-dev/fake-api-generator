import { NextResponse } from 'next/server';
import { generateFieldValue } from '@/lib/dataGenerator';
import connectDB from '@/lib/mongodb';
import { Resource, Database } from '@/models';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { count = 10 } = await request.json();

        await connectDB();

        const resource = await Resource.findOne({ id }).lean();

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // Get all database records for relation lookups
        const allDbRecords = await Database.find().lean();
        const db: any = {};
        allDbRecords.forEach(record => {
            db[record.resourceName] = record.data;
        });

        const items = [];

        for (let i = 0; i < count; i++) {
            const item: any = { id: crypto.randomUUID() };

            for (const field of resource.fields) {
                item[field.name] = generateFieldValue(field, db);
            }

            items.push(item);
        }

        // Update or create the database record for this resource
        await Database.findOneAndUpdate(
            { resourceName: resource.name },
            { resourceName: resource.name, data: items },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, count: items.length, data: items });
    } catch (error) {
        console.error('Error generating data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
