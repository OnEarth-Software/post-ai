"use client";

import React, { useState } from 'react';
import { Search, Filter, UserPlus, X, Trash2, Shield, CreditCard, Zap } from 'lucide-react';
import styles from './users.module.css';

// Dummy Data
const DUMMY_USERS = [
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@acme.com', role: 'user', plan: 'Pro', designUsage: 5, designLimit: 7, productUsage: 4, productLimit: 10, status: 'Active' },
    { id: 2, name: 'Selin Kaya', email: 'selin@techflow.io', role: 'admin', plan: 'Enterprise', designUsage: 12, designLimit: 50, productUsage: 25, productLimit: 100, status: 'Active' },
    { id: 3, name: 'Can Başar', email: 'can.b@globalmarket.net', role: 'user', plan: 'Free', designUsage: 3, designLimit: 3, productUsage: 5, productLimit: 5, status: 'Inactive' },
    { id: 4, name: 'Lumina Studio', email: 'contact@luminastudio.com', role: 'user', plan: 'Pro', designUsage: 2, designLimit: 7, productUsage: 1, productLimit: 10, status: 'Active' },
    { id: 5, name: 'Boutique Design', email: 'hello@boutique.co', role: 'user', plan: 'Free', designUsage: 1, designLimit: 3, productUsage: 2, productLimit: 5, status: 'Active' },
];

export default function UserManagementPage() {
    const [selectedUser, setSelectedUser] = useState<any>(null);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Manage platform users, assign roles, and configure generation limits.</p>
                </div>
                <button className={styles.primaryBtn} onClick={() => setSelectedUser({})}>
                    <UserPlus size={18} />
                    Add New User
                </button>
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Plan</th>
                            <th>Tasarım (Kul/Lim)</th>
                            <th>Ürün (Kul/Lim)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DUMMY_USERS.map((user) => (
                            <tr key={user.id} onClick={() => setSelectedUser(user)}>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {user.name.charAt(0)}
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
                                    <span style={{ color: user.status === 'Active' ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {selectedUser && (
                <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {selectedUser.id ? 'Edit User Profile' : 'Create New User'}
                            </h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {/* Profile Info Section */}
                            <div className={styles.formSection}>
                                <h3 className={styles.sectionTitle}><Shield size={18} /> Profile & Access</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <input type="text" className={styles.input} defaultValue={selectedUser.name} placeholder="e.g. Ahmet Yılmaz" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <input type="email" className={styles.input} defaultValue={selectedUser.email} placeholder="name@company.com" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>System Role</label>
                                        <select className={styles.select} defaultValue={selectedUser.role || 'user'}>
                                            <option value="user">Standard User</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Account Status</label>
                                        <select className={styles.select} defaultValue={selectedUser.status || 'Active'}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive / Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Plan & Limits Section */}
                            <div className={styles.formSection} style={{marginBottom: 0}}>
                                <h3 className={styles.sectionTitle}><Zap size={18} /> Subscription & Limits</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Active Plan</label>
                                        <select className={styles.select} defaultValue={selectedUser.plan || 'Free'}>
                                            <option value="Free">Free Tier</option>
                                            <option value="Pro">Pro Plan</option>
                                            <option value="Enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Aylık Tasarım Hakkı</label>
                                        <input type="number" className={styles.input} defaultValue={selectedUser.designLimit} placeholder="e.g. 3" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Aylık Ürün Yükleme Hakkı</label>
                                        <input type="number" className={styles.input} defaultValue={selectedUser.productLimit} placeholder="e.g. 5" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className={styles.modalFooter}>
                            {selectedUser.id ? (
                                <button className={styles.deleteBtn}>
                                    <Trash2 size={16} /> Delete User
                                </button>
                            ) : (
                                <div></div> /* Empty div to keep alignment */
                            )}
                            
                            <div className={styles.footerActions}>
                                <button className={styles.cancelBtn} onClick={() => setSelectedUser(null)}>Cancel</button>
                                <button className={styles.saveBtn}>Save Changes</button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
