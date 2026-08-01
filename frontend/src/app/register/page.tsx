"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Zap, Upload, BarChart2, Wand2, Eye, EyeOff } from 'lucide-react';
import styles from './register.module.css';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);


    const router = useRouter();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const payload = {
                name: name,
                surname: surname,
                email: email,
                password: password,
                plan_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
            };

            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Kayıt işlemi başarısız oldu.');
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className={styles.container}>
            {/* SOL PANEL - BİLGİLENDİRME (YEŞİL) */}
            <div className={styles.leftPanel}>
                <div className={`${styles.blob} ${styles.blob1}`}></div>
                <div className={`${styles.blob} ${styles.blob2}`}></div>

                <div className={styles.infoContent}>
                    <h1 className={styles.infoTitle}>How it works</h1>

                    <div className={styles.stepList}>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIconWrapper}>
                                <Upload size={24} />
                            </div>
                            <div>
                                <h3 className={styles.stepTitle}>Upload</h3>
                                <p className={styles.stepDesc}>Input your brand guidelines and raw assets.</p>
                            </div>
                        </div>

                        <div className={styles.stepItem}>
                            <div className={styles.stepIconWrapper}>
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <h3 className={styles.stepTitle}>Analysis</h3>
                                <p className={styles.stepDesc}>AI identifies patterns and high-converting elements.</p>
                            </div>
                        </div>

                        <div className={styles.stepItem}>
                            <div className={styles.stepIconWrapper}>
                                <Wand2 size={24} />
                            </div>
                            <div>
                                <h3 className={styles.stepTitle}>Creative</h3>
                                <p className={styles.stepDesc}>Generate 100+ variations optimized for every platform.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.quoteBlock}>
                        "Join 10,000+ marketers scaling their creative output."
                    </div>
                </div>
            </div>

            {/* SAĞ PANEL - FORM */}
            <div className={styles.rightPanel}>
                <Link href="/" className={styles.logo}>
                    <Image src="/logo2.png" alt="AdDesign AI Logo" width={300} height={120} style={{ objectFit: 'contain' }} priority />
                </Link>

                <div className={styles.formWrapper}>
                    <h1 className={styles.title}>Create your account</h1>
                    <p className={styles.subtitle}>
                        Experience the future of marketing creative today.
                    </p>

                    {error && (
                        <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} htmlFor="name">First Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={styles.input}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label} htmlFor="surname">Last Name</label>
                                <input
                                    type="text"
                                    id="surname"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    className={styles.input}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="email">Work Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="john@company.com"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="password">Password</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    required
                                />
                                <div
                                    className={styles.eyeIcon}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>

                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="terms" className={styles.checkbox} required />
                            <label htmlFor="terms" className={styles.termsText}>
                                I agree to the <Link href="#" className={styles.termsLink}>Terms of Service</Link> and <Link href="#" className={styles.termsLink}>Privacy Policy</Link>.
                            </label>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Hesap oluşturuluyor...' : 'Get Started Free'}
                        </button>
                    </form>

                    <p className={styles.loginText}>
                        Already have an account? <Link href="/login" className={styles.loginLink}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
