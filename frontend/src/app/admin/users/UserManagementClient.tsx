"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, UserPlus, X, Trash2, Shield, CreditCard, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './users.module.css';
import { updateUser, deleteUser } from './actions';

export default function UserManagementClient({ initialUsers, total, currentPage, totalPages }: any) {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // For local state edits
    const [editForm, setEditForm] = useState<any>({});

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            router.push(`/admin/users?page=${newPage}`);
        }
    };

    const handleRowClick = (user: any) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            plan: user.plan,
            designLimit: user.designLimit,
            productLimit: user.productLimit
        });
    };

    const handleSave = async () => {
        if (!selectedUser?.id) return;
        setIsSaving(true);
        try {
            const res = await updateUser(selectedUser.id, editForm);
            if (res.success) {
                setSelectedUser(null);
                // The action already revalidates the path, but we might want to refresh router just in case
                router.refresh();
            } else {
                alert("Güncelleme başarısız oldu: " + (res.error || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = () => {
        setUserToDelete(selectedUser);
    };

    const confirmDelete = async () => {
        if (!userToDelete?.id) return;
        
        setIsSaving(true);
        try {
            const res = await deleteUser(userToDelete.id);
            if (res.success) {
                setUserToDelete(null);
                if (selectedUser?.id === userToDelete.id) {
                    setSelectedUser(null);
                }
                router.refresh();
            } else {
                alert("Silme işlemi başarısız oldu: " + (res.error || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Kullanıcı Yönetimi</h1>
                    <p className={styles.subtitle}>Platform kullanıcılarını yönet, rolleri ata ve üretim limitlerini ayarla.</p>
                </div>
                <button className={styles.primaryBtn} onClick={() => alert('Yeni kullanıcı ekleme şu an aktif değil.')}>
                    <UserPlus size={18} />
                    Yeni Kullanıcı Ekle
                </button>
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Rol</th>
                            <th>Plan</th>
                            <th>Tasarım (Kul/Lim)</th>
                            <th>Ürün (Kul/Lim)</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialUsers.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Kullanıcı bulunamadı.</td>
                            </tr>
                        )}
                        {initialUsers.map((user: any) => (
                            <tr key={user.id} onClick={() => handleRowClick(user)}>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className={styles.userName}>{user.name}</span>
                                            <span className={styles.userEmail}>{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${user.plan === 'Free' ? styles.badgeFree : styles.badgePro}`}>
                                        {user.plan}
                                    </span>
                                </td>
                                <td>
                                    <strong>{user.designUsage}</strong> / {user.designLimit}
                                </td>
                                <td>
                                    <strong>{user.productUsage}</strong> / {user.productLimit}
                                </td>
                                <td>
                                    <span style={{ color: user.status === 'Active' ? '#059669' : '#dc2626', fontWeight: 600 }}>
                                        {user.status === 'Active' ? 'Aktif' : 'Pasif'}
                                    </span>
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
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Sayfa {currentPage} / {totalPages} (Toplam {total} kullanıcı)</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Edit User Modal */}
            {selectedUser && (
                <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                Profil Düzenle
                            </h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Profile Info Section */}
                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}><Shield size={18} /> Profil & Erişim</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Ad Soyad</label>
                                        <input type="text" className={styles.input} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>E-posta</label>
                                        <input type="email" className={styles.input} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Sistem Rolü</label>
                                        <select className={styles.select} value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                            <option value="user">Kullanıcı (Standard)</option>
                                            <option value="admin">Yönetici (Admin)</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Hesap Durumu</label>
                                        <select className={styles.select} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                                            <option value="Active">Aktif</option>
                                            <option value="Inactive">Pasif (Askıya Alınmış)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Plan & Limits Section */}
                            <div className={styles.formSection} style={{marginBottom: 0}}>
                                <h3 className={styles.sectionTitle}><Zap size={18} /> Abonelik & Limitler</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Aktif Plan</label>
                                        <select className={styles.select} value={editForm.plan} onChange={e => setEditForm({...editForm, plan: e.target.value})}>
                                            <option value="Free">Free</option>
                                            <option value="Pro">Pro Plan</option>
                                            <option value="Enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Aylık Tasarım Hakkı</label>
                                        <input type="number" className={styles.input} value={editForm.designLimit} onChange={e => setEditForm({...editForm, designLimit: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Aylık Ürün Yükleme Hakkı</label>
                                        <input type="number" className={styles.input} value={editForm.productLimit} onChange={e => setEditForm({...editForm, productLimit: parseInt(e.target.value) || 0})} />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.footerActions} style={{ width: '100%', justifyContent: 'space-between' }}>
                                <button className={styles.deleteBtn} onClick={handleDeleteClick} disabled={isSaving}>
                                    <Trash2 size={16} /> Kullanıcıyı Sil
                                </button>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className={styles.cancelBtn} onClick={() => setSelectedUser(null)}>İptal</button>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? 'İşleniyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className={styles.modalOverlay} onClick={() => setUserToDelete(null)}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <h2 className={styles.modalTitle} style={{ color: '#0f172a' }}>Delete User</h2>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px 24px' }}>
                            <p style={{ color: '#475569', margin: 0, lineHeight: 1.5 }}>
                                Are you sure you want to delete user <strong>{userToDelete.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className={styles.modalFooter} style={{ borderTop: 'none', paddingTop: 0 }}>
                            <div className={styles.footerActions} style={{ width: '100%', justifyContent: 'flex-end', gap: '10px' }}>
                                <button className={styles.cancelBtn} onClick={() => setUserToDelete(null)} disabled={isSaving}>Cancel</button>
                                <button className={styles.deleteBtn} onClick={confirmDelete} disabled={isSaving} style={{ background: '#ef4444', color: 'white', border: 'none' }}>
                                    {isSaving ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
