"use client";

import React from 'react';
import { Search, Filter, Camera, Zap, Calendar, MoreHorizontal } from 'lucide-react';
import styles from './campaigns.module.css';

// Dummy Data mimicking the Campaign model
const DUMMY_CAMPAIGNS = [
    {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        platform: 'Instagram',
        type: 'Story',
        goal: 'Summer Watch Collection Sale',
        slogan: 'Time is yours. Own the summer.',
        tokensSpent: 45,
        cost: '0.12',
        user: { name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=1' },
        createdAt: '2 hours ago'
    },
    {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        platform: 'Instagram',
        type: 'Post',
        goal: 'Headphones Brand Awareness',
        slogan: 'Immerse yourself in pure sound.',
        tokensSpent: 60,
        cost: '0.18',
        user: { name: 'Selin Kaya', avatar: 'https://i.pravatar.cc/150?u=2' },
        createdAt: '5 hours ago'
    },
    {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        platform: 'Instagram',
        type: 'Story',
        goal: 'Sneaker Drop Announcement',
        slogan: 'Step into the future. Limited drop today.',
        tokensSpent: 30,
        cost: '0.08',
        user: { name: 'Can Başar', avatar: 'https://i.pravatar.cc/150?u=3' },
        createdAt: '1 day ago'
    },
    {
        id: 4,
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        platform: 'Instagram',
        type: 'Post',
        goal: 'Vintage Camera Promotion',
        slogan: 'Capture moments that last forever.',
        tokensSpent: 45,
        cost: '0.12',
        user: { name: 'Lumina Studio', avatar: 'https://i.pravatar.cc/150?u=4' },
        createdAt: '2 days ago'
    },
    {
        id: 5,
        imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        platform: 'Instagram',
        type: 'Story',
        goal: 'Skincare Routine Bundle',
        slogan: 'Glow naturally. 3-step routine.',
        tokensSpent: 75,
        cost: '0.24',
        user: { name: 'Boutique Design', avatar: 'https://i.pravatar.cc/150?u=5' },
        createdAt: '3 days ago'
    },
    {
        id: 6,
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        platform: 'Instagram',
        type: 'Post',
        goal: 'Eco-Friendly Bag Launch',
        slogan: 'Sustainable fashion, zero compromise.',
        tokensSpent: 40,
        cost: '0.10',
        user: { name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=1' },
        createdAt: '4 days ago'
    }
];

export default function CampaignsPage() {
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
                            <th>Tasarım</th>
                            <th>Platform & Format</th>
                            <th>Harcanan Token</th>
                            <th>Oluşturan Kullanıcı</th>
                            <th>Tarih</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {DUMMY_CAMPAIGNS.map(campaign => (
                            <tr key={campaign.id}>
                                <td>
                                    <div className={styles.campaignCell}>
                                        <img src={campaign.imageUrl} alt={campaign.goal} className={styles.thumbnail} />
                                        <div className={styles.campaignInfo}>
                                            <span className={styles.campaignTitle}>{campaign.goal}</span>
                                            <span className={styles.campaignSlogan}>"{campaign.slogan}"</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.platformBadge}>
                                        <Camera size={14} />
                                        Instagram
                                    </div>
                                    <span className={styles.typeLabel}>{campaign.type}</span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start'}}>
                                        <div className={styles.tokenBadge} title="Tokens Spent">
                                            <Zap size={14} /> {campaign.tokensSpent}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, paddingLeft: '0.25rem' }}>
                                            Maliyet: ${campaign.cost}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.userBlock}>
                                        <img src={campaign.user.avatar} alt={campaign.user.name} className={styles.avatar} />
                                        <span className={styles.userName}>{campaign.user.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.date}>{campaign.createdAt}</span>
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
