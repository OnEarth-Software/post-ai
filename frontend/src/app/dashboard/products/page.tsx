"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageOpen, Plus, Tag, Palette, Users, Sparkles, Search, Trash2 } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState("");
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteProduct = (e: React.MouseEvent, productId: string) => {
        e.stopPropagation();
        setProductToDelete(productId);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/products/${productToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                setProducts(products.filter(p => p.id !== productToDelete));
                setProductToDelete(null);
            } else {
                alert("An error occurred while deleting the product.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("A network error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getColorHex = (colorName: string) => {
        if (!colorName) return '#cbd5e1';
        if (colorName.startsWith('#')) return colorName;
        
        const colors: Record<string, string> = {
            'black': '#000000', 'white': '#ffffff', 'red': '#ef4444', 
            'blue': '#3b82f6', 'green': '#10b981', 'yellow': '#eab308',
            'purple': '#a855f7', 'pink': '#ec4899', 'gray': '#64748b',
            'brown': '#92400e', 'orange': '#f97316'
        };
        const normalized = colorName.toLowerCase().trim();
        return colors[normalized] || '#cbd5e1';
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.analysis?.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={styles.pageTitle}>Your <span className={styles.textGradient}>Products</span></h1>
                    <p className={styles.pageSubtitle}>Manage and view your uploaded products and their AI analysis.</p>
                </div>
                
                <div className={styles.headerControls}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <input 
                            type="text" 
                            className={styles.searchInput}
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className={styles.uploadBtn}
                        onClick={() => router.push('/dashboard/products/upload')}
                    >
                        <Plus size={18} />
                        Upload New
                    </button>
                </div>
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
            ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <Search size={36} />
                    </div>
                    <div>
                        <h2 className={styles.emptyTitle}>No matches found</h2>
                        <p className={styles.emptyDesc}>We couldn't find any products matching "{searchTerm}".</p>
                    </div>
                </div>
            ) : (
                <div className={styles.productsGrid}>
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className={styles.productCard}
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.imageContainer}>
                                <img src={product.image_url} alt={product.name} className={styles.productImage} />
                                <div className={styles.overlay}>
                                    <button 
                                        className={styles.deleteButton} 
                                        onClick={(e) => handleDeleteProduct(e, product.id)}
                                        title="Ürünü Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
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
                                            {(() => {
                                                const allTags = [];
                                                
                                                if (product.analysis.category) {
                                                    allTags.push(
                                                        <span key="cat" className={`${styles.badge} ${styles.badgeCategory}`} title="Category">
                                                            <Tag size={12} style={{marginRight: '4px'}} />
                                                            {product.analysis.category}
                                                        </span>
                                                    );
                                                }
                                                
                                                if (product.analysis.style) {
                                                    allTags.push(
                                                        <span key="style" className={`${styles.badge} ${styles.badgeStyle}`} title="Style">
                                                            <Palette size={12} style={{marginRight: '4px'}} />
                                                            {product.analysis.style}
                                                        </span>
                                                    );
                                                }
                                                
                                                if (product.analysis.audience) {
                                                    allTags.push(
                                                        <span key="aud" className={`${styles.badge} ${styles.badgeAudience}`} title="Target Audience">
                                                            <Users size={12} style={{marginRight: '4px'}} />
                                                            {product.analysis.audience}
                                                        </span>
                                                    );
                                                }
                                                
                                                if (product.analysis.colors) {
                                                    product.analysis.colors.forEach((color, idx) => {
                                                        allTags.push(
                                                            <span key={`col-${idx}`} className={`${styles.badge} ${styles.badgeColor}`} title="Color">
                                                                <span 
                                                                    className={styles.colorDot} 
                                                                    style={{ backgroundColor: getColorHex(color) }}
                                                                ></span>
                                                                {color}
                                                            </span>
                                                        );
                                                    });
                                                }
                                                
                                                const MAX_TAGS = 4;
                                                const displayTags = allTags.slice(0, MAX_TAGS);
                                                const remainingCount = allTags.length - MAX_TAGS;
                                                
                                                return (
                                                    <>
                                                        {displayTags}
                                                        {remainingCount > 0 && (
                                                            <span className={`${styles.badge}`} style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                                                +{remainingCount}
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className={styles.modalOverlay} onClick={() => !isDeleting && setProductToDelete(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIconWrapper}>
                                <Trash2 size={24} className={styles.modalIcon} />
                            </div>
                            <h3>Delete Product</h3>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this product?</p>
                            <p className={styles.modalWarning}>This action cannot be undone. All associated AI analysis and generated campaign visuals will also be permanently deleted.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.cancelButton} 
                                onClick={() => setProductToDelete(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.confirmDeleteButton} 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
