import React from 'react';
import { cookies } from 'next/headers';
import { Calendar, Download, Users, Megaphone, DollarSign, Sparkles, MoreVertical, Zap } from 'lucide-react';
import styles from './dashboard.module.css';

export default async function AdminDashboardPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let stats: any = {
        total_users: 1248, // mock fallback
        total_campaigns: 8420,
        users_change_percentage: 14.2,
        campaigns_change_percentage: 5.8,
        active_users: [],
        daily_campaigns: []
    };

    if (token) {
        try {
            let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
                apiUrl = 'http://backend:8000';
            }
            const response = await fetch(`${apiUrl}/admin/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            if (response.ok) {
                stats = await response.json();
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Dashboard Overview</h1>
                    <p className={styles.subtitle}>Monitor key platform metrics and recent activity.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn}>
                        <Calendar size={16} />
                        Last 30 Days
                    </button>
                    <button className={styles.secondaryBtn}>
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {/* Stat Card 1 */}
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Toplam Kullanıcı</span>
                        <div className={`${styles.statIconWrapper} ${styles.blueIcon}`}>
                            <Users size={16} className={styles.iconColorBlue} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats.total_users.toLocaleString()}</div>
                    <div className={styles.statChange}>
                        {stats.users_change_percentage >= 0 ? (
                            <span className={styles.positive}>↗ +{stats.users_change_percentage}%</span>
                        ) : (
                            <span className={styles.negative}>↘ {stats.users_change_percentage}%</span>
                        )} geçen aya göre
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Üretilen Tasarım</span>
                        <div className={`${styles.statIconWrapper} ${styles.purpleIcon}`}>
                            <Sparkles size={16} className={styles.iconColorPurple} />
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats.total_campaigns.toLocaleString()}</div>
                    <div className={styles.statChange}>
                        {stats.campaigns_change_percentage >= 0 ? (
                            <span className={styles.positive}>↗ +{stats.campaigns_change_percentage}%</span>
                        ) : (
                            <span className={styles.negative}>↘ {stats.campaigns_change_percentage}%</span>
                        )} geçen aya göre
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Toplam Gelir</span>
                        <div className={`${styles.statIconWrapper} ${styles.greenIcon}`}>
                            <DollarSign size={16} className={styles.iconColorGreen} />
                        </div>
                    </div>
                    <div className={styles.statValue}>₺142.5k</div>
                    <div className={styles.statChange}>
                        <span className={styles.positive}>↗ +12.1%</span> geçen aya göre
                    </div>
                </div>

                {/* Stat Card 4 */}
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Harcanan Token</span>
                        <div className={`${styles.statIconWrapper} ${styles.tealIcon}`}>
                            <Zap size={16} className={styles.iconColorTeal} />
                        </div>
                    </div>
                    <div className={styles.statValue}>2.4M</div>
                    <div className={styles.statChange}>
                        <span className={styles.positive}>↗ +32.5%</span> geçen aya göre
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* Chart Section */}
                <div className={styles.chartSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Günlük Tasarım Üretimi</h2>
                        <button className={styles.iconBtn}><MoreVertical size={16} /></button>
                    </div>
                    <div className={styles.chartPlaceholder}>
                        {(() => {
                            const daily = stats.daily_campaigns || [];
                            if (daily.length === 0) {
                                return <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Veri bulunamadı.</div>;
                            }
                            
                            const maxCount = Math.max(...daily.map((d: any) => d.count), 10);
                            // Generate y-axis labels based on maxCount
                            const yLabels = [maxCount, maxCount * 0.75, maxCount * 0.5, maxCount * 0.25, 0].map(val => 
                                val > 1000 ? (val / 1000).toFixed(1).replace('.0', '') + 'k' : Math.round(val).toString()
                            );
                            
                            // Map English day names to Turkish short names
                            const daysMap: Record<number, string> = { 0: 'Paz', 1: 'Pzt', 2: 'Sal', 3: 'Çar', 4: 'Per', 5: 'Cum', 6: 'Cmt' };
                            
                            return (
                                <>
                                    <div className={styles.yAxis}>
                                        {yLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
                                    </div>
                                    <div className={styles.barsContainer}>
                                        {daily.map((day: any, idx: number) => {
                                            const dateObj = new Date(day.date);
                                            const dayName = daysMap[dateObj.getDay()];
                                            const heightPercent = Math.max((day.count / maxCount) * 100, 5); // min height 5% for visibility
                                            
                                            // Optional: color intensity based on height
                                            let bgColor = '#bbf7d0';
                                            if (heightPercent > 80) bgColor = '#15803d';
                                            else if (heightPercent > 60) bgColor = '#16a34a';
                                            else if (heightPercent > 40) bgColor = '#22c55e';
                                            else if (heightPercent > 20) bgColor = '#4ade80';

                                            return (
                                                <div className={styles.barColumn} key={idx}>
                                                    <div className={styles.bar} style={{ height: `${heightPercent}%`, backgroundColor: bgColor }} title={`${day.count} Tasarım`}></div>
                                                    <span className={styles.xLabel}>{dayName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Top Users Section */}
                <div className={styles.recentActionsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>En Aktif Müşteriler</h2>
                        <a href="#" className={styles.viewAllLink}>Tümünü Gör</a>
                    </div>
                    
                    <div className={styles.actionList}>
                        {stats.active_users && stats.active_users.length > 0 ? (
                            stats.active_users.map((user: any, index: number) => (
                                <div className={styles.actionItem} key={index}>
                                    <div className={styles.userAvatar}>
                                        <img src={`https://ui-avatars.com/api/?name=${user.name}+${user.surname}&background=random`} alt={`${user.name} ${user.surname}`} />
                                    </div>
                                    <div className={styles.actionDetails}>
                                        <p className={styles.actionText} style={{fontWeight: 600, color: '#0f172a'}}>
                                            {user.name} {user.surname}
                                        </p>
                                        <span className={styles.actionTime}>{user.campaign_count} Tasarım</span>
                                    </div>
                                    <div style={{color: index === 0 ? '#059669' : '#475569', fontWeight: 'bold', fontSize: '0.95rem'}}>
                                        #{index + 1}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>
                                Henüz aktif müşteri bulunmuyor.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
