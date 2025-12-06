'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send reset email');
                return;
            }

            setMessage('Password reset link has been sent to your email!');
            setTimeout(() => router.push('/auth/signin'), 3000);
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
                            <h2 className="signin-card-title">Reset Password</h2>
                            <p className="signin-card-subtitle">
                                Enter your email address and we'll send you a link to reset your password
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
                                <Mail size={18} className="signin-input-icon" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="signin-input"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="signin-submit-btn"
                                disabled={isLoading || !email}
                                style={{ marginTop: '1rem' }}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
