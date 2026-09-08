import React from 'react';
import { cookies } from 'next/headers';
import MarketReportsClient from './MarketReportsClient';

export default async function MarketReportsPage({ searchParams }: { searchParams: { page?: string, search?: string, sort?: string, date_range?: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    const page = parseInt(searchParams.page || '1', 10);
    const search = searchParams.search || '';
    const sort = searchParams.sort || 'desc';
    const date_range = searchParams.date_range || 'all';
    const limit = 5;

    let reportsData = {
        items: [],
        total: 0,
        page: 1,
        limit: 10
    };

    if (token) {
        try {
            let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
                apiUrl = 'http://backend:8000';
            }
            
            let queryUrl = `${apiUrl}/admin/market-reports?page=${page}&limit=${limit}`;
            if (search) queryUrl += `&search=${encodeURIComponent(search)}`;
            if (sort) queryUrl += `&sort=${encodeURIComponent(sort)}`;
            if (date_range) queryUrl += `&date_range=${encodeURIComponent(date_range)}`;
            
            const response = await fetch(queryUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            if (response.ok) {
                reportsData = await response.json();
            } else {
                console.error("Raporlar getirilemedi", response.status);
            }
        } catch (err) {
            console.error("Raporlar getirilirken hata oluştu:", err);
        }
    }

    const totalPages = Math.ceil((reportsData.total || 0) / limit) || 1;

    return (
        <MarketReportsClient 
            initialReports={reportsData.items} 
            total={reportsData.total}
            currentPage={reportsData.page}
            totalPages={totalPages}
            currentSearch={search}
            currentSort={sort}
            currentDateRange={date_range}
            token={token}
        />
    );
}
