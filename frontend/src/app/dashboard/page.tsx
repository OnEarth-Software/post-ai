"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { Search, Bell, Sparkles, Package, Image as ImageIcon, CheckCircle2, UploadCloud, PlusCircle, Palette, PenTool, Wand2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { headers } from 'next/headers';



export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [productCount, setProductCount] = useState(0);
    const [campaignsCount, setCampaignsCount] = useState(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const initialChartData = [];
    for (let i = 5; i >= 0; i--) {
        let mIndex = currentMonthIndex - i;
        if (mIndex < 0) mIndex += 12;
        initialChartData.push({ name: months[mIndex], products: 0, campaigns: 0 });
    }
    const [productChartData, setProductChartData] = useState<any[]>(initialChartData);
    const [campaignChartData, setCampaignChartData] = useState<any[]>(initialChartData);
    const [userCredits, setUserCredits] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL


            Promise.all([
                fetch(`${apiUrl}/products/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(res => res.json()),
                fetch(`${apiUrl}/campaigns/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(res => res.json()),
                fetch(`${apiUrl}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(res => res.json())
            ])
                .then(([productsData, campaignsData, userData]) => {


                    if(userData && userData.credits !== undefined){
                        setUserCredits(userData.credits);
                    }

                    if (Array.isArray(productsData)) {
                        setProductCount(productsData.length);

                        // Ürünleri aya göre gruplayıp grafiğe uygun hale getiriyoruz
                        const monthCounts: Record<string, number> = {};
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                        // Başlangıçta ekranda düzgün durması için geriye dönük 6 ayı 0 olarak başlatalım
                        const currentMonthIdx = new Date().getMonth();
                        const displayMonths: string[] = [];
                        for (let i = 5; i >= 0; i--) {
                            let mIdx = currentMonthIdx - i;
                            if (mIdx < 0) mIdx += 12;
                            displayMonths.push(months[mIdx]);
                        }

                        const counts: Record<string, number> = {};
                        displayMonths.forEach(m => { counts[m] = 0; });

                        productsData.forEach(product => {
                            if (product.created_at) {
                                const date = new Date(product.created_at);
                                const monthName = months[date.getMonth()];
                                counts[monthName] = (counts[monthName] || 0) + 1;
                            }
                        });

                        const formattedChartData = displayMonths.map(m => ({
                            name: m,
                            products: counts[m] || 0
                        }));
                        setProductChartData([...formattedChartData]);
                    }

                    if (Array.isArray(campaignsData)) {
                        setCampaignsCount(campaignsData.length);

                        const currentMonthIdx = new Date().getMonth();
                        const displayMonths: string[] = [];
                        for (let i = 5; i >= 0; i--) {
                            let mIdx = currentMonthIdx - i;
                            if (mIdx < 0) mIdx += 12;
                            displayMonths.push(months[mIdx]);
                        }
                        const campCounts: Record<string, number> = {};
                        displayMonths.forEach(m => { campCounts[m] = 0; });

                        campaignsData.forEach(campaign => {
                            if (campaign.created_at) {
                                const date = new Date(campaign.created_at);
                                const monthName = months[date.getMonth()];
                                campCounts[monthName] = (campCounts[monthName] || 0) + 1;
                            }
                        });

                        const formattedCampData = displayMonths.map(m => ({
                            name: m,
                            campaigns: campCounts[m] || 0
                        }));
                        setCampaignChartData([...formattedCampData]);
                    }

                    setLoading(false);
                })
                .catch(err => {
                    console.error("Ürün sayısı alınırken hata:", err);
                    setLoading(false);
                });
        }
    }, [router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.designLoader}>
                    <Palette className={styles.designIcon} />
                    <PenTool className={styles.designIcon} />
                    <Wand2 className={styles.designIcon} />
                </div>
                <p>Crafting your dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardWrapper}>
            {/* Top Bar */}
            <header className={styles.topBar}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input type="text" placeholder="Search campaigns, assets, or products..." className={styles.searchInput} />
                </div>
                <div className={styles.topBarRight}>
                    {/* Şimdilik boş bırakıldı */}
                </div>
            </header>

            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={`${styles.pageTitle} ${styles.textGradient}`}>Dashboard Overview</h1>
                    <p className={styles.pageSubtitle}>Welcome back. Here's what's happening today.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnOutline}>Download Report</button>
                    <button className={styles.btnPrimary}>AI Insights</button>
                </div>
            </div>

            {/* Top Cards */}
            <div className={styles.topCards}>
                <div className={styles.statCard}>
                    <div className={styles.statTop}>
                        <div className={`${styles.statIconWrapper} ${styles.iconProduct}`}>
                            <Package size={20} />
                        </div>

                    </div>
                    <div className={styles.statLabel}>Total Products</div>
                    <div className={styles.statValue}>{productCount}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statTop}>
                        <div className={`${styles.statIconWrapper} ${styles.iconImage}`}>
                            <ImageIcon size={20} />
                        </div>
                        {/* <span className={styles.statTrend}>+12%</span> */}
                    </div>
                    <div className={styles.statLabel}>Generated Images</div>
                    <div className={styles.statValue}>{campaignsCount}</div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statTop}>
                        <div className={`${styles.statIconWrapper} ${styles.iconCredit}`}>
                            <CheckCircle2 size={20} />
                        </div>
                        <span className={styles.statTrend}>High</span>
                    </div>
                    <div className={styles.statLabel}>Total Credits</div>
                    <div className={styles.statValue}>{userCredits}</div>
                    
                </div>
            </div>

            {/* Action Cards */}
            <div className={styles.actionCards}>
                <div className={`${styles.actionCard} ${styles.cardUpload}`} onClick={() => router.push('/dashboard/products/upload')}>
                    <div className={`${styles.actionIconWrapper} ${styles.iconWrapperUpload}`}>
                        <UploadCloud size={32} />
                    </div>
                    <h3 className={styles.actionTitle}>Upload Product</h3>
                    <p className={styles.actionDesc}>Add new inventory for AI processing.</p>
                </div>

                <div className={`${styles.actionCard} ${styles.cardCampaign}`} onClick={() => router.push('/dashboard/campaigns/new')}>
                    <div className={`${styles.actionIconWrapper} ${styles.iconWrapperCampaign}`}>
                        <PlusCircle size={32} />
                    </div>
                    <h3 className={styles.actionTitle}>New Campaign</h3>
                    <p className={styles.actionDesc}>Start a new marketing sequence.</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className={styles.chartsContainer}>

                {/* Products Bar Chart */}
                <div className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>PRODUCT GROWTH</h3>
                            <p className={styles.chartSubtitle}>Monthly product uploads</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 240 }}>
                        <ResponsiveContainer>
                            <BarChart data={productChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="products" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Campaigns Line Chart */}
                <div className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>CAMPAIGN PERFORMANCE</h3>
                            <p className={styles.chartSubtitle}>Active marketing campaigns</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 240 }}>
                        <ResponsiveContainer>
                            <LineChart data={campaignChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="campaigns" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981', strokeWidth: 3, stroke: 'white' }} activeDot={{ r: 8, fill: '#059669', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
