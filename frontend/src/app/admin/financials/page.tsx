"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, Activity, Zap, Box } from 'lucide-react';
import styles from './financials.module.css';

// Mock Data
const PLAN_REVENUE = [
    { id: 1, plan: 'Pro', price: '$29.00', subscribers: 425, totalRevenue: '$12,325.00', mrrGrowth: '+12%' },
    { id: 2, plan: 'Enterprise', price: '$99.00', subscribers: 84, totalRevenue: '$8,316.00', mrrGrowth: '+5%' },
];

const API_EXPENSES = [
    { id: 1, service: 'AI: Detay Çıkarma (Vision)', tokensUsed: '1.2M', totalCost: '$120.00', trend: '+15%' },
    { id: 2, service: 'AI: Yazı Oluşturma (Text)', tokensUsed: '2.1M', totalCost: '$85.00', trend: '+5%' },
    { id: 3, service: 'AI: Görüntü Oluşturma (Image)', tokensUsed: '4.5M', totalCost: '$450.00', trend: '+18%' },
    { id: 4, service: 'Supabase (Veritabanı & Depolama)', tokensUsed: '-', totalCost: '$65.00', trend: 'Stabil' },
];

const MONTHLY_CHART = [
    { month: 'Oca', income: 40, expense: 15 },
    { month: 'Şub', income: 55, expense: 20 },
    { month: 'Mar', income: 45, expense: 25 },
    { month: 'Nis', income: 70, expense: 30 },
    { month: 'May', income: 85, expense: 35 },
    { month: 'Haz', income: 100, expense: 40 },
];

export default function FinancialsPage() {
    const [activeTab, setActiveTab] = useState('Overview');

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Finansal Raporlar</h1>
                    <p className={styles.subtitle}>Sistem gelirleri, abone durumları ve API kullanım maliyetleri.</p>
                </div>
            </div>

            {/* In-page Menu / Tabs */}
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
            </div>

            {/* Content Based on Tab */}
            {activeTab === 'Overview' && (
                <>
                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aylık Toplam Gelir</span>
                                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>$20,641.00</div>
                            <div className={styles.statChange}>
                                <span className={styles.positive}>↗ +8.4%</span> geçen aya göre
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aylık API Maliyeti</span>
                                <div className={`${styles.statIcon} ${styles.iconRed}`}>
                                    <Activity size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>$635.00</div>
                            <div className={styles.statChange}>
                                <span className={styles.negative}>↘ +12.5%</span> geçen aya göre
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Net Kazanç</span>
                                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>$20,006.00</div>
                            <div className={styles.statChange}>
                                <span className={styles.positive}>↗ +7.2%</span> geçen aya göre
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aktif Aboneler</span>
                                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className={styles.statValue}>509</div>
                            <div className={styles.statChange}>
                                <span className={styles.positive}>↗ +24 Yeni</span> bu ay
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className={styles.chartSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Aylık Gelir & Gider Analizi</h2>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <span style={{fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                    <div style={{width: 10, height: 10, background: '#34d399', borderRadius: '50%'}}></div> Gelir
                                </span>
                                <span style={{fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                    <div style={{width: 10, height: 10, background: '#f87171', borderRadius: '50%'}}></div> Gider
                                </span>
                            </div>
                        </div>
                        <div className={styles.chartPlaceholder}>
                            {MONTHLY_CHART.map((data, index) => (
                                <div key={index} className={styles.barColumn}>
                                    <div style={{display: 'flex', gap: '0.5rem', height: '100%', alignItems: 'flex-end'}}>
                                        <div className={styles.barWrapper}>
                                            <div className={styles.barIncome} style={{ height: `${data.income}%` }}></div>
                                        </div>
                                        <div className={styles.barWrapper}>
                                            <div className={styles.barExpense} style={{ height: `${data.expense}%` }}></div>
                                        </div>
                                    </div>
                                    <span className={styles.xLabel}>{data.month}</span>
                                </div>
                            ))}
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
                            {PLAN_REVENUE.map(plan => (
                                <tr key={plan.id}>
                                    <td>
                                        <span className={`${styles.badge} ${plan.plan === 'Pro' ? styles.badgePro : styles.badgeEnterprise}`}>
                                            {plan.plan}
                                        </span>
                                    </td>
                                    <td style={{fontWeight: 600}}>{plan.price}</td>
                                    <td>{plan.subscribers} Kullanıcı</td>
                                    <td style={{fontWeight: 700, color: '#059669'}}>{plan.totalRevenue}</td>
                                    <td><span className={styles.positive}>{plan.mrrGrowth}</span></td>
                                </tr>
                            ))}
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
                            {API_EXPENSES.map(expense => (
                                <tr key={expense.id}>
                                    <td style={{fontWeight: 600, color: '#0f172a'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                            {expense.service.includes('Vision') ? <Box size={16} color="#6366f1"/> : <Zap size={16} color="#f59e0b"/>}
                                            {expense.service}
                                        </div>
                                    </td>
                                    <td>{expense.tokensUsed}</td>
                                    <td style={{fontWeight: 700, color: '#dc2626'}}>{expense.totalCost}</td>
                                    <td>
                                        <span style={{color: expense.trend.includes('+') ? '#dc2626' : '#64748b', fontSize: '0.85rem', fontWeight: 600}}>
                                            {expense.trend}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
