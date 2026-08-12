"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Zap, Star } from 'lucide-react';
import styles from './login.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

const testimonials = [
    {
        quote: "AdVantage AI transformed our workflow from guesswork to precision engineering in weeks.",
        name: "Sarah Chen",
        title: "Growth Lead at Lumina",
        color: "#059669"
    },
    {
        quote: "We scaled our ad variations by 10x without compromising our brand guidelines. Incredible.",
        name: "Michael Ross",
        title: "Creative Director",
        color: "#2563eb"
    },
    {
        quote: "The ROI we've seen since switching to AI-generated creatives is simply unmatched in the industry.",
        name: "Elena Rodriguez",
        title: "Performance Marketer",
        color: "#9333ea"
    }
];

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [activeIndex, setActiveIndex] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [is2faStep, setIs2faStep] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');


    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: email, password: password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Giriş başarısız oldu.');
            }

            const data = await response.json();
            
            if (data.requires_2fa) {
                setTempToken(data.temp_token);
                setIs2faStep(true);
                return;
            }
            
            // SECURITY TRADE-OFF: Storing in localStorage allows existing client-side data fetching to work
            // but exposes the token to XSS. A full HttpOnly architecture would require proxying all API requests.
            localStorage.setItem('token', data.access_token);
            
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const userResponse = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.role === 'admin') {
                    router.push('/admin/dashboard');
                    return;
                }
            }
            
            console.log("Giriş Başarılı");
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handle2faSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temp_token: tempToken, code: twoFactorCode })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '2FA doğrulaması başarısız oldu.');
            }

            const data = await response.json();
            
            localStorage.setItem('token', data.access_token);
            
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const userResponse = await fetch(`${apiUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.role === 'admin') {
                    router.push('/admin/dashboard');
                    return;
                }
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            {/* SOL PANEL - FORM */}
            <div className={styles.leftPanel}>
                <Link href="/" className={styles.logo}>
                    <Image src="/logo2.png" alt="AdDesign AI Logo" width={220} height={60} style={{ objectFit: 'contain' }} priority />
                </Link>

                <div className={styles.formWrapper}>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>
                        Log in to manage your performance marketing with AI precision.
                    </p>

                    {registered && (
                        <div style={{ color: '#059669', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '6px' }}>
                            Registration successful! Please log in.
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                            {error}
                        </div>
                    )}

                    {is2faStep ? (
                        <form onSubmit={handle2faSubmit}>
                            <p style={{marginBottom: '1rem', color: '#64748b'}}>Please enter the 6-digit code from your Authenticator app.</p>
                            <div className={styles.formGroup}>
                                <div className={styles.labelWrapper}>
                                    <label className={styles.label} htmlFor="twoFactorCode">Authentication Code</label>
                                </div>
                                <input
                                    type="text"
                                    id="twoFactorCode"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    className={styles.input}
                                    placeholder="123456"
                                    maxLength={6}
                                    style={{textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25rem'}}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button type="button" className={styles.submitBtn} onClick={() => setIs2faStep(false)} style={{background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', marginTop: '1rem'}}>
                                Back to Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin}>
                            <div className={styles.formGroup}>
                                <div className={styles.labelWrapper}>
                                    <label className={styles.label} htmlFor="email">Email Address</label>
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.labelWrapper}>
                                    <label className={styles.label} htmlFor="password">Password</label>
                                    <Link href="#" className={styles.forgotPwd}>Forgot password?</Link>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Logging in...' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    <p className={styles.signUpText}>
                        Don't have an account? <Link href="/register" className={styles.signUpLink}>Join the beta</Link>
                    </p>

                    <div className={styles.securityBadge}>
                        <ShieldCheck size={16} />
                        AES-256 ENTERPRISE SECURITY
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL - ANİMASYONLU YORUMLAR */}
            <div className={styles.rightPanel}>
                <div className={styles.imageOverlay}></div>

                <div className={styles.testimonialContainer}>
                    {testimonials.map((testi, index) => {
                        let positionClass = styles.hidden;
                        if (index === activeIndex) {
                            positionClass = styles.active;
                        } else if (index === (activeIndex - 1 + testimonials.length) % testimonials.length) {
                            positionClass = styles.prev;
                        } else if (index === (activeIndex + 1) % testimonials.length) {
                            positionClass = styles.next;
                        }

                        return (
                            <div
                                key={index}
                                className={`${styles.testimonialCard} ${positionClass}`}
                            >
                                <div className={styles.stars}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={18} fill="currentColor" />
                                    ))}
                                </div>
                                <p className={styles.quote}>"{testi.quote}"</p>

                                <div className={styles.author}>
                                    <div className={styles.avatar} style={{ backgroundColor: testi.color }}>
                                        {testi.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className={styles.authorName}>{testi.name}</span>
                                        <span className={styles.authorTitle}>{testi.title}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Alt taraftaki navigasyon noktaları */}
                    <div className={styles.dots}>
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );


}
export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
