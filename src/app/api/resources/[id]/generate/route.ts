import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Resource, Database } from '@/types';
import { generateFieldValue } from '@/lib/dataGenerator';

const RESOURCES_FILE = path.join(process.cwd(), 'data', 'resources.json');
const DATABASE_FILE = path.join(process.cwd(), 'data', 'database.json');

async function getResources(): Promise<Resource[]> {
    try {
        const data = await fs.readFile(RESOURCES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function getDatabase(): Promise<Database> {
    try {
        const data = await fs.readFile(DATABASE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function saveDatabase(db: Database) {
    await fs.writeFile(DATABASE_FILE, JSON.stringify(db, null, 2));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { count = 10 } = await request.json();

    const resources = await getResources();
    const resource = resources.find(r => r.id === id);

    if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const db = await getDatabase();
    const items = [];

    for (let i = 0; i < count; i++) {
        const item: any = { id: crypto.randomUUID() };

        for (const field of resource.fields) {
            item[field.name] = generateFieldValue(field, db);
        }

        items.push(item);
    }

    db[resource.name] = items;
    await saveDatabase(db);

    return NextResponse.json({ success: true, count: items.length, data: items });
}
