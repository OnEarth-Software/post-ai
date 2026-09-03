"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, Calendar, Download, Trash2, X } from 'lucide-react';
import styles from './assets.module.css';

interface Asset {
    id: string;
    image_url: string;
    created_at: string;
}

export default function AssetsPage() {
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/assets/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAssets(data);
            } else {
                setError('Failed to fetch assets');
            }
        } catch (err) {
            setError('A network error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (e: React.MouseEvent, imageUrl: string) => {
        e.stopPropagation();
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `AdDesignAI_Asset_${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download image.');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, assetId: string) => {
        e.stopPropagation();
        setAssetToDelete(assetId);
    };

    const confirmDelete = async () => {
        if (!assetToDelete) return;
        setIsDeleting(true);
        
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/assets/${assetToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                setAssets(assets.filter(a => a.id !== assetToDelete));
                setAssetToDelete(null);
            } else {
                alert("An error occurred while deleting the asset.");
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={styles.pageTitle}>Your <span className={styles.textGradient}>Assets</span></h1>
                    <p className={styles.pageSubtitle}>View all your generated campaign visuals here. They are kept safe even if you delete your products.</p>
                </div>
            </div>

            {loading ? (
                <div className={styles.assetsGrid}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className={styles.skeletonCard}>
                            <div className={`${styles.skeletonImage} ${styles.shimmer}`}></div>
                            <div className={styles.skeletonContent}>
                                <div className={`${styles.skeletonDate} ${styles.shimmer}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className={styles.emptyState}>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button onClick={fetchAssets} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Try Again</button>
                </div>
            ) : assets.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <ImageIcon size={36} />
                    </div>
                    <div>
                        <h2 className={styles.emptyTitle}>No assets yet</h2>
                        <p className={styles.emptyDesc}>Generated campaign images will appear here securely.</p>
                    </div>
                </div>
            ) : (
                <div className={styles.assetsGrid}>
                    {assets.map((asset) => (
                        <div key={asset.id} className={styles.assetCard}>
                            <div 
                                className={styles.imageContainer}
                                onClick={() => setSelectedImage(asset.image_url)}
                            >
                                <img 
                                    src={asset.image_url} 
                                    alt="Generated Campaign Asset" 
                                    className={styles.assetImage} 
                                    onError={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                                />
                                <div className={styles.overlay}></div>
                                
                                <div className={styles.actionButtons}>
                                    <button 
                                        className={`${styles.actionBtn} ${styles.downloadBtn}`}
                                        onClick={(e) => handleDownload(e, asset.image_url)}
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={(e) => handleDeleteClick(e, asset.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.assetDate}>
                                    <Calendar size={14} />
                                    {formatDate(asset.created_at)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className={styles.imageModalOverlay} onClick={() => setSelectedImage(null)}>
                    <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeModalBtn} onClick={() => setSelectedImage(null)}>
                            <X size={32} />
                        </button>
                        <img src={selectedImage} alt="Preview" className={styles.imageModalImage} />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {assetToDelete && (
                <div className={styles.modalOverlay} onClick={() => !isDeleting && setAssetToDelete(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIconWrapper}>
                                <Trash2 size={24} className={styles.modalIcon} />
                            </div>
                            <h3>Delete Asset</h3>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this asset?</p>
                            <p className={styles.modalWarning}>This action cannot be undone. The visual will be permanently deleted from the system and storage.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.cancelButton} 
                                onClick={() => setAssetToDelete(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.confirmDeleteButton} 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Asset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
