"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import styles from './NotificationsDropdown.module.css';

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${apiUrl}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.is_read).length);
            }
        } catch (error) {
            console.error('Bildirimler yüklenemedi:', error);
        }
    };

    const handleMarkAsRead = async (id: string, is_read: boolean) => {
        if (is_read) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            await fetch(`${apiUrl}/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Local state update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Bildirim okundu işaretlenemedi:', error);
        }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (error) {
            console.error('Bildirim silinemedi:', error);
        }
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button 
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} className={styles.icon} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Bildirimler</h3>
                    </div>
                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>Hiç bildiriminiz yok.</div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`${styles.item} ${!notif.is_read ? styles.unread : ''}`}
                                    onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                                >
                                    <div className={styles.dot} />
                                    <div className={styles.content}>
                                        <p>{notif.message}</p>
                                        <span className={styles.time}>
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button 
                                        className={styles.deleteBtn}
                                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                                        title="Sil"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
