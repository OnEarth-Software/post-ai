"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import { Shield, Key, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; surname: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Kullanıcı bilgileri çekilemedi:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    if (!user) {
        return null;
    }

    const initials = `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();

    return (
        <div className={styles.container}>
            {/* Header Card */}
            <div className={styles.headerCard}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatar}>
                        {initials}
                    </div>
                    <div className={styles.userDetails}>
                        <div className={styles.userName}>
                            {user.name} {user.surname}
                            <span className={styles.badge}>★ Premium Plan</span>
                        </div>
                        <div className={styles.userRole}>Marketing Lead</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.contentGrid}>
                
                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>User Info</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>First Name</label>
                                    <input type="text" className={styles.input} defaultValue={user.name} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Last Name</label>
                                    <input type="text" className={styles.input} defaultValue={user.surname} />
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Email Address</label>
                                    <input type="email" className={styles.input} defaultValue={user.email} />
                                </div>
                            </div>
                            <button className={styles.saveBtn}>Save Changes</button>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        {/* Right Sidebar widgets for Profile */}
                        <div>
                            <div className={`${styles.card} ${styles.creditCard}`}>
                                <h3 className={styles.cardTitle} style={{marginBottom: '0'}}>Credit Balance</h3>
                                <div className={styles.creditAmount}>
                                    8,450 <span className={styles.creditTotal}>/ 10,000</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill}></div>
                                </div>
                                <div className={styles.renewText}>Renews in 12 days</div>
                                <button className={styles.upgradeBtn}>Upgrade Plan</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Security Tab Content */}
                {activeTab === 'security' && (
                    <>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Security Settings</h3>
                            
                            <div className={styles.securityItem} onClick={() => setIsPasswordModalOpen(true)} style={{cursor: 'pointer'}}>
                                <div className={styles.securityInfo}>
                                    <div className={styles.securityIcon}>
                                        <Key size={20} />
                                    </div>
                                    <div className={styles.securityText}>
                                        <span className={styles.securityTitle}>Change Password</span>
                                        <span className={styles.securityDesc}>Update your password regularly to keep your account secure</span>
                                    </div>
                                </div>
                                <ChevronRight size={20} className={styles.arrowIcon} />
                            </div>

                            <div className={styles.securityItem}>
                                <div className={styles.securityInfo}>
                                    <div className={styles.securityIcon}>
                                        <Shield size={20} />
                                    </div>
                                    <div className={styles.securityText}>
                                        <span className={styles.securityTitle}>Two-Factor Auth (2FA)</span>
                                        <span className={styles.securityDesc}>Recommended for extra account security</span>
                                    </div>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" defaultChecked />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        </div>
                        
                        {/* Empty right column for layout balancing */}
                        <div></div>
                    </>
                )}
                
            </div>

            {/* Password Modal */}
            {isPasswordModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsPasswordModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Change Password</h3>
                            <button className={styles.closeBtn} onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Password</label>
                                <input type="password" className={styles.input} placeholder="••••••••" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Password</label>
                                <input type="password" className={styles.input} placeholder="••••••••" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <input type="password" className={styles.input} placeholder="••••••••" />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={() => setIsPasswordModalOpen(false)}>Save Password</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
