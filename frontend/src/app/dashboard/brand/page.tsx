"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Trash2, X, Building2, UploadCloud } from 'lucide-react';
import styles from './brand.module.css';

interface Brand {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    created_at: string;
}

export default function BrandPage() {
    const router = useRouter();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/brands/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBrands(data);
            } else {
                setError('Failed to fetch brands');
            }
        } catch (err) {
            setError('A network error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('name', name);
            if (description) formData.append('description', description);
            if (logoFile) formData.append('file', logoFile);

            const response = await fetch(`${apiUrl}/brands/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const newBrand = await response.json();
                setBrands([newBrand, ...brands]);
                setIsCreateModalOpen(false);
                // Reset form
                setName('');
                setDescription('');
                setLogoFile(null);
            } else {
                alert("Failed to create brand.");
            }
        } catch (err) {
            console.error("Create error:", err);
            alert("A network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBrand = async (brandId: string) => {
        if (!confirm("Are you sure you want to delete this brand? Products associated with it will lose their brand tag.")) return;
        
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${apiUrl}/brands/${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setBrands(brands.filter(b => b.id !== brandId));
            } else {
                alert("Failed to delete brand.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("A network error occurred.");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={styles.pageTitle}>Your <span className={styles.textGradient}>Brands</span></h1>
                    <p className={styles.pageSubtitle}>Manage your brands and associate them with your products.</p>
                </div>
                
                <div className={styles.headerControls}>
                    <button 
                        className={styles.createBtn}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={18} />
                        Create Brand
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.brandsGrid}>
                    {[1, 2, 3].map((n) => (
                        <div key={n} className={styles.skeletonCard}>
                            <div className={`${styles.skeletonIcon} ${styles.shimmer}`}></div>
                            <div className={`${styles.skeletonTitle} ${styles.shimmer}`}></div>
                            <div className={`${styles.skeletonDesc} ${styles.shimmer}`}></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className={styles.emptyState}>
                    <p style={{ color: 'red' }}>{error}</p>
                    <button className={styles.createBtn} onClick={fetchBrands}>Try Again</button>
                </div>
            ) : brands.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <Sparkles size={36} />
                    </div>
                    <div>
                        <h2 className={styles.emptyTitle}>No brands yet</h2>
                        <p className={styles.emptyDesc}>Create your first brand to organize your products and campaigns better.</p>
                    </div>
                    <button 
                        className={styles.createBtn}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={18} />
                        Create Brand
                    </button>
                </div>
            ) : (
                <div className={styles.brandsGrid}>
                    {brands.map((brand) => (
                        <div key={brand.id} className={styles.brandCard}>
                            <div className={styles.brandHeader}>
                                {brand.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} className={styles.brandLogoImage} />
                                ) : (
                                    <div className={styles.brandIconWrapper}>
                                        <Building2 size={24} />
                                    </div>
                                )}
                                <button 
                                    className={styles.deleteButton} 
                                    onClick={() => handleDeleteBrand(brand.id)}
                                    title="Delete Brand"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <h3 className={styles.brandName}>{brand.name}</h3>
                            <p className={styles.brandDesc}>{brand.description || "No description provided."}</p>
                            
                            <div className={styles.brandDate}>
                                Created on {formatDate(brand.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Brand Modal */}
            {isCreateModalOpen && (
                <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsCreateModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New Brand</h3>
                            <button 
                                className={styles.closeBtn} 
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <form onSubmit={handleCreateBrand}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Brand Name *</label>
                                    <input 
                                        type="text" 
                                        className={styles.formInput} 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Acme Corp"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Description</label>
                                    <textarea 
                                        className={styles.formTextarea} 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="A short description of your brand..."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Brand Logo (Optional)</label>
                                    <div className={styles.fileUploadContainer}>
                                        <input 
                                            type="file" 
                                            id="brandLogoUpload"
                                            accept="image/*"
                                            className={styles.hiddenInput}
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setLogoFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        <label htmlFor="brandLogoUpload" className={`${styles.fileUploadLabel} ${logoFile ? styles.hasFile : ''}`}>
                                            <div className={styles.uploadIconContainer}>
                                                <UploadCloud size={24} />
                                            </div>
                                            <div className={styles.uploadTextContainer}>
                                                <span className={styles.uploadMainText}>
                                                    {logoFile ? logoFile.name : "Click to upload brand logo"}
                                                </span>
                                                <span className={styles.uploadSubText}>
                                                    {logoFile ? "Click to change" : "SVG, PNG, JPG or GIF (max. 5MB)"}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className={styles.submitBtn}
                                    disabled={!name || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className={styles.spinner}></div>
                                            Creating Brand...
                                        </>
                                    ) : (
                                        'Create Brand'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
