import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <Image src="/logo2.png" alt="AdDesign AI Logo" width={300} height={110} style={{ objectFit: 'contain' }} priority />
            </Link>
            <nav className={styles.nav}>
                <Link href="/#features">Home</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/#about">About</Link>
            </nav>
            <div className={styles.actions}>
                <Link href="/login" className={styles.login}>Login</Link>
                <Link href="/register" className={styles.cta}>Start Creating</Link>
            </div>
        </header>
    );
}
