"use client";

import styles from './about.module.css';
import { 
    ScanEye, 
    Lightbulb, 
    PenTool, 
    Sparkles, 
    Box, 
    Wand2, 
    Cloud, 
    LineChart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
                <div className={styles.badge}>Our Mission</div>
                <h1 className={styles.title}>
                    Helping businesses create professional marketing content with <span className={styles.titleHighlight}>AI.</span>
                </h1>
                <p className={styles.description}>
                    We bridge the gap between complex generative technology and high-impact creative execution, empowering marketers to focus on strategy while our engine handles the heavy lifting.
                </p>
            </section>

            {/* THE INTELLIGENCE ENGINE */}
            <section className={styles.engineSection}>
                <h2 className={styles.sectionTitle} style={{textAlign: 'center'}}>The Intelligence Engine</h2>
                <p className={styles.sectionSubtitle} style={{textAlign: 'center'}}>How our system transforms a simple product into a campaign-ready asset.</p>
                
                <div className={styles.featuresGrid}>
                    <div className={styles.featureItem}>
                        <div className={`${styles.iconWrapper} ${styles.iconWrapperSolid}`}>
                            <ScanEye size={28} />
                        </div>
                        <h3 className={styles.featureTitle}>Vision AI</h3>
                        <p className={styles.featureDesc}>Deep scanning of physical product attributes.</p>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`${styles.iconWrapper} ${styles.iconWrapperSolid}`}>
                            <Lightbulb size={28} />
                        </div>
                        <h3 className={styles.featureTitle}>Product Understanding</h3>
                        <p className={styles.featureDesc}>Identifying core value and target demographics.</p>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`${styles.iconWrapper} ${styles.iconWrapperSolid}`}>
                            <PenTool size={28} />
                        </div>
                        <h3 className={styles.featureTitle}>Prompt Generation</h3>
                        <p className={styles.featureDesc}>Synthesizing creative direction into code.</p>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={`${styles.iconWrapper} ${styles.iconWrapperSolid}`}>
                            <Sparkles size={28} />
                        </div>
                        <h3 className={styles.featureTitle}>Image Generation</h3>
                        <p className={styles.featureDesc}>High-fidelity production of visual assets.</p>
                    </div>
                </div>
            </section>

            {/* BUILT ON EXCELLENCE */}
            <section className={styles.excellenceSection}>
                <h2 className={styles.sectionTitle}>Built on Excellence</h2>
                <p className={styles.sectionSubtitle}>Our infrastructure is designed for speed, security, and precision.</p>

                <div className={styles.cardsGrid}>
                    <div className={styles.excellenceCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <Box size={20} />
                            </div>
                            <span className={styles.cardBadge}>CORE</span>
                        </div>
                        <h3 className={styles.cardTitle}>AI Vision</h3>
                        <p className={styles.cardDesc}>Advanced spatial recognition algorithms that understand object depth, texture, and light interaction for flawless rendering.</p>
                        <div className={styles.cardImageContainer}>
                            <Image src="/ai_vision.png" alt="AI Vision Technology" fill className={styles.cardImage} sizes="(max-width: 768px) 100vw, 25vw" />
                        </div>
                    </div>

                    <div className={styles.excellenceCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <Wand2 size={20} />
                            </div>
                            <span className={styles.cardBadge}>GEN</span>
                        </div>
                        <h3 className={styles.cardTitle}>Generative AI</h3>
                        <p className={styles.cardDesc}>Proprietary diffusion models fine-tuned specifically for commercial photography and photorealistic brand imagery.</p>
                        <div className={styles.cardImageContainer}>
                            <Image src="/generative_ai.png" alt="Generative AI" fill className={styles.cardImage} sizes="(max-width: 768px) 100vw, 25vw" />
                        </div>
                    </div>

                    <div className={styles.excellenceCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <Cloud size={20} />
                            </div>
                            <span className={styles.cardBadge}>INFRA</span>
                        </div>
                        <h3 className={styles.cardTitle}>Cloud Storage</h3>
                        <p className={styles.cardDesc}>Secure, redundant, and ultra-fast asset delivery networks that keep your marketing collateral organized and accessible.</p>
                        <div className={styles.cardImageContainer}>
                            <Image src="/cloud_storage.png" alt="Cloud Storage Infrastructure" fill className={styles.cardImage} sizes="(max-width: 768px) 100vw, 25vw" />
                        </div>
                    </div>

                    <div className={styles.excellenceCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>
                                <LineChart size={20} />
                            </div>
                            <span className={styles.cardBadge}>ANALYTICS</span>
                        </div>
                        <h3 className={styles.cardTitle}>Campaign Intel</h3>
                        <p className={styles.cardDesc}>Predictive performance metrics that suggest the best colors, layouts, and styles for your specific industry vertical.</p>
                        <div className={styles.cardImageContainer}>
                            <Image src="/campaign.png" alt="Campaign Analytics" fill className={styles.cardImage} sizes="(max-width: 768px) 100vw, 25vw" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaCard}>
                    <h2 className={styles.ctaTitle}>Ready to transform your<br/>content workflow?</h2>
                    <p className={styles.ctaDesc}>Join 10,000+ marketers leveraging AdVantage AI to scale their creative output effortlessly.</p>
                    <div className={styles.ctaButtons}>
                        <Link href="/register" className={styles.btnPrimary}>Start Free Trial</Link>
                        <button className={styles.btnSecondary}>Request Demo</button>
                    </div>
                </div>
            </section>

        </div>
    );
}
