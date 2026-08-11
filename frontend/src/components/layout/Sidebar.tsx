"use client";

import { useEffect, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Package,
    Megaphone,
    BrainCircuit,
    Folder,
    BarChart3,
    CreditCard,
    Settings,
    Plus,
    HelpCircle,
    LogOut,
    Sparkles,
    Menu,
    X,
    Globe
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Products', path: '/dashboard/products', icon: Package },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: Megaphone },
    { name: 'Assets', path: '/dashboard/assets', icon: Folder },
    { name: 'Social', path: '/dashboard/social', icon: Globe },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; surname: string; email: string } | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                }
            } catch (error) {
                console.error('Kullanıcı bilgileri çekilemedi:', error);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                className={styles.mobileToggleBtn} 
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className={styles.mobileOverlay} 
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.topSection}>
                    <div className={styles.logoRow}>
                        <Link href="/dashboard" className={styles.logoWrapper}>
                            <div className={styles.logoDesktop}>
                                <Image src="/logo2.png" alt="AdDesign AI Logo" width={200} height={120} style={{ objectFit: 'contain' }} priority />
                            </div>
                            <div className={styles.logoCollapsed}>
                                <Image src="/logo3.png" alt="AdDesign AI Logo" width={50} height={50} style={{ objectFit: 'contain' }} priority />
                            </div>
                        </Link>
                        <button 
                            className={styles.mobileCloseBtn} 
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                    </div>

                <nav className={styles.navMenu}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            >
                                <Icon size={20} className={styles.navIcon} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className={styles.bottomSection}>
                {user && (
                    <div className={styles.userProfile}>
                        <div className={styles.userAvatar}>
                            {user.name.charAt(0)}{user.surname.charAt(0)}
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name} {user.surname}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                        </div>
                    </div>
                )}
                
                <div className={styles.divider}></div>

                <button className={styles.newCampaignBtn}>
                    <Plus size={20} />
                    <span>New Campaign</span>
                </button>

                <div className={styles.footerLinks}>
                    <Link href="/help" className={styles.footerItem}>
                        <HelpCircle size={20} className={styles.footerIcon} />
                        <span>Help</span>
                    </Link>
                    <button onClick={handleLogout} className={styles.footerItem}>
                        <LogOut size={20} className={styles.footerIcon} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
        </>
    );
}
