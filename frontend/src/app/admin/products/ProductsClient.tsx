"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Box, Zap, Calendar, MoreHorizontal, X, Trash2, Eye } from 'lucide-react';
import styles from '../campaigns/campaigns.module.css'; // Reusing styles from campaigns
import { deleteProduct } from './actions';

export default function ProductsClient({
    initialProducts,
    total,
    currentPage,
    totalPages,
    currentSearch,
    currentSort,
    currentDateRange
}: any) {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Details Modal
    const [productToDelete, setProductToDelete] = useState<any>(null); // For Delete Modal
    const [isSaving, setIsSaving] = useState(false);

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
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by product name or user..." 
                        className={styles.searchInput}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                
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
                                            <div className={styles.actionMenu}>
                                                <div className={styles.actionItem} onClick={() => {
                                                    setSelectedProduct(product);
                                                    setOpenMenuId(null);
                                                }}>
                                                    <Eye size={16} /> View Details
                                                </div>
                                                <div 
                                                    className={`${styles.actionItem} ${styles.deleteItem}`}
                                                    onClick={() => {
                                                        setProductToDelete(product);
                                                        setOpenMenuId(null);
                                                    }}
                                                >
                                                    <Trash2 size={16} /> Delete Product
                                                </div>
                                            </div>
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
        </div>
    );
}
