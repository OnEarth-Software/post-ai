import React from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './adminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
            <AdminSidebar />
            
            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.contentArea}>
                    {children}
                </div>
            </main>
        </div>
    );
}
