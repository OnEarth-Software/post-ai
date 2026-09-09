import React from 'react';
import { cookies } from 'next/headers';
import DesignClient from './DesignClient';

export default async function DesignPage({ searchParams }: { searchParams: { page?: string, search?: string, platform?: string, type?: string, sort?: string, date_range?: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const page = parseInt(searchParams.page || '1', 10);
    const search = searchParams.search || '';
    const platform = searchParams.platform || 'all';
    const type_filter = searchParams.type || 'all';
    const sort = searchParams.sort || 'desc';
    const date_range = searchParams.date_range || 'all';
    const limit = 5;

    let campaignsData = {
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
            
            let queryUrl = `${apiUrl}/admin/campaigns?page=${page}&limit=${limit}`;
            if (search) queryUrl += `&search=${encodeURIComponent(search)}`;
            if (platform) queryUrl += `&platform=${encodeURIComponent(platform)}`;
            if (type_filter) queryUrl += `&type_filter=${encodeURIComponent(type_filter)}`;
            if (sort) queryUrl += `&sort=${encodeURIComponent(sort)}`;
            if (date_range) queryUrl += `&date_range=${encodeURIComponent(date_range)}`;
            
            const response = await fetch(queryUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            if (response.ok) {
                campaignsData = await response.json();
            } else {
                console.error("Kampanyalar getirilemedi", response.status);
            }
        } catch (err) {
            console.error("Kampanyalar getirilirken hata oluştu:", err);
        }
    }

    const totalPages = Math.ceil((campaignsData.total || 0) / limit) || 1;

    return (
        <DesignClient 
            initialCampaigns={campaignsData.items} 
            total={campaignsData.total}
            currentPage={campaignsData.page}
            totalPages={totalPages}
            currentSearch={search}
            currentPlatform={platform}
            currentType={type_filter}
            currentSort={sort}
            currentDateRange={date_range}
            token={token}
        />
    );
}
