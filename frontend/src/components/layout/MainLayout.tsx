"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Eğer url /login, /register veya /dashboard ise bu sayfalarda genel menü ve footeri gizleyeceğiz
    const hideLayout = pathname === '/login' || pathname === '/register' || pathname === '/dashboard';

    return (
        <>
            {!hideLayout && <Navbar />}
            {children}
            {!hideLayout && <Footer />}
        </>
    );
}
