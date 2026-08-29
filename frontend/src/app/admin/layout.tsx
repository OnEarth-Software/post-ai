import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './adminLayout.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    let shouldRedirectToLogin = false;
    let shouldRedirectToDashboard = false;
    try {
        let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            apiUrl = 'http://backend:8000';
        }
        const response = await fetch(`${apiUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        if (!response.ok) {
            shouldRedirectToLogin = true;
        } else {
            const userData = await response.json();
            if (userData.role !== 'admin') {
                shouldRedirectToDashboard = true;
            }
        }
    } catch (err) {
        console.error("Server-side auth check failed:", err);
        shouldRedirectToLogin = true;
    }
    // Yönlendirme işlemleri Next.js'in hata fırlatma mantığı gereği 
    // try-catch bloğunun tamamen dışında yapılmalıdır.
    if (shouldRedirectToLogin) redirect('/login');
    if (shouldRedirectToDashboard) redirect('/dashboard');

    return (
        <div className={styles.container}>
            <AdminSidebar />

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.contentArea}>
                    {children}
                </div>
            </main>
        </div>
    );
}
