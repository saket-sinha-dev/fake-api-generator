'use client';

import { MockApi } from '@/types';
import { Trash2, ExternalLink, Copy, Check, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface ApiListProps {
    apis: MockApi[];
    onDelete: (id: string) => void;
    onEdit: (api: MockApi) => void;
}

export default function ApiList({ apis, onDelete, onEdit }: ApiListProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'badge-get';
            case 'POST': return 'badge-post';
            case 'PUT': return 'badge-put';
            case 'DELETE': return 'badge-delete';
            default: return 'badge-get';
        }
    };

    if (apis.length === 0) {
        return (
            <div className="text-center py-12 text-muted">
                <p>No APIs created yet. Click "Create New API" to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {apis.map(api => {
                const fullUrl = `${window.location.origin}/api/v1${api.path}`;

                return (
                    <div key={api.id} className="card flex flex-col gap-4 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{api.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${getMethodColor(api.method)}`}>{api.method}</span>
                                    <span className="text-muted text-sm font-mono">{api.path}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-dark-muted text-muted">
                                        {api.statusCode}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => onEdit(api)}
                                    className="text-gray-500 hover:text-blue-400 transition-colors p-2"
                                    title="Edit API"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(api.id)}
                                    className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                    title="Delete API"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-dark-muted p-3 rounded border border-white/5 flex items-center justify-between group">
                            <code className="text-xs text-blue truncate flex-1 mr-4">
                                {fullUrl}
                                {api.queryParams && api.queryParams.length > 0 && (
                                    <span className="text-gray-500">
                                        ?{api.queryParams.map(p => `${p.key}=${p.value}`).join('&')}
                                    </span>
                                )}
                            </code>
                            <div className="flex gap-2 group-hover-visible transition-opacity">
                                <button
                                    onClick={() => {
                                        const urlWithParams = api.queryParams && api.queryParams.length > 0
                                            ? `${fullUrl}?${api.queryParams.map(p => `${p.key}=${p.value}`).join('&')}`
                                            : fullUrl;
                                        copyToClipboard(urlWithParams, api.id);
                                    }}
                                    className="text-gray hover:text-white"
                                    title="Copy URL"
                                >
                                    {copiedId === api.id ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                                <a
                                    href={api.queryParams && api.queryParams.length > 0
                                        ? `${fullUrl}?${api.queryParams.map(p => `${p.key}=${p.value}`).join('&')}`
                                        : fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray hover:text-white"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>

                        {api.queryParams && api.queryParams.length > 0 && (
                            <div>
                                <div className="text-xs text-muted mb-1 uppercase tracking-wider">Query Parameters</div>
                                <div className="flex flex-wrap gap-2">
                                    {api.queryParams.map((param, idx) => (
                                        <span key={idx} className="text-xs px-2 py-1 rounded bg-dark-muted text-muted">
                                            <span className="text-blue-400">{param.key}</span>=<span className="text-green-400">{param.value}</span>
                                            {param.required && <span className="text-red-400 ml-1">*</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {api.requestBody && (
                            <div>
                                <div className="text-xs text-muted mb-1 uppercase tracking-wider">Request Body Example</div>
                                <div className="code-block max-h-32 overflow-y-auto text-xs">
                                    <pre>{JSON.stringify(api.requestBody, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {api.responseBody !== null && (
                            <div>
                                <div className="text-xs text-muted mb-1 uppercase tracking-wider">Response Preview</div>
                                <div className="code-block max-h-32 overflow-y-auto text-xs">
                                    <pre>{JSON.stringify(api.responseBody, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                        {api.responseBody === null && (
                            <div className="text-xs text-muted italic">
                                No response body (e.g., 204 No Content)
                            </div>
                        )}
                    </div>
                );
            })}
        </div >
    );
}
