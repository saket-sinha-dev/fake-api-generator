'use client';

import { Resource } from '@/types';
import { Trash2, Play, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ResourceListProps {
    resources: Resource[];
    onDelete: (id: string) => void;
    onEdit: (resource: Resource) => void;
}

export default function ResourceList({ resources, onDelete, onEdit: _onEdit }: ResourceListProps) {
    const [generating, setGenerating] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testModalData, setTestModalData] = useState<{
        method: string;
        url: string;
        body: string;
        needsId: boolean;
        inputId: string;
        color: string;
    } | null>(null);
    const [testResponse, setTestResponse] = useState<{ status: number; data: any } | null>(null);
    const [testLoading, setTestLoading] = useState(false);

    const handleGenerate = async (resourceId: string) => {
        setGenerating(resourceId);
        try {
            const count = prompt('How many items to generate?', '10');
            if (!count) return;

            const res = await fetch(`/api/resources/${resourceId}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: parseInt(count) }),
            });

            if (res.ok) {
                alert('Data generated successfully!');
            } else {
                alert('Failed to generate data');
            }
        } catch (err) {
            alert('Error generating data');
        } finally {
            setGenerating(null);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openTestModal = (method: string, url: string, body: string, needsId: boolean, color: string) => {
        setTestModalData({ method, url, body, needsId, inputId: '1', color });
        setTestResponse(null);
        setShowTestModal(true);
    };

    const executeTest = async () => {
        if (!testModalData) return;
        
        setTestLoading(true);
        try {
            let testUrl = testModalData.url;
            if (testModalData.needsId) {
                testUrl = testUrl.replace(':id', testModalData.inputId);
            }
            
            const response = await fetch(testUrl, {
                method: testModalData.method,
                headers: { 'Content-Type': 'application/json' },
                body: testModalData.body ? testModalData.body : undefined,
            });
            
            const data = await response.json();
            setTestResponse({ status: response.status, data });
        } catch (err: any) {
            setTestResponse({ status: 0, data: { error: err.message } });
        } finally {
            setTestLoading(false);
        }
    };

    if (resources.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="inline-block p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl mb-4 animate-float">
                    <svg className="w-20 h-20 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                </div>
                <p className="text-xl font-semibold text-text-main mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">No Resources Created Yet</p>
                <p className="text-muted">Click "Create Resource" to define your data models and start generating mock data</p>
            </div>
        );
    }

    return (
        <>
        {/* Modern Test Modal */}
        {showTestModal && testModalData && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
                style={{
                    background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.15), transparent 50%), rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div 
                    className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden animate-slide-up"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                        borderRadius: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(40px)',
                    }}
                >
                    {/* Animated Mesh Gradient Background */}
                    <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: `
                                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
                                radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
                            `,
                            animation: 'float 20s ease-in-out infinite',
                        }}
                    ></div>
                    
                    {/* Glassmorphic Header */}
                    <div 
                        className="relative z-10 p-8 border-b"
                        style={{
                            background: testModalData.color === 'blue' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 197, 253, 0.9) 100%)' :
                                testModalData.color === 'green' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(134, 239, 172, 0.9) 100%)' :
                                testModalData.color === 'yellow' ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(251, 191, 36, 0.9) 100%)' :
                                'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(251, 113, 133, 0.9) 100%)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div 
                                    className="w-16 h-16 rounded-3xl flex items-center justify-center relative overflow-hidden group"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.25)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                                    }}
                                >
                                    <div 
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                            animation: 'shimmer 3s ease-in-out infinite',
                                        }}
                                    ></div>
                                    <Play size={32} className="text-white relative z-10 drop-shadow-lg" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-white mb-2 tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                                        Test API Endpoint
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span 
                                            className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.25)',
                                                backdropFilter: 'blur(10px)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                                            }}
                                        >
                                            {testModalData.method}
                                        </span>
                                        <span className="text-white/90 font-medium text-sm">Request</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTestModal(false)}
                                className="w-12 h-12 rounded-2xl text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <span className="text-3xl font-extralight leading-none group-hover:scale-125 transition-transform duration-300">×</span>
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="relative z-10 p-8 overflow-y-auto max-h-[calc(95vh-280px)]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent' }}>
                        {/* URL Display */}
                        <div className="mb-8">
                            <label className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-gray-700 mb-4 opacity-80">
                                <div 
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{
                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)',
                                    }}
                                ></div>
                                Endpoint URL
                            </label>
                            <div 
                                className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                }}
                            >
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                                        transform: 'translateX(-100%)',
                                        animation: 'shimmer 2s ease-in-out infinite',
                                    }}
                                ></div>
                                <code className="relative z-10 text-emerald-400 font-mono text-base break-all block leading-relaxed" style={{ textShadow: '0 0 20px rgba(52, 211, 153, 0.3)' }}>
                                    {testModalData.url}
                                </code>
                            </div>
                        </div>

                        {/* ID Input for endpoints with :id */}
                        {testModalData.needsId && (
                            <div className="mb-8">
                                <label className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-gray-700 mb-4 opacity-80">
                                    <div 
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{
                                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                            boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
                                        }}
                                    ></div>
                                    Resource ID
                                </label>
                                <input
                                    type="text"
                                    value={testModalData.inputId}
                                    onChange={(e) => setTestModalData({ ...testModalData, inputId: e.target.value })}
                                    className="w-full px-6 py-5 font-mono text-lg font-semibold text-gray-800 rounded-3xl transition-all duration-300 focus:scale-[1.02]"
                                    placeholder="Enter resource ID (e.g., 1)"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                                        border: '2px solid rgba(139, 92, 246, 0.2)',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                                        e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.2), 0 0 0 4px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                                    }}
                                />
                            </div>
                        )}

                        {/* Body Input for POST/PUT */}
                        {testModalData.body && (
                            <div className="mb-8">
                                <label className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-gray-700 mb-4 opacity-80">
                                    <div 
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #34d399)',
                                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                                        }}
                                    ></div>
                                    Request Body (JSON)
                                </label>
                                <div className="relative group">
                                    <textarea
                                        value={testModalData.body}
                                        onChange={(e) => setTestModalData({ ...testModalData, body: e.target.value })}
                                        className="w-full px-6 py-5 rounded-3xl transition-all duration-300 font-mono text-sm leading-relaxed resize-none"
                                        rows={14}
                                        placeholder="Enter JSON body"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))',
                                            color: '#34d399',
                                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(52, 211, 153, 0.2)',
                                            outline: 'none',
                                            textShadow: '0 0 10px rgba(52, 211, 153, 0.2)',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'rgba(52, 211, 153, 0.5)';
                                            e.target.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.3), 0 0 0 4px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(52, 211, 153, 0.2)';
                                            e.target.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                                        }}
                                    />
                                    <div 
                                        className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            color: '#34d399',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(52, 211, 153, 0.3)',
                                        }}
                                    >
                                        JSON
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Response Display */}
                        {testResponse && (
                            <div className="mb-8 animate-slide-up">
                                <label className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-gray-700 mb-4 opacity-80">
                                    <div 
                                        className={`w-2 h-2 rounded-full animate-pulse`}
                                        style={{
                                            background: testResponse.status >= 200 && testResponse.status < 300 
                                                ? 'linear-gradient(135deg, #10b981, #34d399)' 
                                                : 'linear-gradient(135deg, #ef4444, #f87171)',
                                            boxShadow: testResponse.status >= 200 && testResponse.status < 300 
                                                ? '0 0 10px rgba(16, 185, 129, 0.6)' 
                                                : '0 0 10px rgba(239, 68, 68, 0.6)',
                                        }}
                                    ></div>
                                    API Response
                                </label>
                                <div 
                                    className="rounded-3xl p-7 relative overflow-hidden"
                                    style={{
                                        background: testResponse.status >= 200 && testResponse.status < 300 
                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))' 
                                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))',
                                        border: testResponse.status >= 200 && testResponse.status < 300 
                                            ? '2px solid rgba(16, 185, 129, 0.3)' 
                                            : '2px solid rgba(239, 68, 68, 0.3)',
                                        boxShadow: testResponse.status >= 200 && testResponse.status < 300 
                                            ? '0 10px 40px rgba(16, 185, 129, 0.2)' 
                                            : '0 10px 40px rgba(239, 68, 68, 0.2)',
                                    }}
                                >
                                    <div className="flex items-center gap-4 mb-5">
                                        <span 
                                            className="px-5 py-2.5 rounded-2xl text-sm font-black text-white flex items-center gap-2 shadow-lg"
                                            style={{
                                                background: testResponse.status >= 200 && testResponse.status < 300
                                                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                                                    : 'linear-gradient(135deg, #ef4444, #f87171)',
                                                boxShadow: testResponse.status >= 200 && testResponse.status < 300
                                                    ? '0 4px 20px rgba(16, 185, 129, 0.4)'
                                                    : '0 4px 20px rgba(239, 68, 68, 0.4)',
                                            }}
                                        >
                                            <span className="text-lg">{testResponse.status >= 200 && testResponse.status < 300 ? '✓' : '✕'}</span>
                                            Status {testResponse.status}
                                        </span>
                                        <span 
                                            className="text-base font-bold"
                                            style={{
                                                color: testResponse.status >= 200 && testResponse.status < 300 ? '#10b981' : '#ef4444',
                                            }}
                                        >
                                            {testResponse.status >= 200 && testResponse.status < 300 ? 'Success' : 'Error'}
                                        </span>
                                    </div>
                                    <div 
                                        className="rounded-2xl p-5 overflow-x-auto"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))',
                                            boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                        }}
                                    >
                                        <pre 
                                            className="text-sm font-mono leading-loose"
                                            style={{
                                                color: testResponse.status >= 200 && testResponse.status < 300 ? '#34d399' : '#fca5a5',
                                                textShadow: testResponse.status >= 200 && testResponse.status < 300 
                                                    ? '0 0 10px rgba(52, 211, 153, 0.3)' 
                                                    : '0 0 10px rgba(252, 165, 165, 0.3)',
                                            }}
                                        >
{JSON.stringify(testResponse.data, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div 
                        className="relative z-10 p-6 flex gap-4"
                        style={{
                            background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(255, 255, 255, 0.9))',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <button
                            onClick={() => setShowTestModal(false)}
                            className="flex-1 px-8 py-5 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 group"
                            style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                color: '#374151',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                border: '2px solid rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            <span className="group-hover:scale-110 inline-block transition-transform duration-300">Cancel</span>
                        </button>
                        <button
                            onClick={executeTest}
                            disabled={testLoading}
                            className="flex-1 px-8 py-5 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                            style={{
                                background: testModalData.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                    testModalData.color === 'green' ? 'linear-gradient(135deg, #10b981, #34d399)' :
                                    testModalData.color === 'yellow' ? 'linear-gradient(135deg, #f97316, #fbbf24)' :
                                    'linear-gradient(135deg, #ef4444, #f87171)',
                                boxShadow: testModalData.color === 'blue' ? '0 8px 30px rgba(59, 130, 246, 0.4)' :
                                    testModalData.color === 'green' ? '0 8px 30px rgba(16, 185, 129, 0.4)' :
                                    testModalData.color === 'yellow' ? '0 8px 30px rgba(249, 115, 22, 0.4)' :
                                    '0 8px 30px rgba(239, 68, 68, 0.4)',
                            }}
                        >
                            <div 
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                    animation: 'shimmer 2s ease-in-out infinite',
                                }}
                            ></div>
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {testLoading ? (
                                    <>
                                        <div 
                                            className="w-5 h-5 rounded-full animate-spin"
                                            style={{
                                                border: '3px solid rgba(255, 255, 255, 0.3)',
                                                borderTopColor: 'white',
                                            }}
                                        ></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} className="group-hover:scale-125 transition-transform duration-300" />
                                        <span>Send Request</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Resources List */}
        <div className="grid grid-cols-1 gap-4">
            {resources.map((resource, index) => {
                const fullUrl = `${window.location.origin}/api/v1/${resource.name}`;

                return (
                    <div 
                        key={resource.id} 
                        className="card flex flex-col gap-4 animate-fade-in hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group/card"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
                                    {resource.name}
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="badge badge-get animate-pulse-subtle shadow-lg">REST API</span>
                                    <span className="text-text-main text-base font-mono font-medium hover:text-blue-400 transition-colors">/api/v1/{resource.name}</span>
                                    <span className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold shadow-lg border border-white/10">
                                        {resource.fields.length} fields
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleGenerate(resource.id)}
                                    disabled={generating === resource.id}
                                    className="text-gray-500 hover:text-green-400 transition-all duration-300 p-2 rounded-lg hover:bg-green-500/10 hover:scale-110 active:scale-95"
                                    title="Generate Data"
                                >
                                    <Play size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(resource.id)}
                                    className="text-gray-500 hover:text-red-500 transition-all duration-300 p-2 rounded-lg hover:bg-red-500/10 hover:scale-110 hover:-rotate-12 active:scale-95"
                                    title="Delete Resource"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between group/url hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
                            <code className="text-sm text-blue-300 truncate flex-1 mr-4 font-medium hover:text-blue-200 transition-colors">
                                {fullUrl}
                            </code>
                            <div className="flex gap-3 opacity-0 group-hover/url:opacity-100 transition-all duration-300 translate-x-2 group-hover/url:translate-x-0">
                                <button
                                    onClick={() => copyToClipboard(fullUrl, resource.id)}
                                    className={`${copiedId === resource.id ? 'text-green-400 scale-110' : 'text-gray-400 hover:text-white'} transition-all duration-300 hover:scale-125 active:scale-95 p-2 rounded-lg hover:bg-white/10`}
                                    title="Copy URL"
                                >
                                    {copiedId === resource.id ? <Check size={18} className="animate-bounce" /> : <Copy size={18} />}
                                </button>
                                <a
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-125 active:scale-95 p-2 rounded-lg hover:bg-white/10 hover:rotate-12"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>

                        {resource.fields && Array.isArray(resource.fields) && resource.fields.length > 0 && (
                            <div className="animate-slide-up">
                                <div className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
                                    Resource Fields
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {resource.fields.map((field, idx) => (
                                        <span 
                                            key={field.id} 
                                            className="text-sm px-4 py-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 font-mono border border-blue-500/30 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 animate-fade-in"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <span className="text-blue-300 font-bold">{field.name}</span>
                                            <span className="text-gray-400 mx-2">:</span>
                                            <span className="text-emerald-400">{field.type}</span>
                                            {field.required && <span className="text-red-400 ml-1 animate-pulse">*</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full animate-pulse"></span>
                                📡 Available Endpoints
                            </div>
                            <div className="space-y-2">
                                {[
                                    { method: 'GET', path: '', desc: 'Fetch all items (supports filtering, sorting, pagination)', color: 'blue', needsId: false },
                                    { method: 'GET', path: '/:id', desc: 'Get single item by ID', color: 'blue', needsId: true },
                                    { method: 'POST', path: '', desc: 'Create new item', color: 'green', needsId: false },
                                    { method: 'PUT', path: '/:id', desc: 'Update item by ID', color: 'yellow', needsId: true },
                                    { method: 'PATCH', path: '/:id', desc: 'Partially update item by ID', color: 'yellow', needsId: true },
                                    { method: 'DELETE', path: '/:id', desc: 'Delete item by ID', color: 'red', needsId: true },
                                ].map((endpoint, idx) => {
                                    const endpointUrl = `${fullUrl}${endpoint.path}`;
                                    const badgeClass = endpoint.color === 'blue' ? 'badge-get' :
                                        endpoint.color === 'green' ? 'badge-post' :
                                        endpoint.color === 'yellow' ? 'badge-put' : 'badge-delete';
                                    
                                    return (
                                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white transition-all duration-200 group/endpoint flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className={`badge ${badgeClass} text-xs flex-shrink-0`}>{endpoint.method}</span>
                                                <code className="font-mono font-semibold text-gray-900">/api/v1/{resource.name}{endpoint.path}</code>
                                                <span className="text-gray-500">- {endpoint.desc}</span>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover/endpoint:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => copyToClipboard(endpointUrl, `${resource.id}-endpoint-${idx}`)}
                                                    className={`${copiedId === `${resource.id}-endpoint-${idx}` ? 'text-green-400 scale-110' : 'text-gray-400 hover:text-gray-700'} transition-all duration-200 hover:scale-110 p-1.5 rounded`}
                                                    title="Copy URL"
                                                >
                                                    {copiedId === `${resource.id}-endpoint-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (endpoint.method === 'GET' && !endpoint.needsId) {
                                                            window.open(endpointUrl, '_blank');
                                                        } else {
                                                            const sampleData = endpoint.method === 'POST' 
                                                                ? JSON.stringify(resource.fields.reduce((acc, f) => ({
                                                                    ...acc,
                                                                    [f.name]: f.type === 'number' ? 1 : f.type === 'boolean' ? true : `sample_${f.name}`
                                                                }), {}), null, 2)
                                                                : (endpoint.method === 'PUT' || endpoint.method === 'PATCH')
                                                                ? JSON.stringify(resource.fields.reduce((acc, f) => ({
                                                                    ...acc,
                                                                    [f.name]: f.type === 'number' ? 2 : f.type === 'boolean' ? false : `updated_${f.name}`
                                                                }), {}), null, 2)
                                                                : '';
                                                            
                                                            openTestModal(endpoint.method, endpointUrl, sampleData, endpoint.needsId, endpoint.color);
                                                        }
                                                    }}
                                                    className={`text-white px-3 py-1 rounded text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                                                        endpoint.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                                                        endpoint.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                                                        endpoint.color === 'yellow' ? 'bg-orange-500 hover:bg-orange-600' :
                                                        'bg-red-500 hover:bg-red-600'
                                                    }`}
                                                    title={`Test ${endpoint.method} request`}
                                                >
                                                    <Play size={12} className="inline mr-1" />
                                                    Test
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        </>
    );
}
