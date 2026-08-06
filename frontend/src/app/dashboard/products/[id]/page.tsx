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

// Helper to map color names to hex
const getColorHex = (colorName: string) => {
    if (!colorName) return '#94a3b8';
    if (colorName.startsWith('#')) return colorName;
    const colors: Record<string, string> = {
        'black': '#0f172a', 'white': '#f8fafc', 'red': '#ef4444', 
        'blue': '#3b82f6', 'green': '#10b981', 'yellow': '#eab308',
        'purple': '#a855f7', 'pink': '#ec4899', 'gray': '#64748b',
        'brown': '#78350f', 'orange': '#f97316', 'deep olive': '#4b5320', 'olive': '#4b5320',
        'multicolor': '#cbd5e1'
    };
    const normalized = colorName.toLowerCase().trim();
    return colors[normalized] || '#94a3b8';
};

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<ProductAnalysis | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [newColor, setNewColor] = useState('#000000');

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

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
                if (data.analysis && data.analysis.colors) {
                    data.analysis.colors = data.analysis.colors.map((c: string) => getColorHex(c));
                }
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

    const handleSaveAnalysis = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/products/${id}/analysis`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setProduct(data);
                setIsModalOpen(false);
                showNotification("Analysis updated successfully!", "success");
            } else {
                showNotification("Failed to update analysis.", "error");
            }
        } catch (err) {
            console.error(err);
            showNotification("A network error occurred.", "error");
        } finally {
            setIsSaving(false);
        }
    };

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
                    <button className={styles.btnPrimary} onClick={() => router.push(`/dashboard/products/${id}/generate-campaign`)}>
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
                    <div 
                        className={styles.audienceCard}
                        style={(() => {
                            const colors = product.analysis?.colors;
                            if (!colors || colors.length === 0) return {};
                            
                            const getBrightness = (hex: string) => {
                                hex = hex.replace('#', '');
                                if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
                                const r = parseInt(hex.substring(0, 2), 16) || 0;
                                const g = parseInt(hex.substring(2, 4), 16) || 0;
                                const b = parseInt(hex.substring(4, 6), 16) || 0;
                                return (r * 299 + g * 587 + b * 114) / 1000;
                            };

                            if (colors.length === 1) {
                                return { background: `linear-gradient(135deg, ${getColorHex(colors[0])} 0%, #0f172a 100%)` };
                            }
                            
                            const hexColors = colors.map(c => getColorHex(c));
                            // Sort from dark to light
                            hexColors.sort((a, b) => getBrightness(a) - getBrightness(b));
                            
                            return { background: `linear-gradient(135deg, ${hexColors.join(', ')})` };
                        })()}
                    >
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
                                <label>Colors</label>
                                
                                {/* Selected Colors */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {formData.colors?.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '20px', gap: '0.35rem', border: '1px solid #e2e8f0' }}>
                                            <div style={{ backgroundColor: c, width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #cbd5e1' }}></div>
                                            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 500, color: '#334155' }}>{c.toUpperCase()}</span>
                                            <button onClick={() => {
                                                const newColors = [...(formData.colors || [])];
                                                newColors.splice(i, 1);
                                                setFormData({...formData, colors: newColors});
                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '2px' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Predefined Palette */}
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Hızlı Seçim:</div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    {[
                                        '#0f172a', '#f8fafc', '#ef4444', '#f97316', 
                                        '#eab308', '#10b981', '#3b82f6', '#8b5cf6', 
                                        '#a855f7', '#ec4899', '#64748b', '#78350f'
                                    ].map(hex => (
                                        <button 
                                            key={hex}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const currentColors = formData.colors || [];
                                                if (!currentColors.includes(hex)) {
                                                    setFormData({...formData, colors: [...currentColors, hex]});
                                                }
                                            }}
                                            style={{ 
                                                width: '28px', height: '28px', borderRadius: '50%', 
                                                backgroundColor: hex, border: hex === '#f8fafc' ? '1px solid #cbd5e1' : 'none',
                                                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            title={hex}
                                        />
                                    ))}
                                </div>
                                
                                {/* Custom Color Picker */}
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Özel Renk Ekle:</div>

                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #cbd5e1', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <input 
                                            type="color" 
                                            value={newColor} 
                                            onChange={e => setNewColor(e.target.value)} 
                                            style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', padding: '0', border: 'none', cursor: 'pointer' }}
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={newColor} 
                                        onChange={e => setNewColor(e.target.value)} 
                                        style={{ fontSize: '0.875rem', color: '#64748b', flex: 1, fontFamily: 'monospace', fontWeight: 500, background: 'transparent', border: 'none', outline: 'none', textTransform: 'uppercase' }}
                                        placeholder="#000000"
                                        maxLength={7}
                                    />
                                    <button 
                                        className={styles.btnPrimary} 
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        onClick={() => {
                                            const currentColors = formData.colors || [];
                                            if (!currentColors.includes(newColor)) {
                                                setFormData({...formData, colors: [...currentColors, newColor]});
                                            }
                                        }}
                                    >
                                        + Ekle
                                    </button>
                                </div>
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
                            <button className={styles.btnPrimary} onClick={handleSaveAnalysis} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Toast Notification */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
