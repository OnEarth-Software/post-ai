import Link from 'next/link';
import { ArrowRight, Sparkles, Camera, MonitorPlay, Pin, ShoppingCart, FileUp, Eye, Lightbulb, Megaphone, ScanSearch, Zap, LayoutGrid, RefreshCw, Store } from 'lucide-react';
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider';
import styles from './page.module.css';

export default function Home() {
  const steps = [
    { icon: <FileUp size={24} className={styles.stepIcon} />, title: '1. Upload', description: 'Drag & drop your product shots in any quality.' },
    { icon: <Eye size={24} className={styles.stepIcon} />, title: '2. Vision Analysis', description: 'AI extracts textures, colors, and key features.' },
    { icon: <Lightbulb size={24} className={styles.stepIcon} />, title: '3. Understanding', description: 'Market analysis identifies your target audience.' },
    { icon: <Megaphone size={24} className={styles.stepIcon} />, title: '4. Creation', description: 'Copywriters generate high-converting ad text.' },
    { icon: <Sparkles size={24} className={styles.stepIcon} />, title: '5. Generation', description: 'Final visual assets ready to be deployed.' },
  ];

  return (
    <main className={styles.main}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} size={14} />
            Next-Gen Marketing Engine
          </div>
          <h1 className={styles.title}>
            Turn Product Images Into <br />
            <span className={styles.highlight}>AI-Powered</span> Marketing Content
          </h1>
          <p className={styles.description}>
            Upload your product photos and let our AI analyze, extract details, and generate high-converting ads for Instagram, TikTok, and more in seconds.
          </p>
          <div className={styles.actions}>
            <Link href="/start" className={styles.primaryButton}>
              Start Creating <ArrowRight size={18} />
            </Link>
            <Link href="/demo" className={styles.secondaryButton}>
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Slider Bileşenimiz Burada Çağrılıyor */}
        <BeforeAfterSlider />
      </section>

      {/* 2. PLATFORMS SECTION */}
      <section className={styles.platformsSection}>
        <p className={styles.platformsLabel}>OPTIMIZED FOR EVERY CHANNEL</p>
        <div className={styles.logos}>
          <div className={styles.logoItem}><Camera size={24} /><span>Instagram</span></div>
          <div className={styles.logoItem}><MonitorPlay size={24} /><span>TikTok</span></div>
          <div className={styles.logoItem}><Camera size={24} /><span>Facebook</span></div>
          <div className={styles.logoItem}><Pin size={24} /><span>Pinterest</span></div>
          <div className={styles.logoItem}><ShoppingCart size={24} /><span>Shopify</span></div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsHeader}>
          <h2 className={styles.stepsTitle}>From Photos to Sales in 5 Steps</h2>
          <p className={styles.stepsSubtitle}>
            Our proprietary AI pipeline handles the heavy lifting of professional creative production.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.stepIconWrapper}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURES (BENTO GRID) SECTION */}
      <section className={styles.featuresSection}>
        <div className={styles.bentoGrid}>
          {/* Card 1: Large */}
          <div className={`${styles.bentoCard} ${styles.cardLarge}`}>
            <div className={styles.cardIcon}><ScanSearch size={24} /></div>
            <h3 className={styles.cardTitle}>Deep AI Product Analysis</h3>
            <p className={styles.cardDesc}>
              Our vision model understands every detail of your product—from the thread count in fabric to the micro-textures of jewelry—to ensure 100% brand accuracy in every ad.
            </p>
          </div>
          
          {/* Card 2: Highlight */}
          <div className={`${styles.bentoCard} ${styles.cardHighlight}`}>
            <div className={styles.cardIcon}><Zap size={24} /></div>
            <h3 className={styles.cardTitle}>Instant Ad Generator</h3>
            <p className={styles.cardDesc}>
              Generate 50+ ad variants for 5 platforms in under 30 seconds.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.bentoCard}>
            <div className={styles.cardIcon}><LayoutGrid size={24} /></div>
            <h3 className={styles.cardTitle}>Campaign Management</h3>
            <p className={styles.cardDesc}>
              Organize assets by season, product line, or marketing channel with ease.
            </p>
          </div>

          {/* Card 4 */}
          <div className={styles.bentoCard}>
            <div className={styles.cardIcon}><RefreshCw size={24} /></div>
            <h3 className={styles.cardTitle}>AI Regeneration</h3>
            <p className={styles.cardDesc}>
              Don't like a result? One click re-renders the scene with different lighting or themes.
            </p>
          </div>

          {/* Card 5 */}
          <div className={styles.bentoCard}>
            <div className={styles.cardIcon}><Store size={24} /></div>
            <h3 className={styles.cardTitle}>Inventory Sync</h3>
            <p className={styles.cardDesc}>
              Directly import images from your Shopify or BigCommerce storefront.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
