import Link from 'next/link';
import { Globe, Mail, X } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* Brand & Description */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              AdVantage AI
            </Link>
            <p className={styles.description}>
              Revolutionizing e-commerce marketing through specialized AI vision and creative generation.
            </p>
          </div>

          {/* Links Columns */}
          <div className={styles.linksContainer}>
            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>PRODUCT</h4>
              <Link href="/features" className={styles.link}>Features</Link>
              <Link href="/pricing" className={styles.link}>Pricing</Link>
              <Link href="/showcase" className={styles.link}>Showcase</Link>
              <Link href="/api" className={styles.link}>API</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>COMPANY</h4>
              <Link href="/about" className={styles.link}>About Us</Link>
              <Link href="/careers" className={styles.link}>Careers</Link>
              <Link href="/press" className={styles.link}>Press</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.groupTitle}>LEGAL</h4>
              <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
              <Link href="/terms" className={styles.link}>Terms of Service</Link>
              <Link href="/security" className={styles.link}>Security</Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © 2026 AdVantage AI. Functional Elegance for Modern Marketers.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon} aria-label="Website"><Globe size={18} /></a>
            <a href="#" className={styles.socialIcon} aria-label="Email"><Mail size={18} /></a>
            <a href="#" className={styles.socialIcon} aria-label="Twitter"><X size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
