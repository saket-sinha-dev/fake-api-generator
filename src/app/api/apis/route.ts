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

export async function GET() {
    const apis = await getApis();
    return NextResponse.json(apis);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { path: apiPath, method, statusCode, responseBody, name, webhookUrl, projectId } = body;

    if (!apiPath || !method || !responseBody || !projectId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apis = await getApis();

    // Check for duplicate path+method
    const exists = apis.find(api => api.path === apiPath && api.method === method);
    if (exists) {
        return NextResponse.json({ error: 'API endpoint already exists' }, { status: 409 });
    }

    const newApi: MockApi = {
        id: crypto.randomUUID(),
        path: apiPath.startsWith('/') ? apiPath : `/${apiPath}`,
        method,
        statusCode: statusCode || 200,
        responseBody,
        name: name || 'Untitled API',
        webhookUrl,
        projectId,
        createdAt: new Date().toISOString(),
    };

    apis.push(newApi);
    await saveApis(apis);

    return NextResponse.json(newApi, { status: 201 });
}
