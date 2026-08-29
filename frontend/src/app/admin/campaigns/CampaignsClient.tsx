"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Camera, Zap, Calendar, MoreHorizontal, X, Trash2, Eye, Download } from 'lucide-react';
import styles from './campaigns.module.css';
import { deleteCampaign } from './actions';

export default function CampaignsClient({
    initialCampaigns,
    total,
    currentPage,
    totalPages,
    currentSearch,
    currentPlatform,
    currentType,
    currentSort,
    currentDateRange,
    token
}: any) {
    const router = useRouter();
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null); // For Details Modal
    const [campaignToDelete, setCampaignToDelete] = useState<any>(null); // For Delete Modal
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

    const [platform, setPlatform] = useState(currentPlatform || 'all');
    const [typeFilter, setTypeFilter] = useState(currentType || 'all');
    const [sortOrder, setSortOrder] = useState(currentSort || 'desc');
    const [dateRange, setDateRange] = useState(currentDateRange || 'all');

    // For dropdown menu visibility
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleMenuClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Debounced Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== currentSearch) {
                const params = new URLSearchParams();
                if (searchValue) params.set('search', searchValue);
                params.set('page', '1'); // reset to page 1 on search
                router.push(`/admin/campaigns?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue, currentSearch, router]);

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (platform !== 'all') params.set('platform', platform);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (sortOrder !== 'desc') params.set('sort', sortOrder);
        if (dateRange !== 'all') params.set('date_range', dateRange);

        params.set('page', '1');
        setFilterMenuOpen(false);
        setDateMenuOpen(false);
        router.push(`/admin/campaigns?${params.toString()}`);
    };

    // Apply date range directly when selected
    const handleDateRangeSelect = (val: string) => {
        setDateRange(val);
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (platform !== 'all') params.set('platform', platform);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (sortOrder !== 'desc') params.set('sort', sortOrder);
        if (val !== 'all') params.set('date_range', val);

        params.set('page', '1');
        setDateMenuOpen(false);
        router.push(`/admin/campaigns?${params.toString()}`);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete?.id) return;
        setIsSaving(true);
        try {
            const res = await deleteCampaign(campaignToDelete.id);
            if (res.success) {
                setCampaignToDelete(null);
                setOpenMenuId(null);
                if (selectedCampaign?.id === campaignToDelete.id) {
                    setSelectedCampaign(null);
                }
                router.refresh();
            } else {
                alert("Delete failed: " + (res.error || 'Unknown error'));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        if (!exportStart || !exportEnd) {
            alert("Lütfen başlangıç ve bitiş tarihlerini seçin.");
            return;
        }

        setIsExporting(true);
        try {
            // Detect API URL
            let apiUrl = 'http://localhost:8000';
            if (typeof window !== 'undefined' && (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
                apiUrl = `https://${window.location.hostname}:8000`; // simple fallback
            }

            const res = await fetch(`${apiUrl}/admin/campaigns/export?start_date=${exportStart}&end_date=${exportEnd}`, {
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
            a.download = `campaigns_${exportStart}_to_${exportEnd}.csv`;
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
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Campaigns</h1>
                    <p className={styles.subtitle}>View and manage AI generated campaigns across the platform.</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Search by goal, slogan or user..."
                    className={styles.searchInput}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />

                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.filterBtn}
                        onClick={() => { setFilterMenuOpen(!filterMenuOpen); setDateMenuOpen(false); }}
                        style={{ background: filterMenuOpen || platform !== 'all' || typeFilter !== 'all' || sortOrder !== 'desc' ? '#f1f5f9' : 'white' }}
                    >
                        <Filter size={16} /> Filters
                    </button>

                    {filterMenuOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setFilterMenuOpen(false)} />
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, width: '280px', padding: '16px' }}>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Platform</label>
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="all">Tüm Platformlar</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Format</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="all">Tüm Formatlar</option>
                                        <option value="Post">Post</option>
                                        <option value="Story">Story</option>
                                        <option value="Reel">Reel</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Sıralama</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                    >
                                        <option value="desc">Yeniden Eskiye (En Yeni)</option>
                                        <option value="asc">Eskiden Yeniye (En Eski)</option>
                                    </select>
                                </div>

                                <button
                                    onClick={applyFilters}
                                    style={{ width: '100%', padding: '10px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Filtreleri Uygula
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.filterBtn}
                        onClick={() => { setDateMenuOpen(!dateMenuOpen); setFilterMenuOpen(false); }}
                        style={{ background: dateMenuOpen || dateRange !== 'all' ? '#f1f5f9' : 'white' }}
                    >
                        <Calendar size={16} />
                        {dateRange === 'all' ? 'Tüm Zamanlar' : dateRange === '7d' ? 'Son 7 Gün' : dateRange === '1m' ? 'Son 1 Ay' : dateRange === '6m' ? 'Son 6 Ay' : 'Son 1 Yıl'}
                    </button>

                    {dateMenuOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDateMenuOpen(false)} />
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, width: '200px', overflow: 'hidden' }}>
                                {[
                                    { value: 'all', label: 'Tüm Zamanlar' },
                                    { value: '7d', label: 'Son 7 Gün' },
                                    { value: '1m', label: 'Son 1 Ay' },
                                    { value: '6m', label: 'Son 6 Ay' },
                                    { value: '1y', label: 'Son 1 Yıl' }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleDateRangeSelect(option.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: dateRange === option.value ? '#f8fafc' : 'white',
                                            border: 'none',
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            fontWeight: dateRange === option.value ? 600 : 400,
                                            color: dateRange === option.value ? '#0f172a' : '#475569'
                                        }}
                                        onMouseOver={(e) => { if (dateRange !== option.value) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseOut={(e) => { if (dateRange !== option.value) e.currentTarget.style.background = 'white'; }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
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
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tasarım</th>
                            <th>Platform & Format</th>
                            <th>Harcanan Token</th>
                            <th>Oluşturan Kullanıcı</th>
                            <th>Tarih</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialCampaigns.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No campaigns found.</td>
                            </tr>
                        )}
                        {initialCampaigns.map((campaign: any) => (
                            <tr key={campaign.id}>
                                <td>
                                    <div className={styles.campaignCell}>
                                        {campaign.imageUrl ? (
                                            <img src={campaign.imageUrl} alt={campaign.goal} className={styles.thumbnail} />
                                        ) : (
                                            <div className={styles.thumbnail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                                                <Camera size={20} color="#94a3b8" />
                                            </div>
                                        )}
                                        <div className={styles.campaignInfo}>
                                            <span className={styles.campaignTitle}>{campaign.goal}</span>
                                            <span className={styles.campaignSlogan}>"{campaign.slogan || '-'}"</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.platformBadge}>
                                        <Camera size={14} />
                                        {campaign.platform}
                                    </div>
                                    <span className={styles.typeLabel}>{campaign.type}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                                        <div className={styles.tokenBadge} title="Tokens Spent">
                                            <Zap size={14} /> {campaign.tokensSpent}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, paddingLeft: '0.25rem' }}>
                                            Cost: ${campaign.cost}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.userBlock}>
                                        <div className={styles.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                                            {campaign.user.avatar}
                                        </div>
                                        <span className={styles.userName}>{campaign.user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.date}>{new Date(campaign.createdAt).toLocaleDateString('tr-TR')}</span>
                                </td>
                                <td style={{ position: 'relative' }}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={(e) => handleMenuClick(e, campaign.id)}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>

                                    {openMenuId === campaign.id && (
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
                                                    onClick={(e) => { e.stopPropagation(); setSelectedCampaign(campaign); setOpenMenuId(null); }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Eye size={16} /> View Details
                                                </button>
                                                <button
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444', textAlign: 'left', borderRadius: '4px' }}
                                                    onClick={(e) => { e.stopPropagation(); setCampaignToDelete(campaign); setOpenMenuId(null); }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Trash2 size={16} /> Delete Campaign
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (currentSearch) params.set('search', currentSearch);
                            params.set('page', String(currentPage - 1));
                            router.push(`/admin/campaigns?${params.toString()}`);
                        }}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Page {currentPage} / {totalPages}</span>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (currentSearch) params.set('search', currentSearch);
                            params.set('page', String(currentPage + 1));
                            router.push(`/admin/campaigns?${params.toString()}`);
                        }}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Details Modal */}
            {selectedCampaign && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setSelectedCampaign(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }}>Campaign Details</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>Platform: {selectedCampaign.platform} • Format: {selectedCampaign.type}</p>
                            </div>
                            <button style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedCampaign(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <strong style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Goal</strong>
                                    <p style={{ margin: '8px 0 0 0', color: '#0f172a', fontWeight: 500 }}>{selectedCampaign.goal}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <strong style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Slogan</strong>
                                    <p style={{ margin: '8px 0 0 0', color: '#0f172a', fontWeight: 500, fontStyle: 'italic' }}>"{selectedCampaign.slogan || 'No slogan generated'}"</p>
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <strong style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtext</strong>
                                <p style={{ margin: '8px 0 0 0', color: '#334155', padding: '12px 16px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>{selectedCampaign.subtext || 'No subtext provided.'}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <strong style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Prompt</strong>
                                    <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', marginTop: '8px', fontSize: '14px', color: '#f8fafc', maxHeight: '120px', overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.5 }}>
                                        {selectedCampaign.user_prompt || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <strong style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Prompt</strong>
                                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', marginTop: '8px', fontSize: '14px', color: '#cbd5e1', maxHeight: '120px', overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.5 }}>
                                        {selectedCampaign.system_prompt || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{ padding: '10px 24px', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => setSelectedCampaign(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {campaignToDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setCampaignToDelete(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '32px 32px 24px 32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                                <Trash2 size={24} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', marginBottom: '12px', fontWeight: 600 }}>Delete Campaign</h2>
                            <p style={{ color: '#475569', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Are you sure you want to delete this campaign? This action cannot be undone and any generated assets might be lost.
                            </p>
                        </div>
                        <div style={{ padding: '20px 32px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button style={{ padding: '10px 20px', background: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} onClick={() => setCampaignToDelete(null)} disabled={isSaving}>Cancel</button>
                            <button style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={confirmDelete} disabled={isSaving}>
                                {isSaving ? 'Deleting...' : 'Delete Permanently'}
                            </button>
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
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Başlangıç Tarihi</label>
                                <input 
                                    type="date" 
                                    value={exportStart} 
                                    onChange={e => setExportStart(e.target.value)} 
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Bitiş Tarihi</label>
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
