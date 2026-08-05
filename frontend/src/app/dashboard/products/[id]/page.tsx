"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Edit3, Sparkles, Box, Palette, Tags, Zap, Users, Loader2, X, Droplets } from 'lucide-react';
import Link from 'next/link';
import styles from './product-detail.module.css';

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

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<ProductAnalysis | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchProductDetail();
    }, [id]);

    const fetchProductDetail = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/products/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProduct(data);
                setFormData(data.analysis || null);
            } else {
                setError('Failed to load product details.');
            }
        } catch (err) {
            setError('A network error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to map color names to hex
    const getColorHex = (colorName: string) => {
        const colors: Record<string, string> = {
            'black': '#0f172a', 'white': '#f8fafc', 'red': '#ef4444', 
            'blue': '#3b82f6', 'green': '#10b981', 'yellow': '#eab308',
            'purple': '#a855f7', 'pink': '#ec4899', 'gray': '#64748b',
            'brown': '#78350f', 'orange': '#f97316', 'deep olive': '#4b5320', 'olive': '#4b5320'
        };
        const normalized = colorName.toLowerCase().trim();
        return colors[normalized] || '#94a3b8';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return <div style={{ color: 'red', padding: '2rem' }}>{error || 'Product not found'}</div>;
    }

    const mainColor = product.analysis?.colors?.[0] || 'Unknown';
    const mainColorHex = getColorHex(mainColor);

    return (
        <div className={styles.pageWrapper}>
            {/* Header Area */}
            <div className={styles.headerArea}>
                <div>
                    <div className={styles.breadcrumb}>
                        <Link href="/dashboard/products" className={styles.breadcrumbLink}>Products</Link>
                        <ChevronRight size={14} />
                        <span>Visual Asset Analysis</span>
                    </div>
                    <h1 className={`${styles.title} ${styles.textGradient}`}>{product.name}</h1>
                </div>
                
                <div className={styles.headerActions}>
                    <button className={styles.btnOutline} onClick={() => setIsModalOpen(true)}>
                        <Edit3 size={16} />
                        Update Analysis
                    </button>
                    <button className={styles.btnPrimary}>
                        <Sparkles size={16} />
                        Generate Campaign
                    </button>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className={styles.bentoGrid}>
                
                {/* Left Column: Huge Image */}
                <div className={styles.imageCard}>
                    <img src={product.image_url} alt={product.name} className={styles.productImage} />
                    <div className={styles.aiBadge}>
                        <div className={styles.aiBadgeDot}></div>
                        AI SCANNED
                    </div>
                </div>

                {/* Right Column: Information Cards */}
                <div className={styles.rightColumn}>
                    
                    {/* 2x2 Grid */}
                    <div className={styles.infoGrid}>
                        {/* 1. Category */}
                        <div className={styles.infoCard}>
                            <Box size={100} className={styles.bgIcon} />
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox}>
                                    <Box size={20} />
                                </div>
                                <span className={styles.matchBadge}>98.4% Match</span>
                            </div>
                            <div>
                                <div className={styles.cardLabel}>Category</div>
                                <div className={styles.cardValue}>{product.analysis?.category || 'N/A'}</div>
                            </div>
                        </div>

                        {/* 2. Color */}
                        <div className={styles.infoCard}>
                            <Droplets size={100} className={styles.bgIcon} />
                            <div className={styles.cardHeader} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.analysis?.colors?.map((c, i) => (
                                    <div 
                                        key={i}
                                        className={styles.colorSquare} 
                                        style={{ backgroundColor: getColorHex(c), width: '24px', height: '24px' }}
                                        title={c}
                                    ></div>
                                ))}
                            </div>
                            <div>
                                <div className={styles.cardLabel}>Colors</div>
                                <div className={styles.cardValue} style={{ textTransform: 'capitalize', fontSize: '1.1rem' }}>
                                    {product.analysis?.colors?.join(', ') || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* 3. Style */}
                        <div className={styles.infoCard}>
                            <Palette size={100} className={styles.bgIcon} />
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox} style={{ background: '#f8fafc', color: '#64748b' }}>
                                    <Palette size={20} />
                                </div>
                                <span className={styles.matchBadge}>Verified</span>
                            </div>
                            <div>
                                <div className={styles.cardLabel}>Style</div>
                                <div className={styles.cardValue}>{product.analysis?.style || 'N/A'}</div>
                            </div>
                        </div>

                        {/* 4. Marketing Style */}
                        <div className={styles.infoCard}>
                            <Zap size={100} className={styles.bgIcon} />
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox} style={{ background: '#fef3c7', color: '#d97706' }}>
                                    <Zap size={20} />
                                </div>
                                <span className={styles.matchBadge}>Signature</span>
                            </div>
                            <div>
                                <div className={styles.cardLabel}>Marketing Style</div>
                                <div className={styles.cardValue}>{product.analysis?.marketing_style || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience Dark Card */}
                    <div className={styles.audienceCard}>
                        <div className={styles.audienceLabel}>Target Audience</div>
                        <div className={styles.audienceValue}>
                            {product.analysis?.audience || 'General Audience'}
                        </div>
                        <div className={styles.tagsWrapper}>
                            <span className={styles.audienceTag}>Verified Target</span>
                            <span className={styles.audienceTag}>High Conversion</span>
                        </div>
                        
                        <Users size={80} className={styles.audienceIconBg} />
                    </div>
                </div>
            </div>

            {/* Bottom Row to fill space */}
            <div className={styles.bottomGrid}>
                {/* Market Propensity Chart Placeholder */}
                <div className={styles.marketCard}>
                    <div className={styles.marketHeader}>
                        <div className={styles.marketTitle}>
                            <Zap size={18} style={{ color: '#059669' }} />
                            Market Propensity Analysis
                        </div>
                        <div className={styles.marketBadges}>
                            <span className={styles.smallBadge}><span className={styles.dotHigh}></span> High Value</span>
                            <span className={styles.smallBadge}><span className={styles.dotStandard}></span> Standard</span>
                        </div>
                    </div>
                    <div className={styles.chartMock}>
                        <div className={styles.bar} style={{ height: '30%', background: '#a7f3d0' }}></div>
                        <div className={styles.bar} style={{ height: '50%', background: '#6ee7b7' }}></div>
                        <div className={styles.bar} style={{ height: '80%', background: '#34d399' }}></div>
                        <div className={styles.bar} style={{ height: '100%', background: '#059669' }}></div>
                        <div className={styles.bar} style={{ height: '60%', background: '#6ee7b7' }}></div>
                    </div>
                </div>

                {/* Aesthetic Score Placeholder */}
                <div className={styles.scoreCard}>
                    <div className={styles.scoreTitle}>Aesthetic Score</div>
                    <div className={styles.scoreDesc}>Calculated via visual neural weights</div>
                    <div className={styles.scoreValue}>
                        94
                    </div>
                    <div className={styles.scoreLabel}>EXCEPTIONAL</div>
                </div>
            </div>

            {/* Update Analysis Modal */}
            {isModalOpen && formData && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Update AI Analysis</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <input 
                                    type="text" 
                                    className={styles.inputField} 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})} 
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Colors (comma separated)</label>
                                <input 
                                    type="text" 
                                    className={styles.inputField} 
                                    value={formData.colors?.join(', ')} 
                                    onChange={e => setFormData({...formData, colors: e.target.value.split(',').map(s => s.trim())})} 
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Style</label>
                                <input 
                                    type="text" 
                                    className={styles.inputField} 
                                    value={formData.style} 
                                    onChange={e => setFormData({...formData, style: e.target.value})} 
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Marketing Style</label>
                                <input 
                                    type="text" 
                                    className={styles.inputField} 
                                    value={formData.marketing_style} 
                                    onChange={e => setFormData({...formData, marketing_style: e.target.value})} 
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Target Audience</label>
                                <input 
                                    type="text" 
                                    className={styles.inputField} 
                                    value={formData.audience} 
                                    onChange={e => setFormData({...formData, audience: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnOutline} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className={styles.btnPrimary} onClick={() => {
                                // TODO: Connect to update endpoint
                                alert("Update endpoint is not implemented yet. This will save: " + JSON.stringify(formData));
                                setIsModalOpen(false);
                            }}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
