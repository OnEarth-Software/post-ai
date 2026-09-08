"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, MoreHorizontal, X, Trash2, Eye, Download, FileText, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './market-reports.module.css';
import { deleteMarketReport } from './actions';

export default function MarketReportsClient({
    initialReports,
    total,
    currentPage,
    totalPages,
    currentSearch,
    currentSort,
    currentDateRange,
    token
}: any) {
    const router = useRouter();
    const [selectedReport, setSelectedReport] = useState<any>(null); // For Details Modal
    const [reportToDelete, setReportToDelete] = useState<any>(null); // For Delete Modal
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

    // Debounced Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== currentSearch) {
                const params = new URLSearchParams();
                if (searchValue) params.set('search', searchValue);
                params.set('page', '1'); // reset to page 1 on search
                router.push(`/admin/market-reports?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue, currentSearch, router]);

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (sortOrder !== 'desc') params.set('sort', sortOrder);
        if (dateRange !== 'all') params.set('date_range', dateRange);

        params.set('page', '1');
        setFilterMenuOpen(false);
        setDateMenuOpen(false);
        router.push(`/admin/market-reports?${params.toString()}`);
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
        router.push(`/admin/market-reports?${params.toString()}`);
    };

    const confirmDelete = async () => {
        if (!reportToDelete?.campaignId) return;
        setIsSaving(true);
        try {
            const res = await deleteMarketReport(reportToDelete.campaignId);
            if (res.success) {
                setReportToDelete(null);
                setOpenMenuId(null);
                if (selectedReport?.campaignId === reportToDelete.campaignId) {
                    setSelectedReport(null);
                }
                router.refresh();
            } else {
                alert("Silme işlemi başarısız: " + (res.error || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
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

            const res = await fetch(`${apiUrl}/admin/market-reports/export?${params.toString()}`, {
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
            a.download = `market_reports_${exportStart}_to_${exportEnd}.csv`;
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
                    <h1 className={styles.title}>Pazar Analiz Raporları</h1>
                    <p className={styles.subtitle}>Sistem üzerinde oluşturulan pazar analiz raporlarını görüntüleyin ve yönetin.</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Hedef, ürün veya kullanıcı ara..."
                    className={styles.searchInput}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />

                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.filterBtn}
                        onClick={() => { setFilterMenuOpen(!filterMenuOpen); setDateMenuOpen(false); }}
                        style={{ background: filterMenuOpen || sortOrder !== 'desc' ? '#f1f5f9' : 'white' }}
                    >
                        <Filter size={16} /> Filtreler
                    </button>

                    {filterMenuOpen && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setFilterMenuOpen(false)} />
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, width: '280px', padding: '16px' }}>
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
                            <th>Analiz Raporu</th>
                            <th>Kampanya</th>
                            <th>Harcanan Token</th>
                            <th>Harcanan Kredi</th>
                            <th>Oluşturan Kullanıcı</th>
                            <th>Oluşturulma Tarihi</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialReports.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Henüz pazar analiz raporu bulunmuyor.</td>
                            </tr>
                        )}
                        {initialReports.map((report: any) => (
                            <tr key={report.id}>
                                <td>
                                    <div
                                        className={styles.campaignCell}
                                        style={{ cursor: 'pointer', color: '#2563eb' }}
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        <div className={styles.thumbnail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', border: 'none' }}>
                                            <FileText size={20} color="#4f46e5" />
                                        </div>
                                        <div className={styles.campaignInfo}>
                                            <span className={styles.campaignTitle}>{report.productName} Analiz Raporu</span>
                                            <span className={styles.campaignSlogan}>PDF/Doc Görüntüle</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 500, color: '#334155' }}>{report.campaignGoal}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                                        <div className={styles.tokenBadge} title="Tokens Spent" style={{ color: report.tokensSpent > 0 ? '#059669' : '#94a3b8', background: report.tokensSpent > 0 ? '#d1fae5' : '#f1f5f9' }}>
                                            <Zap size={14} /> {report.tokensSpent}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, paddingLeft: '0.25rem' }}>
                                            Cost: ${report.cost || '0.0000'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{report.creditsSpent} Kredi</span>
                                </td>
                                <td>
                                    <div className={styles.userBlock}>
                                        <div className={styles.avatar} style={{ width: '24px', height: '24px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: '50%', color: '#475569', fontWeight: 600 }}>
                                            {report.user.avatar}
                                        </div>
                                        <span className={styles.userName}>{report.user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.date}>{new Date(report.createdAt).toLocaleDateString('tr-TR')}</span>
                                </td>
                                <td style={{ position: 'relative' }}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={(e) => handleMenuClick(e, report.id)}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>

                                    {openMenuId === report.id && (
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
                                                    onClick={(e) => { e.stopPropagation(); setSelectedReport(report); setOpenMenuId(null); }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Eye size={16} /> View Details
                                                </button>
                                                <button
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444', textAlign: 'left', borderRadius: '4px' }}
                                                    onClick={(e) => { e.stopPropagation(); setReportToDelete(report); setOpenMenuId(null); }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Trash2 size={16} /> Delete Analyze Doc
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
                            router.push(`/admin/market-reports?${params.toString()}`);
                        }}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Önceki
                    </button>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Sayfa {currentPage} / {totalPages}</span>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (currentSearch) params.set('search', currentSearch);
                            params.set('page', String(currentPage + 1));
                            router.push(`/admin/market-reports?${params.toString()}`);
                        }}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Sonraki
                    </button>
                </div>
            )}

            {/* Details Modal */}
            {selectedReport && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setSelectedReport(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }}>{selectedReport.productName} - Analiz Raporu</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>Kampanya Hedefi: {selectedReport.campaignGoal}</p>
                            </div>
                            <button style={{ background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedReport(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                            <div className="prose max-w-none">
                                <ReactMarkdown>
                                    {selectedReport.marketReportText}
                                </ReactMarkdown>
                            </div>
                        </div>
                        <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <button style={{ padding: '10px 24px', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => setSelectedReport(null)}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {reportToDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setReportToDelete(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '32px 32px 24px 32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                                <Trash2 size={24} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', marginBottom: '12px', fontWeight: 600 }}>Raporu Sil</h2>
                            <p style={{ color: '#475569', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Bu analiz raporunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </p>
                        </div>
                        <div style={{ padding: '20px 32px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button style={{ padding: '10px 20px', background: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} onClick={() => setReportToDelete(null)} disabled={isSaving}>İptal</button>
                            <button style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={confirmDelete} disabled={isSaving}>
                                {isSaving ? 'Siliniyor...' : 'Kalıcı Olarak Sil'}
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
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                                Opsiyonel: Özel bir tarih aralığı seçebilirsiniz. Varsayılan olarak son 7 günün verisi indirilir.
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
