import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Resource } from '@/types';

const RESOURCES_FILE = path.join(process.cwd(), 'data', 'resources.json');

async function getResources(): Promise<Resource[]> {
    try {
        const data = await fs.readFile(RESOURCES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveResources(resources: Resource[]) {
    await fs.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
}

export async function GET() {
    const resources = await getResources();
    return NextResponse.json(resources);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, fields, projectId } = body;

    if (!name || !fields || !projectId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resources = await getResources();

    // Check for duplicate name
    const exists = resources.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return NextResponse.json({ error: 'Resource already exists' }, { status: 409 });
    }

    const newResource: Resource = {
        id: crypto.randomUUID(),
        name: name.toLowerCase(),
        fields,
        projectId,
        createdAt: new Date().toISOString(),
    };

    resources.push(newResource);
    await saveResources(resources);

    return NextResponse.json(newResource, { status: 201 });
}
