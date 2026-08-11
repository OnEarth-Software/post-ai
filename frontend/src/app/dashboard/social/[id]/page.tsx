"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart } from 'lucide-react';
import styles from './detail.module.css';

export default function SocialDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const token = localStorage.getItem('token');
                
                // Fetch all feeds and find the specific one
                const response = await fetch(`${apiUrl}/campaign-results/social/feed`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const foundItem = data.find((i: any) => i.id === params.id);
                    setItem(foundItem);
                }
            } catch (error) {
                console.error('Detay yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [params.id]);

    const handleToggleLike = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/campaign-results/${item.id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setItem((prev: any) => ({
                    ...prev,
                    is_liked_by_me: data.is_liked,
                    likes_count: data.likes_count
                }));
            }
        } catch (error) {
            console.error("Beğeni işlemi başarısız", error);
        }
    };


    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Yükleniyor...</div>;
    }

    if (!item) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Gönderi bulunamadı.</h2>
                <button onClick={() => router.back()} className={styles.backButton} style={{ marginTop: '20px' }}>
                    <ArrowLeft size={16} /> Geri Dön
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button onClick={() => router.back()} className={styles.backButton}>
                <ArrowLeft size={18} /> Sosyal Vitrin'e Dön
            </button>

            <div className={styles.contentWrapper}>
                <div className={styles.imageSection}>
                    <Image
                        src={item.image_url}
                        alt="Shared Campaign"
                        fill
                        className={styles.image}
                    />
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.header}>
                        <div className={styles.badge}>{item.campaign_type || 'Format Belirtilmemiş'}</div>
                        <h1 className={styles.title}>{item.product_name}</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>{item.campaign_goal || 'Kampanya'}</p>
                    </div>

                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {item.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className={styles.userName}>{item.user_name}</p>
                            <span className={styles.date}>
                                {new Date(item.created_at).toLocaleDateString('tr-TR', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })} tarihinde tasarlandı
                            </span>
                        </div>
                    </div>
                    
                    <div className={styles.actionContainer}>
                        <button 
                            className={`${styles.likeButton} ${item.is_liked_by_me ? styles.liked : ''}`}
                            onClick={handleToggleLike}
                        >
                            <Heart size={24} fill={item.is_liked_by_me ? "currentColor" : "none"} />
                            <span className={styles.likeCount}>{item.likes_count || 0} Beğeni</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
