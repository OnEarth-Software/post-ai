"use client";

import { useState, useEffect } from 'react';
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
    const [productData, setProductData] = useState<any>(null);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageGenStatus, setImageGenStatus] = useState<string>('Yapay Zeka Tasarımı Hazırlıyor...');

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const token = localStorage.getItem('token');
                const response = await fetch(`${apiUrl}/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProductData(data);
                }
            } catch (error) {
                console.error("Ürün verisi çekilemedi", error);
            }
        };
        if (id) fetchProductData();
    }, [id]);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.push(`/dashboard/products/${id}`);
    };

    const handleGenerateCampaign = async () => {
        setIsGeneratingText(true);
        
        const statuses = [
            'Hedef kitle ve kampanya amacı analiz ediliyor...',
            'Yaratıcı metinler ve sloganlar yazılıyor...',
            'Ürün görseline uygun arka plan tasarlanıyor...',
            'Renkler ve ışık ayarlanıyor...',
            'Son dokunuşlar yapılıyor...'
        ];
        let statusIndex = 0;
        const statusInterval = setInterval(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            setImageGenStatus(statuses[statusIndex]);
        }, 3500);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');

            // 1. Ürün bilgilerini al
            const productResponse = await fetch(`${apiUrl}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!productResponse.ok) {
                throw new Error("Ürün detayları alınamadı.");
            }
            const productData = await productResponse.json();

            // 2. Metin Üret
            const payloadToBackend = {
                product_id: id,
                analysis_result: productData.analysis || {},
                campaign_info: {
                    goal: goal === 'custom' ? customGoal : goal,
                    platform: platform,
                    type: type,
                    user_prompt: userPrompt
                },
                image_url: productData.image_url
            };

            const generateResponse = await fetch(`${apiUrl}/campaigns/generate-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payloadToBackend)
            });

            if (!generateResponse.ok) {
                throw new Error("Metin üretilemedi.");
            }
            const generateData = await generateResponse.json();

            // 3. Veritabanına kaydet
            const createPayload = {
                product_id: id,
                goal: goal === 'custom' ? customGoal : goal,
                platform: platform,
                type: type,
                user_prompt: userPrompt,
                slogan: generateData.slogan,
                subtext: generateData.subtext
            };

            const createResponse = await fetch(`${apiUrl}/campaigns/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(createPayload)
            });

            if (!createResponse.ok) {
                throw new Error("Kampanya kaydedilemedi.");
            }
            const createdCampaign = await createResponse.json();
            const newCampaignId = createdCampaign.id;

            // 4. Görsel Üret
            const imgResponse = await fetch(`${apiUrl}/campaign-results/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ campaign_id: newCampaignId })
            });

            if (!imgResponse.ok) {
                throw new Error("Görsel oluşturulamadı.");
            }

            // 5. AI Studio'ya yönlendir
            router.push(`/dashboard/ai_studio/${newCampaignId}`);

        } catch (error: any) {
            console.error("Hata:", error);
            alert("İşlem sırasında bir hata oluştu: " + error.message);
            setIsGeneratingText(false);
        } finally {
            clearInterval(statusInterval);
        }
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
                    {isGeneratingText ? (
                        <div className={styles.generationTemplateContainer}>
                            <h2 className={styles.cardTitle} style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                <Sparkles size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#059669' }} />
                                Kampanya Oluşturuluyor
                            </h2>
                            <p className={styles.cardSubtitle} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                {imageGenStatus}
                            </p>
                            
                            <div 
                                className={styles.skeletonTemplate} 
                                style={{ aspectRatio: type === 'story' ? '9/16' : '1/1' }}
                            >
                                <div className={styles.magicLoaderWrapper}>
                                    <div className={styles.magicLoaderGlow}></div>
                                    <Sparkles size={48} className={styles.magicLoaderIcon} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className={styles.cardTitle}>Kampanya Özeti ve Üretim</h2>
                            <p className={styles.cardSubtitle}>
                                Seçimlerinizi son kez inceleyin ve yapay zeka ile harika bir pazarlama metni oluşturun.
                            </p>

                            <div className={styles.step4Grid}>
                                {/* Sol Taraf: Ürün Detayları */}
                                <div className={styles.productSummaryCol}>
                                    {productData?.image_url ? (
                                        <img src={productData.image_url} alt="Ürün" className={styles.productSummaryImage} />
                                    ) : (
                                        <div className={styles.productSummaryImagePlaceholder}>Resim Yükleniyor...</div>
                                    )}
                                    
                                    <div className={styles.productAnalysisTags}>
                                        {productData?.analysis?.category && <span className={styles.analysisTag}>{productData.analysis.category}</span>}
                                        {productData?.analysis?.style && <span className={styles.analysisTag}>{productData.analysis.style}</span>}
                                        {productData?.analysis?.audience && <span className={styles.analysisTag}>{productData.analysis.audience}</span>}
                                        {productData?.analysis?.marketing_style && <span className={styles.analysisTag}>{productData.analysis.marketing_style}</span>}
                                    </div>
                                </div>

                                {/* Sağ Taraf: Kampanya Özeti */}
                                <div className={styles.campaignSummaryCol}>
                                    <div className={styles.summaryBox} style={{ marginBottom: 0, height: '100%', justifyContent: 'center' }}>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Hedef:</span>
                                            <span className={styles.summaryValue}>{goal === 'custom' ? customGoal : goal}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Platform:</span>
                                            <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>{platform}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Format:</span>
                                            <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>{type}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Talimatınız:</span>
                                            <span className={styles.summaryValue}>{userPrompt || "Yaratıcılık yapay zekaya bırakıldı"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                                <button className={styles.btnPrimary} onClick={handleGenerateCampaign} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                                    <Sparkles size={20} /> Oluştur
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {!isGeneratingText && (
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
            )}
        </div>
    );
}
