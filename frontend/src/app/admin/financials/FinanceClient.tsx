"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, Activity, Zap, Box, FileText, Image as ImageIcon, Type } from 'lucide-react';
import styles from './financials.module.css';

interface FinanceClientProps {
    initialStats: any;
}

const getServiceDisplay = (service: string) => {
    switch (service) {
        case 'POST_TEXT_GENERATION':
            return {
                label: 'Post Açıklama Metni (Caption & Etiket)',
                subtext: 'GPT-4o Mini ile sosyal medya açıklama metni ve CTA',
                icon: <FileText size={18} color="#059669" />
            };
        case 'TEXT_GENERATION':
            return {
                label: 'Kampanya Tasarım Metinleri (Slogan & Alt Başlık)',
                subtext: 'Görsel üzerine yerleşecek slogan ve tasarım metinleri',
                icon: <Type size={18} color="#3b82f6" />
            };
        case 'IMAGE_GENERATION':
            return {
                label: 'Yapay Zeka Görsel Tasarımı',
                subtext: 'GPT Image ile nihai pazarlama post görseli',
                icon: <ImageIcon size={18} color="#8b5cf6" />
            };
        case 'VISION_ANALYSIS':
            return {
                label: 'Ürün Görsel Analizi (Vision)',
                subtext: 'GPT-4o Mini ile ürünün kategori, stil ve renk analizi',
                icon: <Box size={18} color="#6366f1" />
            };
        default:
            return {
                label: service,
                subtext: 'API Servis Harcaması',
                icon: <Zap size={18} color="#f59e0b" />
            };
    }
};

export default function FinanceClient({ initialStats }: FinanceClientProps) {
    const [activeTab, setActiveTab] = useState('Overview');
    const stats = initialStats;

    if (!stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Veri alınamadı. Lütfen giriş yaptığınızdan emin olun.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Finansal Raporlar</h1>
                    <p className={styles.subtitle}>Sistem gelirleri, abone durumları ve API kullanım maliyetleri.</p>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'Overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Overview')}
                >
                    Genel Bakış
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'Revenue' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Revenue')}
                >
                    Plan Gelirleri (Aboneler)
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'Expenses' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Expenses')}
                >
                    API Giderleri & Maliyet
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'UserCosts' ? styles.active : ''}`}
                    onClick={() => setActiveTab('UserCosts')}
                >
                    Kullanıcı Maliyetleri
                </button>
            </div>

            {activeTab === 'Overview' && (
                <>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aylık Toplam Gelir</span>
                                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className={styles.statChange}>
                                <span className={styles.positive}>↗ +{stats.revenueGrowth}%</span> geçen aya göre
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aylık API Maliyeti</span>
                                <div className={`${styles.statIcon} ${styles.iconRed}`}>
                                    <Activity size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>
                                ${stats.apiCost > 0 && stats.apiCost < 0.01
                                    ? stats.apiCost.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                                    : stats.apiCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={styles.statChange}>
                                <span className={styles.negative}>↘ +{stats.apiCostGrowth}%</span> geçen aya göre
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Net Kazanç</span>
                                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>${stats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className={styles.statChange}>
                                <span className={styles.positive}>↗ +{stats.netProfitGrowth}%</span> geçen aya göre
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aktif Aboneler</span>
                                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>{stats.activeSubscribers}</div>
                            <div className={styles.statChange}>
                                <span className={styles.positive}>↗ +{stats.newSubscribers} Yeni</span> bu ay
                            </div>
                        </div>
                    </div>

                    <div className={styles.chartSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Aylık Gelir & Gider Analizi</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: 10, height: 10, background: '#34d399', borderRadius: '50%' }}></div> Gelir
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: 10, height: 10, background: '#f87171', borderRadius: '50%' }}></div> Gider
                                </span>
                            </div>
                        </div>
                        <div className={styles.chartPlaceholder}>
                            {stats.monthlyChart.map((data: any, index: number) => {
                                const maxVal = Math.max(...stats.monthlyChart.map((d: any) => Math.max(d.income, d.expense, 10)));
                                const incomeHeight = (data.income / maxVal) * 100;
                                const expenseHeight = (data.expense / maxVal) * 100;

                                return (
                                    <div key={index} className={styles.barColumn}>
                                        <div style={{ display: 'flex', gap: '0.5rem', height: '100%', alignItems: 'flex-end' }}>
                                            <div className={styles.barWrapper} title={`Gelir: $${data.income.toFixed(2)}`}>
                                                <div className={styles.barIncome} style={{ height: `${incomeHeight}%` }}></div>
                                            </div>
                                            <div className={styles.barWrapper} title={`Gider: $${data.expense.toFixed(2)}`}>
                                                <div className={styles.barExpense} style={{ height: `${expenseHeight}%` }}></div>
                                            </div>
                                        </div>
                                        <span className={styles.xLabel}>{data.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'Revenue' && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Abonelik Planı</th>
                                <th>Aylık Ücret</th>
                                <th>Aktif Abone Sayısı</th>
                                <th>Aylık Toplam Gelir (MRR)</th>
                                <th>Büyüme</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.planRevenues.map((plan: any) => (
                                <tr key={plan.id}>
                                    <td>
                                        <span className={`${styles.badge} ${plan.plan === 'Pro' ? styles.badgePro : styles.badgeEnterprise}`}>
                                            {plan.plan}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{plan.price}</td>
                                    <td>{plan.subscribers} Kullanıcı</td>
                                    <td style={{ fontWeight: 700, color: '#059669' }}>{plan.totalRevenue}</td>
                                    <td><span className={styles.positive}>{plan.mrrGrowth}</span></td>
                                </tr>
                            ))}
                            {stats.planRevenues.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Kayıtlı abone planı bulunmuyor.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'Expenses' && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Servis / API Türü</th>
                                <th>Harcanan Token</th>
                                <th>Toplam Maliyet (Fatura)</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.apiExpenses.map((expense: any) => {
                                const sDisplay = getServiceDisplay(expense.service);
                                return (
                                    <tr key={expense.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {sDisplay.icon}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>
                                                        {sDisplay.label}
                                                    </div>
                                                    {sDisplay.subtext && (
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                                            {sDisplay.subtext}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{expense.tokensUsed}</td>
                                        <td style={{ fontWeight: 700, color: '#dc2626' }}>{expense.totalCost}</td>
                                        <td>
                                            <span style={{ color: expense.trend.includes('+') ? '#dc2626' : '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                                                {expense.trend}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {stats.apiExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Harcanmış API faturası bulunmuyor.</td>
                                </tr>
                            )}
                        </tbody>
                        {stats.apiExpenses.length > 0 && (
                            <tfoot>
                                <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                    <td colSpan={2} style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right', paddingRight: '20px' }}>Genel Toplam:</td>
                                    <td style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.05rem' }}>
                                        ${stats.apiCost > 0 && stats.apiCost < 0.01
                                            ? stats.apiCost.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                                            : stats.apiCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
            {activeTab === 'UserCosts' && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>Plan</th>
                                <th>Harcanan Token</th>
                                <th>Toplam Maliyet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.userApiCosts?.map((user: any) => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{user.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>{user.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${user.plan === 'Pro' ? styles.badgePro : user.plan === 'Enterprise' ? styles.badgeEnterprise : ''}`}>
                                            {user.plan}
                                        </span>
                                    </td>
                                    <td>{user.tokensUsed}</td>
                                    <td style={{ fontWeight: 700, color: '#dc2626' }}>{user.totalCost}</td>
                                </tr>
                            ))}
                            {(!stats.userApiCosts || stats.userApiCosts.length === 0) && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Kullanıcı maliyeti bulunmuyor.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
