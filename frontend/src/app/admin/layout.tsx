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
            redirect('/login');
        }

        const userData = await response.json();
        
        if (userData.role !== 'admin') {
            redirect('/dashboard');
        }
    } catch (err) {
        console.error("Server-side auth check failed:", err);
        redirect('/login');
    }

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
