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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projects = await getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);

    if (projects.length === filteredProjects.length) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await saveProjects(filteredProjects);
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedProject = {
        ...projects[index],
        ...body,
        updatedAt: new Date().toISOString()
    };
    projects[index] = updatedProject;
    await saveProjects(projects);

    return NextResponse.json(updatedProject);
}
