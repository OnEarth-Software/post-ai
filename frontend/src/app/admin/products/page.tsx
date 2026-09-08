import { cookies } from 'next/headers';
import ProductsClient from './ProductsClient';

export default async function ProductsPage({ searchParams }: { searchParams: { page?: string, search?: string, sort?: string, date_range?: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    const page = parseInt(searchParams.page || '1', 10);
    const search = searchParams.search || '';
    const sort = searchParams.sort || 'desc';
    const date_range = searchParams.date_range || 'all';
    const limit = 5;

    let productsData = {
        items: [],
        total: 0,
        page: 1,
        limit: 5
    };
    
    let errorMessage = null;
    
    try {
        let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            apiUrl = 'http://backend:8000';
        }
        
        if (token) {
            let queryUrl = `${apiUrl}/admin/products?page=${page}&limit=${limit}`;
            if (search) queryUrl += `&search=${encodeURIComponent(search)}`;
            if (sort) queryUrl += `&sort=${encodeURIComponent(sort)}`;
            if (date_range) queryUrl += `&date_range=${encodeURIComponent(date_range)}`;
            
            const response = await fetch(queryUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (response.ok) {
                productsData = await response.json();
            } else {
                const text = await response.text();
                errorMessage = `API Error: ${response.status} ${text}`;
                console.error(errorMessage);
            }
        }
    } catch (error: any) {
        errorMessage = `Fetch error: ${error.message}`;
        console.error(errorMessage);
    }
    
    const totalPages = Math.ceil(productsData.total / productsData.limit) || 1;

    return (
        <ProductsClient 
            initialProducts={productsData.items} 
            total={productsData.total}
            currentPage={productsData.page}
            totalPages={totalPages}
            currentSearch={search}
            currentSort={sort}
            currentDateRange={date_range}
            errorMessage={errorMessage}
            token={token}
        />
    );
}
