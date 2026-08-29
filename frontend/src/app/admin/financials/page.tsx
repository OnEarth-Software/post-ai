import React from 'react';
import { cookies } from 'next/headers';
import FinanceClient from './FinanceClient';

export default async function FinancialsPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let stats: any = null;

    if (token) {
        try {
            let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            // Docker network workaround
            if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
                apiUrl = 'http://backend:8000';
            }

            const response = await fetch(`${apiUrl}/admin/finance-stats`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            if (response.ok) {
                stats = await response.json();
            } else {
                console.error("Finance API responded with:", response.status);
            }
        } catch (err) {
            console.error("Failed to fetch finance stats:", err);
        }
    }

    return <FinanceClient initialStats={stats} />;
}
