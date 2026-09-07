"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Megaphone,
    Image as ImageIcon,
    FileText,
    Globe,
    Sparkles,
    BarChart3,
    PieChart,
    ArrowUpRight,
    Loader2,
    Package,
    ShieldCheck,
    Layers,
    Clock,
    Zap
} from 'lucide-react';
import styles from './analytics.module.css';

interface CampaignResult {
    id: string;
    image_url: string;
    is_public: boolean;
    created_at: string;
}

interface Campaign {
    id: string;
    goal: string;
    platform: string;
    type: string;
    slogan?: string;
    subtext?: string;
    post_text?: string;
    created_at: string;
    results: CampaignResult[];
    product?: {
        id: string;
        name: string;
        image_url: string;
    };
}

interface UserProfile {
    id: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    credits?: number;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [productsCount, setProductsCount] = useState<number>(0);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                // 1. Profil ve limit bilgilerini al
                const userRes = await fetch(`${apiUrl}/auth/me`, { headers });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }

                // 2. Kampanyaları al
                const campaignsRes = await fetch(`${apiUrl}/campaigns/`, { headers });
                if (campaignsRes.ok) {
                    const campaignsData = await campaignsRes.json();
                    setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
                }

                // 3. Ürünleri al
                const productsRes = await fetch(`${apiUrl}/products/`, { headers });
                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProductsCount(Array.isArray(productsData) ? productsData.length : 0);
                }
            } catch (err) {
                console.error('Analitik verileri yüklenirken hata:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 size={40} className="animate-spin" />
                <p style={{ fontWeight: 600, color: '#059669' }}>Analitik verileriniz hesaplanıyor...</p>
            </div>
        );
    }

    // --- HESAPLAMALAR ---
    const totalCampaigns = campaigns.length;
    const totalImages = campaigns.reduce((acc, c) => acc + (c.results?.length || 0), 0);
    const totalPostTexts = campaigns.filter(c => c.post_text && c.post_text.trim() !== '').length;
    const totalPublicPosts = campaigns.reduce((acc, c) => acc + (c.results?.filter(r => r.is_public)?.length || 0), 0);

    // Kredi Bakiyesi
    const credits = user?.credits || 0;
    const planName = user?.role === 'admin' ? 'Yönetici' : 'Standart Kullanıcı';

    // Platform Dağılımı
    const platformCounts: Record<string, number> = {};
    campaigns.forEach(c => {
        const plat = c.platform || 'Instagram';
        platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    });
    const platformList = Object.entries(platformCounts).map(([name, count]) => ({
        name,
        count,
        percent: totalCampaigns > 0 ? Math.round((count / totalCampaigns) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Format Dağılımı (Post vs Story)
    const postCount = campaigns.filter(c => (c.type || '').toLowerCase() === 'post').length;
    const storyCount = campaigns.filter(c => (c.type || '').toLowerCase() === 'story').length;
    const postPercent = totalCampaigns > 0 ? Math.round((postCount / totalCampaigns) * 100) : 0;
    const storyPercent = totalCampaigns > 0 ? Math.round((storyCount / totalCampaigns) * 100) : 0;

    // Hedef Dağılımı
    const goalCounts: Record<string, number> = {};
    campaigns.forEach(c => {
        const g = c.goal || 'Genel';
        goalCounts[g] = (goalCounts[g] || 0) + 1;
    });
    const goalList = Object.entries(goalCounts).map(([name, count]) => ({
        name,
        count,
        percent: totalCampaigns > 0 ? Math.round((count / totalCampaigns) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Son 6 Aylık Aktivite Grafiği
    const monthsTr = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const now = new Date();
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mIdx = d.getMonth();
        const y = d.getFullYear();

        const count = campaigns.filter(c => {
            if (!c.created_at) return false;
            const cDate = new Date(c.created_at);
            return cDate.getMonth() === mIdx && cDate.getFullYear() === y;
        }).length;

        monthlyData.push({
            month: monthsTr[mIdx],
            count
        });
    }

    const maxMonthlyCount = Math.max(...monthlyData.map(m => m.count), 1);

    // Son Üretilen Tasarımlar
    const allResults: { id: string; image_url: string; slogan?: string; platform: string; type: string }[] = [];
    campaigns.forEach(c => {
        if (c.results && c.results.length > 0) {
            c.results.forEach(r => {
                allResults.push({
                    id: r.id,
                    image_url: r.image_url,
                    slogan: c.slogan,
                    platform: c.platform,
                    type: c.type
                });
            });
        }
    });
    const recentDesigns = allResults.slice(0, 6);

    const getBarColor = (percent: number) => {
        if (percent >= 90) return '#ef4444';
        if (percent >= 75) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Pazarlama ve Üretim Analitiği</h1>
                <p className={styles.subtitle}>Oluşturduğunuz içeriklerin performansını, platform dağılımını ve kullanım limitlerinizi takip edin.</p>
            </div>

            {/* 1. ÖZET METRİK KARTLARI */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Toplam Kampanya</span>
                        <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                            <Megaphone size={22} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{totalCampaigns}</div>
                    <div className={styles.statMeta}>Yapay zeka ile oluşturulan toplam kampanya</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Üretilen Görseller</span>
                        <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                            <ImageIcon size={22} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{totalImages}</div>
                    <div className={styles.statMeta}>İndirilebilir yüksek çözünürlüklü reklam tasarımı</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Post Açıklamaları</span>
                        <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                            <FileText size={22} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{totalPostTexts}</div>
                    <div className={styles.statMeta}>Yazılan sosyal medya metni (caption & etiket)</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Sosyal Akış Paylaşımı</span>
                        <div className={`${styles.statIcon} ${styles.iconAmber}`}>
                            <Globe size={22} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{totalPublicPosts}</div>
                    <div className={styles.statMeta}>Keşfet ve toplulukta herkese açık paylaşılanlar</div>
                </div>
            </div>

            {/* 2. KREDİ BİLGİLERİ KARTI */}
            <div className={styles.limitsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <ShieldCheck size={22} color="#eab308" />
                        Hesap Bakiyesi & Krediler
                    </h2>
                    <span className={styles.planBadge} style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' }}>
                        <Sparkles size={14} /> {planName}
                    </span>
                </div>

                <div className={styles.limitsGrid} style={{ gridTemplateColumns: '1fr' }}>
                    <div className={styles.limitCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem' }}>
                        <div>
                            <span className={styles.limitName} style={{ fontSize: '1.1rem' }}>Mevcut Kredi Bakiyeniz</span>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
                                Platform içerisindeki ürün yükleme, pazar analizi ve kampanya üretimleri için kullanılır.
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fefce8', padding: '16px 32px', borderRadius: '16px', border: '1px solid #fef08a' }}>
                            <Zap size={32} color="#eab308" />
                            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#854d0e', lineHeight: 1 }}>{credits}</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#a16207', alignSelf: 'flex-end', paddingBottom: '4px' }}>Kredi</span>
                        </div>
                    </div>
                </div>
            </div>

            {totalCampaigns > 0 ? (
                /* 3. İKİ KOLONLU DETAYLI ANALİZ GRAFİKLERİ */
                <div className={styles.contentGrid}>
                    {/* Sol Kolon: Aylık Aktivite ve Platformlar */}
                    <div>
                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle} style={{ marginBottom: '0.5rem' }}>
                                <BarChart3 size={20} color="#059669" />
                                Son 6 Aylık Kampanya Üretimi
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                                Hangi ay kaç adet pazarlama kampanyası oluşturduğunuzu gösterir.
                            </p>

                            <div className={styles.chartContainer}>
                                {monthlyData.map((m, idx) => {
                                    const heightPercent = Math.max(8, Math.round((m.count / maxMonthlyCount) * 100));
                                    return (
                                        <div key={idx} className={styles.barColumn}>
                                            <span className={styles.barValue}>{m.count > 0 ? m.count : ''}</span>
                                            <div className={styles.barWrapper} title={`${m.month}: ${m.count} kampanya`}>
                                                <div 
                                                    className={styles.bar} 
                                                    style={{ height: `${heightPercent}%` }} 
                                                />
                                            </div>
                                            <span className={styles.barLabel}>{m.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* En Son Üretilen Tasarımlar */}
                        {recentDesigns.length > 0 && (
                            <div className={styles.card}>
                                <h3 className={styles.sectionTitle} style={{ marginBottom: '0.5rem' }}>
                                    <Clock size={20} color="#059669" />
                                    Son Tasarımlarınız
                                </h3>
                                <div className={styles.recentGrid}>
                                    {recentDesigns.map((item) => (
                                        <div key={item.id} className={styles.recentCard}>
                                            <Image 
                                                src={item.image_url} 
                                                alt="Campaign design" 
                                                fill 
                                                className={styles.recentImage} 
                                            />
                                            <div className={styles.recentOverlay}>
                                                <span>{item.platform}</span>
                                                <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{item.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sağ Kolon: Platform ve Format Dağılımı */}
                    <div>
                        {/* Platform Dağılımı */}
                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle}>
                                <PieChart size={20} color="#059669" />
                                Tercih Edilen Platformlar
                            </h3>
                            <div className={styles.distList}>
                                {platformList.map((p, i) => {
                                    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
                                    const color = colors[i % colors.length];
                                    return (
                                        <div key={p.name} className={styles.distItem}>
                                            <div className={styles.distHeader}>
                                                <span>{p.name}</span>
                                                <span>{p.count} kampanya (%{p.percent})</span>
                                            </div>
                                            <div className={styles.distBarTrack}>
                                                <div 
                                                    className={styles.distBarFill} 
                                                    style={{ width: `${p.percent}%`, backgroundColor: color }} 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Format Dağılımı (Post vs Story) */}
                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle}>
                                <Layers size={20} color="#059669" />
                                İçerik Formatı (Post / Story)
                            </h3>
                            <div className={styles.distList}>
                                <div className={styles.distItem}>
                                    <div className={styles.distHeader}>
                                        <span>Post (Kare/Dikey)</span>
                                        <span>{postCount} adet (%{postPercent})</span>
                                    </div>
                                    <div className={styles.distBarTrack}>
                                        <div 
                                            className={styles.distBarFill} 
                                            style={{ width: `${postPercent}%`, backgroundColor: '#059669' }} 
                                        />
                                    </div>
                                </div>

                                <div className={styles.distItem}>
                                    <div className={styles.distHeader}>
                                        <span>Story (Tam Ekran 9:16)</span>
                                        <span>{storyCount} adet (%{storyPercent})</span>
                                    </div>
                                    <div className={styles.distBarTrack}>
                                        <div 
                                            className={styles.distBarFill} 
                                            style={{ width: `${storyPercent}%`, backgroundColor: '#3b82f6' }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pazarlama Hedefleri */}
                        {goalList.length > 0 && (
                            <div className={styles.card}>
                                <h3 className={styles.sectionTitle}>
                                    <Sparkles size={20} color="#059669" />
                                    Kampanya Hedefleriniz
                                </h3>
                                <div className={styles.distList}>
                                    {goalList.slice(0, 4).map((g, i) => (
                                        <div key={g.name} className={styles.distItem}>
                                            <div className={styles.distHeader}>
                                                <span>{g.name}</span>
                                                <span>{g.count} (%{g.percent})</span>
                                            </div>
                                            <div className={styles.distBarTrack}>
                                                <div 
                                                    className={styles.distBarFill} 
                                                    style={{ width: `${g.percent}%`, backgroundColor: '#6366f1' }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Henüz kampanya oluşturulmamışsa Boş Durum */
                <div className={styles.emptyState}>
                    <Package size={52} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                        Henüz Bir Kampanya Oluşturmadınız
                    </h3>
                    <p style={{ maxWidth: '460px', margin: '0 auto', fontSize: '0.92rem', lineHeight: 1.6 }}>
                        Ürünlerinizi yükleyip yapay zeka ile ilk pazarlama kampanyanızı oluşturduğunuzda, 
                        tüm grafikleriniz ve platform analizleriniz burada dinamik olarak belirecek.
                    </p>
                    <Link href="/dashboard/products" className={styles.primaryButton}>
                        <Sparkles size={18} /> İlk Kampanyanı Oluştur
                    </Link>
                </div>
            )}
        </div>
    );
}
