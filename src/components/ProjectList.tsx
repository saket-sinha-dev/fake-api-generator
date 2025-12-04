'use client';

import { Project } from '@/types';
import { FolderOpen, Trash2, ChevronRight, Edit2 } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
    onSelect: (project: Project) => void;
    onDelete: (id: string) => void;
    onEdit?: (project: Project) => void;
    selectedProjectId?: string;
}

export default function ProjectList({ projects, onSelect, onDelete, onEdit, selectedProjectId }: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <div className="empty-state">
                <FolderOpen size={64} className="empty-state-icon mx-auto" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted">Create your first project to get started with mock APIs</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
                <div
                    key={project.id}
                    className={`card card-interactive project-card hover-lift ${selectedProjectId === project.id ? 'border-primary' : ''
                        }`}
                    onClick={() => onSelect(project)}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded bg-primary-light flex items-center justify-center">
                                <FolderOpen size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-base mb-1">{project.name}</h3>
                                {project.description && (
                                    <p className="text-sm text-muted line-clamp-1">{project.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(project);
                                    }}
                                    className="icon-btn text-muted hover:text-primary"
                                    title="Edit Project"
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete project "${project.name}"? This will also delete all associated APIs and resources.`)) {
                                        onDelete(project.id);
                                    }
                                }}
                                className="icon-btn text-muted hover:text-error"
                                title="Delete Project"
                            >
                                <Trash2 size={16} />
                            </button>
                            <ChevronRight size={20} className="text-muted" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
