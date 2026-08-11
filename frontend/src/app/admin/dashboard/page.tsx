import React from 'react';
import { Calendar, Download, Users, Megaphone, DollarSign, Sparkles, MoreVertical, Zap } from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
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
                    <div className={styles.statValue}>1,248</div>
                    <div className={styles.statChange}>
                        <span className={styles.positive}>↗ +14.2%</span> geçen aya göre
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
                    <div className={styles.statValue}>8,420</div>
                    <div className={styles.statChange}>
                        <span className={styles.positive}>↗ +5.8%</span> geçen aya göre
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
                        <div className={styles.yAxis}>
                            <span>10k</span>
                            <span>7.5k</span>
                            <span>5k</span>
                            <span>2.5k</span>
                            <span>0</span>
                        </div>
                        <div className={styles.barsContainer}>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '30%', backgroundColor: '#bbf7d0' }}></div>
                                <span className={styles.xLabel}>Pzt</span>
                            </div>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '40%', backgroundColor: '#86efac' }}></div>
                                <span className={styles.xLabel}>Sal</span>
                            </div>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '35%', backgroundColor: '#4ade80' }}></div>
                                <span className={styles.xLabel}>Çar</span>
                            </div>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '55%', backgroundColor: '#22c55e' }}></div>
                                <span className={styles.xLabel}>Per</span>
                            </div>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '50%', backgroundColor: '#16a34a' }}></div>
                                <span className={styles.xLabel}>Cum</span>
                            </div>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '70%', backgroundColor: '#15803d' }}></div>
                                <span className={styles.xLabel}>Cmt</span>
                            </div>
                            <div className={styles.barColumn}>
                                <div className={styles.bar} style={{ height: '80%', backgroundColor: '#166534' }}></div>
                                <span className={styles.xLabel}>Paz</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Users Section */}
                <div className={styles.recentActionsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>En Aktif Müşteriler</h2>
                        <a href="#" className={styles.viewAllLink}>Tümünü Gör</a>
                    </div>
                    
                    <div className={styles.actionList}>
                        <div className={styles.actionItem}>
                            <div className={styles.userAvatar}>
                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Acme Corp" />
                            </div>
                            <div className={styles.actionDetails}>
                                <p className={styles.actionText} style={{fontWeight: 600, color: '#0f172a'}}>Acme Corp. (Ahmet Y.)</p>
                                <span className={styles.actionTime}>245 Tasarım • 12K Token</span>
                            </div>
                            <div style={{color: '#059669', fontWeight: 'bold', fontSize: '0.95rem'}}>#1</div>
                        </div>

                        <div className={styles.actionItem}>
                            <div className={styles.userAvatar}>
                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704c" alt="TechFlow" />
                            </div>
                            <div className={styles.actionDetails}>
                                <p className={styles.actionText} style={{fontWeight: 600, color: '#0f172a'}}>TechFlow (Selin K.)</p>
                                <span className={styles.actionTime}>180 Tasarım • 9.5K Token</span>
                            </div>
                            <div style={{color: '#475569', fontWeight: 'bold', fontSize: '0.95rem'}}>#2</div>
                        </div>

                        <div className={styles.actionItem}>
                            <div className={styles.userAvatar}>
                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704e" alt="Lumina Studio" />
                            </div>
                            <div className={styles.actionDetails}>
                                <p className={styles.actionText} style={{fontWeight: 600, color: '#0f172a'}}>Lumina Studio</p>
                                <span className={styles.actionTime}>156 Tasarım • 8.2K Token</span>
                            </div>
                            <div style={{color: '#475569', fontWeight: 'bold', fontSize: '0.95rem'}}>#3</div>
                        </div>

                        <div className={styles.actionItem}>
                            <div className={styles.userAvatar}>
                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704f" alt="Boutique Design" />
                            </div>
                            <div className={styles.actionDetails}>
                                <p className={styles.actionText} style={{fontWeight: 600, color: '#0f172a'}}>Boutique Design</p>
                                <span className={styles.actionTime}>142 Tasarım • 7.8K Token</span>
                            </div>
                            <div style={{color: '#475569', fontWeight: 'bold', fontSize: '0.95rem'}}>#4</div>
                        </div>

                        <div className={styles.actionItem}>
                            <div className={styles.userAvatar}>
                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704b" alt="Global Market" />
                            </div>
                            <div className={styles.actionDetails}>
                                <p className={styles.actionText} style={{fontWeight: 600, color: '#0f172a'}}>Global Market (Can B.)</p>
                                <span className={styles.actionTime}>112 Tasarım • 5.1K Token</span>
                            </div>
                            <div style={{color: '#475569', fontWeight: 'bold', fontSize: '0.95rem'}}>#5</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
