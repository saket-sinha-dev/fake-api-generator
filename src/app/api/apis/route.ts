import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { API } from '@/models';

export async function GET() {
    try {
        await connectDB();
        const apis = await API.find().lean();
        return NextResponse.json(apis);
    } catch (error) {
        console.error('Error fetching APIs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path: apiPath, method, statusCode, responseBody, name, webhookUrl, projectId, requestBody, queryParams, conditionalResponse } = body;

        console.log('📝 Creating API with conditionalResponse:', conditionalResponse ? 'YES' : 'NO');
        if (conditionalResponse) {
            console.log('🔍 Conditional Response:', JSON.stringify(conditionalResponse, null, 2));
        }

        if (!apiPath || !method || !projectId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        // Check for duplicate path+method
        const exists = await API.findOne({ path: apiPath, method });
        if (exists) {
            return NextResponse.json({ error: 'API endpoint already exists' }, { status: 409 });
        }

        const newApi = await API.create({
            id: crypto.randomUUID(),
            path: apiPath.startsWith('/') ? apiPath : `/${apiPath}`,
            method,
            statusCode: statusCode || 200,
            responseBody,
            name: name || 'Untitled API',
            webhookUrl,
            projectId,
            requestBody,
            queryParams,
            conditionalResponse,
        });

        console.log('✅ API created with ID:', newApi.id, 'Has conditional:', !!newApi.conditionalResponse);

        return NextResponse.json(newApi, { status: 201 });
    } catch (error) {
        console.error('❌ Error creating API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
