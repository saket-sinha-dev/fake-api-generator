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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resources = await getResources();
    const filteredResources = resources.filter(r => r.id !== id);

    if (resources.length === filteredResources.length) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await saveResources(filteredResources);
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const resources = await getResources();
    const index = resources.findIndex(r => r.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const updatedResource = { ...resources[index], ...body };
    resources[index] = updatedResource;
    await saveResources(resources);

    return NextResponse.json(updatedResource);
}
