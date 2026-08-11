"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Sparkles, X, Package, CheckCircle2 } from 'lucide-react';
import styles from './detail.module.css';

export default function SocialDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [userProducts, setUserProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

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

    useEffect(() => {
        if (isModalOpen && userProducts.length === 0) {
            const fetchProducts = async () => {
                setLoadingProducts(true);
                try {
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    const response = await fetch(`${apiUrl}/products/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserProducts(data);
                    }
                } catch (error) {
                    console.error('Ürünler yüklenirken hata:', error);
                } finally {
                    setLoadingProducts(false);
                }
            };
            fetchProducts();
        }
    }, [isModalOpen, userProducts.length]);

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

    const handleUseTemplate = () => {
        setIsModalOpen(true);
    };

    const handleConfirmTemplate = () => {
        if (!selectedProduct) return;
        // The user requested NO BACKEND connection here, so we just log and close
        console.log("Şablon seçilen ürünle kullanılacak:", selectedProduct);
        setIsModalOpen(false);
        alert("Şablon başarıyla seçilen ürüne uygulandı! (Demo Modu)");
    };

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

                    <div className={styles.actionSection}>
                        <h3 className={styles.actionTitle}>Bu tasarımı beğendin mi?</h3>
                        <p className={styles.actionDesc}>
                            Bu görselin arka plan tarzını, renk paletini ve kompozisyonunu kendi ürünlerine tek tıkla uygulayabilirsin.
                        </p>
                        <button onClick={handleUseTemplate} className={styles.primaryButton}>
                            <Sparkles size={20} /> Bu Şablonu Kullan
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Selection Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Ürün Seçin</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Bu tasarım şablonunu hangi ürününüze uygulamak istiyorsunuz?
                        </p>

                        <div className={styles.productList}>
                            {loadingProducts ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Ürünleriniz yükleniyor...</div>
                            ) : userProducts.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Henüz kayıtlı bir ürününüz yok.</div>
                            ) : (
                                userProducts.map((prod) => (
                                    <div 
                                        key={prod.id} 
                                        className={`${styles.productItem} ${selectedProduct === prod.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedProduct(prod.id)}
                                    >
                                        <div className={styles.productItemLeft}>
                                            <div className={styles.productIcon}>
                                                {prod.image_url ? (
                                                    <Image src={prod.image_url} alt={prod.name} fill style={{ objectFit: 'cover', borderRadius: '12px' }} />
                                                ) : (
                                                    <Package size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className={styles.productName}>{prod.name}</p>
                                                <p className={styles.productDesc}>{prod.description || 'Açıklama bulunmuyor'}</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 size={24} className={styles.checkIcon} />
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={styles.modalAction}>
                            <button 
                                onClick={handleConfirmTemplate} 
                                className={styles.primaryButton}
                                style={{ width: 'auto', opacity: selectedProduct ? 1 : 0.5 }}
                                disabled={!selectedProduct}
                            >
                                Seçimi Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
