'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to reset password');
                return;
            }

            setMessage('Password reset successful! Redirecting to sign in...');
            setTimeout(() => router.push('/auth/signin'), 2000);
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-bg">
                <div className="signin-galaxy-layer signin-galaxy-far"></div>
                <div className="signin-galaxy-layer signin-galaxy-mid"></div>
                <div className="signin-galaxy-layer signin-galaxy-near"></div>
                <div className="signin-nebula signin-nebula-1"></div>
                <div className="signin-nebula signin-nebula-2"></div>
                <div className="signin-nebula signin-nebula-3"></div>
            </div>

            <div className="signin-container">
                <div className="signin-card-wrapper" style={{ maxWidth: '480px', margin: '0 auto' }}>
                    <div className="signin-card">
                        <Link href="/auth/signin" className="signin-back-link">
                            <ArrowLeft size={20} />
                            <span>Back to Sign In</span>
                        </Link>

                        <div className="signin-card-header">
                            <h2 className="signin-card-title">Create New Password</h2>
                            <p className="signin-card-subtitle">
                                Enter a new password for your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="signin-error">
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="signin-success">
                                    {message}
                                </div>
                            )}

                            <div className="signin-input-group">
                                <Lock size={18} className="signin-input-icon" />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="signin-input"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="signin-input-group">
                                <Lock size={18} className="signin-input-icon" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="signin-input"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <p className="signin-password-hint">
                                Password must be at least 8 characters
                            </p>

                            <button
                                type="submit"
                                className="signin-submit-btn"
                                disabled={isLoading || !password || !confirmPassword || !token}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
