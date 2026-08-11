"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window !== 'undefined' && !(window as any)._fetchPatched) {
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const response = await originalFetch(...args);
                if (response.status === 401 && !window.location.pathname.includes('/login')) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return response;
            };
            (window as any)._fetchPatched = true;
        }
    }, []);

    // Eğer url /login, /register, /dashboard veya /admin ile başlıyorsa genel menü ve footeri gizleyeceğiz
    const hideLayout = pathname === '/login' || pathname === '/register' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

    return (
        <>
            {!hideLayout && <Navbar />}
            {children}
            {!hideLayout && <Footer />}
        </>
    );
}
