"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Globe, Package, Heart } from 'lucide-react';
import styles from './social.module.css';

export default function SocialFeedPage() {
    const router = useRouter();
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const token = localStorage.getItem('token');

                const response = await fetch(`${apiUrl}/campaign-results/social/feed`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFeed(data);
                }
            } catch (error) {
                console.error('Feed yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    const handleToggleLike = async (e: any, resultId: string, index: number) => {
        e.stopPropagation();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/campaign-results/${resultId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFeed((prev) => {
                    const newFeed = [...prev];
                    newFeed[index] = { ...newFeed[index], is_liked_by_me: data.is_liked, likes_count: data.likes_count };
                    return newFeed;
                });
            }
        } catch (error) {
            console.error("Beğeni işlemi başarısız", error);
        }
    };


    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Globe className={styles.loadingIcon} size={40} />
                <p>Sosyal Akış Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={styles.pageTitle}><span className={styles.textGradient}>Sosyal</span> Vitrin</h1>
                    <p className={styles.pageSubtitle}>Topluluğumuz tarafından üretilen harika tasarımları keşfedin.</p>
                </div>
            </div>

            {feed.length === 0 ? (
                <div className={styles.emptyState}>
                    <Globe size={48} style={{ opacity: 0.5, margin: '0 auto' }} />
                    <h2>Henüz Paylaşım Yok</h2>
                    <p>Sosyal vitrinde henüz paylaşılan bir görsel yok. İlk paylaşan sen ol!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {feed.map((item, index) => (
                        <div
                            key={item.id}
                            className={styles.card}
                            onClick={() => router.push(`/dashboard/social/${item.id}`)}
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={item.image_url}
                                    alt="Shared Campaign"
                                    fill
                                    className={styles.image}
                                />

                                <div className={styles.badgeContainer}>
                                    <span className={styles.glassBadge}>{item.campaign_type || 'Format Belirtilmemiş'}</span>
                                </div>

                                <div className={styles.overlay}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>
                                            {item.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={styles.userDetails}>
                                            <span className={styles.userName}>{item.user_name}</span>
                                            <span className={styles.productName}>
                                                <Package size={12} /> {item.product_name}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        className={`${styles.likeButton} ${item.is_liked_by_me ? styles.liked : ''}`}
                                        onClick={(e) => handleToggleLike(e, item.id, index)}
                                    >
                                        <Heart size={20} fill={item.is_liked_by_me ? "currentColor" : "none"} />
                                        <span className={styles.likeCount}>{item.likes_count || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
