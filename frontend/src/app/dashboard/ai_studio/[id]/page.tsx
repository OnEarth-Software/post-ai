"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Download, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Zap, Type, Crosshair, Layers } from 'lucide-react';
import styles from './ai_studio.module.css';

const formatCapitalize = (text: string) => {
    if (!text) return '';
    const firstChar = text.charAt(0);
    const upperFirst = firstChar === 'i' ? 'I' : firstChar.toUpperCase();
    return upperFirst + text.slice(1).toLowerCase();
};

export default function AIStudioPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaignDetail = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/campaigns/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setCampaign(data);
                } else {
                    console.error('Kampanya detayı çekilemedi');
                }
            } catch (error) {
                console.error('Hata:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCampaignDetail();
        }
    }, [id, router]);

    const handleDownload = async () => {
        if (!campaign || !campaign.results || campaign.results.length === 0) return;

        try {
            const imageUrl = campaign.results[0].image_url;
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const productName = campaign.product?.name ? campaign.product.name.replace(/\s+/g, '_').toLowerCase() : campaign.id;
            a.download = `AdDesignAI_${productName}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('İndirme hatası:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loaderGlow}>
                    <Sparkles className={styles.loadingIcon} size={48} />
                </div>
                <h2>Yapay Zeka Stüdyosu Yükleniyor...</h2>
                <p>Tasarımınız hazırlanıyor</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className={styles.container}>
                <button onClick={() => router.push('/dashboard/campaigns')} className={styles.backButton}>
                    <ArrowLeft size={16} /> Kampanyalara Dön
                </button>
                <div className={styles.errorState}>
                    <h2>Kampanya Bulunamadı</h2>
                    <p>Bu kampanya silinmiş veya erişim yetkiniz olmayabilir.</p>
                </div>
            </div>
        );
    }

    const hasResult = campaign.results && campaign.results.length > 0;

    return (
        <div className={styles.container}>
            <button onClick={() => router.push('/dashboard/campaigns')} className={styles.backButton}>
                <ArrowLeft size={16} /> Kampanyalara Dön
            </button>

            <div className={styles.studioHeader}>
                <div className={styles.titleSection}>
                    <div>
                        <h1 className={styles.titleGradient}>AI Studio</h1>
                        <p className={styles.subtitle}>{campaign.product?.name || 'Ürün'} için oluşturulan kampanya sonuçları.</p>
                    </div>
                </div>

                {hasResult && (
                    <button onClick={handleDownload} className={styles.primaryButton}>
                        <Download size={18} />
                        Görseli İndir
                    </button>
                )}
            </div>

            <div className={styles.studioGrid}>
                {/* Sol Kolon - Üretilen Görsel (Eskiden Sağdaydı) */}
                <div className={styles.resultColumn}>
                    <div className={styles.resultCard}>
                        <div className={styles.resultHeader}>
                            <div className={styles.resultBadge}>
                                <Zap size={14} /> AI Tarafından Üretildi
                            </div>
                        </div>

                        <div className={styles.resultImageWrapper}>
                            {hasResult ? (
                                <Image
                                    src={campaign.results[0].image_url}
                                    alt="AI Generated Campaign"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className={styles.resultImage}
                                />
                            ) : (
                                <div className={styles.pendingState}>
                                    <Sparkles size={48} className={styles.pulseIcon} />
                                    <p>Görsel henüz üretilmemiş veya bir hata oluşmuş.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sağ Kolon - Bilgiler ve Orijinal (Eskiden Soldaydı) */}
                <div className={styles.infoColumn}>
                    <div className={styles.glassCard}>
                        <h3 className={styles.cardTitle}><Layers size={18} /> Kampanya Detayları</h3>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Platform</span>
                                <span className={styles.detailValue}>{formatCapitalize(campaign.platform)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Format</span>
                                <span className={styles.detailValue}>{formatCapitalize(campaign.type)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Hedef</span>
                                <span className={styles.detailValue}>{formatCapitalize(campaign.goal)}</span>
                            </div>
                            {campaign.user_prompt && (
                                <div className={styles.detailItemFull}>
                                    <span className={styles.detailLabel}>Özel İstek</span>
                                    <span className={styles.detailValue}>"{campaign.user_prompt}"</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.glassCard}>
                        <h3 className={styles.cardTitle}><Type size={18} /> Yapay Zeka Metinleri</h3>
                        <div className={styles.sloganBox}>
                            <strong>Slogan:</strong><br /> "{campaign.slogan || 'Slogan bulunamadı'}"
                            {campaign.subtext && (
                                <>
                                    <br /><br />
                                    <strong>Alt Başlık:</strong><br /> "{campaign.subtext}"
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.glassCard}>
                        <h3 className={styles.cardTitle}><ImageIcon size={18} /> Orijinal Ürün Görseli</h3>
                        <div className={styles.originalImageSmallWrapper}>
                            {campaign.product?.image_url ? (
                                <Image
                                    src={campaign.product.image_url}
                                    alt="Original Product"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            ) : (
                                <div className={styles.noImage}>Görsel Yok</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
