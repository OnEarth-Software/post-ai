"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Camera, Zap, Calendar, Download, ImageIcon, Type, X } from 'lucide-react';
import styles from '../campaigns/campaigns.module.css';

export default function DesignClient({
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

    // Debounced Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== currentSearch) {
                const params = new URLSearchParams();
                if (searchValue) params.set('search', searchValue);
                params.set('page', '1'); // reset to page 1 on search
                router.push(`/admin/design?${params.toString()}`);
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
        router.push(`/admin/design?${params.toString()}`);
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
        router.push(`/admin/design?${params.toString()}`);
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
            if (platform && platform !== 'all') params.set('platform', platform);
            if (typeFilter && typeFilter !== 'all') params.set('type_filter', typeFilter);
            if (sortOrder) params.set('sort', sortOrder);
            if (dateRange) params.set('date_range', dateRange);
            if (exportStart) params.set('start_date', exportStart);
            if (exportEnd) params.set('end_date', exportEnd);

            // We can reuse campaigns export endpoint as it has total cost. 
            // Or if they want split columns in CSV we should make a new export endpoint. Let's just use campaigns export for now.
            const res = await fetch(`${apiUrl}/admin/campaigns/export?${params.toString()}`, {
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
            a.download = `design_costs_${exportStart}_to_${exportEnd}.csv`;
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
                    <h1 className={styles.title}>Kampanya Tasarım (Design) Giderleri</h1>
                    <p className={styles.subtitle}>Kampanyaların oluşturulmasında harcanan görsel (Image) ve metin (Text) üretim maliyetlerini inceleyin.</p>
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
                            <th>Kampanya</th>
                            <th>Platform & Format</th>
                            <th>Görsel Üretim (IMAGE)</th>
                            <th>Metin Üretim (TEXT)</th>
                            <th>Toplam Harcama</th>
                            <th>Kullanıcı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialCampaigns.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No design records found.</td>
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
                                            <span className={styles.date} style={{fontSize: '0.75rem', marginTop: '4px'}}>{new Date(campaign.createdAt).toLocaleDateString('tr-TR')}</span>
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
                                        <div className={styles.tokenBadge} title="Image Tokens Spent">
                                            <ImageIcon size={14} color="#8b5cf6" /> {campaign.imageTokens || 0}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, paddingLeft: '0.25rem' }}>
                                            Cost: ${campaign.imageCost || '0.0000'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                                        <div className={styles.tokenBadge} title="Text Tokens Spent">
                                            <Type size={14} color="#3b82f6" /> {campaign.textTokens || 0}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, paddingLeft: '0.25rem' }}>
                                            Cost: ${campaign.textCost || '0.0000'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                                        <div className={styles.tokenBadge} title="Total Design Tokens Spent" style={{background: '#d1fae5', color: '#059669'}}>
                                            <Zap size={14} /> {(campaign.imageTokens || 0) + (campaign.textTokens || 0)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, paddingLeft: '0.25rem' }}>
                                            Cost: ${(parseFloat(campaign.imageCost || '0') + parseFloat(campaign.textCost || '0')).toFixed(4)}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.userBlock}>
                                        <div className={styles.avatar} style={{ width: '28px', height: '28px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '50%', color: '#475569', fontWeight: 600 }}>
                                            {campaign.user.avatar}
                                        </div>
                                        <span className={styles.userName}>{campaign.user.name}</span>
                                    </div>
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
                            router.push(`/admin/design?${params.toString()}`);
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
                            router.push(`/admin/design?${params.toString()}`);
                        }}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
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
                                Opsiyonel: Özel bir tarih aralığı seçebilirsiniz. Eğer tarih seçmezseniz, dışa aktarım işleminde tablodaki arama ve filtreleriniz kullanılacaktır.
                            </p>
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
