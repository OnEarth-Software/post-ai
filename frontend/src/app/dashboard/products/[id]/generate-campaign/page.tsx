"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, ArrowRight, Target, PenTool, Image as ImageIcon, Camera, Smartphone, CheckCircle, Sparkles, Megaphone, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import styles from './generate-campaign.module.css';

export default function GenerateCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    // Form Step State
    const [step, setStep] = useState(1);

    // Form States
    const [goal, setGoal] = useState<string>('');
    const [customGoal, setCustomGoal] = useState<string>('');
    const [platform, setPlatform] = useState<string>('instagram'); // Defaulting to instagram as requested
    const [type, setType] = useState<string>('');
    const [userPrompt, setUserPrompt] = useState<string>('');

    // System prompt hidden from user, set based on requirements
    const [systemPrompt, setSystemPrompt] = useState<string>(
        "json içindeki goal kısmındaki amaca göre içerik yazıları olucak. Logo, Sosyal medya vb. gibi içerikleri kullanma"
    );

    // AI Generation States
    const [isGeneratingText, setIsGeneratingText] = useState(false);
    const [generatedText, setGeneratedText] = useState<string>('');

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.push(`/dashboard/products/${id}`);
    };

    const handleGenerateText = async () => {
        setIsGeneratingText(true);
        
        // Gerekli bilgiler alındı, backend bağlanana kadar mock data gösteriyoruz.
        setTimeout(() => {
            setGeneratedText("Zamanın ötesinde şıklık! Doğa ile iç içe, dinamik tarzını yansıt.");
            setIsGeneratingText(false);
        }, 2500);
    };

    const handleGenerateImage = () => {
        alert("Görsel oluşturma işlemi başlatıldı! (Backend eklenecek)");
        // router.push(`/dashboard/campaigns`);
    };

    const isStepValid = () => {
        if (step === 1) {
            if (goal === 'custom') return customGoal.trim().length > 0;
            return goal !== '';
        }
        if (step === 2) return platform !== '' && type !== '';
        if (step === 3) return userPrompt.trim().length > 0;
        return true;
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <Link href={`/dashboard/products/${id}`} className={styles.breadcrumbLink}>
                    &larr; Ürüne Dön
                </Link>
                <h1 className={styles.title}>Kampanya Oluştur</h1>
                <p className={styles.subtitle}>Yapay zeka ile ürününüz için en iyi pazarlama içeriğini adım adım oluşturun.</p>
            </div>

            {/* Step Indicator */}
            <div className={styles.stepIndicator}>
                {[1, 2, 3, 4].map((s, index) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: index < 3 ? 1 : 0 }}>
                        <div className={`${styles.step} ${step === s ? styles.active : ''} ${step > s ? styles.completed : ''}`}>
                            <div className={styles.stepNumber}>
                                {step > s ? <CheckCircle size={16} /> : s}
                            </div>
                            <span style={{ display: step === s || step > s ? 'block' : 'none' }}>
                                {s === 1 && 'Hedef'}
                                {s === 2 && 'Platform'}
                                {s === 3 && 'İçerik'}
                                {s === 4 && 'Üretim'}
                            </span>
                        </div>
                        {index < 3 && (
                            <div className={`${styles.stepDivider} ${step > s ? styles.completed : ''}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Goal */}
            {step === 1 && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Kampanya Hedefiniz Nedir?</h2>
                    <div className={styles.optionsGrid}>
                        <div className={`${styles.optionCard} ${goal === 'Marka Tanınırlığı' ? styles.selected : ''}`} onClick={() => setGoal('Marka Tanınırlığı')}>
                            <Megaphone size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Marka Tanınırlığı</div>
                        </div>
                        <div className={`${styles.optionCard} ${goal === 'Etkileşim' ? styles.selected : ''}`} onClick={() => setGoal('Etkileşim')}>
                            <Heart size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Etkileşim Artırma</div>
                        </div>
                        <div className={`${styles.optionCard} ${goal === 'Satış' ? styles.selected : ''}`} onClick={() => setGoal('Satış')}>
                            <ShoppingCart size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Satış / Dönüşüm</div>
                        </div>
                        <div className={`${styles.optionCard} ${goal === 'custom' ? styles.selected : ''}`} onClick={() => setGoal('custom')}>
                            <PenTool size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Diğer (Kendim Gireceğim)</div>
                        </div>
                    </div>

                    {goal === 'custom' && (
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Kendi hedefinizi yazın..."
                            value={customGoal}
                            onChange={(e) => setCustomGoal(e.target.value)}
                            autoFocus
                        />
                    )}
                </div>
            )}

            {/* Step 2: Platform and Type */}
            {step === 2 && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Platform ve Format</h2>

                    <h3 className={styles.sectionLabel}>Sosyal Medya Platformu</h3>
                    <div className={styles.optionsGrid}>
                        <div className={`${styles.optionCard} ${platform === 'instagram' ? styles.selected : ''}`} onClick={() => setPlatform('instagram')}>
                            <Camera size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Instagram</div>
                        </div>
                        {/* More platforms can be added later */}
                    </div>

                    <h3 className={styles.sectionLabel}>İçerik Tipi</h3>
                    <div className={styles.optionsGrid}>
                        <div className={`${styles.optionCard} ${type === 'post' ? styles.selected : ''}`} onClick={() => setType('post')}>
                            <ImageIcon size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Post (Kare/Dikey)</div>
                        </div>
                        <div className={`${styles.optionCard} ${type === 'story' ? styles.selected : ''}`} onClick={() => setType('story')}>
                            <Smartphone size={32} className={styles.optionIcon} />
                            <div className={styles.optionTitle}>Story (Tam Ekran)</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Prompt */}
            {step === 3 && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Nasıl Bir İçerik İstiyorsunuz?</h2>
                    <p className={styles.cardSubtitle}>
                        Yapay zekanın nasıl bir tasarım veya kurgu yapması gerektiğini anlatın.
                    </p>
                    <textarea
                        className={styles.textareaField}
                        placeholder="Örn: Kol üzerinde şık bir tasarım, arka plan soft renklerden oluşsun..."
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                    />
                </div>
            )}

            {/* Step 4: Text Generation & Final */}
            {step === 4 && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>1. Kampanya Sloganı Üretimi</h2>
                    <p className={styles.cardSubtitle}>
                        Seçimlerinize göre yapay zeka ürününüzü analiz edip harika bir pazarlama metni hazırlayacak.
                    </p>

                    {!generatedText ? (
                        <div className={styles.loaderContainer}>
                            {isGeneratingText ? (
                                <>
                                    <div className={styles.premiumLoader}></div>
                                    <p className={styles.loaderText}>
                                        Yapay zeka ürününüzü inceliyor ve slogan üretiyor...
                                    </p>
                                </>
                            ) : (
                                <button className={styles.btnPrimary} onClick={handleGenerateText}>
                                    <PenTool size={18} /> Kampanya Yazısı Oluştur
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className={styles.premiumTextBox}>
                                {generatedText}
                            </div>
                            
                            <div className={styles.nextStepBox}>
                                <h2 className={styles.cardTitle} style={{ fontSize: '1.25rem', color: '#047857' }}>2. Görsel Üretimi</h2>
                                <p className={styles.cardSubtitle} style={{ marginBottom: '1.5rem', color: '#334155' }}>
                                    Sloganınız hazır! Artık bu efsane sloganla birleştirilmiş harika bir kampanya görseli üretebiliriz.
                                </p>
                                <button className={styles.btnPrimary} style={{ margin: '0 auto' }} onClick={handleGenerateImage}>
                                    <Sparkles size={18} /> Görsel Oluştur
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Actions */}
            <div className={styles.actions}>
                <button className={styles.btnSecondary} onClick={handleBack}>
                    {step === 1 ? 'İptal' : 'Geri'}
                </button>

                {step < 4 && (
                    <button className={styles.btnPrimary} onClick={handleNext} disabled={!isStepValid()}>
                        İleri <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
