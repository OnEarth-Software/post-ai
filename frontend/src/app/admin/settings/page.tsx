import React from 'react';
import { cookies } from 'next/headers';
import SystemSettingsClient from './SystemSettingsClient';

export default async function SettingsPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let initialConfigs = [];

    if (token) {
        try {
            let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
                apiUrl = 'http://backend:8000';
            }
            
            const response = await fetch(`${apiUrl}/admin/configs`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            if (response.ok) {
                initialConfigs = await response.json();
            }
        } catch (err) {
            console.error("Sistem ayarları getirilirken hata oluştu:", err);
        }
    }

    return (
        <SystemSettingsClient initialConfigs={initialConfigs} />
    );
}
