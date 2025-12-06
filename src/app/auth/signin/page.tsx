'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Shield, Code, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignIn() {
    const router = useRouter();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        mobile: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create account');
                return;
            }

            // Auto sign in after successful signup
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Account created but sign in failed. Please try signing in manually.');
            } else {
                router.push('/');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page" onMouseMove={(e) => {
            const shapes = document.querySelectorAll('.signin-parallax-layer');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 15;
                const moveX = (x - 0.5) * speed;
                const moveY = (y - 0.5) * speed;
                (shape as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }}>
            {/* Background Elements */}
            <div className="signin-bg">
                {/* Galaxy background layers */}
                <div className="signin-galaxy-layer signin-galaxy-far"></div>
                <div className="signin-galaxy-layer signin-galaxy-mid"></div>
                <div className="signin-galaxy-layer signin-galaxy-near"></div>
                
                {/* Nebula clouds */}
                <div className="signin-nebula signin-nebula-1 signin-parallax-layer"></div>
                <div className="signin-nebula signin-nebula-2 signin-parallax-layer"></div>
                <div className="signin-nebula signin-nebula-3 signin-parallax-layer"></div>
                
                {/* Meteoroids */}
                {mounted && (
                    <div className="signin-meteoroids">
                        {[...Array(2)].map((_, i) => {
                            const startY = -10 + Math.random() * 20;
                            const startX = -20 + Math.random() * 20;
                            const duration = 5 + Math.random() * 4;
                            const delay = i * 18 + Math.random() * 12;
                            const size = 3 + Math.random() * 4;
                            return (
                                <div
                                    key={i}
                                    className="signin-meteoroid"
                                    style={{
                                        top: `${startY}%`,
                                        left: `${startX}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        animationDuration: `${duration}s`,
                                        animationDelay: `${delay}s`,
                                    }}
                                ></div>
                            );
                        })}
                    </div>
                )}
                
                {/* Stars - multiple layers */}
                {mounted && (
                    <>
                        <div className="signin-stars signin-stars-layer-1">
                            {[...Array(50)].map((_, i) => {
                                const lightAngle = Math.random() * 100;
                                const animVariant = Math.floor(Math.random() * 3) + 1;
                                const duration = 2 + Math.random() * 2;
                                return (
                                    <div key={i} className="signin-star" style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 3}s`,
                                        animationDuration: `${duration}s`,
                                        animation: `twinkle${animVariant} ${duration}s ease-in-out infinite`,
                                        width: `${1 + Math.random() * 2}px`,
                                        height: `${1 + Math.random() * 2}px`,
                                        background: `radial-gradient(circle at ${lightAngle}% ${lightAngle}%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 40%, rgba(200, 200, 255, 0.7) 100%)`,
                                    }}></div>
                                );
                            })}
                        </div>
                        <div className="signin-stars signin-stars-layer-2">
                            {[...Array(30)].map((_, i) => {
                                const lightAngle = 20 + Math.random() * 60;
                                const animVariant = Math.floor(Math.random() * 3) + 1;
                                const duration = 1.5 + Math.random() * 1.5;
                                return (
                                    <div key={i} className="signin-star signin-star-bright" style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 4}s`,
                                        animationDuration: `${duration}s`,
                                        animation: `twinkleBright${animVariant} ${duration}s ease-in-out infinite`,
                                        width: `${2 + Math.random() * 3}px`,
                                        height: `${2 + Math.random() * 3}px`,
                                        background: `radial-gradient(circle at ${lightAngle}% ${lightAngle}%, rgba(255, 255, 255, 1) 0%, rgba(230, 240, 255, 0.95) 30%, rgba(147, 197, 253, 0.8) 100%)`,
                                    }}></div>
                                );
                            })}
                        </div>
                        

                    </>
                )}
            </div>

            <div className="signin-container">
                {/* Left Side - Branding */}
                <div className="signin-hero">
                    <div className="signin-logo-section" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                        <div className="signin-logo-badge" style={{ animation: 'scaleIn 0.6s ease-out 0.3s backwards' }}>
                            <Code size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="signin-title" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s backwards' }}>
                            Fake<span className="signin-title-accent">API</span>
                        </h1>
                        <p className="signin-subtitle" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s backwards' }}>
                            Mock APIs in seconds, not hours
                        </p>
                    </div>

                    <div className="signin-features">
                        <div className="signin-feature" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}>
                            <div className="signin-feature-icon">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="signin-feature-title">Lightning Fast</h3>
                                <p className="signin-feature-desc">Generate mock data instantly</p>
                            </div>
                        </div>
                        <div className="signin-feature" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}>
                            <div className="signin-feature-icon">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="signin-feature-title">Powerful</h3>
                                <p className="signin-feature-desc">Advanced querying & relations</p>
                            </div>
                        </div>
                        <div className="signin-feature" style={{ animation: 'fadeInUp 0.6s ease-out 0.6s backwards' }}>
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
                <div className="signin-card-wrapper" style={{ animation: 'fadeInUp 0.8s ease-out 0.4s backwards' }}>
                    <div className="signin-card">
                        <div className="signin-card-header">
                            <h2 className="signin-card-title" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                                {mode === 'signin' ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="signin-card-subtitle" style={{ animation: 'fadeIn 0.6s ease-out 0.2s backwards' }}>
                                {mode === 'signin' 
                                    ? 'Sign in to continue to your workspace'
                                    : 'Get started with your free account'
                                }
                            </p>
                        </div>

                        {/* Google Sign In */}
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
                            <span>or {mode === 'signin' ? 'sign in' : 'sign up'} with email</span>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={mode === 'signin' ? handleCredentialsSignIn : handleSignUp}>
                            {error && (
                                <div className="signin-error">
                                    {error}
                                </div>
                            )}

                            {mode === 'signup' && (
                                <div className="signin-form-row">
                                    <div className="signin-input-group">
                                        <User size={18} className="signin-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            className="signin-input"
                                            autoComplete="given-name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="signin-input-group">
                                        <User size={18} className="signin-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            className="signin-input"
                                            autoComplete="family-name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="signin-input-group">
                                <Lock size={18} className="signin-input-icon" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="signin-input"
                                    required
                                    minLength={8}
                                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {mode === 'signup' && (
                                <p className="signin-password-hint">
                                    Password must be at least 8 characters with letters and numbers
                                </p>
                            )}

                            {mode === 'signin' && (
                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <a href="/auth/forgot-password" className="signin-link" style={{ fontSize: '0.875rem' }}>
                                        Forgot password?
                                    </a>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="signin-submit-btn"
                                disabled={isLoading}
                                onMouseEnter={(e) => {
                                    if (!formData.email || !formData.password) {
                                        const button = e.currentTarget;
                                        const moveButton = () => {
                                            const randomX = (Math.random() - 0.5) * 200;
                                            const randomY = (Math.random() - 0.5) * 100;
                                            button.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.5)`;
                                        };
                                        moveButton();
                                        button.style.transition = 'transform 0.15s ease-out';
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (!formData.email || !formData.password) {
                                        const button = e.currentTarget;
                                        const randomX = (Math.random() - 0.5) * 200;
                                        const randomY = (Math.random() - 0.5) * 100;
                                        button.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.5)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!formData.email || !formData.password) {
                                        e.currentTarget.style.transform = 'translate(0, 0) scale(1)';
                                        e.currentTarget.style.transition = 'transform 0.3s ease-out';
                                    }
                                }}
                                style={{
                                    position: (!formData.email || !formData.password) ? 'relative' : 'static',
                                    cursor: (!formData.email || !formData.password) ? 'pointer' : 'pointer'
                                }}
                            >
                                {isLoading ? (
                                    <span>Please wait...</span>
                                ) : (
                                    <>
                                        <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="signin-mode-toggle">
                            <span>
                                {mode === 'signin' 
                                    ? "Don't have an account?" 
                                    : 'Already have an account?'
                                }
                            </span>
                            <button
                                onClick={() => {
                                    setMode(mode === 'signin' ? 'signup' : 'signin');
                                    setError('');
                                }}
                                className="signin-link"
                            >
                                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>

                        <p className="signin-footer-text">
                            By continuing, you agree to our{' '}
                            <a href="#" className="signin-link">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="signin-link">Privacy Policy</a>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="signin-stats" style={{ animation: 'fadeInUp 0.8s ease-out 0.6s backwards' }}>
                        <div className="signin-stat" style={{ animation: 'scaleIn 0.5s ease-out 0.8s backwards' }}>
                            <div className="signin-stat-value">Fast</div>
                            <div className="signin-stat-label">Setup Time</div>
                        </div>
                        <div className="signin-stat-divider"></div>
                        <div className="signin-stat" style={{ animation: 'scaleIn 0.5s ease-out 1s backwards' }}>
                            <div className="signin-stat-value">Free</div>
                            <div className="signin-stat-label">To Use</div>
                        </div>
                        <div className="signin-stat-divider"></div>
                        <div className="signin-stat" style={{ animation: 'scaleIn 0.5s ease-out 1.2s backwards' }}>
                            <div className="signin-stat-value">Open</div>
                            <div className="signin-stat-label">Source</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
