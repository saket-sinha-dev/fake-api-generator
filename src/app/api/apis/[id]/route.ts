import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MockApi } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'apis.json');

async function getApis(): Promise<MockApi[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveApis(apis: MockApi[]) {
    await fs.writeFile(DATA_FILE, JSON.stringify(apis, null, 2));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const apis = await getApis();
    const filteredApis = apis.filter(api => api.id !== id);

    if (apis.length === filteredApis.length) {
        return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    await saveApis(filteredApis);
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const apis = await getApis();
    const index = apis.findIndex(api => api.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    const updatedApi = { ...apis[index], ...body };
    apis[index] = updatedApi;
    await saveApis(apis);

    return NextResponse.json(updatedApi);
}
