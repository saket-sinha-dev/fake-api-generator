'use client';

import { Resource } from '@/types';
import { Trash2, Database, Play } from 'lucide-react';
import { useState } from 'react';

interface ResourceListProps {
    resources: Resource[];
    onDelete: (id: string) => void;
    onEdit: (resource: Resource) => void;
}

export default function ResourceList({ resources, onDelete, onEdit }: ResourceListProps) {
    const [generating, setGenerating] = useState<string | null>(null);
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
                <div className="inline-block p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl mb-4 animate-float">
                    <Database className="w-20 h-20 mx-auto text-purple-500" />
                </div>
                <p className="text-xl font-semibold text-text-main mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">No Resources Created Yet</p>
                <p className="text-muted">Click "Create Resource" to define your data models</p>
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
        <div className="space-y-8">
            {resources.map((resource, index) => (
                <div 
                    key={resource.id} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    {/* Resource Card with Premium Design */}
                    <div 
                        className="relative overflow-hidden group transition-all duration-500 hover:scale-[1.01]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
                            borderRadius: '32px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        {/* Animated Mesh Gradient */}
                        <div 
                            className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                            style={{
                                background: `
                                    radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                                    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                                    radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
                                `,
                            }}
                        ></div>
                        
                        <div className="relative z-10 p-10">
                            {/* Resource Header - Symmetrical Layout */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-6">
                                    <div 
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl group-hover:scale-110 transition-all duration-500"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                        }}
                                    >
                                        {resource.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 
                                            className="text-4xl font-black mb-2"
                                            style={{
                                                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {resource.name}
                                        </h3>
                                        <p className="text-base text-gray-500 font-medium">{resource.fields.length} fields configured</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleGenerate(resource.id)}
                                        disabled={generating === resource.id}
                                        className="relative px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 overflow-hidden group/btn shadow-xl"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)',
                                        }}
                                    >
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                                animation: 'shimmer 2s ease-in-out infinite',
                                            }}
                                        ></div>
                                        <span className="relative z-10 flex items-center gap-3">
                                            <Play size={18} className="group-hover/btn:scale-125 transition-transform duration-300" />
                                            {generating === resource.id ? 'Generating...' : 'Generate Data'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(resource.id)}
                                        className="relative px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 group/btn shadow-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
                                            color: '#ef4444',
                                            border: '2px solid rgba(239, 68, 68, 0.2)',
                                        }}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                                            Delete
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* API Endpoint Display */}
                            <div 
                                className="relative overflow-hidden group/endpoint mb-10 transition-all duration-500 hover:scale-[1.01]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                                    borderRadius: '24px',
                                    padding: '32px',
                                    border: '2px solid rgba(59, 130, 246, 0.15)',
                                    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.1)',
                                }}
                            >
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover/endpoint:opacity-100 transition-opacity duration-700"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                                        animation: 'shimmer 3s ease-in-out infinite',
                                    }}
                                ></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            }}
                                        >
                                            <Database size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-1">Base Endpoint</p>
                                            <code 
                                                className="font-mono text-xl font-bold block"
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                }}
                                            >
                                                /api/v1/{resource.name}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fields Table - Symmetrical and Clean */}
                            <div 
                                className="overflow-hidden mb-10"
                                style={{
                                    borderRadius: '24px',
                                    border: '1px solid rgba(0, 0, 0, 0.05)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                                    background: 'rgba(255, 255, 255, 0.6)',
                                }}
                            >
                                <table className="w-full">
                                    <thead>
                                        <tr 
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.9) 0%, rgba(243, 244, 246, 0.9) 100%)',
                                                borderBottom: '2px solid rgba(0, 0, 0, 0.05)',
                                            }}
                                        >
                                            <th className="w-20 py-5 px-6 text-center font-black text-gray-600 uppercase text-xs tracking-widest">#</th>
                                            <th className="py-5 px-6 text-left font-black text-gray-600 uppercase text-xs tracking-widest">Field Name</th>
                                            <th className="w-48 py-5 px-6 text-left font-black text-gray-600 uppercase text-xs tracking-widest">Type</th>
                                            <th className="w-48 py-5 px-6 text-center font-black text-gray-600 uppercase text-xs tracking-widest">Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resource.fields.map((field, idx) => (
                                            <tr 
                                                key={field.id} 
                                                className="group/row transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-purple-50/40"
                                                style={{ 
                                                    borderBottom: idx === resource.fields.length - 1 ? 'none' : '1px solid rgba(0, 0, 0, 0.03)',
                                                }}
                                            >
                                                <td className="py-5 px-6 text-center">
                                                    <div 
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black mx-auto shadow-sm group-hover/row:scale-110 group-hover/row:shadow-lg transition-all duration-300"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                                            color: '#3b82f6',
                                                        }}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className="font-mono font-bold text-gray-900 text-lg group-hover/row:text-blue-600 transition-colors duration-300">
                                                        {field.name}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span 
                                                        className="px-5 py-2.5 rounded-2xl text-sm font-bold inline-block shadow-sm group-hover/row:shadow-lg group-hover/row:scale-105 transition-all duration-300"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                                                            color: '#8b5cf6',
                                                        }}
                                                    >
                                                        {field.type}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    {field.required ? (
                                                        <span 
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm group-hover/row:shadow-lg group-hover/row:scale-105 transition-all duration-300"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%)',
                                                                color: '#ef4444',
                                                            }}
                                                        >
                                                            <span className="text-lg">✓</span> Yes
                                                        </span>
                                                    ) : (
                                                        <span 
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold"
                                                            style={{
                                                                background: 'rgba(0, 0, 0, 0.03)',
                                                                color: '#9ca3af',
                                                            }}
                                                        >
                                                            No
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* REST Endpoints - Premium Grid */}
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        }}
                                    >
                                        <Database size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900">REST API Endpoints</h4>
                                        <p className="text-sm text-gray-500 font-medium">Auto-generated CRUD operations</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { method: 'GET', path: `/${resource.name}`, desc: 'Fetch all items with pagination support', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                                            { method: 'GET', path: `/${resource.name}/:id`, desc: 'Retrieve single item by unique ID', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                                            { method: 'POST', path: `/${resource.name}`, desc: 'Create a new item', color: 'green', gradient: 'from-green-500 to-emerald-500' },
                                            { method: 'PUT', path: `/${resource.name}/:id`, desc: 'Update an existing item', color: 'yellow', gradient: 'from-orange-500 to-yellow-500' },
                                            { method: 'DELETE', path: `/${resource.name}/:id`, desc: 'Remove item permanently', color: 'red', gradient: 'from-red-500 to-pink-500' }
                                        ].map((endpoint, i) => {
                                            const fullUrl = `${window.location.origin}/api/v1${endpoint.path}`;
                                            return (
                                                <div 
                                                    key={i} 
                                                    className="group/endpoint relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
                                                        borderRadius: '20px',
                                                        padding: '24px',
                                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                                                    }}
                                                >
                                                    <div 
                                                        className="absolute inset-0 opacity-0 group-hover/endpoint:opacity-100 transition-opacity duration-500"
                                                        style={{
                                                            background: endpoint.color === 'blue' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)' :
                                                                endpoint.color === 'green' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%)' :
                                                                endpoint.color === 'yellow' ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)' :
                                                                'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%)',
                                                        }}
                                                    ></div>
                                                    <div className="relative z-10 flex items-center gap-5">
                                                        <div 
                                                            className="w-24 h-16 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover/endpoint:scale-110 transition-all duration-300"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${
                                                                    endpoint.color === 'blue' ? '#3b82f6, #06b6d4' :
                                                                    endpoint.color === 'green' ? '#10b981, #34d399' :
                                                                    endpoint.color === 'yellow' ? '#f97316, #fbbf24' :
                                                                    '#ef4444, #fb7185'
                                                                })`,
                                                                boxShadow: `0 8px 20px ${
                                                                    endpoint.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' :
                                                                    endpoint.color === 'green' ? 'rgba(16, 185, 129, 0.3)' :
                                                                    endpoint.color === 'yellow' ? 'rgba(249, 115, 22, 0.3)' :
                                                                    'rgba(239, 68, 68, 0.3)'
                                                                }`,
                                                            }}
                                                        >
                                                            {endpoint.method}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <code className="text-gray-900 font-mono font-bold text-lg block mb-1 group-hover/endpoint:text-blue-600 transition-colors duration-300">
                                                                /api/v1{endpoint.path}
                                                            </code>
                                                            <p className="text-gray-500 text-sm font-medium">{endpoint.desc}</p>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(fullUrl);
                                                                    const btn = event?.target as HTMLButtonElement;
                                                                    const originalText = btn.textContent;
                                                                    btn.textContent = '✓';
                                                                    setTimeout(() => btn.textContent = originalText || 'Copy', 2000);
                                                                }}
                                                                className="px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                                                                style={{
                                                                    background: 'rgba(0, 0, 0, 0.04)',
                                                                    color: '#374151',
                                                                }}
                                                            >
                                                                Copy
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (endpoint.method === 'GET' && !endpoint.path.includes(':id')) {
                                                                        window.open(fullUrl, '_blank');
                                                                    } else {
                                                                        const sampleData = endpoint.method === 'POST' 
                                                                            ? JSON.stringify(resource.fields.reduce((acc, f) => ({
                                                                                ...acc,
                                                                                [f.name]: f.type === 'number' ? 1 : f.type === 'boolean' ? true : `sample_${f.name}`
                                                                            }), {}), null, 2)
                                                                            : endpoint.method === 'PUT'
                                                                            ? JSON.stringify({ id: '1', ...resource.fields.reduce((acc, f) => ({
                                                                                ...acc,
                                                                                [f.name]: f.type === 'number' ? 2 : f.type === 'boolean' ? false : `updated_${f.name}`
                                                                            }), {}) }, null, 2)
                                                                            : '';
                                                                        
                                                                        const needsId = endpoint.path.includes(':id');
                                                                        openTestModal(endpoint.method, fullUrl, sampleData, needsId, endpoint.color);
                                                                    }
                                                                }}
                                                                className="px-5 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl relative overflow-hidden group/test"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${
                                                                        endpoint.color === 'blue' ? '#3b82f6, #06b6d4' :
                                                                        endpoint.color === 'green' ? '#10b981, #34d399' :
                                                                        endpoint.color === 'yellow' ? '#f97316, #fbbf24' :
                                                                        '#ef4444, #fb7185'
                                                                    })`,
                                                                }}
                                                            >
                                                                <div 
                                                                    className="absolute inset-0 opacity-0 group-hover/test:opacity-100 transition-opacity duration-500"
                                                                    style={{
                                                                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                                                        animation: 'shimmer 2s ease-in-out infinite',
                                                                    }}
                                                                ></div>
                                                                <span className="relative z-10 flex items-center gap-2">
                                                                    <Play size={16} />
                                                                    Test
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        </>
    );
}
