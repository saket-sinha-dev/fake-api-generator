import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MockApi, Resource, Database } from '@/types';
import { match } from 'path-to-regexp';

const DATA_FILE = path.join(process.cwd(), 'data', 'apis.json');
const RESOURCES_FILE = path.join(process.cwd(), 'data', 'resources.json');
const DATABASE_FILE = path.join(process.cwd(), 'data', 'database.json');

async function getApis(): Promise<MockApi[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

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

async function triggerWebhook(url: string, data: any) {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (e) {
        console.error('Webhook error:', e);
    }
}

async function handleRequest(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const apis = await getApis();
    const resources = await getResources();
    const db = await getDatabase();
    const requestMethod = request.method;
    const requestPath = '/' + slug.join('/');
    const url = new URL(request.url);

    // Try to match custom API first
    const api = apis.find(a => {
        if (a.method !== requestMethod) return false;
        if (a.path === requestPath) return true;

        try {
            const fn = match(a.path, { decode: decodeURIComponent });
            return fn(requestPath) !== false;
        } catch (e) {
            return false;
        }
    });

    if (api) {
        // Trigger webhook if configured
        if (api.webhookUrl) {
            const body = requestMethod !== 'GET' ? await request.json() : null;
            triggerWebhook(api.webhookUrl, { method: requestMethod, path: requestPath, body });
        }

        return NextResponse.json(api.responseBody, { status: api.statusCode });
    }

    // Try to match resource-based endpoint
    const resourceName = slug[0];
    const resource = resources.find(r => r.name === resourceName);

    if (resource && db[resourceName]) {
        let data = [...db[resourceName]];
        const itemId = slug[1];

        // Handle specific item requests (GET /users/123, PUT /users/123, DELETE /users/123)
        if (itemId && itemId !== 'undefined') {
            const item = data.find(d => d.id === itemId);

            if (requestMethod === 'GET') {
                if (!item) {
                    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                }
                return NextResponse.json(item);
            }

            if (requestMethod === 'PUT' || requestMethod === 'PATCH') {
                if (!item) {
                    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                }
                const body = await request.json();
                const updatedItem = { ...item, ...body };
                const index = data.findIndex(d => d.id === itemId);
                data[index] = updatedItem;
                db[resourceName] = data;
                await saveDatabase(db);
                return NextResponse.json(updatedItem);
            }

            if (requestMethod === 'DELETE') {
                if (!item) {
                    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                }
                data = data.filter(d => d.id !== itemId);
                db[resourceName] = data;
                await saveDatabase(db);
                return NextResponse.json({ success: true });
            }
        }

        // Handle collection requests (GET /users, POST /users)
        if (requestMethod === 'GET') {
            // Filtering
            const filters = Object.fromEntries(url.searchParams.entries());
            Object.keys(filters).forEach(key => {
                if (!['_page', '_limit', '_sort', '_order'].includes(key)) {
                    data = data.filter(item => {
                        const value = item[key];
                        const filterValue = filters[key];
                        if (typeof value === 'string') {
                            return value.toLowerCase().includes(filterValue.toLowerCase());
                        }
                        return value == filterValue;
                    });
                }
            });

            // Sorting
            const sortBy = url.searchParams.get('_sort');
            const order = url.searchParams.get('_order') || 'asc';
            if (sortBy) {
                data.sort((a, b) => {
                    const aVal = a[sortBy];
                    const bVal = b[sortBy];
                    if (aVal < bVal) return order === 'asc' ? -1 : 1;
                    if (aVal > bVal) return order === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            // Pagination
            const page = parseInt(url.searchParams.get('_page') || '1');
            const limit = parseInt(url.searchParams.get('_limit') || '10');
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = data.slice(startIndex, endIndex);

            return NextResponse.json({
                data: paginatedData,
                pagination: {
                    page,
                    limit,
                    total: data.length,
                    totalPages: Math.ceil(data.length / limit),
                }
            });
        }

        if (requestMethod === 'POST') {
            const body = await request.json();
            const newItem = {
                id: crypto.randomUUID(),
                ...body,
                createdAt: new Date().toISOString(),
            };
            data.push(newItem);
            db[resourceName] = data;
            await saveDatabase(db);
            return NextResponse.json(newItem, { status: 201 });
        }
    }

    return NextResponse.json(
        { error: `Mock API not found for ${requestMethod} ${requestPath}` },
        { status: 404 }
    );
}

export {
    handleRequest as GET,
    handleRequest as POST,
    handleRequest as PUT,
    handleRequest as DELETE,
    handleRequest as PATCH,
    handleRequest as OPTIONS,
    handleRequest as HEAD
};
