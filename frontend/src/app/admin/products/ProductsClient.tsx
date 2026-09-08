"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Box, Zap, Calendar, MoreHorizontal, X, Trash2, Eye, Download } from 'lucide-react';
import styles from '../campaigns/campaigns.module.css'; // Reusing styles from campaigns
import { deleteProduct } from './actions';

export default function ProductsClient({
    initialProducts,
    total,
    currentPage,
    totalPages,
    currentSearch,
    currentSort,
    currentDateRange,
    token
}: any) {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Details Modal
    const [productToDelete, setProductToDelete] = useState<any>(null); // For Delete Modal
    const [isSaving, setIsSaving] = useState(false);

    // For Export
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportStart, setExportStart] = useState('');
    const [exportEnd, setExportEnd] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // For search
    const [searchValue, setSearchValue] = useState(currentSearch || '');

    // For filters
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [dateMenuOpen, setDateMenuOpen] = useState(false);

    const [sortOrder, setSortOrder] = useState(currentSort || 'desc');
    const [dateRange, setDateRange] = useState(currentDateRange || 'all');

    // For dropdown menu visibility
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleMenuClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Quick Search (Debounced)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== currentSearch) {
                const params = new URLSearchParams();
                if (searchValue) params.set('search', searchValue);
                if (sortOrder !== 'desc') params.set('sort', sortOrder);
                if (dateRange !== 'all') params.set('date_range', dateRange);
                
                params.set('page', '1'); // reset to page 1 on search
                router.push(`/admin/products?${params.toString()}`);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [searchValue, currentSearch, sortOrder, dateRange, router]);

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (sortOrder !== 'desc') params.set('sort', sortOrder);
        if (dateRange !== 'all') params.set('date_range', dateRange);

        params.set('page', '1');
        setFilterMenuOpen(false);
        setDateMenuOpen(false);
        router.push(`/admin/products?${params.toString()}`);
    };

    // Apply date range directly when selected
    const handleDateRangeSelect = (val: string) => {
        setDateRange(val);
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (sortOrder !== 'desc') params.set('sort', sortOrder);
        if (val !== 'all') params.set('date_range', val);

        params.set('page', '1');
        setDateMenuOpen(false);
        router.push(`/admin/products?${params.toString()}`);
    };

    const confirmDelete = async () => {
        if (!productToDelete?.id) return;
        setIsSaving(true);
        try {
            const res = await deleteProduct(productToDelete.id);
            if (res.error) {
                alert(res.error);
            } else {
                setProductToDelete(null);
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Error deleting product");
        } finally {
            setIsSaving(false);
        }
    };

    const changePage = (page: number) => {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (sortOrder !== 'desc') params.set('sort', sortOrder);
        if (dateRange !== 'all') params.set('date_range', dateRange);
        
        params.set('page', page.toString());
        router.push(`/admin/products?${params.toString()}`);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            let apiUrl = 'http://localhost:8000';
            if (typeof window !== 'undefined' && (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
                apiUrl = `https://${window.location.hostname}:8000`;
            }

            const params = new URLSearchParams();
            if (searchValue) params.set('search', searchValue);
            if (sortOrder) params.set('sort', sortOrder);
            if (dateRange) params.set('date_range', dateRange);
            if (exportStart) params.set('start_date', exportStart);
            if (exportEnd) params.set('end_date', exportEnd);

            const res = await fetch(`${apiUrl}/admin/products/export?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                alert("Dışa aktarım başarısız oldu. Hata kodu: " + res.status);
                setIsExporting(false);
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `products_${exportStart || 'filtered'}_to_${exportEnd || 'export'}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setExportModalOpen(false);
        } catch (error) {
            console.error("Export error:", error);
            alert("Bir hata oluştu.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Overlay for clicking outside to close menus */}
            {(openMenuId || filterMenuOpen || dateMenuOpen) && (
                <div 
                    className={styles.pageOverlay} 
                    onClick={() => {
                        setOpenMenuId(null);
                        setFilterMenuOpen(false);
                        setDateMenuOpen(false);
                    }} 
                />
            )}

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>View uploaded products and their Vision AI analysis status.</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filterBar}>
                <input 
                    type="text" 
                    placeholder="Search by product name or user..." 
                    className={styles.searchInput}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                
                <div style={{ position: 'relative' }}>
                    <button 
                        className={styles.filterBtn}
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    >
                        <Filter size={16} /> Filters
                    </button>
                    
                    {filterMenuOpen && (
                        <div className={styles.filterDropdown}>
                            <div className={styles.filterGroup}>
                                <label>Sort By</label>
                                <select 
                                    className={styles.filterSelect}
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                            <button className={styles.applyBtn} onClick={applyFilters}>
                                Apply Filters
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    <button 
                        className={styles.filterBtn}
                        onClick={() => setDateMenuOpen(!dateMenuOpen)}
                    >
                        <Calendar size={16} /> 
                        {dateRange === '7d' ? 'Last 7 Days' : 
                         dateRange === '1m' ? 'Last 1 Month' : 
                         dateRange === '6m' ? 'Last 6 Months' : 
                         dateRange === '1y' ? 'Last 1 Year' : 'All Time'}
                    </button>

                    {dateMenuOpen && (
                        <div className={styles.filterDropdown} style={{ right: 0, left: 'auto', minWidth: '150px' }}>
                            <div className={styles.dateOption} onClick={() => handleDateRangeSelect('all')}>All Time</div>
                            <div className={styles.dateOption} onClick={() => handleDateRangeSelect('7d')}>Last 7 Days</div>
                            <div className={styles.dateOption} onClick={() => handleDateRangeSelect('1m')}>Last 1 Month</div>
                            <div className={styles.dateOption} onClick={() => handleDateRangeSelect('6m')}>Last 6 Months</div>
                            <div className={styles.dateOption} onClick={() => handleDateRangeSelect('1y')}>Last 1 Year</div>
                        </div>
                    )}
                </div>
                
                <button
                    className={styles.filterBtn}
                    style={{ background: '#0f172a', color: 'white', border: 'none', marginLeft: 'auto' }}
                    onClick={() => setExportModalOpen(true)}
                >
                    <Download size={16} /> Dışa Aktar (CSV)
                </button>
            </div>

            {/* List (Table) Layout */}
            <div className={styles.tableContainer}>
                {initialProducts && initialProducts.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Analysis Status</th>
                                <th>Tokens Spent (Vision)</th>
                                <th>Uploaded By</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialProducts.map((product: any) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className={styles.campaignCell}>
                                            <img src={product.imageUrl} alt={product.name} className={styles.thumbnail} />
                                            <div className={styles.campaignInfo}>
                                                <span className={styles.campaignTitle}>{product.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.platformBadge} style={{ 
                                            color: product.analysisStatus === 'Analyzed' ? '#059669' : '#d97706',
                                            background: product.analysisStatus === 'Analyzed' ? '#d1fae5' : '#fef3c7'
                                        }}>
                                            <Box size={14} />
                                            {product.analysisStatus}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start'}}>
                                            <div className={styles.tokenBadge} title="Vision AI Tokens Spent" style={{ color: product.tokensSpent > 0 ? '#059669' : '#94a3b8', background: product.tokensSpent > 0 ? '#d1fae5' : '#f1f5f9' }}>
                                                <Zap size={14} /> {product.tokensSpent}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, paddingLeft: '0.25rem' }}>
                                                Cost: ${product.cost}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.userBlock}>
                                            {product.user?.avatar && product.user.avatar.length > 1 ? (
                                                <img src={product.user.avatar} alt={product.user.name} className={styles.avatar} />
                                            ) : (
                                                <div className={styles.avatarPlaceholder} style={{ width: '24px', height: '24px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '50%', color: '#475569', fontWeight: 600 }}>
                                                    {product.user?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <span className={styles.userName}>{product.user?.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.date}>{product.createdAt}</span>
                                    </td>
                                    <td style={{ position: 'relative' }}>
                                        <button 
                                            className={styles.actionBtn}
                                            onClick={(e) => handleMenuClick(e, product.id)}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {openMenuId === product.id && (
                                            <>
                                                <div
                                                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                                                />
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ position: 'absolute', right: '40px', top: '10%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', zIndex: 50, padding: '4px', minWidth: '160px' }}
                                                >
                                                    <button
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#334155', textAlign: 'left', borderRadius: '4px' }}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setOpenMenuId(null); }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                    >
                                                        <Eye size={16} /> View Details
                                                    </button>
                                                    <button
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444', textAlign: 'left', borderRadius: '4px' }}
                                                        onClick={(e) => { e.stopPropagation(); setProductToDelete(product); setOpenMenuId(null); }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                    >
                                                        <Trash2 size={16} /> Delete Product
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <Box size={48} className={styles.emptyIcon} />
                        <h3>No products found</h3>
                        <p>There are no products matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        className={styles.pageBtn}
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                    <button 
                        className={styles.pageBtn}
                        disabled={currentPage === totalPages}
                        onClick={() => changePage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* View Details Modal */}
            {selectedProduct && (
                <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Product Details</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedProduct(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailLabel}>Product</span>
                                    <div className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                        <span>{selectedProduct.name}</span>
                                    </div>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailLabel}>Uploaded By</span>
                                    <div className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {selectedProduct.user?.avatar && selectedProduct.user.avatar.length > 1 ? (
                                            <img src={selectedProduct.user.avatar} alt={selectedProduct.user.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                        ) : (
                                            <div className={styles.avatarPlaceholder} style={{ width: '24px', height: '24px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '50%', color: '#475569', fontWeight: 600 }}>
                                                {selectedProduct.user?.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <span>{selectedProduct.user?.name}</span>
                                    </div>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailLabel}>Status</span>
                                    <span className={styles.detailValue}>{selectedProduct.analysisStatus}</span>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailLabel}>Tokens Spent</span>
                                    <span className={styles.detailValue}>{selectedProduct.tokensSpent}</span>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailLabel}>Cost</span>
                                    <span className={styles.detailValue}>${selectedProduct.cost}</span>
                                </div>
                                <div className={styles.detailCard}>
                                    <span className={styles.detailLabel}>Date</span>
                                    <span className={styles.detailValue}>{selectedProduct.createdAt}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {productToDelete && (
                <div className={styles.modalOverlay} onClick={() => !isSaving && setProductToDelete(null)}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trash2 size={20} /> Delete Product
                            </h2>
                            <button className={styles.closeBtn} onClick={() => !isSaving && setProductToDelete(null)} disabled={isSaving}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                                Are you sure you want to delete <strong>{productToDelete.name}</strong>? This will permanently remove the product and its associated analysis data. This action cannot be undone.
                            </p>
                            <div className={styles.modalActions}>
                                <button 
                                    className={styles.cancelBtn} 
                                    onClick={() => setProductToDelete(null)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={styles.deleteConfirmBtn} 
                                    onClick={confirmDelete}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {exportModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setExportModalOpen(false)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }}>Dışa Aktar (CSV)</h2>
                            <button style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setExportModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                                Opsiyonel: Özel bir tarih aralığı seçebilirsiniz. Eğer tarih seçmezseniz, dışa aktarım işleminde tablodaki arama ve filtreleriniz kullanılacaktır. Varsayılan olarak son 7 günün verisi indirilir.
                            </p>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Başlangıç Tarihi (İsteğe Bağlı)</label>
                                <input
                                    type="date"
                                    value={exportStart}
                                    onChange={e => setExportStart(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Bitiş Tarihi (İsteğe Bağlı)</label>
                                <input
                                    type="date"
                                    value={exportEnd}
                                    onChange={e => setExportEnd(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '20px 32px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button style={{ padding: '10px 20px', background: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} onClick={() => setExportModalOpen(false)} disabled={isExporting}>İptal</button>
                            <button style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExport} disabled={isExporting}>
                                {isExporting ? 'İndiriliyor...' : 'İndir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
