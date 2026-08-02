"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <Image src="/logo2.png" alt="AdDesign AI Logo" width={300} height={110} style={{ objectFit: 'contain' }} priority />
            </Link>

            <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <div className={`${styles.navContainer} ${isMenuOpen ? styles.navOpen : ''}`}>
                <nav className={styles.nav}>
                    <Link href="/#features" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                    <Link href="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
                </nav>
                <div className={styles.actions}>
                    <Link href="/login" className={styles.login} onClick={() => setIsMenuOpen(false)}>Login</Link>
                    <Link href="/register" className={styles.cta} onClick={() => setIsMenuOpen(false)}>Start Creating</Link>
                </div>
            </div>
        </header>
    );
}
