import React from 'react';
import { cookies } from 'next/headers';
import UserManagementClient from './UserManagementClient';

export default async function UserManagementPage({ searchParams }: { searchParams: { page?: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    const page = parseInt(searchParams.page || '1', 10);
    const limit = 5;

    let usersData = {
        items: [],
        total: 0,
        page: 1,
        limit: 5
    };

    if (token) {
        try {
            let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
                apiUrl = 'http://backend:8000';
            }
            
            const response = await fetch(`${apiUrl}/admin/users?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            if (response.ok) {
                usersData = await response.json();
            }
        } catch (err) {
            console.error("Kullanıcılar getirilirken hata oluştu:", err);
        }
    }

    const totalPages = Math.ceil((usersData.total || 0) / limit) || 1;

    return (
        <UserManagementClient 
            initialUsers={usersData.items} 
            total={usersData.total}
            currentPage={usersData.page}
            totalPages={totalPages}
        />
    );
}
