"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(productId: string) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return { error: 'Unauthorized' };
    }

    try {
        let apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
            apiUrl = 'http://backend:8000';
        }

        const response = await fetch(`${apiUrl}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            revalidatePath('/admin/products');
            return { success: true };
        } else {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.detail || 'Failed to delete product' };
        }
    } catch (error: any) {
        return { error: error.message || 'An error occurred' };
    }
}
