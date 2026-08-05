"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Key, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; surname: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
    const [isEmailConfirmModalOpen, setIsEmailConfirmModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Password State
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    // 2FA State
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);
    const [qrUri, setQrUri] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [is2faEnabled, setIs2faEnabled] = useState(false);
    
    // Disable 2FA State
    const [isDisable2faModalOpen, setIsDisable2faModalOpen] = useState(false);
    const [disableTwoFactorCode, setDisableTwoFactorCode] = useState('');

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

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
                    setFormData({ name: data.name, surname: data.surname, email: data.email });
                    setIs2faEnabled(data.is_2fa_enabled || false);
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

    const handleSave = async (withPassword = false) => {
        if (!withPassword && formData.email !== user?.email) {
            setIsEmailConfirmModalOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const payload: any = {
                name: formData.name,
                surname: formData.surname,
            };

            if (formData.email !== user?.email && withPassword) {
                payload.email = formData.email;
                payload.current_password = currentPassword;
            }

            const response = await fetch(`${apiUrl}/auth/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setIsEmailConfirmModalOpen(false);
                setCurrentPassword('');
                showNotification("Bilgiler güncellendi!", "success");
            } else {
                const err = await response.json();
                showNotification(err.detail || "Güncelleme başarısız.", "error");
            }
        } catch (error) {
            console.error(error);
            showNotification("Bir hata oluştu.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            showNotification("Yeni şifreler eşleşmiyor.", "error");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/auth/password`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: passwordData.current, new_password: passwordData.new })
            });
            if (res.ok) {
                showNotification("Şifre başarıyla değiştirildi.", "success");
                setIsPasswordModalOpen(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                const err = await res.json();
                showNotification(err.detail || "Şifre değiştirilemedi.", "error");
            }
        } catch (e) {
            showNotification("Bir hata oluştu.", "error");
        }
    };

    const handle2faToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (is2faEnabled) {
            setIsDisable2faModalOpen(true);
        } else {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/auth/2fa/setup`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setQrUri(data.uri);
                    setIs2faModalOpen(true);
                }
            } catch (e) {
                showNotification("Hata oluştu.", "error");
            }
        }
    };

    const verify2fa = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/auth/2fa/verify`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: twoFactorCode })
            });
            if (res.ok) {
                showNotification("2FA başarıyla aktif edildi.", "success");
                setIs2faEnabled(true);
                setIs2faModalOpen(false);
                setTwoFactorCode('');
            } else {
                showNotification("Geçersiz kod.", "error");
            }
        } catch (e) {
            showNotification("Hata oluştu.", "error");
        }
    };

    const disable2fa = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/auth/2fa/disable`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: disableTwoFactorCode })
            });
            if (res.ok) {
                showNotification("2FA başarıyla kapatıldı.", "success");
                setIs2faEnabled(false);
                setIsDisable2faModalOpen(false);
                setDisableTwoFactorCode('');
            } else {
                showNotification("Geçersiz kod.", "error");
            }
        } catch (e) {
            showNotification("Hata oluştu.", "error");
        }
    };

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
                                    <input type="text" className={styles.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Last Name</label>
                                    <input type="text" className={styles.input} value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} />
                                </div>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Email Address</label>
                                    <input type="email" className={styles.input} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>
                            <button className={styles.saveBtn} onClick={() => handleSave(false)} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <div style={{ clear: 'both' }}></div>
                        </div>

                        {/* Right Sidebar widgets for Profile */}
                        <div>
                            <div className={`${styles.card} ${styles.creditCard}`}>
                                <h3 className={styles.cardTitle} style={{ marginBottom: '0' }}>Credit Balance</h3>
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

                            <div className={styles.securityItem} onClick={() => setIsPasswordModalOpen(true)} style={{ cursor: 'pointer' }}>
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
                                    <input type="checkbox" checked={is2faEnabled} onChange={handle2faToggle} />
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
                                <input type="password" className={styles.input} placeholder="••••••••" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Password</label>
                                <input type="password" className={styles.input} placeholder="••••••••" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <input type="password" className={styles.input} placeholder="••••••••" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handlePasswordChange}>Save Password</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Confirm Modal */}
            {isEmailConfirmModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsEmailConfirmModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Confirm Email Change</h3>
                            <button className={styles.closeBtn} onClick={() => setIsEmailConfirmModalOpen(false)}>&times;</button>
                        </div>
                        <div className={styles.modalBody}>
                            <p style={{ marginBottom: '1rem', color: '#666' }}>Please enter your current password to confirm changing your email address.</p>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Password</label>
                                <input type="password" className={styles.input} placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setIsEmailConfirmModalOpen(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={() => handleSave(true)} disabled={isSaving}>{isSaving ? 'Saving...' : 'Confirm'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {is2faModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIs2faModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{textAlign: 'center'}}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Setup Two-Factor Auth</h3>
                            <button className={styles.closeBtn} onClick={() => setIs2faModalOpen(false)}>&times;</button>
                        </div>
                        <div className={styles.modalBody} style={{alignItems: 'center'}}>
                            <p style={{marginBottom: '1rem', color: '#666'}}>Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.</p>
                            {qrUri && (
                                <div style={{background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block', border: '1px solid #e2e8f0'}}>
                                    <QRCodeSVG value={qrUri} size={200} />
                                </div>
                            )}
                            <div className={styles.formGroup} style={{width: '100%', marginTop: '1rem', textAlign: 'left'}}>
                                <label className={styles.label}>6-digit Code</label>
                                <input type="text" className={styles.input} placeholder="123456" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} maxLength={6} style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.25rem'}} />
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{justifyContent: 'center'}}>
                            <button className={styles.saveBtn} onClick={verify2fa} style={{width: '100%'}}>Verify & Enable</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable 2FA Modal */}
            {isDisable2faModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsDisable2faModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{textAlign: 'center'}}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Disable Two-Factor Auth</h3>
                            <button className={styles.closeBtn} onClick={() => setIsDisable2faModalOpen(false)}>&times;</button>
                        </div>
                        <div className={styles.modalBody} style={{alignItems: 'center'}}>
                            <p style={{marginBottom: '1rem', color: '#666'}}>Please enter the 6-digit code from your Authenticator app to disable 2FA.</p>
                            
                            <div className={styles.formGroup} style={{width: '100%', marginTop: '1rem', textAlign: 'left'}}>
                                <label className={styles.label}>6-digit Code</label>
                                <input type="text" className={styles.input} placeholder="123456" value={disableTwoFactorCode} onChange={e => setDisableTwoFactorCode(e.target.value)} maxLength={6} style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.25rem'}} />
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{justifyContent: 'center'}}>
                            <button className={styles.saveBtn} onClick={disable2fa} style={{width: '100%', background: '#ef4444'}}>Disable 2FA</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {notification && (
                <div className={`${styles.toast} ${notification.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
