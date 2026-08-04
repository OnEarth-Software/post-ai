"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageOpen, Plus, Tag, Palette, Users, Sparkles } from 'lucide-react';
import styles from './products.module.css';

interface ProductAnalysis {
    category: string;
    style: string;
    colors: string[];
    audience: string;
    marketing_style: string;
}

interface Product {
    id: string;
    name: string;
    image_url: string;
    created_at: string;
    analysis?: ProductAnalysis;
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/products/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                setError('Failed to fetch products');
            }
        } catch (err) {
            setError('A network error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper to map color names to hex for the dot
    const getColorHex = (colorName: string) => {
        const colors: Record<string, string> = {
            'black': '#000000', 'white': '#ffffff', 'red': '#ef4444', 
            'blue': '#3b82f6', 'green': '#10b981', 'yellow': '#eab308',
            'purple': '#a855f7', 'pink': '#ec4899', 'gray': '#64748b',
            'brown': '#92400e', 'orange': '#f97316'
        };
        const normalized = colorName.toLowerCase().trim();
        return colors[normalized] || '#cbd5e1';
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Your Products</h1>
                    <p className={styles.pageSubtitle}>Manage and view your uploaded products and their AI analysis.</p>
                </div>
                <button 
                    className={styles.uploadBtn}
                    onClick={() => router.push('/dashboard/products/upload')}
                >
                    <Plus size={18} />
                    Upload New
                </button>
            </div>

            {loading ? (
                <div className={styles.productsGrid}>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={styles.skeletonCard}>
                            <div className={`${styles.skeletonImage} ${styles.shimmer}`}></div>
                            <div className={styles.skeletonContent}>
                                <div className={`${styles.skeletonTitle} ${styles.shimmer}`}></div>
                                <div className={`${styles.skeletonDate} ${styles.shimmer}`}></div>
                                <div className={styles.tagsContainer}>
                                    <div className={`${styles.skeletonBadge} ${styles.shimmer}`}></div>
                                    <div className={`${styles.skeletonBadge} ${styles.shimmer}`}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className={styles.emptyState}>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button className={styles.uploadBtn} onClick={fetchProducts}>Try Again</button>
                </div>
            ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <PackageOpen size={36} />
                    </div>
                    <div>
                        <h2 className={styles.emptyTitle}>No products yet</h2>
                        <p className={styles.emptyDesc}>Get started by uploading your first product for AI analysis.</p>
                    </div>
                    <button 
                        className={styles.uploadBtn}
                        onClick={() => router.push('/dashboard/products/upload')}
                    >
                        <Plus size={18} />
                        Upload Product
                    </button>
                </div>
            ) : (
                <div className={styles.productsGrid}>
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            className={styles.productCard}
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.imageContainer}>
                                <img src={product.image_url} alt={product.name} className={styles.productImage} />
                                <div className={styles.overlay}></div>
                            </div>
                            
                            <div className={styles.cardContent}>
                                <div className={styles.productHeader}>
                                    <div>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <span className={styles.productDate}>Added {formatDate(product.created_at)}</span>
                                    </div>
                                </div>

                                {product.analysis && (
                                    <div className={styles.analysisSection}>
                                        <div className={styles.sectionTitle}>
                                            <Sparkles size={12} style={{display: 'inline', marginRight: '4px', verticalAlign: '-1px'}} />
                                            AI Analysis
                                        </div>
                                        <div className={styles.tagsContainer}>
                                            <span className={`${styles.badge} ${styles.badgeCategory}`} title="Category">
                                                <Tag size={12} style={{marginRight: '4px'}} />
                                                {product.analysis.category}
                                            </span>
                                            <span className={`${styles.badge} ${styles.badgeStyle}`} title="Style">
                                                <Palette size={12} style={{marginRight: '4px'}} />
                                                {product.analysis.style}
                                            </span>
                                            <span className={`${styles.badge} ${styles.badgeAudience}`} title="Target Audience">
                                                <Users size={12} style={{marginRight: '4px'}} />
                                                {product.analysis.audience}
                                            </span>
                                            
                                            {product.analysis.colors && product.analysis.colors.map((color, idx) => (
                                                <span key={idx} className={`${styles.badge} ${styles.badgeColor}`} title="Color">
                                                    <span 
                                                        className={styles.colorDot} 
                                                        style={{ backgroundColor: getColorHex(color) }}
                                                    ></span>
                                                    {color}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
