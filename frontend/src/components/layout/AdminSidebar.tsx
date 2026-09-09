"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
    LogOut, 
    LayoutDashboard, 
    Users, 
    Settings, 
    Plus,
    Megaphone,
    Box,
    CreditCard,
    HelpCircle,
    FileText,
    Palette
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../app/admin/adminLayout.module.css';

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Link href="/admin/dashboard">
                    <Image src="/logo2.png" alt="Logo" width={180} height={50} style={{ objectFit: 'contain' }} priority />
                </Link>
            </div>

            <div className={styles.newCampaignContainer}>
                <button className={styles.newCampaignBtn}>
                    <Plus size={18} />
                    New Campaign
                </button>
            </div>

            <nav className={styles.nav}>
                <Link href="/admin/dashboard" className={`${styles.navItem} ${pathname === '/admin/dashboard' ? styles.active : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/admin/users" className={`${styles.navItem} ${pathname === '/admin/users' ? styles.active : ''}`}>
                    <Users size={20} />
                    <span>User Management</span>
                </Link>
                <Link href="/admin/campaigns" className={`${styles.navItem} ${pathname === '/admin/campaigns' ? styles.active : ''}`}>
                    <Megaphone size={20} />
                    <span>Campaigns</span>
                </Link>
                <Link href="/admin/products" className={`${styles.navItem} ${pathname === '/admin/products' ? styles.active : ''}`}>
                    <Box size={20} />
                    <span>Products</span>
                </Link>
                <Link href="/admin/design" className={`${styles.navItem} ${pathname === '/admin/design' ? styles.active : ''}`}>
                    <Palette size={20} />
                    <span>Design</span>
                </Link>
                <Link href="/admin/market-reports" className={`${styles.navItem} ${pathname === '/admin/market-reports' ? styles.active : ''}`}>
                    <FileText size={20} />
                    <span>Market Reports</span>
                </Link>
                <Link href="/admin/financials" className={`${styles.navItem} ${pathname === '/admin/financials' ? styles.active : ''}`}>
                    <CreditCard size={20} />
                    <span>Financials</span>
                </Link>
            </nav>

            <div className={styles.footer}>
                <nav className={styles.bottomNav}>
                    <Link href="/admin/settings" className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.active : ''}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                    <Link href="#" className={styles.navItem}>
                        <HelpCircle size={20} />
                        <span>Support</span>
                    </Link>
                </nav>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
