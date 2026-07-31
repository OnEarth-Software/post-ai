import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                <span className={styles.logoAccent}>Ad</span>Vantage AI
            </Link>
            <nav className={styles.nav}>
                <Link href="/#features">Home</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/#about">About</Link>
            </nav>
            <div className={styles.actions}>
                <Link href="/login" className={styles.login}>Login</Link>
                <Link href="/start" className={styles.cta}>Start Creating</Link>
            </div>
        </header>
    );
}
