"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Megaphone, Calendar, ArrowRight, Loader2, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import styles from './campaigns.module.css';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCampaigns = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/campaigns/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setCampaigns(data);
                }
            } catch (error) {
                console.error('Kampanyalar çekilemedi:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.loadingIcon} size={40} />
                <p>Kampanyalar yükleniyor...</p>
            </div>
        );
    }

    const filteredCampaigns = campaigns.filter(c => 
        (c.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.goal || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.platform || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={styles.pageTitle}>Sizin <span className={styles.textGradient}>Kampanyalarınız</span></h1>
                    <p className={styles.pageSubtitle}>Oluşturduğunuz tüm yapay zeka destekli reklam kampanyaları.</p>
                </div>
                
                <div className={styles.headerControls}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <input 
                            type="text" 
                            className={styles.searchInput}
                            placeholder="Kampanyalarda ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <Sparkles size={40} />
                    </div>
                    <h2>Henüz hiç kampanya oluşturmadınız</h2>
                    <p>Ürünler sayfasından bir ürün seçerek hemen ilk kampanyanızı oluşturabilirsiniz.</p>
                    <button onClick={() => router.push('/dashboard/products')} className={styles.primaryButton}>
                        Ürünlere Git
                    </button>
                </div>
            ) : (
                <div className={styles.campaignGrid}>
                    {filteredCampaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className={styles.campaignCard}
                            onClick={() => router.push(`/dashboard/ai_studio/${campaign.id}`)}
                        >
                            <div className={styles.cardImageContainer}>
                                {campaign.results && campaign.results.length > 0 ? (
                                    <Image
                                        src={campaign.results[0].image_url}
                                        alt="Campaign Result"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <ImageIcon size={40} />
                                        <span>Görsel Yok</span>
                                    </div>
                                )}
                                <div className={styles.cardOverlay}>
                                    <span className={styles.viewText}>AI Studio'da Görüntüle <ArrowRight size={16} /></span>
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.cardBadges}>
                                    <span className={styles.badge}>{campaign.platform}</span>
                                    <span className={styles.badgeOutline}>{campaign.type}</span>
                                </div>
                                <h3 className={styles.cardTitle}>{campaign.product?.name || 'İsimsiz Ürün'}</h3>
                                <p className={styles.cardGoal}>{campaign.goal}</p>

                                <div className={styles.cardFooter}>
                                    <div className={styles.dateInfo}>
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(campaign.created_at).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}