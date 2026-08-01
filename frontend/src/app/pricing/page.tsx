"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, Droplets } from 'lucide-react';
import styles from './pricing.module.css';

const defaultUIConfig: Record<string, any> = {
    "Free": {
        isPopular: false,
        features: [
            { text: "10 AI Üretimi", included: true },
            { text: "3 Aktif Kampanya", included: true },
            { text: "Filigranlı Çıktı", included: false, icon: 'watermark' },
        ],
        buttonText: "Hemen Başla",
        buttonType: "outline"
    },
    "Pro": {
        isPopular: true,
        features: [
            { text: "300 AI Üretimi", included: true },
            { text: "Sınırsız Kampanya", included: true },
            { text: "HD Dışa Aktarım (Filigransız)", included: true },
            { text: "Öncelikli İşlem Sırası", included: true },
        ],
        buttonText: "Pro'ya Geç",
        buttonType: "primary"
    },
    "Enterprise": {
        isPopular: false,
        features: [
            { text: "Sınırsız Üretim", included: true },
            { text: "Tam API Erişimi", included: true },
            { text: "Özel AI Eğitimi", included: true },
            { text: "Özel Destek Yöneticisi", included: true },
        ],
        buttonText: "İletişime Geç",
        buttonType: "outline"
    }
};

const faqs = [
    {
        question: "Can I cancel my subscription at any time?",
        answer: "Yes, you can cancel your subscription at any time from your account settings. You will continue to have access to your plan until the end of your current billing cycle."
    },
    {
        question: "What happens after I reach my generation limit?",
        answer: "Once you reach your limit, you can either upgrade to a higher tier or wait until your next billing cycle begins. We will notify you when you reach 80% and 100% of your usage."
    },
    {
        question: "Do you offer discounts for non-profits?",
        answer: "Yes, we offer special pricing for registered non-profit organizations and educational institutions. Please contact our sales team for more information."
    },
    {
        question: "Is my data secure with AdVantage AI?",
        answer: "Absolutely. We employ enterprise-grade security measures to protect your data and do not use your proprietary images to train our public models."
    }
];

export default function PricingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/plans/`);
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                setPlans(data || []);
            } catch (error) {
                console.error("Failed to fetch plans from backend:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.title}>Precision Pricing for Scale</h1>
                <p className={styles.subtitle}>
                    Transparent plans designed for modern marketers. Harness the power of AdVantage AI from solo projects to global enterprise operations.
                </p>
            </header>

            <section className={styles.pricingGrid}>
                {loading ? (
                    <p style={{ textAlign: 'center', gridColumn: 'span 3' }}>Loading plans from backend...</p>
                ) : plans.length === 0 ? (
                    <p style={{ textAlign: 'center', gridColumn: 'span 3' }}>No plans found. Please add plans to the database.</p>
                ) : (
                    plans.map((plan, index) => {
                        // Backend'den gelen veri ile eksik UI ayarlarını birleştiriyoruz (Siz DB'ye ekleyene kadar)
                        const config = defaultUIConfig[plan.name] || defaultUIConfig["Free"];

                        const isPopular = plan.is_popular !== undefined ? plan.is_popular : config.isPopular;
                        const period = plan.period || "/ay";
                        const features = plan.features && plan.features.length > 0 ? plan.features : config.features;
                        const buttonText = plan.button_text || config.buttonText;
                        const buttonType = plan.button_type || config.buttonType;

                        // Fiyat formatı
                        let priceDisplay = `$${plan.price}`;
                        if (plan.price === 0 && plan.name !== "Free") {
                            priceDisplay = "Custom";
                        } else if (plan.price === 0) {
                            priceDisplay = "$0";
                        }

                        return (
                            <div key={plan.id || index} className={`${styles.card} ${isPopular ? styles.cardPopular : ''}`}>
                                {isPopular && <div className={styles.popularBadge}>EN POPÜLER</div>}

                                <h2 className={styles.planName}>{plan.name}</h2>
                                <p className={styles.planDesc}>{plan.description}</p>

                                <div className={styles.priceWrapper}>
                                    <span className={`${styles.price} ${priceDisplay === 'Custom' ? styles.priceCustom : ''}`}>
                                        {priceDisplay}
                                    </span>
                                    <span className={styles.period}>{priceDisplay === 'Custom' ? "" : period}</span>
                                </div>

                                <ul className={styles.featuresList}>
                                    {features.map((feature: any, fIndex: number) => {
                                        const featText = typeof feature === 'string' ? feature : feature.text;
                                        const featIcon = typeof feature === 'object' && feature.icon === 'watermark' ? 'watermark' : 'check';

                                        return (
                                            <li key={fIndex} className={styles.featureItem}>
                                                {featIcon === 'watermark' ? (
                                                    <Droplets size={18} className={styles.featureIconWatermark} />
                                                ) : (
                                                    <CheckCircle2 size={18} className={styles.featureIcon} />
                                                )}
                                                <span>{featText}</span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <button className={`${styles.button} ${buttonType === 'primary' ? styles.btnPrimary : styles.btnOutline}`}>
                                    {buttonText}
                                </button>
                            </div>
                        );
                    })
                )}
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
