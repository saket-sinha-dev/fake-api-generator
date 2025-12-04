import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Project } from '@/types';

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');

async function getProjects(): Promise<Project[]> {
    try {
        const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveProjects(projects: Project[]) {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export async function GET() {
    const projects = await getProjects();
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
        return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const projects = await getProjects();

    // Check for duplicate name
    const exists = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        return NextResponse.json({ error: 'Project already exists' }, { status: 409 });
    }

    const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await saveProjects(projects);

    return NextResponse.json(newProject, { status: 201 });
}
