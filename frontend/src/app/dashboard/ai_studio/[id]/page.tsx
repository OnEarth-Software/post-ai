"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Download, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Zap, Type, Crosshair, Layers, FileText, Copy, Check } from 'lucide-react';
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
    const [generatingText, setGeneratingText] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const handleToggleSocial = async (resultId: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/campaign-results/${resultId}/social`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_public: !currentStatus })
            });

            if (response.ok) {
                setCampaign((prev: any) => ({
                    ...prev,
                    results: prev.results.map((r: any) => 
                        r.id === resultId ? { ...r, is_public: !currentStatus } : r
                    )
                }));
            }
        } catch (error) {
            console.error('Paylaşım durumu değiştirilemedi:', error);
        }
    };

    const handleGeneratePostText = async () => {
        setGeneratingText(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/campaigns/${id}/generate-post-text`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCampaign((prev: any) => ({
                    ...prev,
                    post_text: data.post_text
                }));
            } else {
                const errData = await response.json().catch(() => ({}));
                alert(errData.detail || 'Pazarlama yazısı üretilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Sunucuyla bağlantı kurulamadı.');
        } finally {
            setGeneratingText(false);
        }
    };

    const handleCopyText = () => {
        if (campaign?.post_text) {
            navigator.clipboard.writeText(campaign.post_text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                            {hasResult && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#888' }}>Sosyalde Paylaş</span>
                                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={campaign.results[0].is_public || false}
                                            onChange={() => handleToggleSocial(campaign.results[0].id, campaign.results[0].is_public)}
                                            style={{ opacity: 0, width: 0, height: 0 }}
                                        />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: campaign.results[0].is_public ? '#4ade80' : '#333',
                                            transition: '.4s', borderRadius: '34px'
                                        }}>
                                            <span style={{
                                                position: 'absolute', content: '""', height: '16px', width: '16px', left: '2px', bottom: '2px',
                                                backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                                                transform: campaign.results[0].is_public ? 'translateX(20px)' : 'translateX(0)'
                                            }} />
                                        </span>
                                    </label>
                                </div>
                            )}
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
                        <div className={styles.cardHeaderRow}>
                            <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                                <FileText size={18} /> Pazarlama Post Açıklaması
                            </h3>
                            {campaign.post_text && (
                                <button 
                                    onClick={handleCopyText} 
                                    className={styles.copyButton}
                                    title="Metni Kopyala"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Kopyalandı!' : 'Kopyala'}
                                </button>
                            )}
                        </div>

                        {campaign.post_text ? (
                            <>
                                <div className={styles.postTextBox}>
                                    {campaign.post_text}
                                </div>
                                <button 
                                    onClick={handleGeneratePostText} 
                                    disabled={generatingText}
                                    className={styles.regenerateButton}
                                >
                                    {generatingText ? (
                                        <Loader2 size={16} className={styles.spinningIcon} />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    {generatingText ? 'Yeniden Üretiliyor...' : 'Metni Yeniden Üret'}
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                                    Sosyal medyada paylaşmak için yapay zeka ile profesyonel bir gönderi açıklaması (hook, gövde, CTA ve etiketler) oluşturun.
                                </p>
                                <button 
                                    onClick={handleGeneratePostText} 
                                    disabled={generatingText}
                                    className={styles.primaryButton}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {generatingText ? (
                                        <Loader2 size={18} className={styles.spinningIcon} />
                                    ) : (
                                        <Sparkles size={18} />
                                    )}
                                    {generatingText ? 'Yazı Oluşturuluyor...' : 'Pazarlama Yazısı Oluştur'}
                                </button>
                            </div>
                        )}
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
