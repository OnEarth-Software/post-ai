"use client";

import { useState } from 'react';
import { CheckCircle2, ChevronDown, Zap, Calculator, Database, Type, Image as ImageIcon, Box } from 'lucide-react';
import styles from './pricing.module.css';

const operationCosts = [
    { name: "Product Upload & Vision Analysis", credits: 10, icon: Box },
    { name: "Social Media Caption Generation", credits: 10, icon: Type },
    { name: "Deep Market & Competitor Analysis", credits: 100, icon: Database },
    { name: "Full AI Campaign Generation (HD Image)", credits: 200, icon: ImageIcon },
];

const creditPacks = [
    {
        id: "starter",
        name: "Starter Bundle",
        description: "Perfect for testing the waters and small projects.",
        price: "$30",
        credits: 2000,
        isPopular: false,
        examples: [
            "≈ 10 Full AI Campaigns",
            "or 200 Product Uploads",
            "or 20 Market Analyses"
        ],
        buttonText: "Buy Starter Pack",
        buttonType: "outline"
    },
    {
        id: "pro",
        name: "Creator Bundle",
        description: "Best value for regular content creators.",
        price: "$65",
        credits: 5000,
        isPopular: true,
        examples: [
            "≈ 25 Full AI Campaigns",
            "or 500 Product Uploads",
            "or 50 Market Analyses"
        ],
        buttonText: "Get Creator Pack",
        buttonType: "primary"
    },
    {
        id: "agency",
        name: "Agency Bundle",
        description: "High volume credits for marketing teams.",
        price: "$200",
        credits: 20000,
        isPopular: false,
        examples: [
            "≈ 100 Full AI Campaigns",
            "or 2000 Product Uploads",
            "or 200 Market Analyses"
        ],
        buttonText: "Buy Agency Pack",
        buttonType: "outline"
    }
];

const faqs = [
    {
        question: "Do my credits ever expire?",
        answer: "No! Your purchased credits roll over indefinitely. They will remain in your account until you use them, with absolutely no expiration date."
    },
    {
        question: "How exactly are credits deducted?",
        answer: "Credits are only deducted when you successfully perform an action. For example, generating a final HD campaign image deducts 200 credits, while uploading a product deducts 10 credits."
    },
    {
        question: "Do you offer custom enterprise pricing?",
        answer: "Yes, for API access and extremely high volume generation (100k+ credits), please contact our sales team for custom volume discounts."
    }
];

export default function PricingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [calcCredits, setCalcCredits] = useState<number | string>(1000);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Calculate approximate dollar cost. Roughly $15 per 1000 credits.
    const calculatedPrice = (Number(calcCredits) || 0) * 0.015;

    return (
        <div className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.title}>Pay Per Generation</h1>
                <p className={styles.subtitle}>
                    No monthly subscriptions. No hidden fees. Buy credits once and use them forever. Pay exactly for the AI power you consume.
                </p>
            </header>

            {/* Credit Costs Section */}
            <section style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem', color: '#0f172a' }}>Transparent Operation Costs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {operationCosts.map((op, idx) => {
                        const Icon = op.icon;
                        return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.25rem 2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', color: '#059669' }}>
                                        <Icon size={24} />
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{op.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Zap size={18} color="#eab308" />
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eab308' }}>{op.credits}</span>
                                    <span style={{ color: '#64748b', fontWeight: 500 }}>Credits</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Calculator Section */}
            <section style={{ maxWidth: '800px', margin: '0 auto 5rem auto', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '3rem', borderRadius: '24px', color: 'white', boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Calculator size={32} />
                    <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>Cost Calculator</h2>
                </div>
                <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>Enter the amount of credits you need and see the estimated cost.</p>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Credits</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                            <Zap size={20} color="#eab308" />
                            <input 
                                type="number" 
                                value={calcCredits} 
                                onChange={(e) => setCalcCredits(e.target.value)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', width: '100%', paddingLeft: '0.5rem' }}
                                min="0"
                            />
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 300, opacity: 0.5 }}>=</div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Cost</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>${calculatedPrice.toFixed(2)}</span>
                            <span style={{ fontSize: '1rem', opacity: 0.8, alignSelf: 'flex-end', paddingBottom: '0.5rem' }}>USD</span>
                        </div>
                    </div>
                </div>
            </section>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>Credit Bundles</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>Get more value by purchasing pre-configured bundles.</p>
            </div>

            <section className={styles.pricingGrid}>
                {creditPacks.map((pack) => (
                    <div key={pack.id} className={`${styles.card} ${pack.isPopular ? styles.cardPopular : ''}`}>
                        {pack.isPopular && <div className={styles.popularBadge}>MOST POPULAR</div>}

                        <h2 className={styles.planName}>{pack.name}</h2>
                        <p className={styles.planDesc}>{pack.description}</p>

                        <div className={styles.priceWrapper} style={{ marginBottom: '1.5rem' }}>
                            <span className={styles.price}>{pack.price}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', marginBottom: '2rem' }}>
                            <Zap size={24} color="#eab308" />
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#854d0e', lineHeight: 1 }}>{pack.credits.toLocaleString()}</span>
                            <span style={{ fontWeight: 600, color: '#a16207' }}>Credits</span>
                        </div>

                        <ul className={styles.featuresList}>
                            {pack.examples.map((feature, fIndex) => (
                                <li key={fIndex} className={styles.featureItem} style={{ fontWeight: 500 }}>
                                    <CheckCircle2 size={18} className={styles.featureIcon} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`${styles.button} ${pack.buttonType === 'primary' ? styles.btnPrimary : styles.btnOutline}`}>
                            {pack.buttonText}
                        </button>
                    </div>
                ))}
            </section>

            <section className={styles.faqSection}>
                <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqList}>
                    {faqs.map((faq, index) => (
                        <div key={index} className={styles.faqItem}>
                            <button
                                className={styles.faqQuestion}
                                onClick={() => toggleFaq(index)}
                                aria-expanded={openFaq === index}
                            >
                                {faq.question}
                                <ChevronDown
                                    size={20}
                                    className={`${styles.faqIcon} ${openFaq === index ? styles.faqIconOpen : ''}`}
                                />
                            </button>
                            <div className={`${styles.faqAnswer} ${openFaq === index ? styles.faqAnswerOpen : ''}`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
