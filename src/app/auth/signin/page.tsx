'use client';

import { signIn } from 'next-auth/react';
import { Sparkles, Zap, Shield, Code } from 'lucide-react';

export default function SignIn() {
    return (
        <div className="signin-page">
            {/* Background Elements */}
            <div className="signin-bg">
                <div className="signin-gradient-orb signin-orb-1"></div>
                <div className="signin-gradient-orb signin-orb-2"></div>
                <div className="signin-grid"></div>
            </div>

            <div className="signin-container">
                {/* Left Side - Branding */}
                <div className="signin-hero">
                    <div className="signin-logo-section">
                        <div className="signin-logo-badge">
                            <Code size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="signin-title">
                            Fake<span className="signin-title-accent">API</span>
                        </h1>
                        <p className="signin-subtitle">
                            Mock APIs in seconds, not hours
                        </p>
                    </div>

                    <div className="signin-features">
                        <div className="signin-feature">
                            <div className="signin-feature-icon">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="signin-feature-title">Lightning Fast</h3>
                                <p className="signin-feature-desc">Generate mock data instantly</p>
                            </div>
                        </div>
                        <div className="signin-feature">
                            <div className="signin-feature-icon">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="signin-feature-title">Powerful</h3>
                                <p className="signin-feature-desc">Advanced querying & relations</p>
                            </div>
                        </div>
                        <div className="signin-feature">
                            <div className="signin-feature-icon">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="signin-feature-title">Secure</h3>
                                <p className="signin-feature-desc">Google OAuth authentication</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="signin-card-wrapper">
                    <div className="signin-card">
                        <div className="signin-card-header">
                            <h2 className="signin-card-title">Welcome back</h2>
                            <p className="signin-card-subtitle">
                                Sign in to continue to your workspace
                            </p>
                        </div>

                        <button
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="signin-google-btn"
                        >
                            <svg className="signin-google-icon" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <div className="signin-divider">
                            <span>Trusted by developers worldwide</span>
                        </div>

                        <p className="signin-footer-text">
                            By continuing, you agree to our{' '}
                            <a href="#" className="signin-link">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="signin-link">Privacy Policy</a>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="signin-stats">
                        <div className="signin-stat">
                            <div className="signin-stat-value">10k+</div>
                            <div className="signin-stat-label">APIs Created</div>
                        </div>
                        <div className="signin-stat-divider"></div>
                        <div className="signin-stat">
                            <div className="signin-stat-value">5k+</div>
                            <div className="signin-stat-label">Active Users</div>
                        </div>
                        <div className="signin-stat-divider"></div>
                        <div className="signin-stat">
                            <div className="signin-stat-value">99.9%</div>
                            <div className="signin-stat-label">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
