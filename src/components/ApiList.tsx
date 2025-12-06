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
            <div className="text-center py-20 animate-fade-in">
                <div className="inline-block p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl mb-4 animate-float">
                    <svg className="w-20 h-20 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-xl font-semibold text-text-main mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">No APIs Created Yet</p>
                <p className="text-muted">Click "Create New API" to get started and build your first endpoint</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {apis.map(api => {
                const fullUrl = `${window.location.origin}/api/v1${api.path}`;

                return (
                    <div key={api.id} className="card flex flex-col gap-4 animate-fade-in hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group/card">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
                                    {api.name}
                                    {api.conditionalResponse && (
                                        <span className="ml-3 text-xs px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-lg animate-pulse-subtle" title="Has conditional response">
                                            ⚡ CONDITIONAL
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`badge ${getMethodColor(api.method)} animate-pulse-subtle shadow-lg`}>{api.method}</span>
                                    <span className="text-text-main text-base font-mono font-medium hover:text-blue-400 transition-colors">{api.path}</span>
                                    <span className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold shadow-lg border border-white/10 animate-shimmer">
                                        {api.statusCode}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(api)}
                                    className="text-gray-500 hover:text-blue-400 transition-all duration-300 p-2 rounded-lg hover:bg-blue-500/10 hover:scale-110 hover:rotate-12 active:scale-95"
                                    title="Edit API"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(api.id)}
                                    className="text-gray-500 hover:text-red-500 transition-all duration-300 p-2 rounded-lg hover:bg-red-500/10 hover:scale-110 hover:-rotate-12 active:scale-95"
                                    title="Delete API"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between group/url hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
                            <code className="text-sm text-blue-300 truncate flex-1 mr-4 font-medium hover:text-blue-200 transition-colors">
                                {fullUrl}
                                {api.queryParams && Array.isArray(api.queryParams) && api.queryParams.length > 0 && (
                                    <span className="text-emerald-400">
                                        ?{api.queryParams.map(p => `${p.key}=${p.value}`).join('&')}
                                    </span>
                                )}
                            </code>
                            <div className="flex gap-3 opacity-0 group-hover/url:opacity-100 transition-all duration-300 translate-x-2 group-hover/url:translate-x-0">
                                <button
                                    onClick={() => {
                                        const urlWithParams = api.queryParams && Array.isArray(api.queryParams) && api.queryParams.length > 0
                                            ? `${fullUrl}?${api.queryParams.map(p => `${p.key}=${p.value}`).join('&')}`
                                            : fullUrl;
                                        copyToClipboard(urlWithParams, api.id);
                                    }}
                                    className={`${copiedId === api.id ? 'text-green-400 scale-110' : 'text-gray-400 hover:text-white'} transition-all duration-300 hover:scale-125 active:scale-95 p-2 rounded-lg hover:bg-white/10`}
                                    title="Copy URL"
                                >
                                    {copiedId === api.id ? <Check size={18} className="animate-bounce" /> : <Copy size={18} />}
                                </button>
                                <a
                                    href={api.queryParams && Array.isArray(api.queryParams) && api.queryParams.length > 0
                                        ? `${fullUrl}?${api.queryParams.map(p => `${p.key}=${p.value}`).join('&')}`
                                        : fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-125 active:scale-95 p-2 rounded-lg hover:bg-white/10 hover:rotate-12"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>

                        {api.queryParams && Array.isArray(api.queryParams) && api.queryParams.length > 0 && (
                            <div className="animate-slide-up">
                                <div className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
                                    Query Parameters
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {api.queryParams.map((param, idx) => (
                                        <span key={idx} 
                                            className="text-sm px-4 py-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 font-mono border border-blue-500/30 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 animate-fade-in"
                                            style={{ animationDelay: `${idx * 100}ms` }}>
                                            <span className="text-blue-300 font-bold">{param.key}</span>
                                            <span className="text-gray-400">=</span>
                                            <span className="text-emerald-400">{param.value}</span>
                                            {param.required && <span className="text-red-400 ml-1 animate-pulse">*</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {api.requestBody && (
                            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <div className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full animate-pulse"></span>
                                    📥 Request Body Example
                                </div>
                                <div className="code-block max-h-32 overflow-y-auto text-sm hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500">
                                    <pre>{JSON.stringify(api.requestBody, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {api.responseBody !== null && (
                            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <div className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse"></span>
                                    📤 Response Preview
                                </div>
                                <div className="code-block max-h-32 overflow-y-auto text-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 border-l-4 border-green-500">
                                    <pre>{JSON.stringify(api.responseBody, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                        {api.responseBody === null && (
                            <div className="text-xs text-muted italic">
                                No response body (e.g., 204 No Content)
                            </div>
                        )}

                        {api.conditionalResponse && (
                            <div className="animate-slide-up border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4" style={{ animationDelay: '300ms' }}>
                                <div className="text-sm font-bold text-amber-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full animate-pulse"></span>
                                    ⚡ Conditional Response
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                                        <div className="text-xs font-semibold text-gray-600 mb-2">CONDITION</div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                                {api.conditionalResponse.condition.type.toUpperCase()}
                                            </span>
                                            {api.conditionalResponse.condition.key && (
                                                <>
                                                    <span className="text-gray-400">→</span>
                                                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-blue-600 font-semibold">
                                                        {api.conditionalResponse.condition.key}
                                                    </code>
                                                </>
                                            )}
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                {api.conditionalResponse.condition.operator}
                                            </span>
                                            {api.conditionalResponse.condition.value !== undefined && (
                                                <code className="text-xs font-mono bg-green-100 px-2 py-1 rounded text-green-700 font-semibold">
                                                    {String(api.conditionalResponse.condition.value)}
                                                </code>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                                            <div className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                                                ✅ If TRUE
                                                {api.conditionalResponse.statusCodeIfTrue && (
                                                    <span className="ml-auto px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs">
                                                        {api.conditionalResponse.statusCodeIfTrue}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="code-block text-xs max-h-24 overflow-y-auto">
                                                <pre>{JSON.stringify(api.conditionalResponse.responseIfTrue, null, 2)}</pre>
                                            </div>
                                        </div>
                                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                                            <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                                                ❌ If FALSE
                                                {api.conditionalResponse.statusCodeIfFalse && (
                                                    <span className="ml-auto px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs">
                                                        {api.conditionalResponse.statusCodeIfFalse}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="code-block text-xs max-h-24 overflow-y-auto">
                                                <pre>{JSON.stringify(api.conditionalResponse.responseIfFalse, null, 2)}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div >
    );
}
