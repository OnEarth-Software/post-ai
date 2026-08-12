"use client";

import React from 'react';
import { Search, Filter, Box, Zap, Calendar, MoreHorizontal } from 'lucide-react';
import styles from '../campaigns/campaigns.module.css'; // Reusing campaigns styles for consistency

// Dummy Data mimicking the Product model
const DUMMY_PRODUCTS = [
    {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'Summer Edition Smartwatch',
        analysisStatus: 'Analyzed',
        tokensSpent: 15,
        cost: '0.04',
        user: { name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=1' },
        createdAt: '3 hours ago'
    },
    {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'Premium Wireless Headphones',
        analysisStatus: 'Analyzed',
        tokensSpent: 15,
        cost: '0.04',
        user: { name: 'Selin Kaya', avatar: 'https://i.pravatar.cc/150?u=2' },
        createdAt: '6 hours ago'
    },
    {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'Red Running Sneakers',
        analysisStatus: 'Pending',
        tokensSpent: 0,
        cost: '0.00',
        user: { name: 'Can Başar', avatar: 'https://i.pravatar.cc/150?u=3' },
        createdAt: '1 day ago'
    },
    {
        id: 4,
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'Vintage Film Camera',
        analysisStatus: 'Analyzed',
        tokensSpent: 12,
        cost: '0.03',
        user: { name: 'Lumina Studio', avatar: 'https://i.pravatar.cc/150?u=4' },
        createdAt: '2 days ago'
    },
    {
        id: 5,
        imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'Organic Skincare Serum',
        analysisStatus: 'Analyzed',
        tokensSpent: 20,
        cost: '0.05',
        user: { name: 'Boutique Design', avatar: 'https://i.pravatar.cc/150?u=5' },
        createdAt: '3 days ago'
    },
    {
        id: 6,
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'Eco-Friendly Canvas Bag',
        analysisStatus: 'Analyzed',
        tokensSpent: 15,
        cost: '0.04',
        user: { name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=1' },
        createdAt: '4 days ago'
    }
];

export default function ProductsPage() {
    return (
        <div className={styles.container}>
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
                />
                <button className={styles.filterBtn}>
                    <Filter size={16} /> Filters
                </button>
                <button className={styles.filterBtn}>
                    <Calendar size={16} /> Last 7 Days
                </button>
            </div>

            {/* List (Table) Layout */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Ürün</th>
                            <th>Analiz Durumu</th>
                            <th>Harcanan Token (Vision)</th>
                            <th>Yükleyen Kullanıcı</th>
                            <th>Tarih</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {DUMMY_PRODUCTS.map(product => (
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
                                            Maliyet: ${product.cost}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.userBlock}>
                                        <img src={product.user.avatar} alt={product.user.name} className={styles.avatar} />
                                        <span className={styles.userName}>{product.user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.date}>{product.createdAt}</span>
                                </td>
                                <td>
                                    <button className={styles.actionBtn}>
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
